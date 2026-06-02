import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { authService, type InviteInfo } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/useToast';

const schema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters'),
    confirm: z.string().min(8, 'Use at least 8 characters'),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

type LoadState =
  | { status: 'loading' }
  | { status: 'invalid'; message: string }
  | { status: 'ready'; invite: InviteInfo };

export default function AcceptInvitePage() {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const toast = useToast();
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    let cancelled = false;
    authService
      .getInvite(token)
      .then((invite) => {
        if (!cancelled) setState({ status: 'ready', invite });
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err?.response?.data?.message ?? 'This invite link is no longer valid.';
        setState({ status: 'invalid', message });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(values: FormValues) {
    try {
      const { user, token: jwt } = await authService.acceptInvite(token, values.password);
      setSession(user, jwt);
      toast.success('Welcome aboard', `You're signed in as ${user.email}.`);
      navigate('/dashboard');
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'Could not activate your account. Please try again.';
      toast.error(message);
    }
  }

  if (state.status === 'loading') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (state.status === 'invalid') {
    return (
      <>
        <h1 className="heading-display text-3xl font-bold tracking-tight">Invite unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link to="/sign-in">
            <Button fullWidth variant="outline">Sign in instead</Button>
          </Link>
          <Link to="/become-an-ally">
            <Button fullWidth variant="ghost">Submit a new application</Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <ShieldCheck className="h-3.5 w-3.5" /> Ally application approved
      </div>
      <h1 className="heading-display mt-3 text-3xl font-bold tracking-tight">
        Set your password
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome, {state.invite.name.split(' ')[0]}. You're activating the owner account for{' '}
        <span className="font-medium text-foreground">{state.invite.email}</span>.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input
          label="New password"
          type={showPassword ? 'text' : 'password'}
          leftIcon={<Lock className="h-4 w-4" />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          placeholder="At least 8 characters"
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Re-enter your password"
          error={errors.confirm?.message}
          autoComplete="new-password"
          {...register('confirm')}
        />

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Activate account &amp; sign in
        </Button>
      </form>
    </>
  );
}
