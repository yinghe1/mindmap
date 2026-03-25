import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md';
}

export function Button({ variant = 'default', size = 'md', className = '', style, ...props }: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    appearance: 'none',
    border: '1px solid var(--border)',
    background: variant === 'primary' ? 'rgba(138,183,255,0.15)' : variant === 'ghost' ? 'transparent' : 'var(--chip)',
    color: variant === 'primary' ? 'var(--accent)' : 'var(--text)',
    borderRadius: 'var(--radius-pill)',
    padding: size === 'sm' ? '5px 10px' : '7px 14px',
    fontSize: 'var(--font-sm)',
    cursor: 'pointer',
    transition: 'background 0.15s',
    ...style,
  };

  return <button style={baseStyle} className={className} {...props} />;
}
