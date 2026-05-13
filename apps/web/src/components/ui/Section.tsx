import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  spacing?: 'tight' | 'normal' | 'loose';
}

const spacings = {
  tight: 'py-12 sm:py-16',
  normal: 'py-16 sm:py-24',
  loose: 'py-24 sm:py-32',
};

export function Section({ spacing = 'normal', className, children, ...rest }: SectionProps) {
  return (
    <section className={cn(spacings[spacing], className)} {...rest}>
      {children}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <span className="h-px w-6 bg-primary" />
          {eyebrow}
        </p>
      )}
      <h2 className="heading-display text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-muted-foreground sm:text-lg text-pretty">
          {description}
        </p>
      )}
    </div>
  );
}
