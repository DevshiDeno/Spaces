import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';
import { cn } from '@/utils/cn';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-secondary',
        className
      )}
    >
      <Sun className={cn('h-4 w-4 transition-all', isDark ? 'scale-0 rotate-90' : 'scale-100 rotate-0')} />
      <Moon className={cn('absolute h-4 w-4 transition-all', isDark ? 'scale-100 rotate-0' : 'scale-0 -rotate-90')} />
    </button>
  );
}
