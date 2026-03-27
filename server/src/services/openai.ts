import OpenAI from 'openai';
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

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: config.openaiApiKey });
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

  logger.info({ msg: 'LLM call started', name, model: 'gpt-4o', systemPrompt: SYSTEM_PROMPT, userPrompt });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: JSON_SCHEMA,
    },
    temperature: 0.7,
    max_tokens: 12000,
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

  const data = JSON.parse(content) as LLMGeneratedData;
  return { data, durationMs };
}

export async function generatePatternDetails(
  name: string,
  wikiSummary: string
): Promise<{ text: string; durationMs: number }> {
  const openai = getClient();
  const userPrompt = buildPatternDetailsPrompt(name, wikiSummary);

  const start = Date.now();
  logger.info({ msg: 'Pattern details LLM call started', name, model: 'gpt-4o' });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
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
