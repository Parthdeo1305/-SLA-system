import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function Card({ children, className = '', hover = false, glow = false }: CardProps) {
  return (
    <div
      className={`
        rounded-xl border bg-[var(--color-surface-2)] border-[var(--color-border)]
        shadow-[var(--shadow-card)]
        ${hover ? 'transition-all duration-200 hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5' : ''}
        ${glow ? 'shadow-[var(--shadow-glow-primary)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
