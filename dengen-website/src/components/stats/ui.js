import React from 'react';
import { fmtNum } from './statsConfig';

// ── Segmented toggle (keyboard focusable buttons, aria-pressed) ─────
export const ToggleGroup = ({ options, value, onChange, ariaLabel }) => (
  <div role="group" aria-label={ariaLabel} style={{
    display: 'inline-flex', gap: '2px', padding: '2px',
    border: '0.5px solid var(--dg-border)', borderRadius: '99px', background: '#fff',
  }}>
    {options.map(o => {
      const active = o.value === value;
      return (
        <button key={o.value} type="button" aria-pressed={active} onClick={() => onChange(o.value)} style={{
          border: 'none', borderRadius: '99px', padding: '4px 11px',
          fontSize: '12px', fontFamily: 'var(--dg-font)', cursor: 'pointer', whiteSpace: 'nowrap',
          background: active ? 'var(--dg-blue-bg)' : 'transparent',
          color: active ? 'var(--dg-blue)' : 'var(--dg-text-muted)',
          fontWeight: active ? 500 : 400, transition: 'all 0.15s',
        }}>
          {o.label}
        </button>
      );
    })}
  </div>
);

// ── Pills ──────────────────────────────────────────────────────────
const PILL = {
  blue:   { bg: 'var(--dg-blue-bg)', color: 'var(--dg-blue)', border: 'var(--dg-blue-border)' },
  amber:  { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  slate:  { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  violet: { bg: '#faf5ff', color: '#6b21a8', border: '#e9d5ff' },
};

export const Pill = ({ tone = 'blue', title, children }) => {
  const s = PILL[tone] || PILL.blue;
  return (
    <span title={title} style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '11px', fontWeight: 500, lineHeight: 1.4,
      padding: '2px 9px', borderRadius: '99px',
      background: s.bg, color: s.color, border: `0.5px solid ${s.border}`,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
};

export const PrelimBadge = ({ children = 'chrX/chrY preliminary' }) => (
  <Pill tone="amber" title="chrX and chrY were called without ploidy-aware genotyping">⚠ {children}</Pill>
);

// ── Note / callout ─────────────────────────────────────────────────
export const Note = ({ children, tone = 'blue' }) => {
  const s = tone === 'amber'
    ? { bg: '#fffbeb', border: '#fde68a', bar: '#f59e0b' }
    : { bg: 'rgba(255,255,255,0.7)', border: 'var(--dg-blue-border)', bar: 'var(--dg-blue)' };
  return (
    <div style={{
      background: s.bg, border: `0.5px solid ${s.border}`, borderLeft: `2px solid ${s.bar}`,
      borderRadius: '6px', padding: '9px 13px', margin: '0 0 14px',
      fontSize: '13px', color: 'var(--dg-text-muted)', lineHeight: 1.6,
    }}>
      {children}
    </div>
  );
};

// ── Loading skeleton ───────────────────────────────────────────────
export const Skeleton = ({ height = 220 }) => (
  <div aria-busy="true" aria-label="Loading figure" style={{
    height, borderRadius: '8px',
    background: 'linear-gradient(90deg, #eef4fa 25%, #f7fafd 50%, #eef4fa 75%)',
    backgroundSize: '200% 100%', animation: 'dg-shimmer 1.4s ease-in-out infinite',
  }}>
    <style>{`@keyframes dg-shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
  </div>
);

// ── Headline stat cards (mirrors the QC landing stats strip) ────────
export const StatCards = ({ items }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    border: '0.5px solid var(--dg-border)', borderRadius: '10px', overflow: 'hidden',
    marginBottom: '18px', background: 'var(--dg-border)', gap: '0.5px',
  }}>
    {items.map(s => (
      <div key={s.label} style={{ padding: '14px 18px', background: '#fff' }}>
        <div style={{
          fontSize: '11px', color: 'var(--dg-text-muted)', marginBottom: '6px',
          textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500,
        }}>
          {s.label}
        </div>
        <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--dg-text)' }}>{s.value}</div>
      </div>
    ))}
  </div>
);

// ── Data table (thousands separators, sticky header, capped rows) ───
export const DataTable = ({ rows, columns, caption, maxRows = 500, maxHeight = 420 }) => {
  if (!Array.isArray(rows) || !rows.length) {
    return <div style={{ fontSize: '13px', color: 'var(--dg-text-muted)', padding: '16px 0' }}>No rows.</div>;
  }
  const cols = columns || rows.reduce((acc, r) => { Object.keys(r || {}).forEach(k => { if (!acc.includes(k)) acc.push(k); }); return acc; }, []);
  const shown = rows.slice(0, maxRows);
  const cell = v => (typeof v === 'number' ? fmtNum(v) : v === null || v === undefined ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v));

  return (
    <div>
      <div style={{ border: '0.5px solid var(--dg-border)', borderRadius: '8px', overflow: 'auto', maxHeight, background: '#fff' }}>
        <table aria-label={caption} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {cols.map(c => (
                <th key={c} scope="col" style={{
                  position: 'sticky', top: 0, background: 'var(--dg-blue-bg)',
                  padding: '8px 12px', fontSize: '11px', fontWeight: 500, textAlign: 'left',
                  color: 'var(--dg-text-muted)', borderBottom: '0.5px solid var(--dg-border)', whiteSpace: 'nowrap',
                }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i} style={{ background: i % 2 ? '#fafcff' : '#fff' }}>
                {cols.map(c => (
                  <td key={c} style={{
                    padding: '6px 12px', fontSize: '12.5px', color: 'var(--dg-text)',
                    borderBottom: '0.5px solid var(--dg-border)', whiteSpace: 'nowrap',
                    textAlign: typeof r?.[c] === 'number' ? 'right' : 'left',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {cell(r?.[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > maxRows && (
        <div style={{ fontSize: '12px', color: 'var(--dg-text-muted)', marginTop: '6px' }}>
          Showing the first {fmtNum(maxRows)} of {fmtNum(rows.length)} rows. Download the CSV for all rows.
        </div>
      )}
    </div>
  );
};

// ── Small caption line under charts ────────────────────────────────
export const Caption = ({ children }) => (
  <div style={{ fontSize: '12px', color: 'var(--dg-text-muted)', marginTop: '6px', lineHeight: 1.5 }}>{children}</div>
);
