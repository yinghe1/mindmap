import { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  fullWidth?: boolean;
}

export function Input({ fullWidth, style, ...props }: InputProps) {
  return (
    <input
      style={{
        appearance: 'none',
        background: 'var(--chip)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text)',
        padding: '12px 16px',
        fontSize: '16px',
        outline: 'none',
        width: fullWidth ? '100%' : undefined,
        transition: 'border-color 0.15s',
        ...style,
      }}
      {...props}
    />
  );
}
