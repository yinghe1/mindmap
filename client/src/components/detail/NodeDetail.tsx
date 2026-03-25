import { Card, Bar, Tag } from '../../design-system';
import { SparkLine } from './SparkLine';
import { useGraphStore } from '../../store/graph-store';
import type { GraphNode } from '../../api/client';

interface NodeDetailProps {
  node: GraphNode;
}

export function NodeDetail({ node }: NodeDetailProps) {
  const graph = useGraphStore((s) => s.graph);
  const clearSelection = useGraphStore((s) => s.clearSelection);

  const connected = graph
    ? graph.edges
        .filter((e) => e.source === node.id || e.target === node.id)
        .sort((a, b) => b.weight - a.weight)
        .map((e) => {
          const otherId = e.source === node.id ? e.target : e.source;
          const otherNode = graph.nodes.find((n) => n.id === otherId);
          return { edge: e, other: otherNode };
        })
        .filter((x) => x.other)
    : [];

  return (
    <>
      <div
        onClick={clearSelection}
        style={{ fontSize: 'var(--font-sm)', color: 'var(--accent)', cursor: 'pointer', marginBottom: 10 }}
      >
        &larr; Back to Overview
      </div>
      <Card>
        <h3 style={{ margin: '0 0 8px', fontSize: 'var(--font-lg)' }}>{node.label}</h3>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', lineHeight: 1.45 }}>
          {node.role} node in the {node.cluster} cluster.
          Importance {Math.round(node.importance * 100)}, momentum {Math.round(node.momentum * 100)}, bridge score {Math.round(node.bridge * 100)}.
        </p>
      </Card>

      <Card>
        <Bar value={node.importance} label="Importance" showValue />
        <Bar value={node.momentum} label="Momentum" showValue />
        <Bar value={node.bridge} label="Bridge score" showValue />
        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--muted)', marginTop: 8 }}>
          Trend across life phases
        </div>
        <SparkLine values={node.trend} />
      </Card>

      <Card>
        <strong>Representative excerpt</strong>
        <p style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', lineHeight: 1.45, marginTop: 8 }}>
          {node.excerpt}
        </p>
      </Card>

      <Card>
        <strong>Subthemes</strong>
        <div style={{ marginTop: 8 }}>
          {node.subthemes.map((s) => (
            <Tag key={s} label={s} />
          ))}
        </div>
      </Card>

      {connected.length > 0 && (
        <Card>
          <strong>Top associations</strong>
          <div style={{ marginTop: 8 }}>
            {connected.map(({ edge, other }) => (
              <p key={edge.source + edge.target} style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', margin: '4px 0' }}>
                {other!.label} · {Math.round(edge.weight * 100)}
              </p>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
