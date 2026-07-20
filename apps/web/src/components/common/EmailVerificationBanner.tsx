import { useState } from 'react';
import { MailWarning } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/useToast';

/**
 * Soft email-verification nudge. Shown only when the signed-in user is
 * explicitly unverified (emailVerified === false) — never for legacy sessions
 * where the flag is unknown. Doesn't gate anything; just offers a resend.
 */
export function EmailVerificationBanner() {
  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const [sending, setSending] = useState(false);

  if (!user || user.emailVerified !== false) return null;

  async function resend() {
    setSending(true);
    try {
      await authService.resendVerification();
      toast.success('Verification email sent', `Check ${user?.email} for the confirmation link.`);
    } catch {
      toast.error('Could not send email', 'Please try again in a moment.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
      <MailWarning className="h-4 w-4 shrink-0 text-amber-600" />
      <p className="flex-1 text-amber-900 dark:text-amber-200">
        Confirm your email to secure your account and receive booking confirmations.
      </p>
      <button
        type="button"
        onClick={resend}
        disabled={sending}
        className="font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800 disabled:opacity-60 dark:text-amber-300"
      >
        {sending ? 'Sending…' : 'Resend email'}
      </button>
    </div>
  );
}
