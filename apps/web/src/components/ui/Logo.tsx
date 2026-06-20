import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2.5', className)} aria-label="Spaces For you">
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-coral-400 to-coral-600 text-white shadow-md shadow-coral-500/30">
        <span className="font-display text-lg font-bold leading-none">S</span>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent ring-2 ring-background" />
      </span>
      {showWordmark && (
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="font-display text-base font-bold tracking-tight">Spaces</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">For you</span>
        </span>
      )}
    </Link>
  );
}
