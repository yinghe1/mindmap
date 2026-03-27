import { MarkdownRenderer } from './MarkdownRenderer';
import { useGraphStore } from '../../store/graph-store';

interface PatternsViewProps {
  patternDetails: string | null;
  onBack: () => void;
}

export function PatternsView({ patternDetails, onBack }: PatternsViewProps) {
  const person = useGraphStore((s) => s.person);

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
      {/* Subtle gradient background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at 20% 5%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 40%), radial-gradient(circle at 80% 15%, color-mix(in srgb, var(--accent2) 6%, transparent), transparent 35%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', padding: '40px 28px 80px' }}>
        {/* Back link */}
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); onBack(); }}
          style={{
            color: 'var(--accent)',
            fontSize: 'var(--font-sm)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 24,
            textDecoration: 'none',
            opacity: 0.8,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
        >
          <span style={{ fontSize: 14 }}>&larr;</span>
          Back to map
        </a>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 'var(--font-xs)',
            textTransform: 'uppercase',
            letterSpacing: 1.5,
            color: 'var(--accent)',
            fontWeight: 600,
            marginBottom: 8,
          }}>
            Pattern Analysis
          </div>
          <h1 style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
          }}>
            {person?.name || 'Patterns'}
          </h1>
          <p style={{
            fontSize: 'var(--font-md)',
            color: 'var(--muted)',
            marginTop: 8,
            lineHeight: 1.6,
          }}>
            Thinking, behavior, and decision-making structures
          </p>
          <div style={{
            height: 1,
            background: 'linear-gradient(90deg, var(--accent), var(--accent2), transparent)',
            marginTop: 20,
            opacity: 0.3,
          }} />
        </div>

        {/* Content */}
        {patternDetails ? (
          <MarkdownRenderer content={patternDetails} />
        ) : (
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 24px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', margin: 0 }}>
              No pattern analysis available yet.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--font-sm)', margin: '8px 0 0', opacity: 0.7 }}>
              Regenerate this person to run the deep pattern analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
