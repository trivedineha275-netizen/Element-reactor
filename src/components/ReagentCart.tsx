import React from 'react';
import { ReagentSlot } from '../types';
import { Plus, Minus, X, Zap } from 'lucide-react';

interface ReagentCartProps {
  selected: ReagentSlot[];
  maxSlots: number;
  onSetAmount: (sym: string, delta: number) => void;
  onRemoveElement: (sym: string) => void;
  onRunReaction: () => void;
  isReacting: boolean;
}

export const ReagentCart: React.FC<ReagentCartProps> = ({
  selected,
  maxSlots,
  onSetAmount,
  onRemoveElement,
  onRunReaction,
  isReacting
}) => {
  return (
    <div className="cart">
      <div className="cart-header">
        <span className="readout-label">Vessel Reagents & Stoichiometry</span>
        <span className="cart-count mono">{selected.length}/{maxSlots} slots</span>
      </div>

      {selected.length === 0 ? (
        <p className="cart-empty">Click elements on the periodic table below to load reagents into the chamber.</p>
      ) : (
        <ul className="cart-list">
          {selected.map((s) => (
            <li key={s.sym} className="cart-row">
              <span className="cart-sym mono">{s.sym}</span>
              <span className="cart-name">{s.name}</span>
              <div className="stepper" title="Set molar quantity">
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => onSetAmount(s.sym, -1)}
                  aria-label={`Decrease ${s.name} moles`}
                >
                  <Minus size={12} />
                </button>
                <span className="step-value mono">{s.amount} mol</span>
                <button
                  type="button"
                  className="step-btn"
                  onClick={() => onSetAmount(s.sym, 1)}
                  aria-label={`Increase ${s.name} moles`}
                >
                  <Plus size={12} />
                </button>
              </div>
              <button
                type="button"
                className="cart-remove"
                onClick={() => onRemoveElement(s.sym)}
                aria-label={`Remove ${s.name}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="react-btn"
        onClick={onRunReaction}
        disabled={selected.length < 2 || isReacting}
      >
        <Zap size={14} style={{ display: 'inline', marginRight: '6px' }} />
        {isReacting ? "Synthesizing..." : "Execute Reaction"}
      </button>
    </div>
  );
};
