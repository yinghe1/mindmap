export const OUTCOMES_PROMPT = `For the OUTCOMES section, generate:

OUTCOMES (3-6):
Concrete achievements, publications, or historical events:
- id: short lowercase identifier
- label: name of the achievement
- year: year or range (e.g., "1884" or "1880-1885")
- category: "publication", "achievement", "event", "invention", "position", or "legacy"
- description: 1-2 sentence description

OUTCOME_PATHS (3-6):
Each path shows which nodes contributed to an outcome:
- outcome_id: matches an outcome ID
- node_ids: ordered array of 2-4 node IDs showing the path of influence
- description: 1 sentence explaining how these nodes led to the outcome`;
