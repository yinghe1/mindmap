import { create } from 'zustand';
import type { ClusterType } from '../api/client';

export type TimeMode = 'all' | 'recent' | 'playback';
export type ViewScreen = 'input' | 'graph';

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
  showPatterns: boolean;
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
  setShowPatterns: (v: boolean) => void;
  toggleTheme: () => void;
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
  showPatterns: false,
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
  setShowPatterns: (v) => set({ showPatterns: v }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
}));
