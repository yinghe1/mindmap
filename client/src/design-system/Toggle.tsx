interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label
      style={{
        display: 'inline-flex',
        gap: 8,
        alignItems: 'center',
        padding: '7px 10px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--chip)',
        border: '1px solid var(--border)',
        fontSize: 'var(--font-sm)',
        color: 'var(--muted)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: 'var(--accent)' }}
      />
      {label}
    </label>
  );
}
