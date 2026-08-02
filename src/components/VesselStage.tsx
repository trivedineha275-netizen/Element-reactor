import React, { useMemo } from 'react';
import { EvaluatedReaction, ReagentSlot } from '../types';

interface VesselStageProps {
  state: 'idle' | 'reacting' | 'done';
  selected: ReagentSlot[];
  results: EvaluatedReaction[];
}

export const VesselStage: React.FC<VesselStageProps> = ({ state, selected, results }) => {
  const activeVisuals = useMemo(() => {
    if (state !== 'reacting' && state !== 'done') return new Set<string>();
    return new Set(results.map(r => r.rxn.visual));
  }, [state, results]);

  const hasFlame = activeVisuals.has('flame');
  const hasSmoke = activeVisuals.has('smoke');
  const hasGas = activeVisuals.has('gas');
  const hasBubbles = activeVisuals.has('bubbles');
  const hasPrecipitate = activeVisuals.has('precipitate');
  const hasRust = activeVisuals.has('rust');

  const classList = Array.from(activeVisuals).map(v => `visual-${v}`).join(' ');

  let mixGlow = '#00FFC6';
  if (hasFlame) mixGlow = '#FF4B4B';
  else if (hasSmoke || hasGas) mixGlow = '#FFB84B';

  return (
    <div className="vessel-wrap" style={{ position: 'relative', width: '100%', maxWidth: '280px', margin: '0 auto' }}>
      <svg
        className={`vessel ${classList} ${state}`}
        viewBox="0 0 320 380"
        xmlns="http://www.w3.org/2000/svg"
        style={{ '--glow-color': mixGlow } as React.CSSProperties}
      >
        <defs>
          <linearGradient id="glassSheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,255,198,0.14)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(0,255,198,0.20)" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="60%" r="60%">
            <stop offset="0%" stopColor="var(--glow-color)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--glow-color)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="160" cy="365" rx="90" ry="10" fill="#000" opacity="0.6" />

        {/* Outer Glass Contour */}
        <path
          d="M132 40 L132 130 L70 320 Q66 340 90 340 L230 340 Q254 340 250 320 L188 130 L188 40 Z"
          fill="rgba(10,20,18,0.8)"
          stroke="#00FFC6"
          strokeWidth="2.5"
          strokeOpacity="0.6"
        />
        <path
          d="M132 40 L132 130 L70 320 Q66 340 90 340 L230 340 Q254 340 250 320 L188 130 L188 40 Z"
          fill="url(#glassSheen)"
        />
        <rect x="126" y="28" width="68" height="14" rx="3" fill="none" stroke="#00FFC6" strokeWidth="2" strokeOpacity="0.8" />

        <clipPath id="flaskClip">
          <path d="M132 40 L132 130 L70 320 Q66 340 90 340 L230 340 Q254 340 250 320 L188 130 L188 40 Z" />
        </clipPath>

        <g clipPath="url(#flaskClip)">
          <rect className="fill-liquid" x="60" y="190" width="200" height="160" />

          {hasBubbles && (
            <g className="fx-bubbles">
              <circle className="bubble b1" cx="110" cy="320" r="6" />
              <circle className="bubble b2" cx="145" cy="330" r="5" />
              <circle className="bubble b3" cx="175" cy="310" r="8" />
              <circle className="bubble b4" cx="210" cy="325" r="4" />
              <circle className="bubble b5" cx="130" cy="340" r="7" />
              <circle className="bubble b2" cx="190" cy="340" r="5" />
            </g>
          )}
          {hasPrecipitate && (
            <g className="fx-precipitate">
              <circle className="fleck f1" cx="105" cy="220" r="4" />
              <circle className="fleck f2" cx="145" cy="245" r="3.5" />
              <circle className="fleck f3" cx="195" cy="230" r="4.5" />
              <circle className="fleck f4" cx="165" cy="265" r="3" />
              <circle className="fleck f5" cx="125" cy="295" r="4" />
              <circle className="fleck f1" cx="95" cy="280" r="5" />
            </g>
          )}
          {hasRust && (
            <g className="fx-rust">
              <circle className="rust-fleck" cx="115" cy="250" r="12" />
              <circle className="rust-fleck" cx="165" cy="285" r="16" />
              <circle className="rust-fleck" cx="205" cy="240" r="10" />
              <circle className="rust-fleck" cx="135" cy="315" r="14" />
            </g>
          )}
        </g>

        {(state === 'reacting' || state === 'done') && (
          <circle className="glow-burst" cx="160" cy="230" r="85" fill="url(#glow)" />
        )}

        {(hasSmoke || hasGas) && (state === 'reacting' || state === 'done') && (
          <g className="wisps">
            <path className="wisp w1" d="M145 30 Q130 -10 155 -35" />
            <path className="wisp w2" d="M160 30 Q175 -5 145 -45" />
            <path className="wisp w3" d="M175 30 Q190 5 165 -30" />
            <path className="wisp w1" d="M150 25 Q125 -20 160 -50" />
          </g>
        )}

        {hasFlame && (state === 'reacting' || state === 'done') && (
          <path
            className="flame-lick"
            d="M160 30 C145 10, 140 -15, 160 -35 C180 -15, 175 10, 160 30 Z"
          />
        )}

        {selected.map((s, idx) => {
          const side = idx % 2 === 0 ? 'left' : 'right';
          const offset = Math.floor(idx / 2) * 32;
          const x = side === 'left' ? 35 : 285;
          const y = 80 + offset;
          return (
            <text key={s.sym} x={x} y={y} className="tag-symbol" textAnchor={side === 'left' ? 'start' : 'end'}>
              {s.amount > 1 ? `${s.amount}${s.sym}` : s.sym}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
