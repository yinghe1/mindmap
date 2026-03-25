import { useState, useRef, useCallback } from 'react';
import { Button, Slider } from '../../design-system';
import { useGraphStore } from '../../store/graph-store';
import { useUiStore } from '../../store/ui-store';
import { useGenerate } from '../../hooks/useGenerate';
import { generateExportHtml } from '../../utils/export-html';

const LIFE_PHASES = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];

export function TopBar() {
  const person = useGraphStore((s) => s.person);
  const graph = useGraphStore((s) => s.graph);
  const context = useGraphStore((s) => s.context);
  const version = useGraphStore((s) => s.version);
  const monthIndex = useUiStore((s) => s.monthIndex);
  const setMonthIndex = useUiStore((s) => s.setMonthIndex);
  const setScreen = useUiStore((s) => s.setScreen);
  const clearGraph = useGraphStore((s) => s.clear);
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const { regenerate } = useGenerate();

  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAnimating(false);
  }, []);

  const handleAnimate = useCallback(() => {
    if (animating) {
      stopAnimation();
      return;
    }

    setAnimating(true);
    setMonthIndex(0);
    let current = 0;

    intervalRef.current = setInterval(() => {
      current++;
      if (current > 3) {
        stopAnimation();
        return;
      }
      setMonthIndex(current);
    }, 1200);
  }, [animating, stopAnimation, setMonthIndex]);

  const handleBack = () => {
    stopAnimation();
    clearGraph();
    setScreen('input');
  };

  const handleExportHtml = () => {
    if (!person || !graph || !context) return;
    const html = generateExportHtml(person, graph, context);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${person.name_normalized || 'cognitive_map'}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const handleExportPerson = () => {
    if (!person || !graph || !context || !version) return;
    const data = { person, version, graph, context };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${person.name_normalized || 'cognitive_map'}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  return (
    <div
      style={{
        padding: '14px 18px',
        background: 'var(--subtle-bg)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 'var(--font-sm)', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)' }}>
            Latent-space cognitive architecture
          </div>
          <div style={{ fontSize: 'var(--font-xxl)', fontWeight: 700 }}>
            {person?.name || 'Cognitive Map'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Slider
            label="Time"
            min={0}
            max={3}
            value={monthIndex}
            onChange={setMonthIndex}
            displayValue={LIFE_PHASES[monthIndex]}
          />
          <Button onClick={handleAnimate} size="sm">
            {animating ? 'Stop' : 'Animate'}
          </Button>
          <Button onClick={handleBack} size="sm">New Person</Button>
          {person && <Button onClick={() => regenerate(person.id)} size="sm">Regenerate</Button>}
          {graph && <Button onClick={handleExportHtml} size="sm">Export HTML</Button>}
          {graph && <Button onClick={handleExportPerson} size="sm">Export Person</Button>}
          <Button onClick={toggleTheme} size="sm">{theme === 'dark' ? 'Light' : 'Dark'}</Button>
        </div>
      </div>
    </div>
  );
}
