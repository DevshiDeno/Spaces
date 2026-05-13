import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, className, ...rest }, ref) => {
    const checkboxId = id ?? rest.name;
    return (
      <label htmlFor={checkboxId} className={cn('inline-flex cursor-pointer items-start gap-2.5', className)}>
        <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className="peer absolute h-full w-full appearance-none rounded border border-input bg-background checked:border-primary checked:bg-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            {...rest}
          />
          <Check className="pointer-events-none h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100" />
        </span>
        {label && <span className="text-sm leading-tight text-foreground">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
