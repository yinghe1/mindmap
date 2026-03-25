import { useGraphStore } from '../../store/graph-store';
import { useUiStore, type TimeMode } from '../../store/ui-store';
import { Card, Chip, Toggle } from '../../design-system';
import { Legend } from './Legend';
import { TopNodes } from './TopNodes';
import type { ClusterType } from '../../api/client';

const TIME_MODES: { id: TimeMode; label: string }[] = [
  { id: 'all', label: 'Whole life' },
  { id: 'recent', label: 'Late period emphasis' },
  { id: 'playback', label: 'Life-phase playback' },
];

const CLUSTERS: { id: ClusterType; label: string }[] = [
  { id: 'technical', label: 'Technical' },
  { id: 'strategic', label: 'Strategic' },
  { id: 'reflective', label: 'Reflective' },
  { id: 'macro', label: 'Macro' },
];

export function Sidebar() {
  const person = useGraphStore((s) => s.person);
  const timeMode = useUiStore((s) => s.timeMode);
  const setTimeMode = useUiStore((s) => s.setTimeMode);
  const activeClusters = useUiStore((s) => s.activeClusters);
  const toggleCluster = useUiStore((s) => s.toggleCluster);
  const bridgesOnly = useUiStore((s) => s.bridgesOnly);
  const recentOnly = useUiStore((s) => s.recentOnly);
  const strongLinks = useUiStore((s) => s.strongLinks);
  const setBridgesOnly = useUiStore((s) => s.setBridgesOnly);
  const setRecentOnly = useUiStore((s) => s.setRecentOnly);
  const setStrongLinks = useUiStore((s) => s.setStrongLinks);

  return (
    <>
      <h1 style={{ margin: '0 0 6px', fontSize: 'var(--font-xl)' }}>
        {person?.name || 'Cognitive Map'}
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: 'var(--font-md)', margin: '0 0 16px', lineHeight: 1.45 }}>
        {person?.auto_group ? `${person.auto_group} — ` : ''}
        Latent-space cognitive architecture map
      </p>

      <Card>
        <h2 style={{ margin: '0 0 10px', fontSize: 'var(--font-sm)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.1 }}>View</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TIME_MODES.map((m) => (
            <Chip
              key={m.id}
              label={m.label}
              active={timeMode === m.id}
              onClick={() => setTimeMode(m.id)}
            />
          ))}
        </div>

        <h2 style={{ margin: '12px 0 10px', fontSize: 'var(--font-sm)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.1 }}>Filters</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CLUSTERS.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              active={activeClusters.has(c.id)}
              onClick={() => toggleCluster(c.id)}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <Toggle label="Bridges only" checked={bridgesOnly} onChange={setBridgesOnly} />
          <Toggle label="Rising only" checked={recentOnly} onChange={setRecentOnly} />
          <Toggle label="Strong links" checked={strongLinks} onChange={setStrongLinks} />
        </div>
      </Card>

      <Legend />
      <TopNodes />
    </>
  );
}
