interface SliderProps {
  min: number;
  max: number;
  value: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  displayValue?: string;
}

export function Slider({ min, max, value, step = 1, onChange, label, displayValue }: SliderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {label && <span style={{ fontSize: 'var(--font-sm)', color: 'var(--muted)' }}>{label}</span>}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: 220, accentColor: 'var(--accent)' }}
      />
      {displayValue && <span style={{ fontSize: 'var(--font-sm)', color: 'var(--muted)', minWidth: 80 }}>{displayValue}</span>}
    </div>
  );
}
