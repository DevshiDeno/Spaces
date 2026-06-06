import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { AppConfig } from '@/config/configuration';
import {
  allyInviteEmail,
  bookingConfirmationEmail,
  contactNotificationEmail,
  passwordResetEmail,
  payoutSettledEmail,
  rsvpConfirmationEmail,
} from './mail.templates';

export interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private client: Resend | null = null;
  private from = '';
  private supportEmail = '';

  constructor(private readonly config: ConfigService<AppConfig>) {}

  onModuleInit() {
    const mail = this.config.get('mail', { infer: true });
    if (!mail) return;
    this.from = mail.from;
    this.supportEmail = mail.supportEmail;
    if (mail.resendApiKey) {
      this.client = new Resend(mail.resendApiKey);
    } else {
      this.logger.warn(
        'RESEND_API_KEY is not set — email sends will be logged instead of delivered.'
      );
    }
  }

  /** Low-level send. Never throws — failures are logged but don't disrupt the caller. */
  async send(args: SendArgs): Promise<{ delivered: boolean; id?: string }> {
    if (!this.client) {
      this.logger.warn(
        `[mail:noop] would send "${args.subject}" to ${Array.isArray(args.to) ? args.to.join(',') : args.to}`
      );
      return { delivered: false };
    }
    try {
      const result = await this.client.emails.send({
        from: this.from,
        to: args.to,
        subject: args.subject,
        html: args.html,
        replyTo: args.replyTo,
      });
      if (result.error) {
        this.logger.error(`Resend error for "${args.subject}": ${result.error.message}`);
        return { delivered: false };
      }
      return { delivered: true, id: result.data?.id };
    } catch (err) {
      this.logger.error(
        `Mail send threw for "${args.subject}"`,
        err instanceof Error ? err.stack : String(err)
      );
      return { delivered: false };
    }
  }

  // ───────── High-level senders ─────────

  sendAllyInvite(args: { to: string; applicantName: string; inviteUrl: string; expiresAt: Date }) {
    const { subject, html } = allyInviteEmail(args);
    return this.send({ to: args.to, subject, html });
  }

  sendPasswordReset(args: { to: string; name: string; resetUrl: string; expiresAt: Date }) {
    const { subject, html } = passwordResetEmail(args);
    return this.send({ to: args.to, subject, html });
  }

  sendBookingConfirmation(args: {
    to: string;
    name: string;
    venueName: string;
    date: string;
    startTime: string;
    endTime: string;
    totalAmountKES: number;
    reference: string;
  }) {
    const { subject, html } = bookingConfirmationEmail(args);
    return this.send({ to: args.to, subject, html });
  }

  sendRsvpConfirmation(args: {
    to: string;
    name: string;
    eventTitle: string;
    attendees: number;
    totalAmountKES: number;
    reference: string;
  }) {
    const { subject, html } = rsvpConfirmationEmail(args);
    return this.send({ to: args.to, subject, html });
  }

  sendPayoutSettled(args: {
    to: string;
    ownerName: string;
    venueName: string;
    amountKES: number;
    payoutRef: string;
  }) {
    const { subject, html } = payoutSettledEmail(args);
    return this.send({ to: args.to, subject, html });
  }

  sendContactNotification(args: {
    name: string;
    email: string;
    subject: string;
    message: string;
    isVenueInquiry: boolean;
  }) {
    if (!this.supportEmail) {
      this.logger.warn(
        'SUPPORT_EMAIL not set — contact form submissions will not notify anyone via email.'
      );
      return Promise.resolve({ delivered: false });
    }
    const { subject, html } = contactNotificationEmail(args);
    return this.send({
      to: this.supportEmail,
      subject,
      html,
      replyTo: args.email,
    });
  }
}
