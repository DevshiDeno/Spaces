import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/useToast';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await authService.requestPasswordReset(values.email);
      setSubmitted(true);
    } catch {
      toast.error('Could not request a password reset. Please try again.');
    }
  }

  if (submitted) {
    return (
      <>
        <h1 className="heading-display text-3xl font-bold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for that email, we've sent a password reset link. Open it within an
          hour to choose a new password.
        </p>
        <Link
          to="/sign-in"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </>
    );
  }

  return (
    <>
      <h1 className="heading-display text-3xl font-bold tracking-tight">Forgot password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your account email and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link to="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
