import React from 'react';
import { EvaluatedReaction, LeftoverReagent } from '../types';
import { Bot, Sparkles, Thermometer } from 'lucide-react';
import { formatChemicalText } from '../utils/formatUtils';

interface ReactionReadoutProps {
  results: EvaluatedReaction[];
  leftovers: LeftoverReagent[];
  maxTemp: number;
}

export const ReactionReadout: React.FC<ReactionReadoutProps> = ({
  results,
  leftovers,
  maxTemp
}) => {
  if (results.length === 0) {
    return (
      <div className="readout">
        <div className="ai-narrative-box">
          <div className="ai-badge">
            <Bot size={13} style={{ display: 'inline', marginRight: '4px' }} />
            AI Reaction Analysis
          </div>
          <p className="readout-note visible no-reaction">
            No active chemical reaction pathways were triggered under standard laboratory conditions. Reagents remain inert inside the vessel chamber.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="readout">
      <div className="readout-row thermal-banner">
        <span className="readout-label">
          <Thermometer size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
          Thermal Output
        </span>
        <span className="readout-value mono thermal-val">
          ~{maxTemp} K ({Math.round(maxTemp - 273.15)}°C)
        </span>
      </div>

      {results.map((r) => (
        <div key={r.id} className="result-block">
          <div className="readout-row">
            <span className="readout-label">Balanced Equation</span>
            <span className="readout-value mono equation-val">{formatChemicalText(r.rxn.equation)}</span>
          </div>

          <div className="readout-row">
            <span className="readout-label">Reactivity Level</span>
            <span className={`readout-value reactivity-tag rx-${r.rxn.reactivity}`}>
              {r.rxn.reactivity}
            </span>
          </div>

          <div className="readout-row">
            <span className="readout-label">Primary Product</span>
            <span className="readout-value product-val">{formatChemicalText(r.rxn.product)}</span>
          </div>

          {r.rxn.ratioDescription && (
            <div className="readout-row ratio-note">
              <span className="readout-label">Stoichiometry</span>
              <span className="readout-value ratio-text">{formatChemicalText(r.rxn.ratioDescription)}</span>
            </div>
          )}

          <div className="ai-narrative-box">
            <div className="ai-badge">
              <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
              AI Scientific Synthesis & Mechanism
            </div>
            <p className="readout-note visible">
              {formatChemicalText(r.aiExplanation) || "Analyzing molecular yield..."}
            </p>
          </div>
        </div>
      ))}

      {leftovers.length > 0 && (
        <div className="readout-row leftover-row">
          <span className="readout-label">Unreacted Leftovers</span>
          <span className="readout-value mono leftover-val">
            {leftovers.map((l) => `${l.amount} mol ${l.sym}`).join(" · ")}
          </span>
        </div>
      )}
    </div>
  );
};
