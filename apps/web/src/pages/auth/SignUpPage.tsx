import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  isSpaceOwner: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function SignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const isOwnerFlow = searchParams.get('owner') === '1';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isSpaceOwner: isOwnerFlow },
  });
  const isSpaceOwner = watch('isSpaceOwner');

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

        <div>
          <p className="mb-2 text-sm font-medium">Are you a space owner?</p>
          <p className="mb-3 text-xs text-muted-foreground">You can also do this later from your profile.</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue('isSpaceOwner', true)}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                isSpaceOwner ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border'
              }`}
            >
              Yes, I want to list my space
            </button>
            <button
              type="button"
              onClick={() => setValue('isSpaceOwner', false)}
              className={`rounded-lg border p-3 text-left text-sm transition ${
                !isSpaceOwner ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border'
              }`}
            >
              No, just book spaces for now
            </button>
          </div>
        </div>

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
    </>
  );
}
