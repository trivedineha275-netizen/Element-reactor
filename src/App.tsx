import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChemicalElement, EvaluatedReaction, HistoryItem, LeftoverReagent, ReagentSlot } from './types';
import { ELEMENTS, ELEMENT_MAP } from './data/elements';
import { evaluateReactionSet } from './utils/chemistryEngine';
import { sound } from './utils/soundEngine';
import { fetchAiReactionExplanation } from './utils/aiNarrative';
import { VesselStage } from './components/VesselStage';
import { ReagentCart } from './components/ReagentCart';
import { PeriodicTable } from './components/PeriodicTable';
import { ReactionReadout } from './components/ReactionReadout';
import { ExperimentLedger } from './components/ExperimentLedger';
import { Atom, Sparkles } from 'lucide-react';

export default function App() {
  const [selected, setSelected] = useState<ReagentSlot[]>([]);
  const [vesselState, setVesselState] = useState<'idle' | 'reacting' | 'done'>('idle');
  const [results, setResults] = useState<EvaluatedReaction[]>([]);
  const [leftovers, setLeftovers] = useState<LeftoverReagent[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_SLOTS = 6;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handlePickElement(el: ChemicalElement) {
    sound.playClick(300 + el.z * 5);
    setVesselState("idle");
    setResults([]);
    setLeftovers([]);

    if (selected.some((s) => s.sym === el.sym)) {
      setSelected(selected.filter((s) => s.sym !== el.sym));
      return;
    }
    if (selected.length >= MAX_SLOTS) return;
    setSelected([...selected, { sym: el.sym, name: el.name, amount: 1 }]);
  }

  function handleSetAmount(sym: string, delta: number) {
    sound.playClick(400 + delta * 50);
    setSelected((prev) =>
      prev.map((s) =>
        s.sym === sym
          ? { ...s, amount: Math.max(1, Math.min(20, s.amount + delta)) }
          : s
      )
    );
  }

  function handleRemoveElement(sym: string) {
    sound.playClick(200);
    setSelected((prev) => prev.filter((s) => s.sym !== sym));
    setVesselState("idle");
    setResults([]);
    setLeftovers([]);
  }

  function handleClearVessel() {
    sound.playClick(200);
    setSelected([]);
    setVesselState("idle");
    setResults([]);
    setLeftovers([]);
  }

  async function handleRunReaction() {
    if (selected.length < 2) return;
    sound.playClick(600);
    setVesselState("reacting");
    setResults([]);
    setLeftovers([]);

    // Evaluate stoichiometry and chemistry
    const { firedReactions, leftovers: leftoverStock, maxTemp } = evaluateReactionSet(selected);

    const highestReactivity = firedReactions.length > 0
      ? firedReactions.reduce((prev, curr) => {
          const rank = { mild: 0, moderate: 1, vigorous: 2, explosive: 3 };
          return rank[curr.rxn.reactivity] > rank[prev.rxn.reactivity] ? curr : prev;
        }, firedReactions[0]).rxn.reactivity
      : 'mild';

    sound.playReaction(highestReactivity);
    if (firedReactions.some((f) => f.rxn.visual === 'bubbles')) {
      setTimeout(() => sound.playBubble(), 300);
      setTimeout(() => sound.playBubble(), 700);
    }

    // Generate/fetch AI scientific explanations for each fired reaction
    const enrichedReactions = await Promise.all(
      firedReactions.map(async (f) => {
        const explanation = await fetchAiReactionExplanation(f, selected);
        return { ...f, aiExplanation: explanation };
      })
    );

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setVesselState("done");
      setResults(enrichedReactions);
      setLeftovers(leftoverStock);

      if (enrichedReactions.length > 0) {
        setHistory((prev) => {
          const updatedHistory = [...prev];
          enrichedReactions.forEach((f) => {
            const existingIndex = updatedHistory.findIndex(
              (item) => item.equation === f.rxn.equation
            );
            if (existingIndex !== -1) {
              updatedHistory[existingIndex].count =
                (updatedHistory[existingIndex].count || 1) + 1;
              const movedItem = updatedHistory.splice(existingIndex, 1)[0];
              updatedHistory.unshift(movedItem);
            } else {
              updatedHistory.unshift({
                els: f.els,
                name: f.rxn.name,
                equation: f.rxn.equation,
                reactivity: f.rxn.reactivity,
                id: f.id,
                count: 1,
                timestamp: Date.now()
              });
            }
          });
          return updatedHistory.slice(0, 10);
        });
      }
    }, 850);
  }

  function handleReloadReaction(item: HistoryItem) {
    sound.playClick(400);
    const newSelected: ReagentSlot[] = [];
    item.els.forEach((sym) => {
      const el = ELEMENT_MAP.get(sym);
      if (el) {
        newSelected.push({ sym: el.sym, name: el.name, amount: 1 });
      }
    });
    setSelected(newSelected);
    setVesselState("idle");
    setResults([]);
    setLeftovers([]);
  }

  const REACTIVITY_COLOR = {
    mild: "#00FFC6",
    moderate: "#FFB84B",
    vigorous: "#FF754B",
    explosive: "#FF4B4B",
  };
  const REACTIVITY_RANK = { mild: 0, moderate: 1, vigorous: 2, explosive: 3 };

  const dominant = useMemo(() => {
    if (results.length === 0) return null;
    return results.reduce(
      (best, r) =>
        REACTIVITY_RANK[r.rxn.reactivity] > REACTIVITY_RANK[best.rxn.reactivity]
          ? r
          : best,
      results[0]
    );
  }, [results]);

  const appGlowColor = dominant
    ? REACTIVITY_COLOR[dominant.rxn.reactivity] || "#00FFC6"
    : "#00FFC6";

  const maxTemp = useMemo(() => {
    if (!results.length) return 298;
    return Math.max(...results.map((r) => r.rxn.temp || 350));
  }, [results]);

  return (
    <div className="app" style={{ "--glow-color": appGlowColor } as React.CSSProperties}>
      <header className="bench-rail top">
        <div className="rail-label">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rail-eyebrow">
              <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
              QUANTUM CHEMICAL REACTION LAB
            </span>
          </div>
          <h1>
            <Atom size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle', color: 'var(--reagent)' }} />
            Element Reactor
          </h1>
        </div>
        <div className="rail-sub">
          Select elements from the 118-element periodic table, set molar stoichiometry ratios, and simulate exact chemical synthesis. Features live ratio distinction (such as HO₂ vs H₂O₂ vs H₂O vs Holmium Ho), clean multi-element pathways, real-time SVG reaction optics, Web Audio sound synthesis, and AI scientific reasoning.
        </div>
      </header>

      <main className="floor">
        <section className="vessel-stage" style={{ minWidth: 0 }}>
          <VesselStage state={vesselState} selected={selected} results={results} />

          <ReagentCart
            selected={selected}
            maxSlots={MAX_SLOTS}
            onSetAmount={handleSetAmount}
            onRemoveElement={handleRemoveElement}
            onRunReaction={handleRunReaction}
            isReacting={vesselState === 'reacting'}
          />

          {vesselState !== 'idle' && (
            <ReactionReadout
              results={results}
              leftovers={leftovers}
              maxTemp={maxTemp}
            />
          )}

          <button
            type="button"
            className="clear-btn"
            onClick={handleClearVessel}
            disabled={selected.length === 0}
          >
            Clear Chamber Reagents
          </button>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
          <PeriodicTable
            selected={selected}
            onPickElement={handlePickElement}
          />
        </section>
      </main>

      <ExperimentLedger
        history={history}
        onReloadReaction={handleReloadReaction}
      />
    </div>
  );
}
