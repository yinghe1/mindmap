# API Documentation

Base URL: `http://localhost:3001/api`

## Endpoints

### POST /api/generate
Generate a cognitive map for a person.

**Request:**
```json
{ "name": "Mark Twain" }
```

**Response (200):**
```json
{
  "person": { /* Person object */ },
  "version": { /* PersonVersion object */ },
  "graph": { /* GraphData: nodes, edges, outcomes, outcome_paths */ },
  "context": { /* ContextData: places, influences, sources */ },
  "cached": false
}
```

**Errors:**
- `400` — Name is required / Name is too long
- `404` — Person not found on Wikipedia / Not a person
- `500` — Generation failed

**Flow:**
1. Normalize name → check DB for existing record
2. If exists with version data → return cached (`cached: true`)
3. Verify via Wikipedia REST API (must be a human)
4. Generate structured JSON via OpenAI GPT-4o
5. Save to SQLite (people + person_versions)
6. Return full response

---

### GET /api/people
List all generated people.

**Response:**
```json
{ "people": [/* Person objects */] }
```

---

### GET /api/people/:id
Get a person with their latest version data.

**Response:**
```json
{
  "person": { /* Person object */ },
  "version": { /* PersonVersion object */ },
  "graph": { /* GraphData */ },
  "context": { /* ContextData */ }
}
```

---

### POST /api/people/:id/regenerate
Force a new LLM generation for an existing person. Creates a new version.

**Response:** Same shape as POST /api/generate

---

### GET /api/people/:id/versions
List all versions for a person.

**Response:**
```json
{ "versions": [/* PersonVersion objects, newest first */] }
```

---

### GET /api/health
Health check.

**Response:**
```json
{ "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```
