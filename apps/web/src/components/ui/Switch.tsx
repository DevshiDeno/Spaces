import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, ...rest }, ref) => (
    <label className={cn('inline-flex cursor-pointer items-center gap-3', className)}>
      <span className="relative inline-block h-6 w-11">
        <input ref={ref} type="checkbox" className="peer sr-only" {...rest} />
        <span className="absolute inset-0 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      {label && <span className="text-sm">{label}</span>}
    </label>
  )
);

Switch.displayName = 'Switch';
