export const CONTEXT_PROMPT = `For the CONTEXT section, generate:

PLACES (3-8):
Key locations in the person's life:
- place: city/region name
- lat, lng: approximate coordinates
- start_year, end_year: years associated
- description: 1 sentence about significance

INFLUENCES (3-8):
People who influenced or were influenced by this person:
- name: person's name
- type: "literary", "philosophical", "political", "personal", "scientific", or "artistic"
- direction: "influenced_person" (they influenced our subject) or "person_influenced" (our subject influenced them)
- description: 1 sentence about the influence

SOURCES (2-4):
Key reference works or sources:
- title: name of source
- url: Wikipedia or other public URL
- type: "wikipedia", "book", "article", or "reference"`;
