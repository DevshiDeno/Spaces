import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leftIcon, rightSlot, id, className, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center rounded-lg border bg-background transition-colors',
            'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
            error ? 'border-destructive' : 'border-input'
          )}
        >
          {leftIcon && (
            <span className="pl-3 text-muted-foreground">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex-1 bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground',
              'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...rest}
          />
          {rightSlot && <span className="pr-3 text-muted-foreground">{rightSlot}</span>}
        </div>
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          hint && <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
