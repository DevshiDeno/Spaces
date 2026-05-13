import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PaymentMethod, PaymentStatus } from '@prisma/client';

export interface InitiatePaymentInput {
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  phone?: string;
  email?: string;
}

export interface PaymentResult {
  status: PaymentStatus;
  reference: string;
  provider: 'mpesa-sandbox' | 'stripe' | 'mock';
  message?: string;
}

/**
 * Stubbed payments service.
 *
 * For M-Pesa: wire up Daraja STK Push in `initiateMpesa()` and handle the
 * webhook in `handleMpesaCallback()`. Currently both return mocked success
 * so the booking flow works end-to-end without real credentials.
 *
 * For card: drop in Stripe / Flutterwave / DPO inside `initiateCard()`.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly config: ConfigService) {}

  async initiate(input: InitiatePaymentInput): Promise<PaymentResult> {
    if (input.method === 'MPESA') return this.initiateMpesa(input);
    return this.initiateCard(input);
  }

  // ───────── M-Pesa ─────────

  private async initiateMpesa(input: InitiatePaymentInput): Promise<PaymentResult> {
    const consumerKey = this.config.get<string>('mpesa.consumerKey');
    const consumerSecret = this.config.get<string>('mpesa.consumerSecret');

    if (!consumerKey || !consumerSecret) {
      this.logger.warn(
        `M-Pesa credentials missing — returning mocked success for booking ${input.bookingId}.` +
          ' Set MPESA_* env vars and implement STK Push to enable real payments.'
      );
      return {
        status: 'SUCCEEDED',
        reference: `MOCK-MPESA-${Date.now()}`,
        provider: 'mock',
        message: 'Mocked STK Push (credentials not configured)',
      };
    }

    // TODO: Implement Daraja STK Push:
    // 1) POST https://{baseUrl}/oauth/v1/generate?grant_type=client_credentials
    //    with Basic Auth (consumerKey:consumerSecret) → token
    // 2) Build STK Push payload:
    //    {
    //      BusinessShortCode, Password, Timestamp, TransactionType: 'CustomerPayBillOnline',
    //      Amount, PartyA: phone, PartyB: shortcode, PhoneNumber: phone,
    //      CallBackURL: this.config.get('mpesa.callbackUrl'),
    //      AccountReference: input.bookingId, TransactionDesc: 'Venue booking'
    //    }
    // 3) POST https://{baseUrl}/mpesa/stkpush/v1/processrequest with Bearer token
    // 4) Persist CheckoutRequestID → booking.paymentRef
    // 5) Return PENDING — finalization happens in handleMpesaCallback().

    this.logger.log(`[TODO] Real STK Push for booking ${input.bookingId}`);
    return {
      status: 'PENDING',
      reference: `STK-${Date.now()}`,
      provider: 'mpesa-sandbox',
      message: 'STK Push sent — awaiting customer confirmation',
    };
  }

  async handleMpesaCallback(payload: unknown): Promise<{ ok: true }> {
    // TODO: Verify callback signature, parse stkCallback.ResultCode,
    // mark Booking.paymentStatus = SUCCEEDED / FAILED accordingly.
    this.logger.log('M-Pesa callback received', JSON.stringify(payload).slice(0, 500));
    return { ok: true };
  }

  // ───────── Card ─────────

  private async initiateCard(input: InitiatePaymentInput): Promise<PaymentResult> {
    const stripeKey = this.config.get<string>('stripe.secretKey');
    if (!stripeKey) {
      this.logger.warn(
        `Stripe key missing — returning mocked card success for booking ${input.bookingId}.`
      );
      return {
        status: 'SUCCEEDED',
        reference: `MOCK-CARD-${Date.now()}`,
        provider: 'mock',
        message: 'Mocked card payment (Stripe not configured)',
      };
    }

    // TODO: Create a Stripe PaymentIntent for `input.amount * 100` cents,
    // return clientSecret to the frontend, finalize via webhook.
    this.logger.log(`[TODO] Real Stripe charge for booking ${input.bookingId}`);
    return {
      status: 'PENDING',
      reference: `PI-${Date.now()}`,
      provider: 'stripe',
      message: 'PaymentIntent created — confirm on client',
    };
  }
}
