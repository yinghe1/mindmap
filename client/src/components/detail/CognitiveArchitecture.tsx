import { Card, Tag } from '../../design-system';
import { useGraphStore } from '../../store/graph-store';

export function CognitiveArchitecturePanel() {
  const context = useGraphStore((s) => s.context);
  const person = useGraphStore((s) => s.person);

  const arch = context?.cognitive_architecture;
  if (!arch) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          fontSize: 'var(--font-sm)',
          textTransform: 'uppercase',
          letterSpacing: 1.1,
          color: 'var(--muted)',
          marginBottom: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
        }}
      >
        Cognitive Architecture
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>{'\u{1F9E0}'}</span>
          <strong style={{ fontSize: 'var(--font-lg)' }}>
            {person?.name ? `How ${person.name.split(' ')[0]} Thinks` : 'Decision Architecture'}
          </strong>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', lineHeight: 1.5 }}>
          {arch.summary}
        </p>
        <div style={{ marginTop: 8 }}>
          <Tag label={arch.primary_driver} color="var(--accent)" />
        </div>
      </Card>

      <Card>
        <strong>Decision Path</strong>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--font-xs)', margin: '4px 0 12px' }}>
          How situations are processed from trigger to action
        </p>
        <div style={{ position: 'relative', paddingLeft: 20 }}>
          {/* Vertical connector line */}
          <div
            style={{
              position: 'absolute',
              left: 7,
              top: 4,
              bottom: 4,
              width: 2,
              background: 'linear-gradient(180deg, var(--accent), var(--accent2), var(--warn))',
              borderRadius: 1,
              opacity: 0.4,
            }}
          />
          {arch.decision_path.map((step, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: i < arch.decision_path.length - 1 ? 16 : 0 }}>
              {/* Node dot */}
              <div
                style={{
                  position: 'absolute',
                  left: -17,
                  top: 3,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: i === 0
                    ? 'var(--accent)'
                    : i === arch.decision_path.length - 1
                    ? 'var(--warn)'
                    : 'var(--accent2)',
                  border: '2px solid var(--dot-border)',
                }}
              />
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: 'var(--text)' }}>
                {step.stage}
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 'var(--font-sm)', margin: '2px 0 4px', lineHeight: 1.4 }}>
                {step.description}
              </p>
              {step.branches.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {step.branches.map((b) => (
                    <span
                      key={b}
                      style={{
                        fontSize: 'var(--font-xs)',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--accent) 18%, transparent)',
                        color: 'var(--accent)',
                      }}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <strong>Core Tensions</strong>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--font-xs)', margin: '4px 0 10px' }}>
          Internal opposing forces that shape behaviour
        </p>
        {arch.cognitive_tensions.map((t, i) => (
          <div
            key={i}
            style={{
              marginBottom: i < arch.cognitive_tensions.length - 1 ? 12 : 0,
              padding: '10px 12px',
              background: 'var(--subtle-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--chip)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 'var(--font-sm)',
                  fontWeight: 700,
                  color: 'var(--accent)',
                }}
              >
                {t.pole_a}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: 'var(--font-xs)' }}>vs</span>
              <span
                style={{
                  fontSize: 'var(--font-sm)',
                  fontWeight: 700,
                  color: 'var(--accent2)',
                }}
              >
                {t.pole_b}
              </span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--font-sm)', margin: 0, lineHeight: 1.4 }}>
              {t.description}
            </p>
          </div>
        ))}
      </Card>

      <Card>
        <strong>Behavioural Signature</strong>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', lineHeight: 1.5, marginTop: 6 }}>
          {arch.behavioural_signature}
        </p>
      </Card>
    </div>
  );
}
