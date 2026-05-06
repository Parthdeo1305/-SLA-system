import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2.5 rounded-lg text-sm
            bg-[var(--color-surface-3)] border
            text-[var(--color-text-primary)]
            placeholder:text-[var(--color-text-muted)]
            transition-all duration-150
            ${
              error
                ? 'border-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-[var(--color-border)] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
            }
            outline-none
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-danger-text)]">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
