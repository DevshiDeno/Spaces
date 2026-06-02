import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/useToast';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function SignUpPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      const { user, token } = await authService.register(values);
      setSession(user, token);
      toast.success('Account created', `Welcome, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  }

  return (
    <>
      <h1 className="heading-display text-3xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Join our community of inclusive spaces.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Input
          label="Full name"
          leftIcon={<User className="h-4 w-4" />}
          placeholder="John Doe"
          error={errors.name?.message}
          autoComplete="name"
          {...register('name')}
        />
        <Input
          label="Email address"
          type="email"
          leftIcon={<Mail className="h-4 w-4" />}
          placeholder="you@example.com"
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          leftIcon={<Lock className="h-4 w-4" />}
          rightSlot={
            <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          placeholder="At least 6 characters"
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password')}
        />

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/sign-in" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>

      <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-center text-xs text-muted-foreground">
        Want to list a venue?{' '}
        <Link to="/become-an-ally" className="font-medium text-primary hover:underline">
          Apply to become an ally
        </Link>
        . We'll review your application and send you a login invite.
      </div>
    </>
  );
}
