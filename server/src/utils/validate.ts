import type { LLMGeneratedData } from '../types/api.js';

export function validateGeneratedData(data: unknown): data is LLMGeneratedData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  if (!d.profile || typeof d.profile !== 'object') return false;
  if (!d.graph || typeof d.graph !== 'object') return false;
  if (!d.context || typeof d.context !== 'object') return false;

  const graph = d.graph as Record<string, unknown>;
  if (!Array.isArray(graph.nodes) || graph.nodes.length === 0) return false;
  if (!Array.isArray(graph.edges) || graph.edges.length === 0) return false;
  if (!Array.isArray(graph.outcomes)) return false;
  if (!Array.isArray(graph.outcome_paths)) return false;

  for (const node of graph.nodes) {
    if (!node.id || !node.label || typeof node.importance !== 'number') return false;
    if (!node.cluster || !node.role) return false;
    if (!Array.isArray(node.trend) || node.trend.length < 3) return false;
  }

  for (const edge of graph.edges) {
    if (!edge.source || !edge.target || typeof edge.weight !== 'number') return false;
  }

  return true;
}
