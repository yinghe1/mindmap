import { create } from 'zustand';
import type { ClusterType } from '../api/client';

export type TimeMode = 'all' | 'recent' | 'playback';
export type ViewScreen = 'input' | 'graph';
export type OverlayView = null | 'patterns';

interface UiState {
  screen: ViewScreen;
  timeMode: TimeMode;
  monthIndex: number;
  activeClusters: Set<ClusterType>;
  bridgesOnly: boolean;
  recentOnly: boolean;
  strongLinks: boolean;
  loading: boolean;
  error: string | null;
  generationProgress: string | null;
  overlay: OverlayView;
  theme: 'dark' | 'light';

  setScreen: (screen: ViewScreen) => void;
  setTimeMode: (mode: TimeMode) => void;
  setMonthIndex: (index: number) => void;
  toggleCluster: (cluster: ClusterType) => void;
  setBridgesOnly: (v: boolean) => void;
  setRecentOnly: (v: boolean) => void;
  setStrongLinks: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  setError: (error: string | null) => void;
  setGenerationProgress: (msg: string | null) => void;
  navigateTo: (view: OverlayView) => void;
  toggleTheme: () => void;
}

function overlayFromPath(path: string): OverlayView {
  if (path === '/patterns') return 'patterns';
  return null;
}

export const useUiStore = create<UiState>((set) => ({
  screen: 'input',
  timeMode: 'all',
  monthIndex: 3,
  activeClusters: new Set<ClusterType>(['technical', 'strategic', 'reflective', 'macro']),
  bridgesOnly: false,
  recentOnly: false,
  strongLinks: false,
  loading: false,
  error: null,
  generationProgress: null,
  overlay: overlayFromPath(window.location.pathname),
  theme: 'dark',

  setScreen: (screen) => set({ screen }),
  setTimeMode: (mode) => set({ timeMode: mode }),
  setMonthIndex: (index) => set({ monthIndex: index }),
  toggleCluster: (cluster) =>
    set((state) => {
      const next = new Set(state.activeClusters);
      if (next.has(cluster)) next.delete(cluster);
      else next.add(cluster);
      return { activeClusters: next };
    }),
  setBridgesOnly: (v) => set({ bridgesOnly: v }),
  setRecentOnly: (v) => set({ recentOnly: v }),
  setStrongLinks: (v) => set({ strongLinks: v }),
  setLoading: (v) => set({ loading: v }),
  setError: (error) => set({ error }),
  setGenerationProgress: (msg) => set({ generationProgress: msg }),
  navigateTo: (view) => {
    if (view) {
      window.history.pushState({}, '', `/${view}`);
    } else {
      window.history.pushState({}, '', '/');
    }
    set({ overlay: view });
  },
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
}));

// Listen for browser back/forward
window.addEventListener('popstate', () => {
  useUiStore.setState({ overlay: overlayFromPath(window.location.pathname) });
});
