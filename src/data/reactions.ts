import { ReactionDefinition } from '../types';

export interface ReactionVariant {
  symbols: string[]; // sorted element symbols
  matchRatio: (moles: Record<string, number>) => boolean;
  definition: ReactionDefinition;
}

export function buildReactionKey(symbols: string[]): string {
  return [...symbols].sort().join("+");
}

export const CURATED_REACTION_VARIANTS: ReactionVariant[] = [
  // --- HOLMIUM VS HYDROGEN + OXYGEN (Explicit Distinction) ---
  {
    symbols: ["Ho", "O"],
    matchRatio: () => true,
    definition: {
      equation: "4Ho + 3O₂ → 2Ho₂O₃",
      name: "Holmium(III) Oxide Synthesis",
      product: "Holmium(III) Oxide (Pale Pink Crystals)",
      byproducts: ["Thermal Energy Release", "Solid Oxidation Crust"],
      reactivity: "vigorous",
      ratio: [4, 3], // 4 Ho, 3 O
      visual: "smoke",
      temp: 1650,
      ratioDescription: "Direct rare-earth oxidation of Holmium metal (atomic #67) with Oxygen."
    }
  },

  // --- HYDROGEN + OXYGEN RATIO VARIANTS ---
  {
    symbols: ["H", "O"],
    // 2 H : 1 O (or excess H relative to O) -> Water Synthesis
    matchRatio: (m) => {
      const h = m["H"] || 0;
      const o = m["O"] || 0;
      return h >= o * 1.5;
    },
    definition: {
      equation: "2H₂ + O₂ → 2H₂O",
      name: "Water Synthesis (Exothermic Combustion)",
      product: "Water Vapor (H₂O)",
      byproducts: ["Intense Heat", "Flash Light"],
      reactivity: "explosive",
      ratio: [2, 1], // 2 H, 1 O
      visual: "flame",
      temp: 2200,
      ratioDescription: "2:1 molar ratio of Hydrogen to Oxygen yields water combustion."
    }
  },
  {
    symbols: ["H", "O"],
    // 1 H : 2 O (or excess O) -> Hydroperoxyl Radical Formation
    matchRatio: (m) => {
      const h = m["H"] || 0;
      const o = m["O"] || 0;
      return o >= h * 1.5;
    },
    definition: {
      equation: "H + O₂ → HO₂",
      name: "Hydroperoxyl Radical Synthesis",
      product: "Hydroperoxyl Radical (HO₂)",
      byproducts: ["Reactive Oxygen Intermediates", "Thermal Shock"],
      reactivity: "vigorous",
      ratio: [1, 2], // 1 H, 2 O
      visual: "gas",
      temp: 850,
      ratioDescription: "1:2 molar ratio (excess oxygen) forms reactive hydroperoxyl radicals."
    }
  },
  {
    symbols: ["H", "O"],
    // 1 H : 1 O -> Hydrogen Peroxide Synthesis
    matchRatio: () => true, // default for H+O if 1:1 or other
    definition: {
      equation: "H₂ + O₂ → H₂O₂",
      name: "Hydrogen Peroxide Synthesis",
      product: "Hydrogen Peroxide Liquid (H₂O₂)",
      byproducts: ["Mild Thermal Release", "Active Oxygen Linkage"],
      reactivity: "moderate",
      ratio: [1, 1], // 1 H, 1 O
      visual: "bubbles",
      temp: 340,
      ratioDescription: "1:1 stoichiometric ratio yields hydrogen peroxide."
    }
  },

  // --- CARBON + OXYGEN RATIO VARIANTS ---
  {
    symbols: ["C", "O"],
    matchRatio: (m) => (m["O"] || 0) >= (m["C"] || 0) * 1.5,
    definition: {
      equation: "C + O₂ → CO₂",
      name: "Complete Carbon Combustion",
      product: "Carbon Dioxide Gas (CO₂)",
      byproducts: ["Thermal Radiation", "Glow"],
      reactivity: "moderate",
      ratio: [1, 2],
      visual: "gas",
      temp: 950,
      ratioDescription: "Excess oxygen leads to complete combustion into carbon dioxide."
    }
  },
  {
    symbols: ["C", "O"],
    matchRatio: () => true,
    definition: {
      equation: "2C + O₂ → 2CO",
      name: "Incomplete Carbon Combustion",
      product: "Carbon Monoxide Gas (CO)",
      byproducts: ["Heat", "Toxic Gas"],
      reactivity: "mild",
      ratio: [1, 1],
      visual: "smoke",
      temp: 650,
      ratioDescription: "1:1 ratio causes oxygen-starved incomplete combustion into carbon monoxide."
    }
  },

  // --- IRON + OXYGEN RATIO VARIANTS ---
  {
    symbols: ["Fe", "O"],
    matchRatio: (m) => (m["O"] || 0) >= (m["Fe"] || 0) * 0.7,
    definition: {
      equation: "4Fe + 3O₂ → 2Fe₂O₃",
      name: "Iron(III) Oxidation (Rusting)",
      product: "Hydrated Iron(III) Oxide (Rust)",
      byproducts: ["Exothermic Slow Reaction"],
      reactivity: "mild",
      ratio: [4, 3],
      visual: "rust",
      temp: 320,
      ratioDescription: "4:3 molar ratio forms stable red-brown iron(III) oxide (rust)."
    }
  },
  {
    symbols: ["Fe", "O"],
    matchRatio: () => true,
    definition: {
      equation: "2Fe + O₂ → 2FeO",
      name: "Iron(II) Oxide Synthesis",
      product: "Black Iron(II) Oxide (FeO)",
      byproducts: ["Thermal Radiation"],
      reactivity: "moderate",
      ratio: [1, 1],
      visual: "smoke",
      temp: 780,
      ratioDescription: "1:1 molar ratio under oxygen-limited conditions yields ferrous oxide."
    }
  },

  // --- SODIUM + OXYGEN RATIO VARIANTS ---
  {
    symbols: ["Na", "O"],
    matchRatio: (m) => (m["Na"] || 0) >= (m["O"] || 0) * 3,
    definition: {
      equation: "4Na + O₂ → 2Na₂O",
      name: "Sodium Oxide Combustion",
      product: "Sodium Oxide White Solid (Na₂O)",
      byproducts: ["Bright Yellow Flame", "Heat"],
      reactivity: "explosive",
      ratio: [4, 1],
      visual: "flame",
      temp: 1450,
      ratioDescription: "Excess sodium forms basic sodium oxide."
    }
  },
  {
    symbols: ["Na", "O"],
    matchRatio: () => true,
    definition: {
      equation: "2Na + O₂ → Na₂O₂",
      name: "Sodium Peroxide Synthesis",
      product: "Sodium Peroxide Powder (Na₂O₂)",
      byproducts: ["Exothermic Heat", "White Fumes"],
      reactivity: "vigorous",
      ratio: [1, 1],
      visual: "smoke",
      temp: 920,
      ratioDescription: "Equal molar ratio produces sodium peroxide."
    }
  },

  // --- OTHER BINARY REACTION CURATED LIST ---
  {
    symbols: ["Al", "O"],
    matchRatio: () => true,
    definition: {
      equation: "4Al + 3O₂ → 2Al₂O₃",
      name: "Aluminium Oxidation",
      product: "Aluminium Oxide Layer",
      byproducts: ["White Smoke", "High Heat"],
      reactivity: "vigorous",
      ratio: [4, 3],
      visual: "smoke",
      temp: 1400
    }
  },
  {
    symbols: ["Cl", "Na"],
    matchRatio: () => true,
    definition: {
      equation: "2Na + Cl₂ → 2NaCl",
      name: "Table Salt Synthesis",
      product: "Sodium Chloride Crystal Salt (NaCl)",
      byproducts: ["Intense Heat", "Yellow Flame"],
      reactivity: "vigorous",
      ratio: [1, 1],
      visual: "flame",
      temp: 1100
    }
  },
  {
    symbols: ["Cl", "H"],
    matchRatio: () => true,
    definition: {
      equation: "H₂ + Cl₂ → 2HCl",
      name: "Hydrochloric Acid Gas Synthesis",
      product: "Hydrogen Chloride Gas (HCl)",
      byproducts: ["Choking Acidic Fumes"],
      reactivity: "explosive",
      ratio: [1, 1],
      visual: "gas",
      temp: 1200
    }
  },
  {
    symbols: ["H", "N"],
    matchRatio: () => true,
    definition: {
      equation: "N₂ + 3H₂ → 2NH₃",
      name: "Haber-Bosch Ammonia Synthesis",
      product: "Ammonia Gas (NH₃)",
      byproducts: ["Pungent Gas", "Thermal Output"],
      reactivity: "moderate",
      ratio: [3, 1],
      visual: "gas",
      temp: 720
    }
  },
  {
    symbols: ["K", "O"],
    matchRatio: (m) => (m["O"] || 0) >= (m["K"] || 0),
    definition: {
      equation: "K + O₂ → KO₂",
      name: "Potassium Superoxide Synthesis",
      product: "Potassium Superoxide (KO₂)",
      byproducts: ["Orange Glow", "Heat"],
      reactivity: "explosive",
      ratio: [1, 2],
      visual: "flame",
      temp: 1600
    }
  },
  {
    symbols: ["Mg", "O"],
    matchRatio: () => true,
    definition: {
      equation: "2Mg + O₂ → 2MgO",
      name: "Magnesium Ribbon Combustion",
      product: "Magnesium Oxide White Ash (MgO)",
      byproducts: ["Blinding UV White Light", "Extreme Heat"],
      reactivity: "explosive",
      ratio: [2, 1],
      visual: "flame",
      temp: 2800
    }
  },

  // --- CURATED MULTI-ELEMENT REACTIONS (3+ Elements) ---
  {
    symbols: ["Al", "Fe", "O"],
    matchRatio: () => true,
    definition: {
      equation: "2Al + Fe₂O₃ → Al₂O₃ + 2Fe",
      name: "Thermite Redox Reaction",
      product: "Molten Iron Metal + Aluminium Oxide",
      byproducts: ["Blinding Light", "Extreme Thermal Blast"],
      reactivity: "explosive",
      ratio: [2, 2, 3], // Al: 2, Fe: 2, O: 3
      visual: "flame",
      temp: 2750
    }
  },
  {
    symbols: ["C", "K", "N", "O"],
    matchRatio: () => true,
    definition: {
      equation: "2KNO₃ + 3C → K₂CO₃ + N₂ + 3CO",
      name: "Black Powder Ignition",
      product: "Potassium Carbonate + Nitrogen Gas",
      byproducts: ["Rapid Gas Expansion", "Explosive Shockwave"],
      reactivity: "explosive",
      ratio: [3, 2, 2, 6], // C: 3, K: 2, N: 2, O: 6
      visual: "smoke",
      temp: 2100
    }
  },
  {
    symbols: ["C", "H", "O"],
    matchRatio: (m) => (m["H"] || 0) >= (m["C"] || 0) * 3,
    definition: {
      equation: "CH₄ + 2O₂ → CO₂ + 2H₂O",
      name: "Methane Hydrocarbon Combustion",
      product: "Carbon Dioxide + Water Vapor",
      byproducts: ["Blue Flame", "Thermal Energy"],
      reactivity: "vigorous",
      ratio: [1, 4, 4], // C: 1, H: 4, O: 4
      visual: "flame",
      temp: 1550
    }
  },
  {
    symbols: ["C", "H", "O"],
    matchRatio: () => true,
    definition: {
      equation: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
      name: "Photosynthetic Glucose Synthesis",
      product: "Glucose Sugar + Oxygen Gas",
      byproducts: ["Stored Chemical Energy"],
      reactivity: "mild",
      ratio: [6, 12, 6], // C: 6, H: 12, O: 6
      visual: "precipitate",
      temp: 310
    }
  },
  {
    symbols: ["H", "N", "O"],
    matchRatio: () => true,
    definition: {
      equation: "H₂ + N₂ + 3O₂ → 2HNO₃",
      name: "Nitric Acid Synthesis",
      product: "Aqueous Nitric Acid (HNO₃)",
      byproducts: ["Acidic Fumes", "Heat"],
      reactivity: "vigorous",
      ratio: [2, 2, 6],
      visual: "smoke",
      temp: 650
    }
  },
  {
    symbols: ["H", "O", "S"],
    matchRatio: () => true,
    definition: {
      equation: "2H₂ + O₂ + 2S → 2H₂SO₄",
      name: "Sulfuric Acid Synthesis",
      product: "Sulfuric Acid (H₂SO₄)",
      byproducts: ["Intense Hydration Heat"],
      reactivity: "vigorous",
      ratio: [4, 8, 2],
      visual: "gas",
      temp: 780
    }
  },
  {
    symbols: ["Cl", "Na", "O"],
    matchRatio: () => true,
    definition: {
      equation: "2Na + Cl₂ + O₂ → 2NaClO",
      name: "Sodium Hypochlorite Bleach Synthesis",
      product: "Liquid Bleach Solution (NaClO)",
      byproducts: ["Pungent Chlorine Vapor"],
      reactivity: "moderate",
      ratio: [2, 2, 2],
      visual: "bubbles",
      temp: 360
    }
  },
  {
    symbols: ["C", "H", "Na", "O"],
    matchRatio: () => true,
    definition: {
      equation: "NaHCO₃ + CH₃COOH → NaCH₃COO + H₂O + CO₂↑",
      name: "Sodium Bicarbonate Acid Neutralization",
      product: "Sodium Acetate + Water + CO₂ Gas",
      byproducts: ["Vigorous Effervescence", "Carbon Dioxide Bubbles"],
      reactivity: "moderate",
      ratio: [2, 4, 1, 5],
      visual: "bubbles",
      temp: 298
    }
  },
  {
    symbols: ["Cl", "H", "Na", "O"],
    matchRatio: () => true,
    definition: {
      equation: "NaClO + 2HCl → NaCl + H₂O + Cl₂↑",
      name: "Bleach & Acid Toxic Chlorine Release",
      product: "Toxic Chlorine Gas + Salt Water",
      byproducts: ["Choking Toxic Gas Hazard", "Pungent Fumes"],
      reactivity: "vigorous",
      ratio: [2, 3, 1, 1],
      visual: "smoke",
      temp: 310
    }
  }
];
