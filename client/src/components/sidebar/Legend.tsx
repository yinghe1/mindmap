import { Card } from '../../design-system';

const LEGEND_ITEMS = [
  { color: 'var(--technical)', label: 'Technical' },
  { color: 'var(--strategic)', label: 'Strategic' },
  { color: 'var(--reflective)', label: 'Reflective' },
  { color: 'var(--macro)', label: 'Macro' },
];

export function Legend() {
  return (
    <Card>
      <h2 style={{ margin: '0 0 10px', fontSize: 'var(--font-sm)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.1 }}>Legend</h2>
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: item.color,
              border: '1px solid var(--dot-border)',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 'var(--font-md)', color: 'var(--muted)' }}>{item.label}</span>
        </div>
      ))}
      <p style={{ marginTop: 8, fontSize: 'var(--font-sm)', color: 'var(--muted)' }}>
        Size = importance. Border = bridge score.
      </p>
    </Card>
  );
}
