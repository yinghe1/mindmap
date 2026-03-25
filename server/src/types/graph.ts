export type ClusterType = 'technical' | 'strategic' | 'reflective' | 'macro';
export type RoleType = 'Core' | 'Bridge' | 'Foundation' | 'Shock' | 'Emergent' | 'Origin';

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

export type EdgeType = 'strong_stable' | 'strong_rising' | 'stable' | 'rising' | 'light';

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
