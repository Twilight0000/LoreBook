
export type EntityType = 'CHARACTER' | 'PLACE' | 'EVENT';

export interface EntityMetadata {
  // Character specific
  role?: string;
  traits?: string[];
  
  // Place specific
  placeType?: string; // e.g. Forest, City
  coordinates?: string;

  // Timeline specific
  dateStr?: string;
  order?: number;
}

export interface Entity {
  id: string;
  user_id?: string;
  type: EntityType;
  name: string;
  description: string;
  image_url?: string;
  metadata: EntityMetadata;
  created_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CHARACTERS = 'CHARACTERS',
  PLACES = 'PLACES',
  TIMELINE = 'TIMELINE',
  SETTINGS = 'SETTINGS',
}
