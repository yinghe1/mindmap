interface BarProps {
  value: number;
  label?: string;
  showValue?: boolean;
}

export function Bar({ value, label, showValue }: BarProps) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ margin: '8px 0' }}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          {label && <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{label}</span>}
          {showValue && <span style={{ fontSize: 'var(--font-sm)', color: 'var(--muted)' }}>{pct}</span>}
        </div>
      )}
      <div
        style={{
          height: 8,
          borderRadius: 'var(--radius-pill)',
          overflow: 'hidden',
          background: 'var(--bar-track)',
        }}
      >
        <span
          style={{
            display: 'block',
            height: '100%',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
