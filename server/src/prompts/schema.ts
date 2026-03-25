export const JSON_SCHEMA = {
  name: 'cognitive_map',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      profile: {
        type: 'object',
        properties: {
          auto_group: {
            type: 'string',
            description: 'Category: Writer, Philosopher, Scientist, Entrepreneur, Political Figure, Artist, Musician, Explorer, Military Leader, Religious Figure, or other',
          },
          cognitive_architecture: {
            type: 'object',
            description: 'A decision-tree-style summary of how this person\'s cognitive patterns drive decisions and behaviours',
            properties: {
              summary: {
                type: 'string',
                description: 'A 2-3 sentence overview of the person\'s cognitive decision-making architecture',
              },
              primary_driver: {
                type: 'string',
                description: 'The dominant cognitive force (e.g. "Moral conviction", "Empirical curiosity")',
              },
              decision_path: {
                type: 'array',
                description: 'A sequence of 4-6 decision nodes showing how this person processes situations, like a decision tree from root trigger to action',
                items: {
                  type: 'object',
                  properties: {
                    stage: { type: 'string', description: 'Short label for this decision stage (e.g. "Encounter", "Filter", "Resolve", "Act")' },
                    description: { type: 'string', description: '1 sentence describing what happens at this stage' },
                    branches: {
                      type: 'array',
                      description: 'The possible directions from this stage (1-3 branches)',
                      items: { type: 'string' },
                    },
                  },
                  required: ['stage', 'description', 'branches'],
                  additionalProperties: false,
                },
              },
              cognitive_tensions: {
                type: 'array',
                description: 'The 2-3 core internal tensions that shape behaviour',
                items: {
                  type: 'object',
                  properties: {
                    pole_a: { type: 'string' },
                    pole_b: { type: 'string' },
                    description: { type: 'string' },
                  },
                  required: ['pole_a', 'pole_b', 'description'],
                  additionalProperties: false,
                },
              },
              behavioural_signature: {
                type: 'string',
                description: 'A 1-2 sentence description of the person\'s characteristic behavioural pattern that emerges from this architecture',
              },
            },
            required: ['summary', 'primary_driver', 'decision_path', 'cognitive_tensions', 'behavioural_signature'],
            additionalProperties: false,
          },
          patterns: {
            type: 'object',
            description: 'Recurring patterns in thinking, speaking, and behaviour',
            properties: {
              thinking: {
                type: 'array',
                description: '3-5 cognitive habits and reasoning patterns, ranked by strength',
                items: {
                  type: 'object',
                  properties: {
                    pattern: { type: 'string', description: 'Short label for the pattern' },
                    description: { type: 'string', description: '1 sentence description' },
                    strength: { type: 'number', description: '0.0-1.0 strength score' },
                    samples: { type: 'array', items: { type: 'string' }, description: '2-3 concrete examples' },
                    impact: { type: 'string', description: '1-2 sentences on how this pattern shaped outcomes, decisions, or relationships with reasoning' },
                    outcome: { type: 'string', description: 'A specific concrete result or consequence this pattern produced' },
                    influence: { type: 'string', description: 'How this pattern affected the audience, followers, or broader culture, with reasoning why it worked' },
                  },
                  required: ['pattern', 'description', 'strength', 'samples', 'impact', 'outcome', 'influence'],
                  additionalProperties: false,
                },
              },
              speaking: {
                type: 'array',
                description: '3-5 communication and rhetorical patterns, ranked by strength',
                items: {
                  type: 'object',
                  properties: {
                    pattern: { type: 'string', description: 'Short label for the pattern' },
                    description: { type: 'string', description: '1 sentence description' },
                    strength: { type: 'number', description: '0.0-1.0 strength score' },
                    samples: { type: 'array', items: { type: 'string' }, description: '2-3 concrete examples' },
                    impact: { type: 'string', description: '1-2 sentences on how this pattern shaped outcomes, decisions, or relationships with reasoning' },
                    outcome: { type: 'string', description: 'A specific concrete result or consequence this pattern produced' },
                    influence: { type: 'string', description: 'How this pattern affected the audience, followers, or broader culture, with reasoning why it worked' },
                  },
                  required: ['pattern', 'description', 'strength', 'samples', 'impact', 'outcome', 'influence'],
                  additionalProperties: false,
                },
              },
              behavior: {
                type: 'array',
                description: '3-5 behavioural patterns and habits, ranked by strength',
                items: {
                  type: 'object',
                  properties: {
                    pattern: { type: 'string', description: 'Short label for the pattern' },
                    description: { type: 'string', description: '1 sentence description' },
                    strength: { type: 'number', description: '0.0-1.0 strength score' },
                    samples: { type: 'array', items: { type: 'string' }, description: '2-3 concrete examples' },
                    impact: { type: 'string', description: '1-2 sentences on how this pattern shaped outcomes, decisions, or relationships with reasoning' },
                    outcome: { type: 'string', description: 'A specific concrete result or consequence this pattern produced' },
                    influence: { type: 'string', description: 'How this pattern affected the audience, followers, or broader culture, with reasoning why it worked' },
                  },
                  required: ['pattern', 'description', 'strength', 'samples', 'impact', 'outcome', 'influence'],
                  additionalProperties: false,
                },
              },
            },
            required: ['thinking', 'speaking', 'behavior'],
            additionalProperties: false,
          },
        },
        required: ['auto_group', 'cognitive_architecture', 'patterns'],
        additionalProperties: false,
      },
      graph: {
        type: 'object',
        properties: {
          nodes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                importance: { type: 'number' },
                momentum: { type: 'number' },
                bridge: { type: 'number' },
                cluster: { type: 'string', enum: ['technical', 'strategic', 'reflective', 'macro'] },
                role: { type: 'string', enum: ['Core', 'Bridge', 'Foundation', 'Shock', 'Emergent', 'Origin'] },
                subthemes: { type: 'array', items: { type: 'string' } },
                trend: { type: 'array', items: { type: 'number' } },
                x: { type: 'number' },
                y: { type: 'number' },
                excerpt: { type: 'string' },
              },
              required: ['id', 'label', 'importance', 'momentum', 'bridge', 'cluster', 'role', 'subthemes', 'trend', 'x', 'y', 'excerpt'],
              additionalProperties: false,
            },
          },
          edges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source: { type: 'string' },
                target: { type: 'string' },
                weight: { type: 'number' },
                recentChange: { type: 'number' },
                type: { type: 'string', enum: ['strong_stable', 'strong_rising', 'stable', 'rising', 'light'] },
                shared: { type: 'array', items: { type: 'string' } },
                excerpt: { type: 'string' },
              },
              required: ['source', 'target', 'weight', 'recentChange', 'type', 'shared', 'excerpt'],
              additionalProperties: false,
            },
          },
          outcomes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                year: { type: 'string' },
                category: { type: 'string' },
                description: { type: 'string' },
              },
              required: ['id', 'label', 'year', 'category', 'description'],
              additionalProperties: false,
            },
          },
          outcome_paths: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                outcome_id: { type: 'string' },
                node_ids: { type: 'array', items: { type: 'string' } },
                description: { type: 'string' },
              },
              required: ['outcome_id', 'node_ids', 'description'],
              additionalProperties: false,
            },
          },
        },
        required: ['nodes', 'edges', 'outcomes', 'outcome_paths'],
        additionalProperties: false,
      },
      context: {
        type: 'object',
        properties: {
          places: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                place: { type: 'string' },
                lat: { type: 'number' },
                lng: { type: 'number' },
                start_year: { type: 'number' },
                end_year: { type: 'number' },
                description: { type: 'string' },
              },
              required: ['place', 'lat', 'lng', 'start_year', 'end_year', 'description'],
              additionalProperties: false,
            },
          },
          influences: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string', enum: ['literary', 'philosophical', 'political', 'personal', 'scientific', 'artistic'] },
                direction: { type: 'string', enum: ['influenced_person', 'person_influenced'] },
                description: { type: 'string' },
              },
              required: ['name', 'type', 'direction', 'description'],
              additionalProperties: false,
            },
          },
          sources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                url: { type: 'string' },
                type: { type: 'string', enum: ['wikipedia', 'book', 'article', 'reference'] },
              },
              required: ['title', 'url', 'type'],
              additionalProperties: false,
            },
          },
        },
        required: ['places', 'influences', 'sources'],
        additionalProperties: false,
      },
    },
    required: ['profile', 'graph', 'context'],
    additionalProperties: false,
  },
} as const;
