import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { MailService } from '@/mail/mail.service';
import type { PaymentMethod, PaymentStatus } from '@prisma/client';

export interface InitiatePaymentInput {
  amount: number;
  method: PaymentMethod;
  phone?: string;
  email?: string;
  /** Booking.id or Rsvp.id — used as Daraja AccountReference (12 chars max). */
  accountReference: string;
  /** Free-text description shown on M-Pesa prompt (13 chars max). */
  description: string;
}

export interface PaymentResult {
  status: PaymentStatus;
  /** CheckoutRequestID for real M-Pesa; mock ref otherwise. Stored on Booking/Rsvp.paymentRef. */
  reference: string;
  provider: 'mpesa-sandbox' | 'mpesa-prod' | 'stripe' | 'mock';
  message?: string;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private tokenCache: CachedToken | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly mail: MailService
  ) {}

  async initiate(input: InitiatePaymentInput): Promise<PaymentResult> {
    if (input.method === 'MPESA') return this.initiateMpesa(input);
    return this.initiateCard(input);
  }

  // ───────── M-Pesa ─────────

  private async initiateMpesa(input: InitiatePaymentInput): Promise<PaymentResult> {
    const consumerKey = this.config.get<string>('mpesa.consumerKey');
    const consumerSecret = this.config.get<string>('mpesa.consumerSecret');
    const shortcode = this.config.get<string>('mpesa.shortcode');
    const passkey = this.config.get<string>('mpesa.passkey');
    const callbackUrl = this.config.get<string>('mpesa.callbackUrl');
    const baseUrl =
      this.config.get<string>('mpesa.baseUrl') ?? 'https://sandbox.safaricom.co.ke';

    if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
      this.logger.warn(
        `M-Pesa credentials incomplete — returning mocked success for ${input.accountReference}.` +
          ' Set MPESA_* env vars to enable real STK Push.'
      );
      return {
        status: 'SUCCEEDED',
        reference: `MOCK-MPESA-${Date.now()}`,
        provider: 'mock',
        message: 'Mocked STK Push (credentials not configured)',
      };
    }

    const phone = this.normalizePhone(input.phone);
    if (!phone) {
      throw new BadRequestException(
        'A valid Kenyan phone number is required for M-Pesa payments'
      );
    }
    if (input.amount < 1) {
      throw new BadRequestException('M-Pesa amount must be at least 1 KES');
    }

    try {
      const token = await this.getDarajaToken(baseUrl, consumerKey, consumerSecret);
      const timestamp = this.darajaTimestamp(new Date());
      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

      const stkBody = {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(input.amount),
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: input.accountReference.slice(0, 12),
        TransactionDesc: input.description.slice(0, 13),
      };

      const res = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkBody),
      });
      const json = (await res.json().catch(() => ({}))) as {
        CheckoutRequestID?: string;
        ResponseCode?: string;
        ResponseDescription?: string;
        errorMessage?: string;
      };

      if (!res.ok || json.ResponseCode !== '0' || !json.CheckoutRequestID) {
        const message =
          json.errorMessage ?? json.ResponseDescription ?? `STK Push HTTP ${res.status}`;
        this.logger.error(`STK Push failed for ${input.accountReference}: ${message}`);
        return {
          status: 'FAILED',
          reference: `STK-FAIL-${Date.now()}`,
          provider: this.providerFromBase(baseUrl),
          message,
        };
      }

      return {
        status: 'PENDING',
        reference: json.CheckoutRequestID,
        provider: this.providerFromBase(baseUrl),
        message: 'STK Push sent — awaiting customer confirmation',
      };
    } catch (err) {
      this.logger.error(
        `M-Pesa STK Push error for ${input.accountReference}`,
        err instanceof Error ? err.stack : String(err)
      );
      return {
        status: 'FAILED',
        reference: `STK-ERR-${Date.now()}`,
        provider: this.providerFromBase(baseUrl),
        message: err instanceof Error ? err.message : 'M-Pesa request failed',
      };
    }
  }

  async handleMpesaCallback(payload: unknown): Promise<{ ok: true }> {
    const callback = this.extractCallback(payload);
    if (!callback) {
      this.logger.warn(
        'M-Pesa callback received with unexpected shape',
        JSON.stringify(payload).slice(0, 500)
      );
      return { ok: true };
    }

    const { CheckoutRequestID, ResultCode, ResultDesc } = callback;
    const status: PaymentStatus = ResultCode === 0 ? 'SUCCEEDED' : 'FAILED';

    this.logger.log(
      `M-Pesa callback: ${CheckoutRequestID} → ${status} (${ResultCode}: ${ResultDesc})`
    );

    const booking = await this.prisma.booking.findFirst({
      where: { paymentRef: CheckoutRequestID },
      include: {
        user: { select: { name: true, email: true } },
        venue: { select: { name: true } },
      },
    });
    if (booking) {
      // Idempotent: only act on PENDING bookings. Retries from Safaricom or
      // replays land here as no-ops once we've already recorded the result.
      if (booking.paymentStatus !== 'PENDING') {
        this.logger.warn(
          `Ignored callback for booking ${booking.id}: already in status ${booking.paymentStatus}`
        );
        return { ok: true };
      }
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: status,
          // CANCELLED on failure releases the slot from the overlap check.
          status: status === 'SUCCEEDED' ? 'CONFIRMED' : 'CANCELLED',
        },
      });
      if (status === 'SUCCEEDED') {
        void this.mail.sendBookingConfirmation({
          to: booking.user.email,
          name: booking.user.name,
          venueName: booking.venue.name,
          date: booking.date.toISOString().slice(0, 10),
          startTime: booking.startTime,
          endTime: booking.endTime,
          totalAmountKES: booking.totalAmount,
          reference: booking.paymentRef ?? booking.id,
        });
      }
      return { ok: true };
    }

    const rsvp = await this.prisma.rsvp.findFirst({
      where: { paymentRef: CheckoutRequestID },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true } },
      },
    });
    if (rsvp) {
      if (rsvp.paymentStatus !== 'PENDING') {
        this.logger.warn(
          `Ignored callback for rsvp ${rsvp.id}: already in status ${rsvp.paymentStatus}`
        );
        return { ok: true };
      }
      if (status === 'SUCCEEDED') {
        await this.prisma.rsvp.update({
          where: { id: rsvp.id },
          data: { paymentStatus: 'SUCCEEDED' },
        });
        void this.mail.sendRsvpConfirmation({
          to: rsvp.user.email,
          name: rsvp.user.name,
          eventTitle: rsvp.event.title,
          attendees: rsvp.attendees,
          totalAmountKES: rsvp.totalAmount,
          reference: rsvp.reference,
        });
      } else {
        // Release the tickets back to the pool, atomically with the rsvp update.
        await this.prisma.$transaction([
          this.prisma.rsvp.update({
            where: { id: rsvp.id },
            data: { paymentStatus: 'FAILED' },
          }),
          this.prisma.event.update({
            where: { id: rsvp.eventId },
            data: { ticketsSold: { decrement: rsvp.attendees } },
          }),
        ]);
      }
      return { ok: true };
    }

    // No match — could be a stale callback for a deleted record, or a replay
    // attempt. We've already passed the IP allowlist guard, so this is most
    // likely benign noise; log it for observability.
    this.logger.warn(
      `No Booking or Rsvp matched paymentRef=${CheckoutRequestID} — possible replay or stale callback`
    );
    return { ok: true };
  }

  // ───────── Card (stub) ─────────

  private async initiateCard(input: InitiatePaymentInput): Promise<PaymentResult> {
    const stripeKey = this.config.get<string>('stripe.secretKey');
    if (!stripeKey) {
      this.logger.warn(
        `Stripe key missing — returning mocked card success for ${input.accountReference}.`
      );
      return {
        status: 'SUCCEEDED',
        reference: `MOCK-CARD-${Date.now()}`,
        provider: 'mock',
        message: 'Mocked card payment (Stripe not configured)',
      };
    }

    this.logger.log(`[TODO] Real Stripe charge for ${input.accountReference}`);
    return {
      status: 'PENDING',
      reference: `PI-${Date.now()}`,
      provider: 'stripe',
      message: 'PaymentIntent created — confirm on client',
    };
  }

  // ───────── Helpers ─────────

  private async getDarajaToken(
    baseUrl: string,
    consumerKey: string,
    consumerSecret: string
  ): Promise<string> {
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresAt > now + 60_000) {
      return this.tokenCache.token;
    }
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const res = await fetch(
      `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    if (!res.ok) {
      throw new Error(`Daraja OAuth failed: ${res.status} ${await res.text()}`);
    }
    const json = (await res.json()) as { access_token?: string; expires_in?: string };
    if (!json.access_token) {
      throw new Error('Daraja OAuth response missing access_token');
    }
    const expiresInSec = Number(json.expires_in ?? 3600);
    this.tokenCache = {
      token: json.access_token,
      expiresAt: now + expiresInSec * 1000,
    };
    return json.access_token;
  }

  private darajaTimestamp(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }

  private normalizePhone(input?: string): string | null {
    if (!input) return null;
    const digits = input.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('254')) return digits;
    if (digits.length === 10 && digits.startsWith('0')) return `254${digits.slice(1)}`;
    if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) {
      return `254${digits}`;
    }
    return null;
  }

  private extractCallback(
    payload: unknown
  ): { CheckoutRequestID: string; ResultCode: number; ResultDesc: string } | null {
    if (!payload || typeof payload !== 'object') return null;
    const body = (payload as { Body?: { stkCallback?: unknown } }).Body;
    const stkCallback = body?.stkCallback as
      | { CheckoutRequestID?: string; ResultCode?: number; ResultDesc?: string }
      | undefined;
    if (!stkCallback?.CheckoutRequestID || typeof stkCallback.ResultCode !== 'number') {
      return null;
    }
    return {
      CheckoutRequestID: stkCallback.CheckoutRequestID,
      ResultCode: stkCallback.ResultCode,
      ResultDesc: stkCallback.ResultDesc ?? '',
    };
  }

  private providerFromBase(baseUrl: string): 'mpesa-sandbox' | 'mpesa-prod' {
    return baseUrl.includes('sandbox') ? 'mpesa-sandbox' : 'mpesa-prod';
  }
}
