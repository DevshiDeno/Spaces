/**
 * Plain-HTML email templates. Kept inline (no external template engine) so
 * the email build is part of normal type-checking.
 *
 * If you outgrow these, the natural upgrade is React Email or MJML.
 */

const BRAND = 'Spaces For you';
const BRAND_COLOR = '#E07A5F'; // coral, matches the web theme

interface ButtonOpts {
  label: string;
  href: string;
}

function layout(opts: { heading: string; body: string; cta?: ButtonOpts; footer?: string }): string {
  const cta = opts.cta
    ? `<p style="margin:32px 0;">
         <a href="${opts.cta.href}" style="background:${BRAND_COLOR};color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">${opts.cta.label}</a>
       </p>`
    : '';
  const footer = opts.footer ?? `&copy; ${new Date().getFullYear()} ${BRAND} &middot; Nairobi, Kenya`;

  return `<!doctype html>
<html>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f7f5f2;margin:0;padding:24px;color:#1f1d1b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ebe7e1;">
      <tr>
        <td style="padding:28px 32px 8px 32px;">
          <div style="font-size:18px;font-weight:700;color:${BRAND_COLOR};letter-spacing:-0.01em;">${BRAND}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 32px 32px 32px;">
          <h1 style="font-size:22px;margin:8px 0 16px 0;line-height:1.3;">${opts.heading}</h1>
          <div style="font-size:15px;line-height:1.6;color:#3a3633;">${opts.body}</div>
          ${cta}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px 24px 32px;border-top:1px solid #ebe7e1;font-size:12px;color:#857e77;text-align:center;">
          ${footer}
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function allyInviteEmail(input: {
  applicantName: string;
  inviteUrl: string;
  expiresAt: Date;
}) {
  const subject = "You're approved as a Spaces For you ally";
  const html = layout({
    heading: `Welcome aboard, ${input.applicantName.split(' ')[0]}.`,
    body: `<p>Your application has been approved. Activate your owner account to start listing your space and managing bookings.</p>
           <p style="color:#857e77;font-size:13px;">This link expires on ${input.expiresAt.toUTCString()}.</p>`,
    cta: { label: 'Set your password', href: input.inviteUrl },
  });
  return { subject, html };
}

export function welcomeEmail(input: {
  name: string;
  verifyUrl: string;
  expiresAt: Date;
}) {
  const subject = `Welcome to ${BRAND}`;
  const html = layout({
    heading: `Welcome, ${input.name.split(' ')[0]}!`,
    body: `<p>Thanks for joining ${BRAND} — inclusive venues and creative connections across Kenya.</p>
           <p>Confirm your email so we can send you booking confirmations and keep your account secure.</p>
           <p style="color:#857e77;font-size:13px;">This link expires on ${input.expiresAt.toUTCString()}. You can keep using your account in the meantime.</p>`,
    cta: { label: 'Confirm your email', href: input.verifyUrl },
  });
  return { subject, html };
}

export function verifyEmailTemplate(input: {
  name: string;
  verifyUrl: string;
  expiresAt: Date;
}) {
  const subject = `Confirm your ${BRAND} email`;
  const html = layout({
    heading: 'Confirm your email',
    body: `<p>Hi ${input.name.split(' ')[0]}, tap the button below to verify this email address.</p>
           <p style="color:#857e77;font-size:13px;">This link expires on ${input.expiresAt.toUTCString()}. If you didn't request this, you can ignore it.</p>`,
    cta: { label: 'Confirm your email', href: input.verifyUrl },
  });
  return { subject, html };
}

export function passwordResetEmail(input: {
  name: string;
  resetUrl: string;
  expiresAt: Date;
}) {
  const subject = 'Reset your Spaces For you password';
  const html = layout({
    heading: 'Reset your password',
    body: `<p>Hi ${input.name.split(' ')[0]}, we received a request to reset your password.</p>
           <p>Click the button below to choose a new one. If you didn't ask for this, you can safely ignore this email.</p>
           <p style="color:#857e77;font-size:13px;">This link expires on ${input.expiresAt.toUTCString()}.</p>`,
    cta: { label: 'Choose a new password', href: input.resetUrl },
  });
  return { subject, html };
}

export function bookingConfirmationEmail(input: {
  name: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmountKES: number;
  reference: string;
}) {
  const subject = `Booking confirmed: ${input.venueName}`;
  const html = layout({
    heading: `Your booking is confirmed.`,
    body: `<p>Hi ${input.name.split(' ')[0]}, your reservation at <strong>${input.venueName}</strong> is locked in.</p>
           <table style="margin-top:12px;font-size:14px;">
             <tr><td style="padding:4px 12px 4px 0;color:#857e77;">When</td><td>${input.date}, ${input.startTime}–${input.endTime}</td></tr>
             <tr><td style="padding:4px 12px 4px 0;color:#857e77;">Paid</td><td>KES ${input.totalAmountKES.toLocaleString()}</td></tr>
             <tr><td style="padding:4px 12px 4px 0;color:#857e77;">Reference</td><td><code>${input.reference}</code></td></tr>
           </table>`,
  });
  return { subject, html };
}

export function rsvpConfirmationEmail(input: {
  name: string;
  eventTitle: string;
  attendees: number;
  totalAmountKES: number;
  reference: string;
}) {
  const subject = `You're in: ${input.eventTitle}`;
  const html = layout({
    heading: `You're going to ${input.eventTitle}.`,
    body: `<p>Hi ${input.name.split(' ')[0]}, we've reserved <strong>${input.attendees} ticket${input.attendees > 1 ? 's' : ''}</strong> for you.</p>
           <table style="margin-top:12px;font-size:14px;">
             ${input.totalAmountKES > 0 ? `<tr><td style="padding:4px 12px 4px 0;color:#857e77;">Paid</td><td>KES ${input.totalAmountKES.toLocaleString()}</td></tr>` : ''}
             <tr><td style="padding:4px 12px 4px 0;color:#857e77;">Reference</td><td><code>${input.reference}</code></td></tr>
           </table>`,
  });
  return { subject, html };
}

export function payoutSettledEmail(input: {
  ownerName: string;
  venueName: string;
  amountKES: number;
  payoutRef: string;
}) {
  const subject = `Payout sent: ${input.venueName}`;
  const html = layout({
    heading: `KES ${input.amountKES.toLocaleString()} is on its way.`,
    body: `<p>Hi ${input.ownerName.split(' ')[0]}, your earnings from <strong>${input.venueName}</strong> have been settled.</p>
           <table style="margin-top:12px;font-size:14px;">
             <tr><td style="padding:4px 12px 4px 0;color:#857e77;">Amount</td><td>KES ${input.amountKES.toLocaleString()}</td></tr>
             <tr><td style="padding:4px 12px 4px 0;color:#857e77;">M-Pesa ref</td><td><code>${input.payoutRef}</code></td></tr>
           </table>
           <p style="margin-top:16px;color:#857e77;font-size:13px;">If you don't see the funds in a few minutes, reach out and we'll investigate.</p>`,
  });
  return { subject, html };
}

export function contactNotificationEmail(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  isVenueInquiry: boolean;
}) {
  const subject = `[Contact] ${input.subject}`;
  const html = layout({
    heading: input.isVenueInquiry ? 'New venue inquiry' : 'New contact form submission',
    body: `<p><strong>From:</strong> ${escapeHtml(input.name)} &lt;${escapeHtml(input.email)}&gt;</p>
           <p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
           <p style="margin-top:16px;white-space:pre-wrap;background:#f7f5f2;padding:16px;border-radius:8px;font-size:14px;">${escapeHtml(input.message)}</p>`,
    footer: 'Sent from the Spaces For you contact form.',
  });
  return { subject, html };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
