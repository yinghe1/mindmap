import { Router } from 'express';
import {
  getAllPeople,
  getPersonById,
  getLatestVersion,
  getVersionsByPersonId,
  findPersonByNormalizedName,
  insertPerson,
  insertVersion,
  getNextVersion,
} from '../db/queries/people.js';
import { regeneratePerson } from '../services/pipeline.js';
import { isOpenAIConfigured } from '../config.js';
import type { GraphData } from '../types/graph.js';
import type { ContextData } from '../types/context.js';
import type { ErrorResponse, GenerateResponse } from '../types/api.js';

const router = Router();

router.get('/people', (_req, res) => {
  const people = getAllPeople();
  res.json({ people });
});

router.get('/people/:id', (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid ID' } as ErrorResponse);
    return;
  }

  const person = getPersonById(id);
  if (!person) {
    res.status(404).json({ error: 'Person not found' } as ErrorResponse);
    return;
  }

  const version = getLatestVersion(id);
  if (!version) {
    res.status(404).json({ error: 'No version data found' } as ErrorResponse);
    return;
  }

  const graph = JSON.parse(version.graph_data) as GraphData;
  const context = version.context_data
    ? (JSON.parse(version.context_data) as ContextData)
    : { places: [], influences: [], sources: [] };

  res.json({ person, version, graph, context });
});

router.post('/people/:id/regenerate', async (req, res) => {
  try {
    if (!isOpenAIConfigured()) {
      res.status(503).json({ error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.' } as ErrorResponse);
      return;
    }

    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ID' } as ErrorResponse);
      return;
    }

    const result = await regeneratePerson(id);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message } as ErrorResponse);
  }
});

router.post('/people/import', (req, res) => {
  try {
    const { person: importedPerson, graph, context } = req.body;

    if (!importedPerson?.name || !importedPerson?.name_normalized || !graph) {
      res.status(400).json({ error: 'Invalid import data: missing person, graph, or name' } as ErrorResponse);
      return;
    }

    // Upsert person: use existing if name_normalized matches
    const existing = findPersonByNormalizedName(importedPerson.name_normalized);
    const personId = existing?.id ?? insertPerson({
      name: importedPerson.name,
      name_normalized: importedPerson.name_normalized,
      wiki_url: importedPerson.wiki_url || '',
      wiki_title: importedPerson.wiki_title || importedPerson.name,
      wiki_summary: importedPerson.wiki_summary || '',
      wiki_verified: importedPerson.wiki_verified ?? 1,
      auto_group: importedPerson.auto_group || 'Other',
    });

    // Insert a new version with the imported data
    const nextVersion = getNextVersion(personId);
    insertVersion({
      person_id: personId,
      version: nextVersion,
      graph_data: JSON.stringify(graph),
      context_data: JSON.stringify(context || {}),
      node_count: graph.nodes?.length || 0,
      edge_count: graph.edges?.length || 0,
      model_used: 'imported',
      prompt_version: 'imported',
      generation_ms: 0,
    });

    const person = getPersonById(personId)!;
    const version = getLatestVersion(personId)!;

    const result: GenerateResponse = {
      person,
      version,
      graph,
      context: context || { places: [], influences: [], sources: [] },
      cached: false,
    };

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed';
    res.status(500).json({ error: message } as ErrorResponse);
  }
});

router.get('/people/:id/versions', (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid ID' } as ErrorResponse);
    return;
  }

  const versions = getVersionsByPersonId(id);
  res.json({ versions });
});

export default router;
