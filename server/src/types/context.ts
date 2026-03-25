export interface Place {
  place: string;
  lat: number;
  lng: number;
  start_year: number;
  end_year: number;
  description: string;
}

export interface Influence {
  name: string;
  type: 'literary' | 'philosophical' | 'political' | 'personal' | 'scientific' | 'artistic';
  direction: 'influenced_person' | 'person_influenced';
  description: string;
}

export interface Source {
  title: string;
  url: string;
  type: 'wikipedia' | 'book' | 'article' | 'reference';
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
  places: Place[];
  influences: Influence[];
  sources: Source[];
  cognitive_architecture?: CognitiveArchitecture;
}
