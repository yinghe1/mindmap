import { Card, Tag } from '../../design-system';
import { useGraphStore } from '../../store/graph-store';

interface OverviewProps {
  onShowPatterns?: () => void;
}

export function Overview({ onShowPatterns }: OverviewProps) {
  const graph = useGraphStore((s) => s.graph);
  const person = useGraphStore((s) => s.person);
  const context = useGraphStore((s) => s.context);

  if (!graph) return null;

  const coreNodes = graph.nodes.filter((n) => n.role === 'Core');
  const bridgeNodes = graph.nodes.filter((n) => n.role === 'Bridge');
  const topNodes = [...graph.nodes].sort((a, b) => b.importance - a.importance).slice(0, 4);

  return (
    <>
      <Card>
        <h3 style={{ margin: '0 0 8px', fontSize: 'var(--font-lg)' }}>Overview</h3>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', lineHeight: 1.45 }}>
          {person?.wiki_summary
            ? person.wiki_summary.slice(0, 200) + (person.wiki_summary.length > 200 ? '...' : '')
            : 'Select a node or edge to inspect importance, associations, life-phase shifts, and thematic trend.'}
        </p>
        {person?.wiki_url && (
          <a
            href={person.wiki_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', fontSize: 'var(--font-sm)', display: 'inline-block', marginTop: 8 }}
          >
            Wikipedia
          </a>
        )}
      </Card>

      {onShowPatterns && (
        <Card>
          <a
            href="/patterns"
            onClick={(e) => { e.preventDefault(); onShowPatterns(); }}
            style={{
              color: 'var(--accent)',
              fontSize: 'var(--font-md)',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Patterns &rarr;
          </a>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--font-sm)', margin: '4px 0 0' }}>
            Deep pattern analysis of thinking, behavior, and decisions
            {!context?.pattern_details && ' (regenerate to populate)'}
          </p>
        </Card>
      )}

      <Card>
        <strong>Interpretation</strong>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', lineHeight: 1.45, marginTop: 8 }}>
          {graph.nodes.length} themes, {graph.edges.length} connections.
          {coreNodes.length > 0 && ` ${coreNodes.length} core hubs.`}
          {bridgeNodes.length > 0 && ` ${bridgeNodes.length} bridge nodes.`}
        </p>
        <div style={{ marginTop: 10 }}>
          <Tag label="Core hubs" />
          <Tag label="Bridge nodes" />
          <Tag label="Emergent themes" />
        </div>
      </Card>

      <Card>
        <strong>Strongest attractors</strong>
        <div style={{ marginTop: 8 }}>
          {topNodes.map((n, i) => (
            <p key={n.id} style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', margin: '4px 0' }}>
              {i + 1}. {n.label}
            </p>
          ))}
        </div>
      </Card>

      {context && context.influences.length > 0 && (
        <Card>
          <strong>Key influences</strong>
          <div style={{ marginTop: 8 }}>
            {context.influences.slice(0, 5).map((inf) => (
              <p key={inf.name} style={{ fontSize: 'var(--font-md)', margin: '4px 0' }}>
                <a
                  href={`https://en.wikipedia.org/wiki/${encodeURIComponent(inf.name.replace(/\s+/g, '_'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'none' }}
                >
                  {inf.name}
                </a>
                <span style={{ color: 'var(--muted)' }}> ({inf.type})</span>
              </p>
            ))}
          </div>
        </Card>
      )}

      {graph.outcomes.length > 0 && (
        <Card>
          <strong>Key outcomes</strong>
          <div style={{ marginTop: 8 }}>
            {graph.outcomes.map((o) => (
              <div key={o.id} style={{ margin: '6px 0' }}>
                <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{o.label}</span>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--muted)', marginLeft: 8 }}>{o.year}</span>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--muted)', margin: '2px 0 0' }}>{o.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
