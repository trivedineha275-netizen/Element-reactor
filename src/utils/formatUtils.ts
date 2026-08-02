/**
 * Formats chemical formulas, equations, and scientific text into clean, 
 * standard Unicode representation, stripping raw LaTeX/Markdown tags.
 * Converts formulas like H2O -> H₂O, $h_03$ -> Ho₂O₃, H_2O -> H₂O, etc.
 */
export function formatChemicalText(text: string | null | undefined): string {
  if (!text) return "";

  // 1. Strip wrapping LaTeX dollar signs $...$
  let clean = text.replace(/\$([^\$]+)\$/g, "$1");

  // 2. Convert HTML subscript/superscript tags like <sub>2</sub>
  clean = clean.replace(/<sub>(\d+)<\/sub>/gi, (_, num) => toSubscript(num));
  clean = clean.replace(/<sup>(\d+)<\/sup>/gi, (_, num) => toSuperscript(num));

  // 3. Convert underscores/carets like H_2 or _3
  clean = clean.replace(/_(\d+)/g, (_, num) => toSubscript(num));
  clean = clean.replace(/\^_?(\d+)/g, (_, num) => toSuperscript(num));

  // 4. Convert raw LaTeX ho_3 or h_03 or Ho_2O_3
  clean = clean.replace(/([A-Z][a-z]?|\))_(\d+)/gi, (match, sym, num) => {
    return normalizeSymbol(sym) + toSubscript(num);
  });

  // 5. Convert chemical formulas with plain numbers following element symbols, e.g. H2O -> H₂O, CO2 -> CO₂
  // Matches element symbols (e.g. H, He, Ho, Fe, O, Cl, etc.) or closing parens followed by numbers
  clean = clean.replace(/([A-Z][a-z]?|\))(\d+)/g, (match, sym, num) => {
    return sym + toSubscript(num);
  });

  // 6. Replace arrow representations
  clean = clean.replace(/->|\\rightarrow/g, "→");

  return clean;
}

function normalizeSymbol(sym: string): string {
  if (!sym) return "";
  if (sym.length === 1) return sym.toUpperCase();
  return sym.charAt(0).toUpperCase() + sym.slice(1).toLowerCase();
}

function toSubscript(numStr: string): string {
  const map: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };
  return numStr.split('').map(char => map[char] || char).join('');
}

function toSuperscript(numStr: string): string {
  const map: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
  };
  return numStr.split('').map(char => map[char] || char).join('');
}
