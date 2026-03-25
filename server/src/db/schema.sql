CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_normalized TEXT NOT NULL UNIQUE,
  wiki_url TEXT,
  wiki_title TEXT,
  wiki_summary TEXT,
  wiki_verified INTEGER NOT NULL DEFAULT 0,
  auto_group TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS person_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  graph_data TEXT NOT NULL,
  context_data TEXT,
  node_count INTEGER NOT NULL DEFAULT 0,
  edge_count INTEGER NOT NULL DEFAULT 0,
  model_used TEXT NOT NULL DEFAULT 'gpt-4o',
  prompt_version TEXT NOT NULL DEFAULT '1.0',
  generation_ms INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_overlays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  overlay_type TEXT NOT NULL,
  overlay_data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_person_versions_person_id ON person_versions(person_id);
CREATE INDEX IF NOT EXISTS idx_person_versions_version ON person_versions(person_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_user_overlays_person_id ON user_overlays(person_id);
