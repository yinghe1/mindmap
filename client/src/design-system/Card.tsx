import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

export function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        marginBottom: 16,
        padding: 14,
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
