import { getDb } from '../connection.js';
import type { Person, PersonVersion } from '../../types/profile.js';

export function findPersonByNormalizedName(nameNormalized: string): Person | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM people WHERE name_normalized = ?').get(nameNormalized) as Person | undefined;
}

export function insertPerson(person: {
  name: string;
  name_normalized: string;
  wiki_url: string;
  wiki_title: string;
  wiki_summary: string;
  wiki_verified: number;
  auto_group: string;
}): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO people (name, name_normalized, wiki_url, wiki_title, wiki_summary, wiki_verified, auto_group)
    VALUES (@name, @name_normalized, @wiki_url, @wiki_title, @wiki_summary, @wiki_verified, @auto_group)
  `).run(person);
  return Number(result.lastInsertRowid);
}

export function getPersonById(id: number): Person | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM people WHERE id = ?').get(id) as Person | undefined;
}

export function getAllPeople(): Person[] {
  const db = getDb();
  return db.prepare('SELECT * FROM people ORDER BY created_at DESC').all() as Person[];
}

export function getLatestVersion(personId: number): PersonVersion | undefined {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM person_versions WHERE person_id = ? ORDER BY version DESC LIMIT 1'
  ).get(personId) as PersonVersion | undefined;
}

export function getVersionsByPersonId(personId: number): PersonVersion[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM person_versions WHERE person_id = ? ORDER BY version DESC'
  ).all(personId) as PersonVersion[];
}

export function insertVersion(version: {
  person_id: number;
  version: number;
  graph_data: string;
  context_data: string;
  node_count: number;
  edge_count: number;
  model_used: string;
  prompt_version: string;
  generation_ms: number;
}): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO person_versions (person_id, version, graph_data, context_data, node_count, edge_count, model_used, prompt_version, generation_ms)
    VALUES (@person_id, @version, @graph_data, @context_data, @node_count, @edge_count, @model_used, @prompt_version, @generation_ms)
  `).run(version);
  return Number(result.lastInsertRowid);
}

export function getNextVersion(personId: number): number {
  const db = getDb();
  const row = db.prepare('SELECT MAX(version) as max_v FROM person_versions WHERE person_id = ?').get(personId) as { max_v: number | null };
  return (row?.max_v ?? 0) + 1;
}
