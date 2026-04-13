import OpenAI from 'openai';
import JSON5 from 'json5';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { SYSTEM_PROMPT } from '../prompts/system.js';
import { buildGraphPrompt } from '../prompts/graph.js';
import { buildPatternDetailsPrompt } from '../prompts/pattern-details.js';
import { CONTEXT_PROMPT } from '../prompts/context.js';
import { OUTCOMES_PROMPT } from '../prompts/outcomes.js';
import { JSON_SCHEMA } from '../prompts/schema.js';
import type { LLMGeneratedData } from '../types/api.js';

let client: OpenAI | null = null;

function stripMarkdownJson(text: string): string {
  // Step 1: strip fences FIRST — before any backtick replacement so ``` isn't mangled
  const fenceMatch = text.trim().match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/);
  let cleaned = fenceMatch ? fenceMatch[1].trim() : text.trim();

  // Step 2: replace inline backtick-quoted strings (`value`) → "value"
  cleaned = cleaned.replace(/(?<!`)`(?!``|`)([^`\n]*)`(?!`)/g, (_, inner) =>
    '"' + inner.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
  );

  // Step 3: remove stray tab/control characters (tabs inside numbers break parsing)
  cleaned = cleaned.replace(/\t/g, ' ');

  // Step 3b: remove stray = between colon and value: `"id":="val"` → `"id":"val"`
  cleaned = cleaned.replace(/:\s*=\s*(["{[\d\-tfn])/g, ': $1');

  // Step 3c: remove garbage-fragment lines — an unquoted identifier with only a comma, no colon
  // e.g. `        aneous,` is a truncated word that appeared as stray text
  cleaned = cleaned.replace(/\n[ \t]+[A-Za-z_$][A-Za-z0-9_$]*,(\n)/g, '$1');

  // Step 4a: replace pipe character used as a corrupted opening quote: `  |cluster":` → `  "cluster":`
  cleaned = cleaned.replace(/([\n\r][ \t]+)\|([A-Za-z_$][A-Za-z0-9_$]*"[ \t]*:)/g, '$1"$2');

  // Step 4b: fix missing opening quote on property keys: `  _key": [` → `  "_key": [`
  // Only matches ASCII identifiers followed by closing " and colon
  cleaned = cleaned.replace(/([\n\r][ \t]+)([A-Za-z_$][A-Za-z0-9_$]*)("[ \t]*:)/g, '$1"$2$3');

  // Step 5: fix bare-string-as-id/source at the start of an object (no key name)
  //   Node:  `{  "side_inversion",  "label":` → `{  "id": "side_inversion",  "label":`
  //   Edge:  `{  "margin_of_safety",  "target":` → `{  "source": "margin_of_safety",  "target":`
  cleaned = cleaned.replace(/(\{[ \t]*\n[ \t]*)"([^"\n]+)",(\s*"label":)/g,  '$1"id": "$2",$3');
  cleaned = cleaned.replace(/(\{[ \t]*\n[ \t]*)"([^"\n]+)",(\s*"target":)/g, '$1"source": "$2",$3');

  // Step 6: insert missing comma when a number value is immediately followed by the next property key
  // e.g. `"bridge": 0            "cluster":` → `"bridge": 0,\n        "cluster":`
  cleaned = cleaned.replace(/(\d)([ \t]*\n[ \t]*"[A-Za-z_])/g, '$1,$2');

  // Step 6b: fix missing opening { for array elements that start with an unquoted key
  // e.g. after `},\n      ary_name: "Charlie"` → `},\n      {\n        ary_name: "Charlie"`
  // Only matches when the value is a quoted string (to reduce false positives in object context)
  cleaned = cleaned.replace(/([ \t]*}[ \t]*,\n([ \t]+))([A-Za-z_$][A-Za-z0-9_$]*)(\s*:[ \t]*")/g,
    '$1{\n$2  $3$4');

  // Step 7: fix "key: value" where colon is jammed inside the opening quote
  //   Case A (string value): `"far_reaching_impact: "influence",` (before "label":)
  cleaned = cleaned.replace(/"([A-Za-z_][A-Za-z0-9_]*): *"([^"\n]*)",(\s*"label":)/g, '"id": "$1",$3');
  //   Case B (array value): `"shared: ["val"` → `"shared": ["val"`
  cleaned = cleaned.replace(/"([A-Za-z_][A-Za-z0-9_]*):\s*\["/g, '"$1": ["');

  return cleaned;
}

// Only lowercase ALL_CAPS keys (e.g. GRAPH, NODES) — leave camelCase like recentChange alone
function normalizeKeys(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(normalizeKeys);
  if (val && typeof val === 'object') {
    return Object.fromEntries(
      Object.entries(val as Record<string, unknown>).map(([k, v]) => {
        const key = /^[A-Z][A-Z0-9_]*$/.test(k) ? k.toLowerCase() : k;
        return [key, normalizeKeys(v)];
      })
    );
  }
  return val;
}

const EDGE_SOURCE_ALIASES = ['super_node_link', 'from', 'node_a', 'source_node', 'start'];
const NODE_ID_ALIASES    = ['lag', 'node_id', 'key', 'name_id'];
const KNOWN_NODE_FIELDS  = new Set(['id', 'label', 'importance', 'momentum', 'bridge', 'cluster', 'role', 'subthemes', 'trend', 'x', 'y', 'excerpt']);
const CLUSTER_VALUES     = new Set(['technical', 'strategic', 'reflective', 'macro']);
const ROLE_VALUES        = new Set(['Core', 'Bridge', 'Foundation', 'Shock', 'Emergent', 'Origin']);

function isTrendArray(v: unknown): v is number[] {
  return Array.isArray(v) && v.length >= 3 && (v as unknown[]).every(n => typeof n === 'number');
}

/** Recover node fields that the model put under a wrong/misspelled/non-ASCII key. */
function recoverNodeFields(node: Record<string, unknown>): void {
  for (const k of Object.keys(node)) {
    if (KNOWN_NODE_FIELDS.has(k)) continue;
    const v = node[k];
    if (!node.cluster && typeof v === 'string' && CLUSTER_VALUES.has(v)) {
      node.cluster = v; delete node[k]; continue;
    }
    if (!node.role && typeof v === 'string' && ROLE_VALUES.has(v)) {
      node.role = v; delete node[k]; continue;
    }
    if (!node.trend && isTrendArray(v)) {
      node.trend = v; delete node[k]; continue;
    }
  }
}

function normalizeModelData(raw: unknown): unknown {
  const d = normalizeKeys(raw) as Record<string, unknown>;

  // Model sometimes emits outcomes at root level instead of inside graph
  if (d.outcomes && d.graph) {
    const outcomesSection = d.outcomes as Record<string, unknown>;
    const graph = d.graph as Record<string, unknown>;
    if (!graph.outcomes)      graph.outcomes      = outcomesSection.outcomes      ?? [];
    if (!graph.outcome_paths) graph.outcome_paths = outcomesSection.outcome_paths ?? [];
    delete d.outcomes;
  }

  if (d.graph) {
    const graph = d.graph as Record<string, unknown>;

    if (Array.isArray(graph.nodes)) {
      graph.nodes = (graph.nodes as Record<string, unknown>[]).map(node => {
        // Recover id from known aliases
        if (!node.id) {
          for (const alias of NODE_ID_ALIASES) {
            if (node[alias]) { node.id = node[alias]; delete node[alias]; break; }
          }
        }
        // Fallback: promote first unrecognised key as id
        if (!node.id) {
          for (const k of Object.keys(node)) {
            if (!KNOWN_NODE_FIELDS.has(k)) { node.id = k; delete node[k]; break; }
          }
        }
        // Recover cluster/role/trend from wrongly-named keys (e.g. `ary:`, `กัน:`)
        recoverNodeFields(node);
        return node;
      });
    }

    if (Array.isArray(graph.edges)) {
      graph.edges = (graph.edges as Record<string, unknown>[]).map(edge => {
        if (!edge.source) {
          for (const alias of EDGE_SOURCE_ALIASES) {
            if (edge[alias]) { edge.source = edge[alias]; delete edge[alias]; break; }
          }
        }
        return edge;
      });
    }
  }

  return d;
}

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: config.useLocal ? 'ollama' : config.openaiApiKey,
      baseURL: config.useLocal ? 'http://localhost:11434/v1' : undefined,
    });
  }
  return client;
}

export async function generateCognitiveMap(
  name: string,
  wikiSummary: string
): Promise<{ data: LLMGeneratedData; durationMs: number }> {
  const openai = getClient();
  const userPrompt = [
    buildGraphPrompt(name, wikiSummary),
    CONTEXT_PROMPT,
    OUTCOMES_PROMPT,
  ].join('\n\n');

  const start = Date.now();

  const LOCAL_JSON_REMINDER = `\n\nCRITICAL OUTPUT RULES (local model):
- Output ONLY raw JSON. No markdown fences, no backticks, no commentary.
- Every property key MUST be a double-quoted ASCII string: "key": value
- No trailing commas. No single quotes. No pipe | characters. No non-ASCII in keys.
- Do not invent new key names. Use exactly the field names shown in the schema.`;

  const systemPrompt = config.useLocal ? SYSTEM_PROMPT + LOCAL_JSON_REMINDER : SYSTEM_PROMPT;

  logger.info({ msg: 'LLM call started', name, model: config.useLocal ? config.localModel : 'gpt-4o', systemPrompt, userPrompt });

  const response = await openai.chat.completions.create({
    model: config.useLocal ? config.localModel : 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    ...(config.useLocal ? {} : {
      response_format: {
        type: 'json_schema',
        json_schema: JSON_SCHEMA,
      },
    }),
    temperature: 0.7,
    max_tokens: 16000,
  });

  const durationMs = Date.now() - start;
  const choice = response.choices[0];
  const content = choice?.message?.content;

  logger.info({
    msg: 'LLM call completed',
    name,
    durationMs,
    finishReason: choice?.finish_reason ?? null,
    promptTokens: response.usage?.prompt_tokens ?? null,
    completionTokens: response.usage?.completion_tokens ?? null,
    totalTokens: response.usage?.total_tokens ?? null,
  });

  if (!content) {
    logger.error({ msg: 'No content in OpenAI response', name, finishReason: choice?.finish_reason ?? null });
    throw new Error('No content in OpenAI response');
  }

  const cleaned = stripMarkdownJson(content);
  let data: LLMGeneratedData;
  try {
    data = normalizeModelData(JSON5.parse(cleaned)) as LLMGeneratedData;
  } catch (err) {
    logger.error({ msg: 'JSON5 parse failed', name, err: String(err), cleaned });
    throw err;
  }
  return { data, durationMs };
}

export async function generatePatternDetails(
  name: string,
  wikiSummary: string
): Promise<{ text: string; durationMs: number }> {
  const openai = getClient();
  const userPrompt = buildPatternDetailsPrompt(name, wikiSummary);

  const start = Date.now();
  logger.info({ msg: 'Pattern details LLM call started', name, model: config.useLocal ? config.localModel : 'gpt-4o' });

  const response = await openai.chat.completions.create({
    model: config.useLocal ? config.localModel : 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a cognitive pattern analyst and behavioral modeler. Produce a thorough, well-structured analysis in markdown format.' },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 8000,
  });

  const durationMs = Date.now() - start;
  const choice = response.choices[0];
  const text = choice?.message?.content;

  logger.info({
    msg: 'Pattern details LLM call completed',
    name,
    durationMs,
    finishReason: choice?.finish_reason ?? null,
    promptTokens: response.usage?.prompt_tokens ?? null,
    completionTokens: response.usage?.completion_tokens ?? null,
    totalTokens: response.usage?.total_tokens ?? null,
  });

  if (!text) {
    logger.error({ msg: 'No content in pattern details response', name });
    throw new Error('No content in pattern details response');
  }

  return { text, durationMs };
}
