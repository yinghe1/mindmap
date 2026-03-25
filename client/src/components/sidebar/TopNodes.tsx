import { Card, Bar } from '../../design-system';
import { useGraphStore } from '../../store/graph-store';
import { useUiStore } from '../../store/ui-store';

export function TopNodes() {
  const graph = useGraphStore((s) => s.graph);
  const monthIndex = useUiStore((s) => s.monthIndex);
  const timeMode = useUiStore((s) => s.timeMode);
  const selectNode = useGraphStore((s) => s.selectNode);

  if (!graph) return null;

  const scored = graph.nodes
    .map((n) => {
      const trendVal = n.trend[monthIndex] ?? 0.5;
      const value = timeMode === 'recent' ? trendVal * 0.75 + n.momentum * 0.25 : trendVal;
      return { node: n, value };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <Card>
      <h2 style={{ margin: '0 0 10px', fontSize: 'var(--font-sm)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.1 }}>
        Top {scored.length} nodes
      </h2>
      {scored.map((item, i) => (
        <div
          key={item.node.id}
          onClick={() => selectNode(item.node)}
          style={{ cursor: 'pointer', marginBottom: 4 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>
              {i + 1}. {item.node.label}
            </span>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--muted)' }}>
              {Math.round(item.value * 100)}
            </span>
          </div>
          <Bar value={item.value} />
        </div>
      ))}
    </Card>
  );
}
