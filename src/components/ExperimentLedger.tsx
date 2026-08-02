import React from 'react';
import { HistoryItem } from '../types';
import { History, RotateCcw } from 'lucide-react';
import { formatChemicalText } from '../utils/formatUtils';

interface ExperimentLedgerProps {
  history: HistoryItem[];
  onReloadReaction?: (item: HistoryItem) => void;
}

export const ExperimentLedger: React.FC<ExperimentLedgerProps> = ({
  history,
  onReloadReaction
}) => {
  if (history.length === 0) return null;

  return (
    <footer className="bench-rail bottom">
      <div className="rail-eyebrow small">
        <History size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
        EXPERIMENT LEDGER & SYNTHESIS LOG
      </div>
      <ul className="ledger">
        {history.map((h) => (
          <li
            key={h.id}
            className="ledger-row"
            onClick={() => onReloadReaction && onReloadReaction(h)}
            title="Click to reload reactants into vessel"
          >
            <span className="mono ledger-reagents">{h.els.join(" + ")}</span>
            <span className={`ledger-dot rx-${h.reactivity}`} />
            <span className="ledger-name">{h.name}</span>
            <span className="mono ledger-eq">
              {formatChemicalText(h.equation)}
              {h.count > 1 && (
                <span className="history-badge">×{h.count}</span>
              )}
              {onReloadReaction && (
                <RotateCcw size={12} className="reload-icon" />
              )}
            </span>
          </li>
        ))}
      </ul>
    </footer>
  );
};
