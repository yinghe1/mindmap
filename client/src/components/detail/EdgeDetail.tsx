import { Card, Bar, Tag } from '../../design-system';
import { useGraphStore } from '../../store/graph-store';
import type { GraphEdge } from '../../api/client';

interface EdgeDetailProps {
  edge: GraphEdge;
}

export function EdgeDetail({ edge }: EdgeDetailProps) {
  const graph = useGraphStore((s) => s.graph);
  const clearSelection = useGraphStore((s) => s.clearSelection);
  const sourceNode = graph?.nodes.find((n) => n.id === edge.source);
  const targetNode = graph?.nodes.find((n) => n.id === edge.target);

  return (
    <>
      <div
        onClick={clearSelection}
        style={{ fontSize: 'var(--font-sm)', color: 'var(--accent)', cursor: 'pointer', marginBottom: 10 }}
      >
        &larr; Back to Overview
      </div>
      <Card>
        <h3 style={{ margin: '0 0 8px', fontSize: 'var(--font-lg)' }}>
          {sourceNode?.label || edge.source} ↔ {targetNode?.label || edge.target}
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', lineHeight: 1.45 }}>
          Association strength {Math.round(edge.weight * 100)} with recent change {Math.round(edge.recentChange * 100)}.
          Classified as {edge.type.replace(/_/g, ' ')}.
        </p>
      </Card>

      <Card>
        <Bar value={edge.weight} label="Association strength" showValue />
        <Bar value={Math.min(edge.recentChange * 5, 1)} label="Recent change" showValue />
      </Card>

      <Card>
        <strong>Representative excerpt</strong>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', lineHeight: 1.45, marginTop: 8 }}>
          {edge.excerpt}
        </p>
      </Card>

      <Card>
        <strong>Shared topics</strong>
        <div style={{ marginTop: 8 }}>
          {edge.shared.map((s) => (
            <Tag key={s} label={s} />
          ))}
        </div>
      </Card>
    </>
  );
}
