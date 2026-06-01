import { clsx } from 'clsx';
import { ButtonHTMLAttributes, forwardRef, ReactElement, cloneElement } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-atlas-accent text-atlas-text-primary hover:brightness-105 active:brightness-95',
  secondary:
    'bg-atlas-bg-subtle text-atlas-text-primary border border-atlas-border hover:bg-atlas-border/50',
  ghost: 'text-atlas-text-primary hover:bg-atlas-bg-subtle',
  dark: 'bg-atlas-dark-surface text-white hover:opacity-90',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, asChild, ...props }, ref) => {
    const classes = clsx(
      'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:pointer-events-none',
      variants[variant],
      sizes[size],
      className
    );

    if (asChild && children) {
      const child = children as ReactElement<any>;
      return cloneElement(child, {
        className: clsx(classes, child.props?.className),
        ref,
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={classes}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
