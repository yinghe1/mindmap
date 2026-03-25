# Prompt Architecture

The LLM prompt is modular, composed of separate files that are concatenated into a single API call.

## Prompt Files

### system.ts — System Persona
Sets the LLM persona as a "cognitive architecture analyst" with rules:
- 8-12 nodes, 12-18 edges
- Score ranges (0.0-1.0)
- Accuracy constraints (public biography only)
- Required data structure

### graph.ts — Graph Generation
Provides instructions for generating:
- **Nodes**: themes with importance, momentum, bridge scores, cluster assignment, role type, subthemes, trend data, position, and excerpt
- **Edges**: connections with weight, recent change, type classification, shared topics, and excerpt
- Includes cluster definitions (technical, strategic, reflective, macro)
- Includes role definitions (Core, Bridge, Foundation, Shock, Emergent, Origin)

### context.ts — Context Generation
Instructions for:
- **Places**: geographic locations with coordinates and year ranges
- **Influences**: people who influenced/were influenced by the subject
- **Sources**: reference works and URLs

### outcomes.ts — Outcomes Generation
Instructions for:
- **Outcomes**: concrete achievements with year and category
- **Outcome Paths**: chains of nodes leading to each outcome

### schema.ts — JSON Schema
OpenAI structured output schema (`response_format: json_schema`) ensuring the LLM returns exactly the expected shape. Enforces:
- All required fields present
- Correct types (string, number, array)
- Enum values for cluster, role, edge type, influence type/direction

## Prompt Assembly (in openai.ts)

```typescript
const userPrompt = [
  buildGraphPrompt(name, wikiSummary),  // graph.ts
  CONTEXT_PROMPT,                       // context.ts
  OUTCOMES_PROMPT,                      // outcomes.ts
].join('\n\n');

// Single API call with system prompt + user prompt + JSON schema
openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ],
  response_format: { type: 'json_schema', json_schema: JSON_SCHEMA },
});
```

## Modifying Prompts

To adjust generation quality:
1. Edit the relevant prompt file
2. Update `prompt_version` in pipeline.ts if significant
3. Regenerate to see changes (new version created, old preserved)
