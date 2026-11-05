import React, { useRef, useState } from 'react';
import { CARD_BG, CARD_BORDER } from './statsConfig';
import { DataTable, Note, Pill, Skeleton, ToggleGroup } from './ui';
import { downloadCSV, downloadJSON, downloadPNG, downloadSVG } from './downloads';

const asList = v => (Array.isArray(v) ? v : v ? [v] : []);

const sourceText = s => (typeof s === 'string' ? s : s?.label || s?.name || null);
const sourceUrl  = s => (s && typeof s === 'object' ? s.url || s.href || null : null);

const columnsList = cols => {
  if (!cols) return [];
  if (Array.isArray(cols)) return cols.map(c => (typeof c === 'string' ? [c, ''] : [c.name || c.id, c.description || c.meaning || '']));
  return Object.entries(cols).map(([k, v]) => [k, typeof v === 'string' ? v : v?.description || '']);
};

const SmallButton = ({ onClick, children, label }) => (
  <button type="button" onClick={onClick} aria-label={label} style={{
    background: '#fff', border: '0.5px solid var(--dg-border)', borderRadius: '6px',
    padding: '3px 9px', fontSize: '11px', fontFamily: 'var(--dg-font)',
    color: 'var(--dg-text-muted)', cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s',
  }}
    onMouseOver={e => { e.currentTarget.style.color = 'var(--dg-blue)'; e.currentTarget.style.borderColor = 'var(--dg-blue-border)'; }}
    onMouseOut={e => { e.currentTarget.style.color = 'var(--dg-text-muted)'; e.currentTarget.style.borderColor = 'var(--dg-border)'; }}
  >
    {children}
  </button>
);

const MetaHeading = ({ children }) => (
  <div style={{
    fontSize: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--dg-text-muted)', margin: '12px 0 6px',
  }}>
    {children}
  </div>
);

// ── FigureCard ─────────────────────────────────────────────────────
// Title, description, source and "About" texts all come from the manifest entry (meta).
export default function FigureCard({
  id, meta = {}, status = 'ready', error, onRetry,
  controls, badges, note, children, footer,
  tableRows, downloadRows, downloadData, fileSuffix = '', extraMeta,
}) {
  const [view, setView] = useState('chart');
  const chartRef = useRef(null);
  const base = `dengen_${id}${fileSuffix ? `_${fileSuffix}` : ''}`;
  const csvRows = downloadRows || tableRows;
  const jsonData = downloadData || csvRows;
  const notes = asList(meta.notes);
  const caveats = asList(meta.caveats);
  const cols = columnsList(meta.columns);
  const src = sourceText(meta.source);
  const titleId = `fig-${id}-title`;

  return (
    <section id={`fig-${id}`} aria-labelledby={titleId} style={{
      background: CARD_BG, border: CARD_BORDER, borderRadius: '12px',
      padding: '20px 22px', marginBottom: '22px', scrollMarginTop: '120px', minWidth: 0,
    }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px 16px', marginBottom: '6px' }}>
        <div style={{ minWidth: 0, flex: '1 1 260px' }}>
          <h3 id={titleId} style={{ fontSize: '15px', fontWeight: 500, color: 'var(--dg-text)', margin: '0 0 6px', lineHeight: 1.35 }}>
            {meta.title || id}
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {src && (
              sourceUrl(meta.source)
                ? <a href={sourceUrl(meta.source)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}><Pill tone="slate">Source · {src}</Pill></a>
                : <Pill tone="slate">Source · {src}</Pill>
            )}
            {badges}
          </div>
        </div>
        {status === 'ready' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {view === 'chart' && controls}
            {tableRows && (
              <ToggleGroup ariaLabel="Chart or table view" value={view} onChange={setView}
                options={[{ value: 'chart', label: 'Chart' }, { value: 'table', label: 'Table' }]} />
            )}
          </div>
        )}
      </div>

      {meta.description && (
        <p style={{ fontSize: '13px', color: 'var(--dg-text-muted)', lineHeight: 1.7, margin: '8px 0 14px', maxWidth: '760px' }}>
          {meta.description}
        </p>
      )}

      {status === 'ready' && note}

      {/* ── Body ── */}
      {status === 'loading' && <Skeleton />}
      {status === 'error' && (
        <div role="alert" style={{
          border: '0.5px solid #fca5a5', borderRadius: '8px', background: '#fff5f5',
          padding: '14px 16px', fontSize: '13px', color: '#b91c1c',
        }}>
          Could not load this figure: {error}
          {onRetry && (
            <button type="button" onClick={onRetry} style={{
              marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer',
              color: '#b91c1c', textDecoration: 'underline', fontFamily: 'var(--dg-font)', fontSize: '13px',
            }}>
              Retry
            </button>
          )}
        </div>
      )}
      {status === 'ready' && (view === 'table' && tableRows
        ? <DataTable rows={tableRows} caption={`${meta.title || id} — data table`} />
        : <div ref={chartRef}>{children}</div>
      )}
      {status === 'ready' && view === 'chart' && footer}

      {/* ── About + downloads ── */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start',
        gap: '10px', marginTop: '16px', paddingTop: '12px', borderTop: '0.5px solid var(--dg-border)',
      }}>
        <details style={{ flex: '1 1 300px', minWidth: 0 }}>
          <summary style={{ fontSize: '12px', fontWeight: 500, color: 'var(--dg-blue)', cursor: 'pointer' }}>
            About this figure
          </summary>
          <div style={{ fontSize: '12.5px', color: 'var(--dg-text-muted)', lineHeight: 1.65, paddingTop: '4px' }}>
            {extraMeta}
            {notes.length > 0 && (<><MetaHeading>Notes</MetaHeading>{notes.map((n, i) => <p key={i} style={{ margin: '0 0 6px' }}>{n}</p>)}</>)}
            {caveats.length > 0 && (<><MetaHeading>Caveats</MetaHeading>{caveats.map((n, i) => <Note key={i} tone="amber">{n}</Note>)}</>)}
            {cols.length > 0 && (
              <>
                <MetaHeading>Columns</MetaHeading>
                <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '3px 14px', margin: 0 }}>
                  {cols.map(([k, v]) => (
                    <React.Fragment key={k}>
                      <dt style={{ fontFamily: 'ui-monospace, monospace', fontSize: '12px', color: 'var(--dg-text)' }}>{k}</dt>
                      <dd style={{ margin: 0 }}>{v}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </>
            )}
            {meta.file && (<><MetaHeading>File</MetaHeading><code style={{ fontSize: '12px' }}>{meta.file}</code></>)}
          </div>
        </details>

        {status === 'ready' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--dg-text-muted)', marginRight: '2px' }}>Download</span>
            {csvRows && <SmallButton label="Download data as CSV" onClick={() => downloadCSV(csvRows, base)}>CSV</SmallButton>}
            {jsonData && <SmallButton label="Download data as JSON" onClick={() => downloadJSON(jsonData, base)}>JSON</SmallButton>}
            {view === 'chart' && children && (
              <>
                <SmallButton label="Download chart as SVG" onClick={() => downloadSVG(chartRef.current, base)}>SVG</SmallButton>
                <SmallButton label="Download chart as PNG" onClick={() => downloadPNG(chartRef.current, base)}>PNG</SmallButton>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
