const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data as T;
}

export interface Person {
  id: number;
  name: string;
  name_normalized: string;
  wiki_url: string | null;
  wiki_title: string | null;
  wiki_summary: string | null;
  wiki_verified: number;
  auto_group: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonVersion {
  id: number;
  person_id: number;
  version: number;
  graph_data: string;
  context_data: string | null;
  node_count: number;
  edge_count: number;
  model_used: string;
  prompt_version: string;
  generation_ms: number;
  created_at: string;
}

export type ClusterType = 'technical' | 'strategic' | 'reflective' | 'macro';
export type RoleType = 'Core' | 'Bridge' | 'Foundation' | 'Shock' | 'Emergent' | 'Origin';
export type EdgeType = 'strong_stable' | 'strong_rising' | 'stable' | 'rising' | 'light';

export interface GraphNode {
  id: string;
  label: string;
  importance: number;
  momentum: number;
  bridge: number;
  cluster: ClusterType;
  role: RoleType;
  subthemes: string[];
  trend: number[];
  x: number;
  y: number;
  excerpt: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  recentChange: number;
  type: EdgeType;
  shared: string[];
  excerpt: string;
}

export interface Outcome {
  id: string;
  label: string;
  year: string;
  category: string;
  description: string;
}

export interface OutcomePath {
  outcome_id: string;
  node_ids: string[];
  description: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  outcomes: Outcome[];
  outcome_paths: OutcomePath[];
}

export interface CognitiveArchitecture {
  summary: string;
  primary_driver: string;
  decision_path: Array<{
    stage: string;
    description: string;
    branches: string[];
  }>;
  cognitive_tensions: Array<{
    pole_a: string;
    pole_b: string;
    description: string;
  }>;
  behavioural_signature: string;
}

export interface ContextData {
  places: Array<{
    place: string;
    lat: number;
    lng: number;
    start_year: number;
    end_year: number;
    description: string;
  }>;
  influences: Array<{
    name: string;
    type: string;
    direction: string;
    description: string;
  }>;
  sources: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  cognitive_architecture?: CognitiveArchitecture;
  pattern_details?: string;
}

export interface GenerateResponse {
  person: Person;
  version: PersonVersion;
  graph: GraphData;
  context: ContextData;
  cached: boolean;
}

export interface PersonDetailResponse {
  person: Person;
  version: PersonVersion;
  graph: GraphData;
  context: ContextData;
}

export const api = {
  generate(name: string) {
    return request<GenerateResponse>('/generate', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  getPeople() {
    return request<{ people: Person[] }>('/people');
  },

  getPerson(id: number) {
    return request<PersonDetailResponse>(`/people/${id}`);
  },

  regenerate(id: number) {
    return request<GenerateResponse>(`/people/${id}/regenerate`, {
      method: 'POST',
    });
  },

  getVersions(id: number) {
    return request<{ versions: PersonVersion[] }>(`/people/${id}/versions`);
  },

  importPerson(data: { person: Person; version: PersonVersion; graph: GraphData; context: ContextData }) {
    return request<GenerateResponse>('/people/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  health() {
    return request<{ status: string }>('/health');
  },
};
