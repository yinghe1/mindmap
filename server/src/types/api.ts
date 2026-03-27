import type { Person, PersonVersion } from './profile.js';
import type { GraphData } from './graph.js';
import type { ContextData } from './context.js';

export interface GenerateRequest {
  name: string;
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

export interface PeopleListResponse {
  people: Person[];
}

export interface VersionListResponse {
  versions: PersonVersion[];
}

export interface ErrorResponse {
  error: string;
  details?: string;
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

export interface LLMGeneratedData {
  profile: {
    auto_group: string;
    cognitive_architecture: CognitiveArchitecture;
  };
  graph: GraphData;
  context: ContextData;
}
