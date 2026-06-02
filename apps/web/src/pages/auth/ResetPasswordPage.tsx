import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
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

export default function ResetPasswordPage() {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await authService.confirmPasswordReset(token, values.password);
      toast.success('Password updated', 'Sign in with your new password.');
      navigate('/sign-in');
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'This link may have expired. Request a new one to continue.';
      toast.error('Could not reset password', message);
    }
  }

  return (
    <>
      <h1 className="heading-display text-3xl font-bold tracking-tight">Set a new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose a new password for your Qreative Spaces account.
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
          Update password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Need a new reset link?{' '}
        <Link to="/forgot-password" className="font-medium text-primary hover:underline">
          Request one
        </Link>
      </p>
    </>
  );
}
