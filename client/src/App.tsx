import { useEffect } from 'react';
import { useUiStore } from './store/ui-store';
import { useGraphStore } from './store/graph-store';
import { NameInput } from './components/generation/NameInput';
import { AppShell } from './components/layout/AppShell';
import { Sidebar } from './components/sidebar/Sidebar';
import { TopBar } from './components/topbar/TopBar';
import { CytoscapeGraph } from './components/graph/CytoscapeGraph';
import { BottomBar } from './components/bottombar/BottomBar';
import { DetailPanel } from './components/detail/DetailPanel';
import { PatternsView } from './components/detail/PatternsView';

// Cognitive Map Application
export default function App() {
  const screen = useUiStore((s) => s.screen);
  const theme = useUiStore((s) => s.theme);
  const overlay = useUiStore((s) => s.overlay);
  const navigateTo = useUiStore((s) => s.navigateTo);
  const context = useGraphStore((s) => s.context);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (screen === 'input') {
    return <NameInput />;
  }

  return (
    <>
      <AppShell
        sidebar={<Sidebar />}
        main={
          <>
            <TopBar />
            <div style={{ position: 'relative', minHeight: 0 }}>
              <CytoscapeGraph />
            </div>
            <BottomBar />
          </>
        }
        detail={<DetailPanel />}
      />
      {overlay === 'patterns' && (
        <PatternsView
          patternDetails={context?.pattern_details ?? null}
          onBack={() => navigateTo(null)}
        />
      )}
    </>
  );
}
