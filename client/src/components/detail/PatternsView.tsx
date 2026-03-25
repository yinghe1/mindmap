import { Card } from '../../design-system';
import type { Patterns, PatternItem } from '../../api/client';

interface PatternsViewProps {
  patterns: Patterns | null;
  onBack: () => void;
}

function PatternCategory({ title, items }: { title: string; items: PatternItem[] }) {
  const sorted = [...items].sort((a, b) => b.strength - a.strength);

  return (
    <Card>
      <strong style={{ textTransform: 'capitalize' }}>{title}</strong>
      <div style={{ marginTop: 10 }}>
        {sorted.map((item) => (
          <div key={item.pattern} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 'var(--font-md)', fontWeight: 600 }}>{item.pattern}</span>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--muted)' }}>
                {Math.round(item.strength * 100)}%
              </span>
            </div>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: 'var(--bar-track)',
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${item.strength * 100}%`,
                  borderRadius: 2,
                  background: 'var(--accent)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>
              {item.description}
            </p>
            {item.samples && item.samples.length > 0 && (
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, listStyle: 'disc' }}>
                {item.samples.map((s, i) => (
                  <li key={i} style={{ fontSize: 'var(--font-sm)', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.4, marginBottom: 2 }}>
                    {s}
                  </li>
                ))}
              </ul>
            )}
            {item.impact && (
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text)', margin: '6px 0 0', lineHeight: 1.4 }}>
                <strong style={{ color: 'var(--accent)' }}>Impact:</strong> {item.impact}
              </p>
            )}
            {item.outcome && (
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text)', margin: '4px 0 0', lineHeight: 1.4 }}>
                <strong style={{ color: 'var(--accent2)' }}>Outcome:</strong> {item.outcome}
              </p>
            )}
            {item.influence && (
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text)', margin: '4px 0 0', lineHeight: 1.4 }}>
                <strong style={{ color: 'var(--strategic)' }}>Influence:</strong> {item.influence}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function PatternsView({ patterns, onBack }: PatternsViewProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--bg)',
        overflowY: 'auto',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <a
          onClick={onBack}
          style={{
            color: 'var(--accent)',
            fontSize: 'var(--font-sm)',
            cursor: 'pointer',
            display: 'inline-block',
            marginBottom: 8,
          }}
        >
          &larr; Back
        </a>
        <h3 style={{ margin: '0 0 8px', fontSize: 'var(--font-lg)' }}>Patterns</h3>
        <p
          style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--muted)',
            fontStyle: 'italic',
            marginTop: 0,
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          Strength indicates how dominant each pattern is in this person's profile — 100% means a defining characteristic, lower values indicate secondary or occasional patterns.
        </p>
        {patterns ? (
          <>
            <PatternCategory title="Thinking" items={patterns.thinking} />
            <PatternCategory title="Speaking" items={patterns.speaking} />
            <PatternCategory title="Behavior" items={patterns.behavior} />
          </>
        ) : (
          <Card>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', margin: 0 }}>
              No patterns data available. Regenerate this person to populate patterns.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
