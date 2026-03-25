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
