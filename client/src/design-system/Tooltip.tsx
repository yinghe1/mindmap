import type { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  visible: boolean;
  x: number;
  y: number;
}

export function Tooltip({ children, visible, x, y }: TooltipProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        maxWidth: 320,
        pointerEvents: 'none',
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        background: 'rgba(8,12,24,0.94)',
        boxShadow: 'var(--shadow-tooltip)',
        color: 'var(--text)',
        fontSize: 'var(--font-sm)',
        lineHeight: 1.4,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 0.12s ease, transform 0.12s ease',
        zIndex: 100,
      }}
    >
      {children}
    </div>
  );
}
