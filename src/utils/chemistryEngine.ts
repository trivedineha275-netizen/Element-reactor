import { ChemicalElement, EvaluatedReaction, LeftoverReagent, ReagentSlot, VisualEffect } from '../types';
import { ELEMENT_MAP } from '../data/elements';
import { buildReactionKey, CURATED_REACTION_VARIANTS } from '../data/reactions';

export interface ReactionEngineOutput {
  firedReactions: EvaluatedReaction[];
  leftovers: LeftoverReagent[];
  maxTemp: number;
}

export function evaluateReactionSet(reagents: ReagentSlot[]): ReactionEngineOutput {
  if (reagents.length < 2) {
    return { firedReactions: [], leftovers: reagents.map(r => ({ sym: r.sym, amount: r.amount })), maxTemp: 298 };
  }

  // Stock inventory map (moles available)
  const stock: Record<string, number> = {};
  reagents.forEach(r => {
    stock[r.sym] = r.amount;
  });

  const activeSymbols = reagents.map(r => r.sym).sort();
  const firedReactions: EvaluatedReaction[] = [];

  // Check if any Noble gases are present alone
  const containsNobleOnly = activeSymbols.every(sym => {
    const el = ELEMENT_MAP.get(sym);
    return el?.group === 'noble';
  });

  if (containsNobleOnly) {
    return {
      firedReactions: [],
      leftovers: reagents.map(r => ({ sym: r.sym, amount: r.amount })),
      maxTemp: 298
    };
  }

  // Step 1: Search for matching curated reaction variants based on available symbols & stoichiometry
  let mainVariant = CURATED_REACTION_VARIANTS.find(variant => {
    const varKey = buildReactionKey(variant.symbols);
    const activeKey = buildReactionKey(activeSymbols);
    if (varKey === activeKey && variant.matchRatio(stock)) {
      return true;
    }
    return false;
  });

  // Fallback match: check if variant symbols are a subset of active symbols if activeSymbols.length > 2
  if (!mainVariant) {
    mainVariant = CURATED_REACTION_VARIANTS.find(variant => {
      const isSubset = variant.symbols.every(s => activeSymbols.includes(s));
      return isSubset && variant.matchRatio(stock);
    });
  }

  if (mainVariant) {
    const rxn = mainVariant.definition;
    const variantSymbols = mainVariant.symbols;
    
    // Calculate limiting reagent extent
    let extent = Infinity;
    variantSymbols.forEach((sym, idx) => {
      const available = stock[sym] || 0;
      const reqRatio = rxn.ratio[idx] || 1;
      if (reqRatio > 0) {
        extent = Math.min(extent, available / reqRatio);
      }
    });

    if (extent === Infinity || extent <= 0 || isNaN(extent)) {
      extent = 1;
    }

    const used = variantSymbols.map((sym, idx) => {
      const consumed = +((rxn.ratio[idx] || 1) * extent).toFixed(2);
      stock[sym] = Math.max(0, +((stock[sym] || 0) - consumed).toFixed(2));
      return consumed;
    });

    firedReactions.push({
      id: `${buildReactionKey(variantSymbols)}-${Date.now()}`,
      els: variantSymbols,
      used,
      extent: +extent.toFixed(2),
      rxn
    });
  } else {
    // Step 2: Algorithmic Chemistry for non-curated combinations
    const nonNobleReagents = reagents.filter(r => ELEMENT_MAP.get(r.sym)?.group !== 'noble');
    if (nonNobleReagents.length >= 2) {
      const symbols = nonNobleReagents.map(r => r.sym).sort();
      const metals = nonNobleReagents.filter(r => {
        const el = ELEMENT_MAP.get(r.sym);
        return el && ['alkali', 'alkaline', 'transition', 'poor-metal', 'lanthanide', 'actinide'].includes(el.group);
      });
      const nonmetals = nonNobleReagents.filter(r => {
        const el = ELEMENT_MAP.get(r.sym);
        return el && ['nonmetal', 'halogen', 'metalloid'].includes(el.group);
      });

      if (metals.length > 0 && nonmetals.length > 0) {
        const primaryMetal = metals[0];
        const primaryNonmetal = nonmetals[0];
        const mEl = ELEMENT_MAP.get(primaryMetal.sym);
        const nmEl = ELEMENT_MAP.get(primaryNonmetal.sym);

        if (mEl && nmEl) {
          const mVal = mEl.valency[0] || 1;
          const nmVal = Math.abs(nmEl.valency[0] || 1);
          
          // Cross valency rule for stoichiometry ratio
          const mRatio = nmVal;
          const nmRatio = mVal;

          const availableM = stock[primaryMetal.sym] || 1;
          const availableNM = stock[primaryNonmetal.sym] || 1;
          const extent = Math.min(availableM / mRatio, availableNM / nmRatio);

          const usedM = +((mRatio * extent).toFixed(2));
          const usedNM = +((nmRatio * extent).toFixed(2));

          stock[primaryMetal.sym] = Math.max(0, +((stock[primaryMetal.sym] || 0) - usedM).toFixed(2));
          stock[primaryNonmetal.sym] = Math.max(0, +((stock[primaryNonmetal.sym] || 0) - usedNM).toFixed(2));

          const electronegDiff = Math.abs(nmEl.electronegativity - mEl.electronegativity);
          const isIonic = electronegDiff > 1.7;
          const reactivity = electronegDiff > 2.5 ? 'explosive' : electronegDiff > 1.8 ? 'vigorous' : 'moderate';
          const visual: VisualEffect = isIonic ? (reactivity === 'explosive' ? 'flame' : 'smoke') : 'precipitate';
          const temp = reactivity === 'explosive' ? 2200 : reactivity === 'vigorous' ? 1400 : 750;

          const equation = `${mRatio > 1 ? mRatio : ''}${primaryMetal.sym} + ${nmRatio > 1 ? nmRatio : ''}${primaryNonmetal.sym} → ${primaryMetal.sym}${mRatio > 1 ? mRatio : ''}${primaryNonmetal.sym}${nmRatio > 1 ? nmRatio : ''}`;

          firedReactions.push({
            id: `algo-${symbols.join('-')}-${Date.now()}`,
            els: [primaryMetal.sym, primaryNonmetal.sym],
            used: [usedM, usedNM],
            extent: +extent.toFixed(2),
            rxn: {
              equation,
              name: `${mEl.name} ${nmEl.name} Ionic Synthesis`,
              product: `${mEl.name} ${nmEl.name.endsWith('ine') ? nmEl.name.replace('ine', 'ide') : nmEl.name + 'ide'}`,
              byproducts: ["Lattice Formation Heat", "Ion Exchange"],
              reactivity,
              ratio: [mRatio, nmRatio],
              visual,
              temp
            }
          });
        }
      }
    }
  }

  // Step 3: Collect leftover unreacted stock
  const leftovers: LeftoverReagent[] = Object.entries(stock)
    .filter(([, amt]) => amt > 0.01)
    .map(([sym, amt]) => ({ sym, amount: +amt.toFixed(2) }));

  const maxTemp = firedReactions.length > 0
    ? Math.max(...firedReactions.map(f => f.rxn.temp))
    : 298;

  return {
    firedReactions,
    leftovers,
    maxTemp
  };
}
