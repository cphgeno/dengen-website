import * as d3 from 'd3';

// ── Data location (single constant; move the folder and change only this) ──
export const STATS_BASE_URL = `${process.env.PUBLIC_URL || ''}/data/stats`;

// ── Colours ────────────────────────────────────────────────────────
// Chart colours are literal (not CSS vars) so exported SVG/PNG files keep them.
export const COLORS = {
  snv:        '#87ceeb',   // skyblue
  snvStroke:  '#5fb4d9',
  indel:      '#ff8c00',   // darkorange
  indelStroke:'#d97700',
  deletion:   '#ff8c00',
  insertion:  '#fdba74',
  scopeAll:   '#87ceeb',
  scopeSingle:'#2b7fb0',
  neutral:    '#a5b4fc',
  axis:       '#cbd5e1',
  grid:       '#eef2f7',
  text:       '#334155',
  muted:      '#64748b',
};

export const CARD_BG     = 'rgba(240, 249, 255, 0.6)';   // sky-50 / 60
export const CARD_BORDER = '0.5px solid var(--dg-border)';

// Colour-blind-safe sequential scale (YlGnBu), trimmed at the pale end.
export const sequentialColors = n => {
  if (n <= 1) return [d3.interpolateYlGnBu(0.55)];
  return d3.range(n).map(i => d3.interpolateYlGnBu(0.18 + 0.72 * (i / (n - 1))));
};

// ── Contigs ────────────────────────────────────────────────────────
export const CONTIGS = [...d3.range(1, 23).map(i => `chr${i}`), 'chrX', 'chrY'];
export const ROLLUPS = ['autosomes', 'all'];
export const DEFAULT_CONTIG = 'autosomes';
export const contigRank = c => {
  const i = CONTIGS.indexOf(c);
  if (i >= 0) return i;
  const j = ROLLUPS.indexOf(c);
  return j >= 0 ? 100 + j : 200;
};
export const byContig = (a, b) => contigRank(a.contig) - contigRank(b.contig);
export const isSexContig  = c => c === 'chrX' || c === 'chrY';
export const includesSex  = sel => sel === 'all' || isSexContig(sel);
export const contigLabel  = c => c === 'autosomes' ? 'Autosomes (chr1–22)' : c === 'all' ? 'All contigs' : c;
export const contigShort  = c => String(c).replace(/^chr/, '');

// ── Frequency classes ──────────────────────────────────────────────
export const MAF_CLASSES = ['singleton', 'doubleton', 'rare', 'low_frequency', 'common', 'very_common'];
export const CLASS_LABELS = {
  all: 'All', singleton: 'Singleton', doubleton: 'Doubleton', rare: 'Rare',
  low_frequency: 'Low frequency', common: 'Common', very_common: 'Very common',
  monomorphic_alt: 'Monomorphic ALT',
};
export const classLabel = c => CLASS_LABELS[c] || String(c).replace(/_/g, ' ');

// ── Formatting ─────────────────────────────────────────────────────
const fInt   = d3.format(',');
const fFloat = d3.format(',.4~f');
const fSmall = d3.format('.3~g');
const fSI    = d3.format('.3~s');

export const isNum = v => typeof v === 'number' && Number.isFinite(v);

// Exact numbers with thousands separators (tables, tooltips, cards)
export const fmtNum = v => {
  if (!isNum(v)) return v == null ? '—' : String(v);
  if (Number.isInteger(v)) return fInt(v);
  if (Math.abs(v) < 0.001 && v !== 0) return fSmall(v);
  return fFloat(v);
};

// Summary statistics: integers above 1,000, otherwise 4 significant digits
export const fmtStat = v => {
  if (!isNum(v)) return '—';
  if (Math.abs(v) >= 1000) return fInt(Math.round(v));
  return d3.format(',.4~r')(v);
};

// Compact axis labels: 1.2M, 340k, 2.1B
export const fmtCompact = v => {
  if (!isNum(v)) return '';
  if (Math.abs(v) < 1000) return Math.abs(v) < 1 && v !== 0 ? fSmall(v) : d3.format('~')(+v.toFixed(2));
  return fSI(v).replace('G', 'B');
};

export const fmtPct = (v, digits = 2) => (isNum(v) ? `${d3.format(`,.${digits}~f`)(v)}%` : '—');

// 1e-5 → "0.001%", 0.5 → "50%"
export const fmtFracPct = v => (isNum(v) ? `${+(v * 100).toPrecision(3)}%` : '');

// ── Small helpers ──────────────────────────────────────────────────
export const pick = (row, ...keys) => {
  if (!row) return null;
  for (const k of keys) { const v = row[k]; if (v !== undefined && v !== null) return v; }
  return null;
};
export const num = v => (v === null || v === undefined || v === '' ? null : (Number.isFinite(+v) ? +v : null));
export const hasContigCol = rows => Array.isArray(rows) && rows.some(r => r && Object.prototype.hasOwnProperty.call(r, 'contig'));
export const forContig = (rows, contig) => (hasContigCol(rows) ? rows.filter(r => r.contig === contig) : (rows || []));
