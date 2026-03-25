# Database Schema

SQLite database stored at `server/data/cognitive_map.db`.

## Tables

### people
Stores verified person records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL | Display name |
| name_normalized | TEXT | NOT NULL UNIQUE | Lowercase normalized key (e.g., `mark_twain`) |
| wiki_url | TEXT | | Wikipedia page URL |
| wiki_title | TEXT | | Wikipedia article title |
| wiki_summary | TEXT | | Wikipedia extract text |
| wiki_verified | INTEGER | NOT NULL DEFAULT 0 | 1 if verified via Wikipedia |
| auto_group | TEXT | | Auto-assigned category (Writer, Scientist, etc.) |
| created_at | TEXT | DEFAULT datetime('now') | Record creation time |
| updated_at | TEXT | DEFAULT datetime('now') | Last update time |

### person_versions
Stores versioned cognitive map generations. Each generation creates a new version.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| person_id | INTEGER | FK → people(id) ON DELETE CASCADE | Parent person |
| version | INTEGER | NOT NULL DEFAULT 1 | Version number (increments) |
| graph_data | TEXT | NOT NULL | JSON blob: `{ nodes, edges, outcomes, outcome_paths }` |
| context_data | TEXT | | JSON blob: `{ places, influences, sources }` |
| node_count | INTEGER | NOT NULL DEFAULT 0 | Number of nodes |
| edge_count | INTEGER | NOT NULL DEFAULT 0 | Number of edges |
| model_used | TEXT | NOT NULL DEFAULT 'gpt-4o' | LLM model identifier |
| prompt_version | TEXT | NOT NULL DEFAULT '1.0' | Prompt template version |
| generation_ms | INTEGER | NOT NULL DEFAULT 0 | Generation duration in ms |
| created_at | TEXT | DEFAULT datetime('now') | Generation timestamp |

### user_overlays
Stores user customizations (future use).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| person_id | INTEGER | FK → people(id) ON DELETE CASCADE | Parent person |
| overlay_type | TEXT | NOT NULL | Type of overlay |
| overlay_data | TEXT | NOT NULL | JSON blob with overlay data |
| created_at | TEXT | DEFAULT datetime('now') | Creation time |
| updated_at | TEXT | DEFAULT datetime('now') | Last update time |

## Indexes

- `idx_person_versions_person_id` — Fast lookup of versions by person
- `idx_person_versions_version` — Fast lookup of latest version
- `idx_user_overlays_person_id` — Fast lookup of overlays by person

## Querying

### Get person with latest version
```sql
SELECT p.*, pv.*
FROM people p
JOIN person_versions pv ON pv.person_id = p.id
WHERE p.name_normalized = 'mark_twain'
ORDER BY pv.version DESC
LIMIT 1;
```

### List all people
```sql
SELECT * FROM people ORDER BY created_at DESC;
```

### Get version history
```sql
SELECT * FROM person_versions WHERE person_id = ? ORDER BY version DESC;
```

## JSON Data Structures

### graph_data
```json
{
  "nodes": [
    {
      "id": "string",
      "label": "string",
      "importance": 0.0-1.0,
      "momentum": 0.0-1.0,
      "bridge": 0.0-1.0,
      "cluster": "technical|strategic|reflective|macro",
      "role": "Core|Bridge|Foundation|Shock|Emergent|Origin",
      "subthemes": ["string"],
      "trend": [0.0, 0.0, 0.0, 0.0],
      "x": 0.0-1.0,
      "y": 0.0-1.0,
      "excerpt": "string"
    }
  ],
  "edges": [
    {
      "source": "node_id",
      "target": "node_id",
      "weight": 0.0-1.0,
      "recentChange": 0.0-0.2,
      "type": "strong_stable|strong_rising|stable|rising|light",
      "shared": ["string"],
      "excerpt": "string"
    }
  ],
  "outcomes": [
    {
      "id": "string",
      "label": "string",
      "year": "string",
      "category": "string",
      "description": "string"
    }
  ],
  "outcome_paths": [
    {
      "outcome_id": "string",
      "node_ids": ["string"],
      "description": "string"
    }
  ]
}
```

### context_data
```json
{
  "places": [
    {
      "place": "string",
      "lat": 0.0,
      "lng": 0.0,
      "start_year": 1800,
      "end_year": 1900,
      "description": "string"
    }
  ],
  "influences": [
    {
      "name": "string",
      "type": "literary|philosophical|political|personal|scientific|artistic",
      "direction": "influenced_person|person_influenced",
      "description": "string"
    }
  ],
  "sources": [
    {
      "title": "string",
      "url": "string",
      "type": "wikipedia|book|article|reference"
    }
  ]
}
```
