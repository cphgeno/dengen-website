import React, { useCallback, useLayoutEffect, useState } from 'react';
import * as d3 from 'd3';
import { COLORS, fmtCompact, fmtNum, isNum } from './statsConfig';

// React renders every SVG element; d3 only supplies scales, ticks, shapes and colours.

const FONT_SIZE = 11;

// ── Layout helpers ─────────────────────────────────────────────────
// Callback ref, so re-measuring follows the element even when the chart swaps
// between its empty state and the real frame.
export function useContainerWidth(min = 260) {
  const [node, setNode] = useState(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    if (!node) return undefined;
    const measure = w => setWidth(Math.max(min, Math.floor(w)));
    measure(node.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    ro.observe(node);
    return () => ro.disconnect();
  }, [node, min]);
  return [setNode, width];
}

export function useTooltip() {
  const [tip, setTip] = useState(null);
  const show = useCallback((e, content) => {
    const svg = e.currentTarget.ownerSVGElement || e.currentTarget;
    const r = svg.getBoundingClientRect();
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top, content });
  }, []);
  const hide = useCallback(() => setTip(null), []);
  return [tip, show, hide];
}

export const logTicks = ([a, b]) => {
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const out = [];
  for (let e = Math.ceil(Math.log10(lo)); e <= Math.floor(Math.log10(hi)); e++) out.push(10 ** e);
  return out.length ? out : [lo, hi];
};

// ── Tooltip ────────────────────────────────────────────────────────
// content: { title, rows: [[label, value, colour?], ...], foot }
export const Tooltip = ({ tip, width }) => {
  if (!tip?.content) return null;
  const { title, rows = [], foot } = tip.content;
  const W = 230;
  const left = tip.x + 14 + W > width ? Math.max(0, tip.x - W - 10) : tip.x + 14;
  return (
    <div role="status" style={{
      position: 'absolute', left, top: Math.max(0, tip.y - 12), width: 'max-content', maxWidth: W,
      pointerEvents: 'none', zIndex: 5,
      background: '#fff', border: '0.5px solid var(--dg-border)', borderRadius: '6px',
      boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)', padding: '7px 10px',
      fontSize: '12px', color: 'var(--dg-text)', lineHeight: 1.55,
    }}>
      {title && <div style={{ fontWeight: 500, marginBottom: rows.length ? '3px' : 0 }}>{title}</div>}
      {rows.map(([label, value, colour], i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '14px' }}>
          <span style={{ color: 'var(--dg-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {colour && <span style={{ width: 8, height: 8, borderRadius: 2, background: colour, display: 'inline-block' }} />}
            {label}
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        </div>
      ))}
      {foot && <div style={{ color: 'var(--dg-text-muted)', marginTop: '3px', fontSize: '11px' }}>{foot}</div>}
    </div>
  );
};

// ── Frame: measured wrapper + svg + tooltip ────────────────────────
const Frame = ({ frameRef, width, height, ariaLabel, tip, children }) => (
  <div ref={frameRef} style={{ position: 'relative', width: '100%', minHeight: height }}>
    {width > 0 && (
      <svg width={width} height={height} role="img" aria-label={ariaLabel}
        style={{ display: 'block', overflow: 'visible', fontFamily: 'var(--dg-font, system-ui, sans-serif)' }}>
        {children}
      </svg>
    )}
    <Tooltip tip={tip} width={width} />
  </div>
);

export const EmptyChart = ({ height = 200, message = 'No data for this selection.' }) => (
  <div style={{
    height, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '0.5px dashed var(--dg-border)', borderRadius: '8px',
    fontSize: '13px', color: 'var(--dg-text-muted)', background: 'rgba(255,255,255,0.6)',
  }}>
    {message}
  </div>
);

// ── Axes, grid, legend, title (all plain SVG) ──────────────────────
export const Axis = ({ orient = 'bottom', scale, x = 0, y = 0, tickValues, ticks = 5, format = fmtCompact, label, labelOffset, rotate = false }) => {
  const band = typeof scale.bandwidth === 'function';
  let values = tickValues || (band ? scale.domain() : scale.ticks(ticks));
  const pos = v => (band ? scale(v) + scale.bandwidth() / 2 : scale(v));
  const [r0, r1] = d3.extent(scale.range());

  // Thin out horizontal labels that would collide (narrow screens, many categories)
  if (orient === 'bottom' && !rotate && values.length > 1) {
    const w = v => String(format(v)).length * 6.4 + 8;
    const ps = values.map(pos);
    const uniform = band && !tickValues;
    const spacing = (r1 - r0) / values.length;
    const k = Math.ceil(d3.max(values, w) / Math.max(1, spacing));
    if (uniform) {
      if (k > 1) values = values.filter((_, i) => i % k === 0);
    } else {
      // Greedy: keep a tick only if it clears the previous kept label
      let last = -Infinity, lastW = 0;
      values = values.filter((v, i) => {
        const p = ps[i];
        if (!isNum(p)) return false;
        if (Math.abs(p - last) < (lastW + w(v)) / 2) return false;
        last = p; lastW = w(v);
        return true;
      });
    }
  }

  if (orient === 'bottom') {
    return (
      <g transform={`translate(${x},${y})`} fontSize={FONT_SIZE} fill={COLORS.muted}>
        <line x1={r0} x2={r1} stroke={COLORS.axis} strokeWidth={0.75} />
        {values.map((v, i) => {
          const p = pos(v);
          if (!isNum(p)) return null;
          return (
            <g key={i} transform={`translate(${p},0)`}>
              <line y2={4} stroke={COLORS.axis} strokeWidth={0.75} />
              {rotate
                ? <text transform="translate(0,8) rotate(-40)" textAnchor="end" dy="0.35em">{format(v)}</text>
                : <text y={15} textAnchor="middle">{format(v)}</text>}
            </g>
          );
        })}
        {label && (
          <text x={(r0 + r1) / 2} y={labelOffset ?? (rotate ? 50 : 34)} textAnchor="middle" fill={COLORS.text}>{label}</text>
        )}
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y})`} fontSize={FONT_SIZE} fill={COLORS.muted}>
      <line y1={r0} y2={r1} stroke={COLORS.axis} strokeWidth={0.75} />
      {values.map((v, i) => {
        const p = pos(v);
        if (!isNum(p)) return null;
        return (
          <g key={i} transform={`translate(0,${p})`}>
            <line x2={-4} stroke={COLORS.axis} strokeWidth={0.75} />
            <text x={-7} dy="0.32em" textAnchor="end">{format(v)}</text>
          </g>
        );
      })}
      {label && (
        <text transform="rotate(-90)" x={-(r0 + r1) / 2} y={labelOffset ?? -46} textAnchor="middle" fill={COLORS.text}>{label}</text>
      )}
    </g>
  );
};

const GridY = ({ scale, values, width }) => (
  <g>
    {values.map((v, i) => {
      const p = scale(v);
      return isNum(p) ? <line key={i} x1={0} x2={width} y1={p} y2={p} stroke={COLORS.grid} strokeWidth={0.75} /> : null;
    })}
  </g>
);

const SvgLegend = ({ items, x = 0, y = 0 }) => {
  let cx = 0;
  return (
    <g transform={`translate(${x},${y})`} fontSize={FONT_SIZE} fill={COLORS.text}>
      {items.map(it => {
        const g = (
          <g key={it.label} transform={`translate(${cx},0)`}>
            <rect y={-8} width={10} height={10} rx={2} fill={it.color} stroke={it.stroke || 'none'} strokeWidth={0.5} />
            <text x={15} dy="0">{it.label}</text>
          </g>
        );
        cx += 26 + it.label.length * 7.2;
        return g;
      })}
    </g>
  );
};

const header = (title, legend) => {
  let top = 10;
  const titleY = title ? 14 : 0;
  if (title) top += 20;
  const legendY = legend ? top + 4 : 0;
  if (legend) top += 20;
  return { top, titleY, legendY };
};

// Long titles are shortened to the chart width; the full text stays in a <title> tooltip.
const SvgTitle = ({ title, y, maxW }) => {
  const max = maxW ? Math.max(8, Math.floor((maxW - 4) / 6.8)) : Infinity;
  const text = title.length > max ? `${title.slice(0, max - 1).trimEnd()}…` : title;
  return (
    <text x={2} y={y} fontSize={12} fontWeight={500} fill={COLORS.text}>
      <title>{title}</title>{text}
    </text>
  );
};

// ── Histogram ──────────────────────────────────────────────────────
// bins: [{ x0, x1, values: { key: number }, ...extra }]
// series: [{ key, label, color, stroke }]
export function Histogram({
  bins, series, mode = 'stack', xType = 'linear', yLog = false, height = 260,
  xDomain, xTickValues, xTicks = 6, xFormat = fmtCompact, yFormat = fmtCompact,
  xLabel, yLabel, vlines = [], title, ariaLabel, tooltip, legend,
}) {
  const [ref, width] = useContainerWidth();
  const [tip, showTip, hideTip] = useTooltip();
  const showLegend = legend ?? series.length > 1;

  const valid = (bins || []).filter(b => isNum(b.x0) && isNum(b.x1) && b.x1 > b.x0 && (xType !== 'log' || b.x1 > 0));
  if (!valid.length) return <div ref={ref}><EmptyChart height={height} /></div>;

  const h = header(title, showLegend);
  const m = { top: h.top, right: 16, bottom: xLabel ? 46 : 28, left: 58 };
  const iw = Math.max(20, width - m.left - m.right);
  const ih = Math.max(40, height - m.top - m.bottom);

  let lo = xDomain?.[0] ?? d3.min(valid, b => b.x0);
  const hi = xDomain?.[1] ?? d3.max(valid, b => b.x1);
  if (xType === 'log' && !(lo > 0)) lo = d3.min(valid, b => (b.x0 > 0 ? b.x0 : b.x1 / 2));
  // symlog: the constant sets where the axis turns from linear to logarithmic;
  // the narrowest bin keeps the low end readable instead of stretching [0, 1].
  const symConst = xType === 'symlog' ? Math.max(1, d3.min(valid, b => b.x1 - b.x0) || 1) : 1;
  const x = (xType === 'log' ? d3.scaleLog() : xType === 'symlog' ? d3.scaleSymlog().constant(symConst) : d3.scaleLinear())
    .domain([lo, hi]).range([0, iw]);
  const symTicks = () => {
    const out = lo <= 0 ? [0] : [];
    const start = Math.max(symConst, lo > 0 ? lo : symConst);
    for (let e = Math.floor(Math.log10(start)); e <= Math.ceil(Math.log10(hi)); e++) {
      [1, 2, 5].forEach(k => { const v = k * 10 ** e; if (v >= start && v <= hi) out.push(v); });
    }
    return out;
  };
  const clampX = v => Math.max(Math.min(lo, hi), Math.min(Math.max(lo, hi), v));

  const val = (b, k) => (isNum(b.values[k]) ? b.values[k] : 0);
  const tops = valid.map(b => (mode === 'stack' ? d3.sum(series, s => val(b, s.key)) : d3.max(series, s => val(b, s.key))));
  const ymax = d3.max(tops) || 1;

  let y;
  if (yLog) {
    const positives = valid.flatMap(b => series.map(s => val(b, s.key))).filter(v => v > 0);
    const ymin = d3.min(positives) || 1;
    y = d3.scaleLog().domain([Math.max(ymin / 2, 1e-12), ymax * 1.4]).range([ih, 0]).clamp(true);
  } else {
    y = d3.scaleLinear().domain([0, ymax]).nice().range([ih, 0]);
  }
  const floor = yLog ? y.domain()[0] : 0;
  const yTicks = yLog ? logTicks(y.domain()) : y.ticks(5);
  const xt = xTickValues
    ? xTickValues.filter(v => v >= Math.min(lo, hi) && v <= Math.max(lo, hi))
    : xType === 'log' ? logTicks([lo, hi]) : xType === 'symlog' ? symTicks() : x.ticks(xTicks);

  const defaultTip = b => ({
    title: `${xFormat(b.x0)} – ${xFormat(b.x1)}`,
    rows: series.map(s => [s.label, fmtNum(b.values[s.key]), s.color]),
  });

  return (
    <Frame frameRef={ref} width={width} height={height} ariaLabel={ariaLabel || title} tip={tip}>
      {title && <SvgTitle title={title} y={h.titleY} maxW={width} />}
      {showLegend && <SvgLegend items={series} x={m.left} y={h.legendY} />}
      <g transform={`translate(${m.left},${m.top})`}>
        <GridY scale={y} values={yTicks} width={iw} />
        {valid.map((b, i) => {
          const X0 = x(clampX(b.x0)), X1 = x(clampX(b.x1));
          const w = Math.max(0.6, X1 - X0 - (X1 - X0 > 3 ? 0.75 : 0));
          let cum = 0;
          return (
            <g key={i}>
              {series.map(s => {
                const v = val(b, s.key);
                if (v <= 0) return null;
                let y0, y1;
                if (mode === 'stack') { y0 = cum; y1 = cum + v; cum = y1; } else { y0 = 0; y1 = v; }
                const py1 = y(y1), py0 = y(Math.max(y0, floor));
                return (
                  <rect key={s.key} x={X0} y={py1} width={w} height={Math.max(0, py0 - py1)}
                    fill={s.color} fillOpacity={mode === 'overlay' ? 0.6 : 0.9}
                    stroke={s.stroke || 'none'} strokeWidth={0.5} />
                );
              })}
            </g>
          );
        })}
        {vlines.filter(v => isNum(v.x) && v.x >= Math.min(lo, hi) && v.x <= Math.max(lo, hi)).map((v, i) => (
          <g key={`v${i}`} pointerEvents="none">
            <line x1={x(v.x)} x2={x(v.x)} y1={0} y2={ih} stroke={v.color || COLORS.text} strokeWidth={1} strokeDasharray="4 3" />
            {v.label && <text x={x(v.x) + 4} y={10} fontSize={10} fill={v.color || COLORS.text}>{v.label}</text>}
          </g>
        ))}
        {valid.map((b, i) => {
          const X0 = x(clampX(b.x0)), X1 = x(clampX(b.x1));
          return (
            <rect key={`h${i}`} data-export-ignore="" x={X0} y={0} width={Math.max(1, X1 - X0)} height={ih} fill="transparent"
              onMouseMove={e => showTip(e, tooltip ? tooltip(b) : defaultTip(b))} onMouseLeave={hideTip} />
          );
        })}
        <Axis orient="left" scale={y} tickValues={yTicks} format={yFormat} label={yLabel} />
        <Axis orient="bottom" scale={x} y={ih} tickValues={xt} format={xFormat} label={xLabel} />
      </g>
    </Frame>
  );
}

// ── BarChart (categorical x, optional grouped series) ──────────────
// data: [{ cat, values: { key: number }, ...extra }]
export function BarChart({
  data, series, height = 260, yLog = false, yDomain, yFormat = fmtCompact, xFormat = d => d,
  xLabel, yLabel, tickFilter, colorFn, tooltip, ariaLabel, title, legend, legendItems,
  rotate = false, padding = 0.2, valueLabels,
}) {
  const [ref, width] = useContainerWidth();
  const [tip, showTip, hideTip] = useTooltip();
  const items = legendItems || series;
  const showLegend = legend ?? items.length > 1;

  const vals = (data || []).flatMap(d => series.map(s => d.values[s.key])).filter(v => isNum(v) && (!yLog || v > 0));
  if (!data?.length || !vals.length) return <div ref={ref}><EmptyChart height={height} /></div>;

  const h = header(title, showLegend);
  const m = { top: h.top + (valueLabels ? 12 : 0), right: 14, bottom: (rotate ? 56 : 28) + (xLabel ? 18 : 0), left: 58 };
  const iw = Math.max(20, width - m.left - m.right);
  const ih = Math.max(40, height - m.top - m.bottom);

  const cats = data.map(d => d.cat);
  const x = d3.scaleBand().domain(cats).range([0, iw]).padding(padding);
  const xi = d3.scaleBand().domain(series.map(s => s.key)).range([0, x.bandwidth()]).padding(series.length > 1 ? 0.08 : 0);

  let y;
  if (yLog) {
    y = d3.scaleLog().domain(yDomain || [Math.max(d3.min(vals) / 2, 1e-12), d3.max(vals) * 1.4]).range([ih, 0]).clamp(true);
  } else {
    y = d3.scaleLinear().domain(yDomain || [0, d3.max(vals)]).nice().range([ih, 0]);
  }
  const floor = yLog ? y.domain()[0] : Math.max(0, y.domain()[0]);
  const yTicks = yLog ? logTicks(y.domain()) : y.ticks(5);
  const xTickValues = tickFilter ? cats.filter(tickFilter) : cats;

  const defaultTip = d => ({ title: String(xFormat(d.cat)), rows: series.map(s => [s.label, fmtNum(d.values[s.key]), s.color]) });

  return (
    <Frame frameRef={ref} width={width} height={height} ariaLabel={ariaLabel || title} tip={tip}>
      {title && <SvgTitle title={title} y={h.titleY} maxW={width} />}
      {showLegend && <SvgLegend items={items} x={m.left} y={h.legendY} />}
      <g transform={`translate(${m.left},${m.top})`}>
        <GridY scale={y} values={yTicks} width={iw} />
        {data.map(d => (
          <g key={d.cat} transform={`translate(${x(d.cat)},0)`}>
            {series.map(s => {
              const v = d.values[s.key];
              if (!isNum(v) || (yLog && v <= 0)) return null;
              const top = y(v), bottom = y(floor);
              const fill = colorFn ? colorFn(d, s) : s.color;
              return (
                <g key={s.key}>
                  <rect x={xi(s.key)} y={top} width={xi.bandwidth()} height={Math.max(0, bottom - top)} rx={1.5}
                    fill={fill} fillOpacity={0.9} stroke={s.stroke || 'none'} strokeWidth={0.5} />
                  {valueLabels && (
                    <text x={xi(s.key) + xi.bandwidth() / 2} y={top - 4} textAnchor="middle" fontSize={10} fill={COLORS.text}>
                      {valueLabels(v)}
                    </text>
                  )}
                </g>
              );
            })}
            <rect data-export-ignore="" x={-x.step() * padding / 2} y={0} width={x.step()} height={ih} fill="transparent"
              onMouseMove={e => showTip(e, tooltip ? tooltip(d) : defaultTip(d))} onMouseLeave={hideTip} />
          </g>
        ))}
        <Axis orient="left" scale={y} tickValues={yTicks} format={yFormat} label={yLabel} />
        <Axis orient="bottom" scale={x} y={ih} tickValues={xTickValues} format={xFormat} label={xLabel} rotate={rotate} />
      </g>
    </Frame>
  );
}

// ── StackedBar (vertical stacked, or horizontal 100% stacked) ───────
export function StackedBar({
  data, series, horizontal = false, normalize = false, height, labelMin = 0.04,
  yFormat = fmtCompact, xFormat = d => d, xLabel, yLabel, tooltip, ariaLabel, title, legend, rotate = false,
}) {
  const [ref, width] = useContainerWidth();
  const [tip, showTip, hideTip] = useTooltip();
  const showLegend = legend ?? series.length > 1;
  const H = height || (horizontal ? 60 + 44 * (data?.length || 1) : 280);

  const totals = (data || []).map(d => d3.sum(series, s => (isNum(d.values[s.key]) ? d.values[s.key] : 0)));
  if (!data?.length || !(d3.max(totals) > 0)) return <div ref={ref}><EmptyChart height={H} /></div>;

  const h = header(title, showLegend);
  const legendRows = horizontal && showLegend ? Math.ceil((series.reduce((a, s) => a + 26 + s.label.length * 7.2, 0)) / Math.max(200, width - 80)) : 1;
  const top = h.top + (legendRows - 1) * 18;
  const cats = data.map(d => d.cat);

  const defaultTip = (d, i) => ({
    title: String(xFormat(d.cat)),
    rows: series.map(s => {
      const v = d.values[s.key];
      const share = totals[i] ? (isNum(v) ? v : 0) / totals[i] : null;
      return [s.label, `${fmtNum(v)}${share !== null ? ` (${(share * 100).toFixed(1)}%)` : ''}`, s.color];
    }),
    foot: `Total ${fmtNum(totals[i])}`,
  });

  // Legend that wraps (horizontal charts often have many classes)
  const WrappedLegend = ({ x0, y0, maxW }) => {
    let cx = 0, cy = 0;
    return (
      <g transform={`translate(${x0},${y0})`} fontSize={FONT_SIZE} fill={COLORS.text}>
        {series.map(s => {
          const w = 26 + s.label.length * 7.2;
          if (cx + w > maxW && cx > 0) { cx = 0; cy += 18; }
          const g = (
            <g key={s.key} transform={`translate(${cx},${cy})`}>
              <rect y={-8} width={10} height={10} rx={2} fill={s.color} />
              <text x={15}>{s.label}</text>
            </g>
          );
          cx += w;
          return g;
        })}
      </g>
    );
  };

  if (horizontal) {
    const m = { top, right: 16, bottom: 26, left: 64 };
    const iw = Math.max(20, width - m.left - m.right);
    const ih = Math.max(30, H - m.top - m.bottom);
    const yb = d3.scaleBand().domain(cats).range([0, ih]).padding(0.28);
    const xs = d3.scaleLinear().domain([0, normalize ? 1 : d3.max(totals)]).range([0, iw]);
    return (
      <Frame frameRef={ref} width={width} height={H} ariaLabel={ariaLabel || title} tip={tip}>
        {title && <SvgTitle title={title} y={h.titleY} maxW={width} />}
        {showLegend && <WrappedLegend x0={m.left} y0={h.legendY} maxW={iw} />}
        <g transform={`translate(${m.left},${m.top})`}>
          {data.map((d, i) => {
            let cum = 0;
            const tot = totals[i] || 1;
            return (
              <g key={d.cat} transform={`translate(0,${yb(d.cat)})`}>
                {series.map(s => {
                  const raw = isNum(d.values[s.key]) ? d.values[s.key] : 0;
                  const v = normalize ? raw / tot : raw;
                  const x0 = xs(cum); cum += v; const x1 = xs(cum);
                  if (x1 - x0 <= 0) return null;
                  const share = raw / tot;
                  const light = d3.hsl(s.color).l > 0.6;
                  return (
                    <g key={s.key}>
                      <rect x={x0} y={0} width={x1 - x0} height={yb.bandwidth()} fill={s.color} stroke="#fff" strokeWidth={0.75} />
                      {share >= labelMin && x1 - x0 > 30 && (
                        <text x={(x0 + x1) / 2} y={yb.bandwidth() / 2} dy="0.35em" textAnchor="middle" fontSize={10.5}
                          fill={light ? COLORS.text : '#fff'}>
                          {(share * 100).toFixed(share < 0.1 ? 1 : 0)}%
                        </text>
                      )}
                    </g>
                  );
                })}
                <rect data-export-ignore="" x={0} y={0} width={iw} height={yb.bandwidth()} fill="transparent"
                  onMouseMove={e => showTip(e, tooltip ? tooltip(d, i) : defaultTip(d, i))} onMouseLeave={hideTip} />
              </g>
            );
          })}
          <Axis orient="left" scale={yb} format={xFormat} />
          <Axis orient="bottom" scale={xs} y={ih} ticks={5} format={normalize ? v => `${Math.round(v * 100)}%` : fmtCompact} />
        </g>
      </Frame>
    );
  }

  const m = { top, right: 14, bottom: (rotate ? 56 : 28) + (xLabel ? 18 : 0), left: 58 };
  const iw = Math.max(20, width - m.left - m.right);
  const ih = Math.max(40, H - m.top - m.bottom);
  const x = d3.scaleBand().domain(cats).range([0, iw]).padding(0.2);
  const y = d3.scaleLinear().domain([0, normalize ? 1 : d3.max(totals)]).nice().range([ih, 0]);
  const yTicks = y.ticks(5);

  return (
    <Frame frameRef={ref} width={width} height={H} ariaLabel={ariaLabel || title} tip={tip}>
      {title && <SvgTitle title={title} y={h.titleY} maxW={width} />}
      {showLegend && <SvgLegend items={series} x={m.left} y={h.legendY} />}
      <g transform={`translate(${m.left},${m.top})`}>
        <GridY scale={y} values={yTicks} width={iw} />
        {data.map((d, i) => {
          let cum = 0;
          const tot = totals[i] || 1;
          return (
            <g key={d.cat} transform={`translate(${x(d.cat)},0)`}>
              {series.map(s => {
                const raw = isNum(d.values[s.key]) ? d.values[s.key] : 0;
                const v = normalize ? raw / tot : raw;
                const y0 = y(cum); cum += v; const y1 = y(cum);
                return v > 0 ? <rect key={s.key} x={0} y={y1} width={x.bandwidth()} height={Math.max(0, y0 - y1)} fill={s.color} fillOpacity={0.9} stroke="#fff" strokeWidth={0.5} /> : null;
              })}
              <rect data-export-ignore="" x={-x.step() * 0.1} y={0} width={x.step()} height={ih} fill="transparent"
                onMouseMove={e => showTip(e, tooltip ? tooltip(d, i) : defaultTip(d, i))} onMouseLeave={hideTip} />
            </g>
          );
        })}
        <Axis orient="left" scale={y} tickValues={yTicks} format={normalize ? v => `${Math.round(v * 100)}%` : yFormat} label={yLabel} />
        <Axis orient="bottom" scale={x} y={ih} format={xFormat} label={xLabel} rotate={rotate} />
      </g>
    </Frame>
  );
}

// ── LineChart ──────────────────────────────────────────────────────
// series: [{ key, label, color, points: [{ x, y }] }]
export function LineChart({
  series, height = 240, xType = 'linear', xDomain, yDomain, xTickValues, xTicks = 6,
  xFormat = fmtCompact, yFormat = fmtCompact, xLabel, yLabel, tooltip, ariaLabel, title, legend,
}) {
  const [ref, width] = useContainerWidth();
  const [tip, showTip, hideTip] = useTooltip();
  const showLegend = legend ?? series.length > 1;

  const clean = series.map(s => ({
    ...s,
    points: (s.points || []).filter(p => isNum(p.x) && isNum(p.y) && (xType !== 'log' || p.x > 0)).sort((a, b) => a.x - b.x),
  })).filter(s => s.points.length);
  if (!clean.length) return <div ref={ref}><EmptyChart height={height} /></div>;

  const h = header(title, showLegend);
  const m = { top: h.top, right: 18, bottom: xLabel ? 46 : 28, left: 58 };
  const iw = Math.max(20, width - m.left - m.right);
  const ih = Math.max(40, height - m.top - m.bottom);

  const all = clean.flatMap(s => s.points);
  const x = (xType === 'log' ? d3.scaleLog() : d3.scaleLinear()).domain(xDomain || d3.extent(all, p => p.x)).range([0, iw]);
  const y = d3.scaleLinear().domain(yDomain || [0, d3.max(all, p => p.y)]).nice().range([ih, 0]);
  const yTicks = y.ticks(5);
  const xt = xTickValues || (xType === 'log' ? logTicks(x.domain()) : x.ticks(xTicks));
  const line = d3.line().x(p => x(p.x)).y(p => y(p.y));
  const bis = d3.bisector(p => p.x);

  const onMove = e => {
    const svg = e.currentTarget.ownerSVGElement;
    const mx = e.clientX - svg.getBoundingClientRect().left - m.left;
    const xv = x.invert(mx);
    const nearest = clean.map(s => {
      const i = Math.min(s.points.length - 1, Math.max(0, bis.center(s.points, xv)));
      return { s, p: s.points[i] };
    });
    const content = tooltip
      ? tooltip(xv, nearest)
      : { title: xFormat(nearest[0].p.x), rows: nearest.map(({ s, p }) => [s.label, fmtNum(p.y), s.color]) };
    showTip(e, { ...content, guide: mx });
  };

  return (
    <Frame frameRef={ref} width={width} height={height} ariaLabel={ariaLabel || title} tip={tip}>
      {title && <SvgTitle title={title} y={h.titleY} maxW={width} />}
      {showLegend && <SvgLegend items={clean} x={m.left} y={h.legendY} />}
      <g transform={`translate(${m.left},${m.top})`}>
        <GridY scale={y} values={yTicks} width={iw} />
        {clean.map(s => (
          <path key={s.key} d={line(s.points)} fill="none" stroke={s.stroke || s.color} strokeWidth={1.75} strokeLinejoin="round" />
        ))}
        {tip?.content?.guide !== undefined && (
          <line data-export-ignore="" x1={tip.content.guide} x2={tip.content.guide} y1={0} y2={ih} stroke={COLORS.axis} strokeDasharray="3 3" pointerEvents="none" />
        )}
        <rect data-export-ignore="" x={0} y={0} width={iw} height={ih} fill="transparent" onMouseMove={onMove} onMouseLeave={hideTip} />
        <Axis orient="left" scale={y} tickValues={yTicks} format={yFormat} label={yLabel} />
        <Axis orient="bottom" scale={x} y={ih} tickValues={xt} format={xFormat} label={xLabel} />
      </g>
    </Frame>
  );
}
