interface TagProps {
  label: string;
  color?: string;
}

export function Tag({ label, color }: TagProps) {
  const c = color || 'var(--accent)';
  return (
    <span
      style={{
        display: 'inline-block',
        margin: '4px 6px 0 0',
        padding: '4px 8px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 'var(--font-sm)',
        color: c,
        background: `color-mix(in srgb, ${c} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${c} 18%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}
