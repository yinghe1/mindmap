interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  color?: string;
}

export function Chip({ label, active, onClick, color }: ChipProps) {
  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid var(--border)',
        background: 'var(--chip)',
        color: color || 'var(--text)',
        borderRadius: 'var(--radius-pill)',
        padding: '7px 11px',
        fontSize: 'var(--font-sm)',
        cursor: onClick ? 'pointer' : 'default',
        outline: active ? '2px solid rgba(138,183,255,0.5)' : 'none',
        transition: 'background 0.15s, outline 0.15s',
        userSelect: 'none',
      }}
    >
      {label}
    </div>
  );
}
