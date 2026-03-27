export function buildGraphPrompt(name: string, wikiSummary: string): string {
  return `Generate the cognitive map for: ${name}

Wikipedia summary for reference:
${wikiSummary}

For the GRAPH section, generate:

NODES (exactly 10):
Each node represents a major theme, domain, or life-phase pattern. Include:
- id: short lowercase identifier (e.g., "early_works", "philosophy")
- label: descriptive title (3-7 words)
- importance: 0.0-1.0 (how central to their identity)
- momentum: 0.0-1.0 (how much it grew/changed over their life)
- bridge: 0.0-1.0 (how much it connects different domains)
- cluster: one of "technical", "strategic", "reflective", "macro"
  - technical = craft, skill, domain expertise
  - strategic = career moves, alliances, business
  - reflective = inner life, philosophy, identity
  - macro = legacy, cultural impact, historical significance
- role: one of "Core", "Bridge", "Foundation", "Shock", "Emergent", "Origin"
  - Core = central enduring theme
  - Bridge = connects multiple domains
  - Foundation = early formative element
  - Shock = disruptive event or turning point
  - Emergent = developed later, still evolving
  - Origin = earliest biographical root
- subthemes: 3-5 specific keywords
- trend: array of 4 numbers (0.0-1.0) showing strength across 4 life phases
- x, y: position 0.1-0.9, spatially grouped by cluster
- excerpt: 1-2 sentence analytical insight

EDGES (12-18):
Each edge connects two nodes. Include:
- source, target: node IDs
- weight: 0.0-1.0 (association strength)
- recentChange: 0.0-0.2 (how much the relationship shifted in later phases)
- type: "strong_stable", "strong_rising", "stable", "rising", or "light"
- shared: 2-3 keywords they share
- excerpt: 1-2 sentence description of the relationship

For the PROFILE section, also generate:

COGNITIVE ARCHITECTURE:
Model how this person's mind processes situations and reaches decisions, structured like a decision tree:
- summary: 2-3 sentence overview of their cognitive decision-making style
- primary_driver: the dominant cognitive force (e.g., "Moral conviction", "Empirical curiosity", "Strategic ambition")
- decision_path: a sequence of 4-6 stages showing how they process situations from trigger to action:
  - stage: short label (e.g., "Encounter", "Moral filter", "Creative synthesis", "Public action")
  - description: what happens at this stage
  - branches: 1-3 possible directions from this stage
- cognitive_tensions: 2-3 core internal tensions that shape behaviour:
  - pole_a, pole_b: the two opposing forces
  - description: how this tension manifests
- behavioural_signature: 1-2 sentences describing the characteristic pattern that emerges`;
}
