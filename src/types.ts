export type ElementGroup =
  | 'alkali'
  | 'alkaline'
  | 'transition'
  | 'poor-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble'
  | 'lanthanide'
  | 'actinide';

export interface ChemicalElement {
  sym: string;
  name: string;
  z: number;
  mass: string;
  group: ElementGroup;
  row: number;
  col: number;
  electronegativity: number;
  valency: number[];
  phase?: 'gas' | 'liquid' | 'solid';
}

export type ReactivityLevel = 'mild' | 'moderate' | 'vigorous' | 'explosive';
export type VisualEffect = 'flame' | 'smoke' | 'gas' | 'bubbles' | 'precipitate' | 'rust';

export interface ReactionDefinition {
  equation: string;
  name: string;
  product: string;
  byproducts: string[];
  reactivity: ReactivityLevel;
  ratio: number[]; // stoichiometry matching elements in alphabetical symbol order
  visual: VisualEffect;
  temp: number; // thermal output in Kelvin
  ratioDescription?: string;
}

export interface ReagentSlot {
  sym: string;
  name: string;
  amount: number; // in moles
}

export interface EvaluatedReaction {
  id: string;
  els: string[]; // element symbols involved
  used: number[]; // moles consumed per element
  extent: number; // reaction extent multiplier
  rxn: ReactionDefinition;
  aiExplanation?: string;
}

export interface LeftoverReagent {
  sym: string;
  amount: number;
}

export interface HistoryItem {
  id: string;
  els: string[];
  name: string;
  equation: string;
  reactivity: ReactivityLevel;
  count: number;
  timestamp: number;
}
