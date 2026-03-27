import { normalizeName } from '../utils/normalize.js';
import { validateGeneratedData } from '../utils/validate.js';
import { verifyPerson } from './wikipedia.js';
import { generateCognitiveMap, generatePatternDetails } from './openai.js';
import {
  findPersonByNormalizedName,
  insertPerson,
  insertVersion,
  getLatestVersion,
  getNextVersion,
  getPersonById,
} from '../db/queries/people.js';
import type { GenerateResponse } from '../types/api.js';
import type { GraphData } from '../types/graph.js';
import type { ContextData } from '../types/context.js';

export async function generatePerson(name: string): Promise<GenerateResponse> {
  const nameNormalized = normalizeName(name);

  if (!nameNormalized) {
    throw new Error('Invalid name provided');
  }

  // Check if already exists
  const existing = findPersonByNormalizedName(nameNormalized);
  if (existing) {
    const version = getLatestVersion(existing.id);
    if (version) {
      const graph = JSON.parse(version.graph_data) as GraphData;
      const context = version.context_data ? JSON.parse(version.context_data) as ContextData : { places: [], influences: [], sources: [] };
      return { person: existing, version, graph, context, cached: true };
    }
  }

  // Verify via Wikipedia
  const wiki = await verifyPerson(name);
  if (!wiki) {
    throw new Error(`Could not find "${name}" on Wikipedia. Please check the spelling.`);
  }
  if (!wiki.isHuman) {
    throw new Error(`"${wiki.title}" does not appear to be a person. Only real humans can be mapped.`);
  }

  // Generate via OpenAI — main graph + pattern details in parallel
  const [mapResult, patternDetailsResult] = await Promise.all([
    generateCognitiveMap(wiki.title, wiki.summary),
    generatePatternDetails(wiki.title, wiki.summary),
  ]);

  const { data, durationMs } = mapResult;

  if (!validateGeneratedData(data)) {
    throw new Error('Generated data failed validation. Please try again.');
  }

  // Store person
  const personId = existing?.id ?? insertPerson({
    name: wiki.title,
    name_normalized: nameNormalized,
    wiki_url: wiki.url,
    wiki_title: wiki.title,
    wiki_summary: wiki.summary,
    wiki_verified: 1,
    auto_group: data.profile.auto_group,
  });

  // Merge cognitive architecture and pattern details into context
  const contextWithArch = {
    ...data.context,
    cognitive_architecture: data.profile.cognitive_architecture,
    pattern_details: patternDetailsResult.text,
  };

  // Store version
  const nextVersion = getNextVersion(personId);
  const versionId = insertVersion({
    person_id: personId,
    version: nextVersion,
    graph_data: JSON.stringify(data.graph),
    context_data: JSON.stringify(contextWithArch),
    node_count: data.graph.nodes.length,
    edge_count: data.graph.edges.length,
    model_used: 'gpt-4o',
    prompt_version: '1.0',
    generation_ms: durationMs,
  });

  const person = getPersonById(personId)!;
  const version = getLatestVersion(personId)!;

  return {
    person,
    version,
    graph: data.graph,
    context: contextWithArch,
    cached: false,
  };
}

export async function regeneratePerson(personId: number): Promise<GenerateResponse> {
  const person = getPersonById(personId);
  if (!person) {
    throw new Error('Person not found');
  }

  const wikiSummary = person.wiki_summary || '';
  const [mapResult, patternDetailsResult] = await Promise.all([
    generateCognitiveMap(person.name, wikiSummary),
    generatePatternDetails(person.name, wikiSummary),
  ]);

  const { data, durationMs } = mapResult;

  if (!validateGeneratedData(data)) {
    throw new Error('Generated data failed validation. Please try again.');
  }

  const regenContext = {
    ...data.context,
    cognitive_architecture: data.profile.cognitive_architecture,
    pattern_details: patternDetailsResult.text,
  };

  const nextVersion = getNextVersion(personId);
  insertVersion({
    person_id: personId,
    version: nextVersion,
    graph_data: JSON.stringify(data.graph),
    context_data: JSON.stringify(regenContext),
    node_count: data.graph.nodes.length,
    edge_count: data.graph.edges.length,
    model_used: 'gpt-4o',
    prompt_version: '1.0',
    generation_ms: durationMs,
  });

  const version = getLatestVersion(personId)!;

  return {
    person,
    version,
    graph: data.graph,
    context: regenContext,
    cached: false,
  };
}
