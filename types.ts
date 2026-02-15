
export interface PlasticType {
  id: string;
  code: number;
  name: string;
  commonName: string;
  structure: string;
  formula: string;
  polymerization: string;
  properties: string[];
  safety: string;
  sustainability: string;
  description_ar: string;
  name_ar: string;
  safety_ar: string;
  // Enhanced properties
  recyclabilityScore?: number; // 0-100
  degradationYears?: number; // Environmental degradation timeline
  polymerCategory?: 'thermoplastic' | 'thermoset' | 'elastomer';
  chemicalBonds?: string; // Simplified bond structure
  commonUses?: string[];
  commonUses_ar?: string[];
}

export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  name_ar: string;
  mass: number;
  category: string;
  config: string;
  summary: string;
  summary_ar: string;
  row: number;
  col: number;
}

export interface UserStats {
  rank: string;
  rank_ar: string;
  points: number;
  level: number;
  xp: number;
  nextLevelXp: number;
  scans: number;
  equationsBalanced: number;
  // Environmental Impact Metrics
  co2Saved?: number; // kg of CO2
  plasticsIdentified?: number;
  recyclingStreak?: number; // days
}

export type Language = 'en' | 'ar';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}
