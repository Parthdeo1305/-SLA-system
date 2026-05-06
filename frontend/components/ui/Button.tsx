import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const VARIANT_STYLES = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-[var(--color-text-primary)] shadow-sm hover:shadow-indigo-500/20 hover:shadow-md',
  secondary:
    'bg-[var(--color-surface-3)] hover:bg-[var(--color-border-hover)] text-[var(--color-text-primary)] border border-[var(--color-border)]',
  danger:
    'bg-red-900/50 hover:bg-red-900 text-[var(--color-danger-text)] border border-red-900 hover:text-red-300',
  ghost:
    'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]',
};

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
