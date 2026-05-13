import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-5">
      <aside className="relative hidden overflow-hidden lg:col-span-2 lg:block">
        <img
          src="/images/venue-1.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-coral-600/90 via-coral-500/70 to-accent/60" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <Logo className="text-white" />
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">
              Inclusive spaces.
              <br /> Safer experiences.
              <br /> Creative connections.
            </h2>
            <p className="mt-4 max-w-md text-white/85">
              Join thousands of organizers, artists, and venue owners building safer creative
              communities across Kenya.
            </p>
          </div>
          <p className="text-xs text-white/70">© Qreative Spaces · Nairobi, Kenya</p>
        </div>
      </aside>
      <main className="relative col-span-3 flex flex-col items-center justify-center px-6 py-10">
        <Link
          to="/"
          className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
