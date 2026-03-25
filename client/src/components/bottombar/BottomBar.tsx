import { useGraphStore } from '../../store/graph-store';

export function BottomBar() {
  const version = useGraphStore((s) => s.version);
  const cached = useGraphStore((s) => s.cached);

  return (
    <div
      style={{
        padding: '14px 18px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <strong>Interaction:</strong>{' '}
        <span style={{ color: 'var(--muted)', fontSize: 'var(--font-md)' }}>
          Click node or edge for details, drag nodes, use filters and time slider.
        </span>
      </div>
      <div style={{ color: 'var(--muted)', fontSize: 'var(--font-sm)' }}>
        {version && (
          <>
            v{version.version} · {version.node_count} nodes · {version.edge_count} edges
            {version.generation_ms > 0 && ` · ${(version.generation_ms / 1000).toFixed(1)}s`}
            {cached && ' · cached'}
          </>
        )}
      </div>
    </div>
  );
}
