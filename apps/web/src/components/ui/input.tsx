import { clsx } from 'clsx';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-atlas-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full rounded-xl border px-4 py-3 text-base transition-colors',
            'placeholder:text-atlas-text-secondary/50',
            'focus:outline-none focus:ring-2 focus:ring-atlas-accent focus:border-transparent',
            error ? 'border-atlas-error' : 'border-atlas-border',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-atlas-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
