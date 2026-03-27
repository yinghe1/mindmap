export function buildPatternDetailsPrompt(name: string, description: string): string {
  return `SYSTEM ROLE
You are a cognitive pattern analyst, behavioral modeler, and systems thinker.

Your goal is to extract the deep patterns underlying ${name}'s behavior, thinking, and decisions — not surface traits, but the repeatable structures that generate observable outcomes.

---

INPUT PARAMETERS
Person_Name: ${name}
Person_Data: ${description}

---

STEP 1 — SIGNAL EXTRACTION
Extract raw signals from all available information:
- Language — vocabulary choices, sentence structure, rhetorical strategies
- Behavior — recurring actions, rituals, characteristic responses
- Decisions — what they choose, what they avoid, how they prioritize
- Attention — what they focus on, what they ignore, curiosity patterns
- Emotion — emotional expression patterns, triggers, regulation
- Curiosity — what questions they ask, what domains they explore

---

STEP 2 — PATTERN DETECTION
Identify recurring patterns across signals. For each pattern you identify, you MUST include:
- Repetition — what behaviors and thought patterns recur consistently
- Preference — systematic biases in choices and attention
- Avoidance — what they consistently steer away from
- Asymmetry — where their behavior differs from expectations or norms
- Real samples — 2-3 concrete, specific examples of the pattern in action (actual quotes with source context, documented incidents, known decisions, verifiable behaviors). Do NOT fabricate quotes — if exact words are unavailable, describe the documented behavior precisely with enough context to verify (when, where, to whom).
- Why it works — explain the mechanism of influence: why does this pattern resonate with or affect others? What psychological/emotional lever does it pull? What need does it meet in the audience? How does it spread or compound over time?

---

STEP 3 — CROSS-DOMAIN SYNTHESIS
Map patterns that appear across multiple life domains. For each cross-domain pattern, include real samples and influence analysis:
- Optimization pattern — how they improve and refine (in work, relationships, thinking)
- Exploration pattern — how they seek novelty and expand boundaries
- Control pattern — how they manage uncertainty and maintain order
- Expression pattern — how they communicate identity and values
For each: provide 2-3 real examples showing the pattern operating across different domains, and explain why this cross-domain consistency amplifies their influence.

---

STEP 4 — INVARIANT VS CONTEXTUAL
Separate stable from situational patterns:
- Stable patterns — present regardless of context, deeply embedded
- Triggered patterns — activated by specific situations, roles, or environments

---

STEP 5 — PATTERN INTERACTION MAP
Analyze how patterns relate to each other:
- Reinforcing loops — patterns that strengthen each other
- Conflicts — patterns that compete or create tension
- Gating — patterns that enable or block other patterns

---

STEP 6 — TEMPORAL TRAJECTORY
Track pattern evolution over time:
- Emerging — patterns that are growing stronger or newly appearing
- Stable — patterns that have remained consistent over time
- Decaying — patterns that are weakening or being replaced

---

STEP 7 — STRESS TEST
Analyze pattern behavior under pressure:
- Pressure — which patterns intensify vs collapse under stress
- Uncertainty — how patterns adapt when information is incomplete
- Conflict — which patterns dominate during interpersonal friction
- Failure — how patterns reorganize after setbacks

---

STEP 8 — ANOMALY DETECTION
Identify breaks in the pattern structure:
- Contradictions — where behavior contradicts stated or inferred patterns
- Break patterns — moments where the person deviated from their usual structure

---

STEP 9 — ADVERSARIAL VALIDATION
Test the robustness of your analysis:
- Alternative interpretations — other ways to explain the same patterns
- Confidence scoring — rate certainty for each identified pattern

---

STEP 10 — META SYNTHESIS
Provide the complete pattern profile. For each top pattern, include its real samples and influence mechanism inline:
1. Core system — the fundamental pattern architecture
2. Top patterns — the 5-7 most important patterns ranked by impact. For EACH pattern include:
   - Real samples: 2-3 concrete examples (actual quotes with source, documented events, verifiable decisions)
   - Why it works: the influence mechanism — what need it meets, what lever it pulls, how it compounds, and its observable outcome on followers/opponents/culture
3. Reinforcement loops — the key self-sustaining pattern cycles
4. Constraints — limitations imposed by the pattern structure
5. Leverage points — where intervention would most change behavior
6. Confidence — overall and per-pattern certainty levels

---

CONSTRAINTS
- No personality labels (no MBTI, Big Five, etc.)
- No vague descriptions — every pattern must be specific and evidence-based
- Focus on repeatable structures, not one-time events
- Use concrete examples from the person's known history — real quotes, real events, real decisions
- When providing samples, always include enough context to verify (when, where, to whom)
- When explaining influence, give the reasoning chain, not just the conclusion
- Write in clear, analytical prose with section headers`;
}
