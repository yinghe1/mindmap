import { create } from 'zustand';
import type { Person, PersonVersion, GraphData, ContextData, GraphNode, GraphEdge } from '../api/client';

interface GraphState {
  person: Person | null;
  version: PersonVersion | null;
  graph: GraphData | null;
  context: ContextData | null;
  cached: boolean;

  selectedNode: GraphNode | null;
  selectedEdge: GraphEdge | null;

  setPerson: (person: Person, version: PersonVersion, graph: GraphData, context: ContextData, cached: boolean) => void;
  selectNode: (node: GraphNode | null) => void;
  selectEdge: (edge: GraphEdge | null) => void;
  clearSelection: () => void;
  clear: () => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  person: null,
  version: null,
  graph: null,
  context: null,
  cached: false,

  selectedNode: null,
  selectedEdge: null,

  setPerson: (person, version, graph, context, cached) =>
    set({ person, version, graph, context, cached, selectedNode: null, selectedEdge: null }),

  selectNode: (node) => set({ selectedNode: node, selectedEdge: null }),

  selectEdge: (edge) => set({ selectedEdge: edge, selectedNode: null }),

  clearSelection: () => set({ selectedNode: null, selectedEdge: null }),

  clear: () =>
    set({
      person: null,
      version: null,
      graph: null,
      context: null,
      cached: false,
      selectedNode: null,
      selectedEdge: null,
    }),
}));
