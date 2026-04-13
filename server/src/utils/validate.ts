import { logger } from '../logger.js';
import type { LLMGeneratedData } from '../types/api.js';

export function validateGeneratedData(data: unknown): data is LLMGeneratedData {
  const fail = (reason: string) => {
    logger.warn({ msg: 'Validation failed', reason, data });
    return false;
  };

  if (!data || typeof data !== 'object') return fail('data is not an object');
  const d = data as Record<string, unknown>;

  if (!d.profile || typeof d.profile !== 'object') return fail('missing profile');
  if (!d.graph || typeof d.graph !== 'object') return fail('missing graph');
  if (!d.context || typeof d.context !== 'object') return fail('missing context');

  const graph = d.graph as Record<string, unknown>;
  if (!Array.isArray(graph.nodes) || graph.nodes.length === 0) return fail('nodes missing or empty');
  if (!Array.isArray(graph.edges) || graph.edges.length === 0) return fail('edges missing or empty');
  if (!Array.isArray(graph.outcomes)) return fail('outcomes missing');
  if (!Array.isArray(graph.outcome_paths)) return fail('outcome_paths missing');

  for (const node of graph.nodes) {
    if (!node.id || !node.label || typeof node.importance !== 'number')
      return fail(`node invalid: ${JSON.stringify(node)}`);
    if (!node.cluster || !node.role)
      return fail(`node missing cluster/role: ${JSON.stringify(node)}`);
    if (!Array.isArray(node.trend) || node.trend.length < 3)
      return fail(`node trend invalid: ${JSON.stringify(node)}`);
  }

  for (const edge of graph.edges) {
    if (!edge.source || !edge.target || typeof edge.weight !== 'number')
      return fail(`edge invalid: ${JSON.stringify(edge)}`);
  }

  return true;
}
