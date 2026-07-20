import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

type Status = 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const { token = '' } = useParams<{ token: string }>();
  const { isAuthenticated, setUser } = useAuthStore();
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');
  const ranFor = useRef<string | null>(null);

  useEffect(() => {
    // Guard against the effect firing twice (React 18 StrictMode) for one token.
    if (ranFor.current === token) return;
    ranFor.current = token;

    (async () => {
      try {
        await authService.verifyEmail(token);
        // Refresh the cached user so the "verify your email" banner clears.
        if (isAuthenticated) {
          try {
            const fresh = await authService.me();
            setUser(fresh);
          } catch {
            /* non-fatal — verification still succeeded */
          }
        }
        setStatus('success');
      } catch (err) {
        setMessage(
          (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
            'This verification link is invalid or has expired.'
        );
        setStatus('error');
      }
    })();
  }, [token, isAuthenticated, setUser]);

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Confirming your email…</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <h1 className="heading-display mt-4 text-3xl font-bold tracking-tight">Email confirmed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks — your email address is verified. You're all set.
        </p>
        <Link
          to={isAuthenticated ? '/dashboard' : '/sign-in'}
          className="mt-6 font-medium text-primary hover:underline"
        >
          {isAuthenticated ? 'Go to your dashboard' : 'Sign in'} →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-4 text-center">
      <XCircle className="h-10 w-10 text-destructive" />
      <h1 className="heading-display mt-4 text-3xl font-bold tracking-tight">
        Couldn't verify email
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        {isAuthenticated ? (
          <>
            Head to your{' '}
            <Link to="/dashboard" className="font-medium text-primary hover:underline">
              dashboard
            </Link>{' '}
            to request a fresh link.
          </>
        ) : (
          <>
            <Link to="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{' '}
            to request a new verification link.
          </>
        )}
      </p>
    </div>
  );
}
