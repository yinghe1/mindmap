export interface WikiResult {
  title: string;
  url: string;
  summary: string;
  isHuman: boolean;
}

export async function verifyPerson(name: string): Promise<WikiResult | null> {
  const encoded = encodeURIComponent(name.replace(/\s+/g, '_'));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;

  const response = await fetch(url, {
    headers: { 'User-Agent': 'CognitiveMap/1.0 (educational project)' },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Wikipedia API error: ${response.status}`);
  }

  const data = await response.json() as Record<string, any>;

  if (data.type === 'disambiguation') {
    return null;
  }

  const summary: string = data.extract || '';
  const isHuman = detectHuman(summary, data.description || '');

  return {
    title: data.title,
    url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encoded}`,
    summary,
    isHuman,
  };
}

function detectHuman(summary: string, description: string): boolean {
  const combined = (summary + ' ' + description).toLowerCase();

  const humanIndicators = [
    /\bwas an?\b.*\b(author|writer|poet|artist|scientist|politician|philosopher|inventor|musician|composer|actor|actress|leader|president|king|queen|emperor|general|explorer|mathematician|physician|engineer|economist|historian|journalist|activist|entrepreneur|reformer|statesman|diplomat|theologian|preacher|monk|saint|pope|bishop|rabbi|imam)\b/,
    /\bborn\b.*\d{3,4}/,
    /\(\d{4}\s*[-–]\s*\d{4}\)/,
    /\b(he|she|his|her|they)\b.*\b(was|were|born|died|lived|wrote|created|founded|led|served|became|married)\b/,
  ];

  const nonHumanIndicators = [
    /\bis a (city|town|village|country|state|river|mountain|lake|building|company|organization|band|genus|species|protein|chemical|element|software|game|film|book|album|song|ship|aircraft)\b/,
    /\bis an? (city|town|village|country|state|river|mountain|lake|building|company|organization|band|genus|species|protein|chemical|element|software|game|film|book|album|song|ship|aircraft)\b/,
  ];

  for (const pattern of nonHumanIndicators) {
    if (pattern.test(combined)) return false;
  }

  for (const pattern of humanIndicators) {
    if (pattern.test(combined)) return true;
  }

  return false;
}
