import React, { useState, useMemo } from 'react';
import { ChemicalElement, ElementGroup, ReagentSlot } from '../types';
import { ELEMENTS } from '../data/elements';
import { Search } from 'lucide-react';

interface PeriodicTableProps {
  selected: ReagentSlot[];
  onPickElement: (el: ChemicalElement) => void;
}

const CATEGORY_LABELS: [ElementGroup, string][] = [
  ["alkali", "Alkali Metal"],
  ["alkaline", "Alkaline Earth"],
  ["transition", "Transition Metal"],
  ["poor-metal", "Post-Transition Metal"],
  ["metalloid", "Metalloid"],
  ["nonmetal", "Nonmetal"],
  ["halogen", "Halogen"],
  ["noble", "Noble Gas"],
  ["lanthanide", "Lanthanide"],
  ["actinide", "Actinide"],
];

export const PeriodicTable: React.FC<PeriodicTableProps> = ({
  selected,
  onPickElement,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hoveredElement, setHoveredElement] = useState<ChemicalElement | null>(null);

  const filteredElements = useMemo(() => {
    return ELEMENTS.filter(el => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        el.name.toLowerCase().includes(q) ||
        el.sym.toLowerCase().includes(q) ||
        el.z.toString() === q;
      const matchesCategory =
        selectedCategory === "all" || el.group === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="table-stage">
      <div className="table-controls">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div className="rail-eyebrow small">INTERACTIVE PERIODIC TABLE (118 ELEMENTS)</div>
          {hoveredElement && (
            <div className="mono hover-detail">
              <strong>{hoveredElement.name} ({hoveredElement.sym})</strong> | Z: {hoveredElement.z} | Electronegativity: {hoveredElement.electronegativity || 'N/A'} | Valency: {hoveredElement.valency.join(", ")}
            </div>
          )}
        </div>

        <div className="filter-toolbar">
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input mono"
              placeholder="Search by name, symbol (e.g., Ho, H, Fe), or atomic number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="category-select mono"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Groups</option>
            {CATEGORY_LABELS.map(([group, label]) => (
              <option key={group} value={group}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mobile-scroll-hint mono">
        Scroll horizontally to explore full grid →
      </div>

      <div className="periodic-scroll-container">
        <div className="element-grid periodic">
          {ELEMENTS.map((el) => {
            const isSelected = selected.some((s) => s.sym === el.sym);
            const isFilteredOut = !filteredElements.some(f => f.sym === el.sym);

            return (
              <button
                type="button"
                key={el.sym}
                className={`element-tile group-${el.group} ${isSelected ? "selected" : ""} ${isFilteredOut ? "filtered-out" : ""}`}
                style={{ gridRow: el.row, gridColumn: el.col }}
                onClick={() => onPickElement(el)}
                onMouseEnter={() => setHoveredElement(el)}
                onMouseLeave={() => setHoveredElement(null)}
                aria-pressed={isSelected}
                title={`${el.name} (${el.sym}) - Atomic #${el.z}, Electronegativity: ${el.electronegativity}`}
              >
                <span className="el-z">{el.z}</span>
                <span className="el-sym">{el.sym}</span>
                <span className="el-mass mono">{el.mass}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="legend">
        {CATEGORY_LABELS.map(([g, label]) => (
          <button
            type="button"
            key={g}
            className={`legend-item ${selectedCategory === g ? 'active' : ''}`}
            onClick={() => setSelectedCategory(selectedCategory === g ? "all" : g)}
          >
            <span className={`legend-swatch group-${g}`} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
};
