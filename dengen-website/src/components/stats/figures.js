import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import FigureCard from './FigureCard';
import { BarChart, Histogram, LineChart, StackedBar } from './charts';
import { DataTable, Caption, Note, Pill, PrelimBadge, StatCards, ToggleGroup } from './ui';
import { useStatsFiles } from './useStatsData';
import { COPY } from './copy';
import {
  COLORS, CONTIGS, MAF_CLASSES, byContig, classLabel, contigShort, forContig, fmtCompact, fmtFracPct,
  fmtNum, fmtStat, fmtPct, hasContigCol, includesSex, isNum, num, pick, sequentialColors,
} from './statsConfig';

// ── Column accessors ───────────────────────────────────────────────
// Real DenGen schemas first; common variants accepted as fallbacks.
const getLower  = r => num(pick(r, 'maf_lower', 'miss_lower', 'bin_lower', 'lower', 'missing_lower'));
const getUpper  = r => num(pick(r, 'maf_upper', 'miss_upper', 'bin_upper', 'upper', 'missing_upper'));
const getCount  = r => num(pick(r, 'count', 'n', 'n_variants'));
const getClass  = r => pick(r, 'class', 'maf_class', 'af_class', 'frequency_class');
const getMetric = r => pick(r, 'metric', 'key', 'name');
const getType   = r => pick(r, 'type', 'variant_type', 'vtype');

// "snp" / "snv" → snv, "indel" → indel, "all" → all
const typeKey = t => {
  const s = String(t ?? '').toLowerCase();
  if (s.startsWith('snp') || s.startsWith('snv')) return 'snv';
  if (s.startsWith('indel')) return 'indel';
  return s || 'other';
};
const TYPE_LABEL = { snv: 'SNV', indel: 'Indel', all: 'All variants' };

const SNV_SERIES   = { key: 'snv',   label: 'SNV',   color: COLORS.snv,   stroke: COLORS.snvStroke };
const INDEL_SERIES = { key: 'indel', label: 'Indel', color: COLORS.indel, stroke: COLORS.indelStroke };

const NO_ROWS = [];
const prelimFor = (rows, contig) => (hasContigCol(rows) && includesSex(contig) ? <PrelimBadge /> : null);
const noContigBadge = rows => (!hasContigCol(rows) ? <Pill tone="slate" title="This file has no per-contig rows">Not split by contig</Pill> : null);
const sortedByContig = rows => [...(rows || [])].sort(byContig);

// Long format (type, lower, upper, count) → bins with { snv, indel }.
// Wide format (n_snv / n_indel columns) is also accepted.
const toTypedBins = rows => {
  if (!rows?.length) return [];
  const long = rows.some(r => getType(r) !== null && getCount(r) !== null);
  if (!long) {
    return rows.map(r => ({
      x0: getLower(r), x1: getUpper(r),
      values: { snv: num(pick(r, 'n_snv', 'snv', 'snp', 'snps')), indel: num(pick(r, 'n_indel', 'indel', 'indels')) },
    }));
  }
  const map = new Map();
  rows.forEach(r => {
    const k = typeKey(getType(r));
    if (k !== 'snv' && k !== 'indel') return;            // "all" is the sum; skip to avoid double counting
    const x0 = getLower(r), x1 = getUpper(r);
    const id = `${x0}|${x1}`;
    if (!map.has(id)) map.set(id, { x0, x1, values: { snv: 0, indel: 0 } });
    map.get(id).values[k] += getCount(r) || 0;
  });
  return Array.from(map.values()).sort((a, b) => a.x0 - b.x0);
};

// ── 1a. Variant counts ─────────────────────────────────────────────
function VariantCountsFigure({ id, meta, data, contig }) {
  const rows = data[id] || NO_ROWS;
  const [metric, setMetric] = useState('counts');

  const acc = r => {
    const snv = num(pick(r, 'snp', 'snv', 'n_snv', 'snps'));
    const indel = num(pick(r, 'indel', 'n_indel', 'indels'));
    const total = num(pick(r, 'records', 'n_total', 'total', 'n_records')) ?? ((snv ?? 0) + (indel ?? 0));
    // *_pct columns are percentages; *_share / *_fraction are fractions
    let share = num(pick(r, 'singleton_pct', 'pct_singleton'));
    if (share !== null) share /= 100;
    else share = num(pick(r, 'singleton_share', 'singleton_fraction'));
    if (share === null) {
      const s = (num(r.singleton_snp) ?? 0) + (num(r.singleton_indel) ?? 0);
      if (total && (r.singleton_snp != null || r.singleton_indel != null)) share = s / total;
    }
    return { contig: r.contig, snv, indel, total, share, perMb: num(pick(r, 'records_per_mb', 'per_mb')) };
  };

  const sel = rows.find(r => r.contig === contig);
  const head = sel ? acc(sel) : null;
  const perContig = rows.filter(r => CONTIGS.includes(r.contig)).sort(byContig).map(acc);
  const hasPerMb = perContig.some(r => isNum(r.perMb));
  const scopeLabel = contig === 'autosomes' ? 'autosomes' : contig;

  const cards = [
    { label: `SNVs · ${scopeLabel}`,            value: head ? fmtNum(head.snv) : '—' },
    { label: `Indels · ${scopeLabel}`,          value: head ? fmtNum(head.indel) : '—' },
    { label: `Total · ${scopeLabel}`,           value: head ? fmtNum(head.total) : '—' },
    { label: `Singleton share · ${scopeLabel}`, value: head && isNum(head.share) ? fmtPct(head.share * 100, 1) : '—' },
  ];

  const tip = d => ({
    title: d.cat,
    rows: metric === 'counts'
      ? [['SNVs', fmtNum(d.values.snv), COLORS.snv], ['Indels', fmtNum(d.values.indel), COLORS.indel], ['Total', fmtNum(d.total)]]
      : [['Records per Mb', fmtNum(d.values.perMb), COLORS.neutral]],
  });

  return (
    <FigureCard id={id} meta={meta} fileSuffix={contig}
      badges={<>{includesSex(contig) && <PrelimBadge>{contig === 'all' ? 'Includes chrX/chrY' : contig} preliminary</PrelimBadge>}<PrelimBadge>Per-contig chart includes chrX/chrY</PrelimBadge></>}
      controls={hasPerMb && (
        <ToggleGroup ariaLabel="Variant count metric" value={metric} onChange={setMetric}
          options={[{ value: 'counts', label: 'Counts' }, { value: 'per_mb', label: 'Records / Mb' }]} />
      )}
      tableRows={sortedByContig(rows)}
    >
      <StatCards items={cards} />
      {metric === 'counts' ? (
        <StackedBar
          data={perContig.map(r => ({ cat: r.contig, values: { snv: r.snv, indel: r.indel }, total: r.total }))}
          series={[SNV_SERIES, INDEL_SERIES]} xFormat={contigShort} yLabel="Records" tooltip={tip}
          ariaLabel="Stacked bar chart of SNV and indel counts per contig" height={300} />
      ) : (
        <BarChart
          data={perContig.map(r => ({ cat: r.contig, values: { perMb: r.perMb } }))}
          series={[{ key: 'perMb', label: 'Records per Mb', color: COLORS.neutral }]}
          colorFn={d => (d.cat === contig ? '#6366f1' : COLORS.neutral)}
          xFormat={contigShort} yLabel="Records per Mb" tooltip={tip}
          ariaLabel="Bar chart of variant records per megabase per contig" height={300} />
      )}
    </FigureCard>
  );
}

// ── 1b. Substitution spectrum ──────────────────────────────────────
const SIX = ['C>A', 'C>G', 'C>T', 'T>A', 'T>C', 'T>G'];

function SubstitutionFigure({ id, meta, data, manifest, contig }) {
  const has12 = Array.isArray(data.substitution_types);
  const [view, setView] = useState('6');
  const srcId = view === '12' && has12 ? 'substitution_types' : id;
  const rows = forContig(data[srcId], contig);

  const getSub = r => pick(r, 'substitution', 'type', 'class', 'sub', 'mutation');
  const getPct = r => num(pick(r, 'pct_of_scope', 'pct', 'percent'));
  const maxPct = d3.max(rows, getPct) || 0;
  const scalePct = maxPct <= 1.0001 ? 100 : 1;            // fractions → percent

  const present = Array.from(new Set(rows.map(getSub).filter(Boolean)));
  const cats = view === '6'
    ? [...SIX.filter(s => present.includes(s)), ...present.filter(s => !SIX.includes(s)).sort()]
    : present.sort();
  const scopes = Array.from(new Set(rows.map(r => r.scope).filter(Boolean)))
    .sort((a, b) => (a === 'all' ? -1 : b === 'all' ? 1 : a === 'singleton' ? -1 : 1));
  const palette = [COLORS.scopeAll, COLORS.scopeSingle, '#94a3b8', '#c4b5fd'];
  const series = scopes.map((s, i) => ({ key: s, label: COPY.scopeLabels[s] || s, color: palette[i % palette.length] }));

  const chartData = cats.map(cat => {
    const values = {}, counts = {};
    scopes.forEach(s => {
      const r = rows.find(x => getSub(x) === cat && x.scope === s);
      values[s] = r ? getPct(r) * scalePct : null;
      counts[s] = r ? getCount(r) : null;
    });
    return { cat, values, counts };
  });

  const activeMeta = srcId === id ? meta : { ...meta, ...manifest.files[srcId], title: meta.title };

  return (
    <FigureCard id={id} meta={activeMeta} fileSuffix={`${view}class_${contig}`}
      badges={prelimFor(rows, contig)}
      controls={has12 && (
        <ToggleGroup ariaLabel="Number of substitution classes" value={view} onChange={setView}
          options={[{ value: '6', label: '6 classes' }, { value: '12', label: '12 classes' }]} />
      )}
      tableRows={rows}
    >
      <BarChart data={chartData} series={series} yLabel="% of scope" yFormat={v => `${v}%`}
        rotate={view === '12' && cats.length > 8}
        tooltip={d => ({ title: d.cat, rows: series.map(s => [s.label, `${fmtPct(d.values[s.key])} · ${fmtNum(d.counts[s.key])}`, s.color]) })}
        ariaLabel="Grouped bar chart of substitution class shares for all SNVs and singletons" height={280} />
    </FigureCard>
  );
}

// ── 1c. Indel length ───────────────────────────────────────────────
function IndelLengthFigure({ id, meta, data, contig }) {
  const contigRows = forContig(data[id], contig);
  const scopes = Array.from(new Set(contigRows.map(r => r.scope).filter(Boolean)));
  const [scope, setScope] = useState('all');
  const [logY, setLogY] = useState('log');
  const activeScope = scopes.includes(scope) ? scope : scopes[0];
  const rows = scopes.length ? contigRows.filter(r => r.scope === activeScope) : contigRows;

  const byLen = d3.rollup(rows, v => d3.sum(v, getCount), r => num(pick(r, 'length', 'indel_length', 'len', 'size')));
  const lens = Array.from(byLen.keys()).filter(isNum).sort((a, b) => a - b);
  const chartData = lens.map(l => ({ cat: String(l), len: l, values: { count: byLen.get(l) } }));
  const maxAbs = d3.max(lens, l => Math.abs(l)) || 0;
  const label = c => {
    const l = +c;
    if (Math.abs(l) === maxAbs && maxAbs > 50) return l < 0 ? `<−${maxAbs - 1}` : `>${maxAbs - 1}`;
    return l > 0 ? `+${l}` : String(l).replace('-', '−');
  };

  return (
    <FigureCard id={id} meta={meta} fileSuffix={`${activeScope || 'all'}_${contig}`}
      badges={prelimFor(contigRows, contig)}
      controls={<>
        {scopes.length > 1 && (
          <ToggleGroup ariaLabel="Indel scope" value={activeScope} onChange={setScope}
            options={scopes.map(s => ({ value: s, label: s === 'all' ? 'All indels' : COPY.scopeLabels[s] || s }))} />
        )}
        <ToggleGroup ariaLabel="Y axis scale" value={logY} onChange={setLogY}
          options={[{ value: 'log', label: 'Log y' }, { value: 'linear', label: 'Linear y' }]} />
      </>}
      tableRows={rows}
      footer={<Caption>{COPY.indelCap}</Caption>}
    >
      <BarChart data={chartData} series={[{ key: 'count', label: 'Indels', color: COLORS.deletion }]}
        legendItems={[{ label: 'Deletions', color: COLORS.deletion }, { label: 'Insertions', color: COLORS.insertion }]}
        legend colorFn={d => (d.len < 0 ? COLORS.deletion : COLORS.insertion)}
        yLog={logY === 'log'} padding={0.12} xFormat={label} yLabel="Indels" xLabel="Indel length (bp)"
        tickFilter={c => { const l = Math.abs(+c); return l === maxAbs || (l % 10 === 0 && l < maxAbs - 5); }}
        tooltip={d => ({ title: `${d.len < 0 ? 'Deletion' : 'Insertion'} ${label(d.cat)} bp`, rows: [['Indels', fmtNum(d.values.count), d.len < 0 ? COLORS.deletion : COLORS.insertion]] })}
        ariaLabel="Bar chart of indel counts by signed length" height={290} />
    </FigureCard>
  );
}

// ── 2a. MAF spectrum (log x) ───────────────────────────────────────
const MAF_TICKS = [1e-5, 1e-4, 1e-3, 1e-2, 0.1, 0.5];

function MafLogHistFigure({ id, meta, data, contig }) {
  const raw = forContig(data[id], contig);
  const bins = toTypedBins(raw)
    .map(b => ({ ...b, x1: Math.min(b.x1, 0.5) }))
    .filter(b => isNum(b.x0) && isNum(b.x1) && b.x1 > b.x0 && b.x1 > 0);
  const lo = d3.min(bins, b => (b.x0 > 0 ? b.x0 : null));

  return (
    <FigureCard id={id} meta={meta} fileSuffix={contig} badges={prelimFor(data[id], contig) || noContigBadge(data[id])}
      tableRows={raw} footer={<Caption>{COPY.mafCap}</Caption>}>
      <Histogram bins={bins} series={[SNV_SERIES, INDEL_SERIES]} mode="stack" xType="log"
        xDomain={lo ? [Math.min(lo, MAF_TICKS[0]), 0.5] : undefined} xTickValues={MAF_TICKS} xFormat={fmtFracPct}
        xLabel="Minor allele frequency (log scale)" yLabel="Variants"
        tooltip={b => ({ title: `MAF ${fmtFracPct(b.x0)} – ${fmtFracPct(b.x1)}`, rows: [['SNVs', fmtNum(b.values.snv), COLORS.snv], ['Indels', fmtNum(b.values.indel), COLORS.indel]] })}
        ariaLabel="Stacked histogram of SNV and indel counts by minor allele frequency, log x axis" height={300} />
    </FigureCard>
  );
}

// ── 2b. Frequency classes (100% stacked) ───────────────────────────
function MafClassesFigure({ id, meta, data, contig }) {
  const rows = forContig(data[id], contig);
  const typesPresent = Array.from(new Set(rows.map(r => typeKey(getType(r)))));
  const types = [...['snv', 'indel', 'all'].filter(t => typesPresent.includes(t)), ...typesPresent.filter(t => !['snv', 'indel', 'all'].includes(t))];

  const present = Array.from(new Set(rows.map(getClass).filter(Boolean)));
  const monoTotal = d3.sum(rows.filter(r => getClass(r) === 'monomorphic_alt'), getCount);
  const classes = [
    ...MAF_CLASSES.filter(c => present.includes(c)),
    ...(monoTotal > 0 ? ['monomorphic_alt'] : []),
    ...present.filter(c => !MAF_CLASSES.includes(c) && c !== 'monomorphic_alt'),
  ];
  const colors = sequentialColors(classes.length);
  const series = classes.map((c, i) => ({ key: c, label: classLabel(c), color: colors[i] }));
  const chartData = types.map(t => ({
    cat: TYPE_LABEL[t] || t,
    values: Object.fromEntries(classes.map(c => [c, d3.sum(rows.filter(r => typeKey(getType(r)) === t && getClass(r) === c), getCount)])),
  }));

  const defs = meta.class_definitions || COPY.classDefinitions;
  const defList = Array.isArray(defs) ? defs.map(d => [d.class || d.id, d.definition || d.description]) : Object.entries(defs);

  return (
    <FigureCard id={id} meta={meta} fileSuffix={contig} badges={prelimFor(data[id], contig) || noContigBadge(data[id])} tableRows={rows}
      footer={
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: '10px', fontSize: '12px', color: 'var(--dg-text-muted)' }}>
          {defList.filter(([k]) => classes.includes(k)).map(([k, v]) => (
            <span key={k}><strong style={{ fontWeight: 500, color: 'var(--dg-text)' }}>{classLabel(k)}</strong> {v}</span>
          ))}
        </div>
      }>
      <StackedBar data={chartData} series={series} horizontal normalize labelMin={0.04}
        ariaLabel="Horizontal 100% stacked bars of allele frequency classes for SNVs and indels" />
    </FigureCard>
  );
}

// ── 2c. Common variant MAF (linear) ────────────────────────────────
function MafLinearFigure({ id, meta, data, contig }) {
  const raw = forContig(data[id], contig);
  const bins = toTypedBins(raw);
  return (
    <FigureCard id={id} meta={meta} fileSuffix={contig} badges={prelimFor(data[id], contig) || noContigBadge(data[id])} tableRows={raw}>
      <Histogram bins={bins} series={[SNV_SERIES, INDEL_SERIES]} mode="stack"
        xFormat={v => `${+(v * 100).toFixed(1)}%`} xLabel="Minor allele frequency" yLabel="Variants"
        tooltip={b => ({ title: `MAF ${(b.x0 * 100).toFixed(0)}–${(b.x1 * 100).toFixed(0)}%`, rows: [['SNVs', fmtNum(b.values.snv), COLORS.snv], ['Indels', fmtNum(b.values.indel), COLORS.indel]] })}
        ariaLabel="Stacked histogram of common variants by minor allele frequency in 1% bins" height={270} />
    </FigureCard>
  );
}

// ── 3a. Ts/Tv by class ─────────────────────────────────────────────
function TitvFigure({ id, meta, data, contig }) {
  const rows = forContig(data[id], contig);
  const order = ['all', ...MAF_CLASSES, 'monomorphic_alt'];
  const present = Array.from(new Set(rows.map(getClass).filter(Boolean)));
  const cats = [...order.filter(c => present.includes(c)), ...present.filter(c => !order.includes(c))];
  const chartData = cats.map(c => {
    const r = rows.find(x => getClass(x) === c);
    const ts = num(pick(r, 'ts', 'n_ts')), tv = num(pick(r, 'tv', 'n_tv'));
    const titv = num(pick(r, 'titv', 'ts_tv', 'tstv')) ?? (ts !== null && tv ? ts / tv : null);
    return { cat: c, values: { titv }, ts, tv };
  }).filter(d => isNum(d.values.titv));

  return (
    <FigureCard id={id} meta={meta} fileSuffix={contig} badges={prelimFor(rows, contig)} tableRows={rows}
      note={<Note>{COPY.titvNote}</Note>}>
      <BarChart data={chartData} series={[{ key: 'titv', label: 'Ts/Tv', color: COLORS.snv }]}
        colorFn={d => (d.cat === 'all' ? COLORS.scopeSingle : COLORS.snv)}
        xFormat={classLabel} yFormat={d3.format('.1f')} yLabel="Ts/Tv" valueLabels={d3.format('.2f')}
        rotate={chartData.length > 7}
        tooltip={d => ({ title: classLabel(d.cat), rows: [['Ts/Tv', d.values.titv.toFixed(3)], ['Transitions', fmtNum(d.ts)], ['Transversions', fmtNum(d.tv)]] })}
        ariaLabel="Bar chart of transition to transversion ratio per allele frequency class" height={280} />
    </FigureCard>
  );
}

// ── 3b. Missingness ────────────────────────────────────────────────
function MissingnessFigure({ id, meta, data }) {
  const raw = data[id] || NO_ROWS;
  const [panel, setPanel] = useState('hist');

  // Autosomes only. If a contig column ever appears: prefer "autosomes", else use autosomal rows.
  const rows = useMemo(() => {
    if (!hasContigCol(raw)) return raw;
    const roll = raw.filter(r => r.contig === 'autosomes');
    return roll.length ? roll : raw.filter(r => CONTIGS.slice(0, 22).includes(r.contig));
  }, [raw]);

  const bins = useMemo(() => toTypedBins(rows).filter(b => isNum(b.x0) && isNum(b.x1)), [rows]);

  // Cumulative call-rate curve: share of sites with call rate ≥ 1 − miss_upper
  const curve = key => {
    const total = d3.sum(bins, b => b.values[key] || 0);
    if (!total || !bins.length) return [];
    let cum = 0;
    const pts = [{ x: 1 - bins[0].x0, y: 0 }];
    bins.forEach(b => { cum += b.values[key] || 0; pts.push({ x: 1 - b.x1, y: (cum / total) * 100 }); });
    return pts;
  };
  const minRate = bins.length ? 1 - d3.max(bins, b => b.x1) : 0;
  const fmtMiss = v => `${+(v * 100).toFixed(2)}%`;

  // Summary table: drop bookkeeping rows (keyed by type / metric / key / name)
  const skip = COPY.missingnessSkip;
  const keyOf = r => pick(r, 'metric', 'key', 'name', 'type');
  const summary = data.missingness_summary || NO_ROWS;
  const summaryRows = summary.some(r => keyOf(r) !== null)
    ? summary.filter(r => !skip.includes(keyOf(r)))
    : summary.length === 1
      ? Object.entries(summary[0]).filter(([k]) => !skip.includes(k)).map(([metric, value]) => ({ metric, value }))
      : summary;
  const byContigRows = data.missingness_by_contig ? sortedByContig(data.missingness_by_contig) : null;

  return (
    <FigureCard id={id} meta={meta}
      badges={<Pill tone="violet">Autosomes only</Pill>}
      note={<Note>{COPY.autosomesOnly}</Note>}
      controls={<ToggleGroup ariaLabel="Missingness view" value={panel} onChange={setPanel}
        options={[{ value: 'hist', label: 'Histogram' }, { value: 'curve', label: 'Cumulative call rate' }]} />}
      tableRows={rows}
      downloadData={{ histogram: raw, summary: data.missingness_summary, by_contig: data.missingness_by_contig }}
      footer={
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginTop: '16px' }}>
          {summaryRows.length > 0 && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--dg-text)', marginBottom: '6px' }}>{COPY.summary}</div>
              <DataTable rows={summaryRows} caption="Missingness summary" maxHeight={260} />
            </div>
          )}
          {byContigRows && (
            <details style={{ minWidth: 0 }}>
              <summary style={{ fontSize: '12px', fontWeight: 500, color: 'var(--dg-blue)', cursor: 'pointer', marginBottom: '6px' }}>{COPY.perContig}</summary>
              <DataTable rows={byContigRows} caption="Missingness per autosome" maxHeight={260} />
            </details>
          )}
        </div>
      }
    >
      {panel === 'hist' ? (
        <Histogram bins={bins} series={[SNV_SERIES, INDEL_SERIES]} mode="overlay" yLog
          xFormat={fmtMiss} xLabel="Fraction of samples missing a call" yLabel="Sites (log scale)"
          tooltip={b => ({ title: `Missing ${fmtMiss(b.x0)} – ${fmtMiss(b.x1)}`, rows: [['SNV sites', fmtNum(b.values.snv), COLORS.snv], ['Indel sites', fmtNum(b.values.indel), COLORS.indel]] })}
          ariaLabel="Histogram of sites per missingness bin, SNV and indel overlaid, log y axis" height={280} />
      ) : (
        <LineChart
          series={[{ ...SNV_SERIES, color: COLORS.snvStroke, points: curve('snv') }, { ...INDEL_SERIES, points: curve('indel') }]}
          xDomain={[1, minRate]} yDomain={[0, 100]} xFormat={v => `${+(v * 100).toFixed(1)}%`} yFormat={v => `${v}%`}
          xLabel="Call rate at least" yLabel="% of sites"
          tooltip={(xv, near) => ({ title: `Call rate ≥ ${(near[0].p.x * 100).toFixed(2)}%`, rows: near.map(({ s, p }) => [s.label, fmtPct(p.y), s.color]) })}
          ariaLabel="Cumulative share of sites at or above each call rate, SNV and indel" height={280} />
      )}
    </FigureCard>
  );
}

// ── 3c. Raw call QUAL ──────────────────────────────────────────────
// The file can hold ~200k QUAL values; curves are computed on every row,
// then thinned to ~600 log-spaced points for drawing.
const thinLog = (pts, n = 600) => {
  if (pts.length <= n) return pts;
  const xs = pts.map(p => p.x).filter(x => x > 0);
  const lo = Math.log10(d3.min(xs)), hi = Math.log10(d3.max(xs));
  const step = (hi - lo) / n;
  const out = [];
  let last = -Infinity;
  pts.forEach((p, i) => {
    const lx = Math.log10(p.x);
    if (lx - last >= step || i === pts.length - 1) { out.push(p); last = lx; }
  });
  return out;
};

function QualFigure({ id, meta, data }) {
  const src = data[id] || NO_ROWS;

  const { curves, binned } = useMemo(() => {
    const rows = src.map(r => ({
      q: num(pick(r, 'quality', 'qual')), snps: num(pick(r, 'snps', 'n_snps', 'snv')) || 0,
      ts: num(r.ts) || 0, tv: num(r.tv) || 0, indels: num(pick(r, 'indels', 'n_indels')) || 0,
    })).filter(r => isNum(r.q));

    const asc = [...rows].sort((a, b) => a.q - b.q);
    const cumulative = key => {
      const total = d3.sum(asc, r => r[key]);
      if (!total) return [];
      // share of calls with QUAL ≥ q  =  1 − (calls with QUAL < q) / total
      let below = 0;
      const pts = asc.map(r => { const p = { x: r.q, y: (1 - below / total) * 100 }; below += r[key]; return p; });
      return thinLog(pts.filter(p => p.x > 0));
    };

    const bins = COPY.qualBins.map(([label, lo, hi]) => {
      const sel = rows.filter(r => r.q >= lo && r.q < hi);
      const ts = d3.sum(sel, r => r.ts), tv = d3.sum(sel, r => r.tv);
      return { cat: label, values: { titv: tv ? ts / tv : null }, ts, tv, snps: d3.sum(sel, r => r.snps) };
    });

    return { curves: { snv: cumulative('snps'), indel: cumulative('indels') }, binned: bins };
  }, [src]);

  return (
    <FigureCard id={id} meta={meta} badges={<Pill tone="violet">{COPY.rawCalls}</Pill>}
      tableRows={binned.map(b => ({ qual_bin: b.cat, snps: b.snps, ts: b.ts, tv: b.tv, titv: b.values.titv }))}
      downloadRows={src}>
      <LineChart title="Share of calls with QUAL at or above x"
        series={[{ ...SNV_SERIES, color: COLORS.snvStroke, points: curves.snv }, { ...INDEL_SERIES, points: curves.indel }]}
        xType="log" yDomain={[0, 100]} xFormat={fmtCompact} yFormat={v => `${v}%`} xLabel="QUAL (log scale)" yLabel="% of calls"
        tooltip={(xv, near) => ({ title: `QUAL ≥ ${fmtNum(near[0].p.x)}`, rows: near.map(({ s, p }) => [s.label, fmtPct(p.y), s.color]) })}
        ariaLabel="Cumulative share of raw calls with QUAL at or above each value, log x axis" height={260} />
      <div style={{ height: '18px' }} />
      <BarChart title="Ts/Tv per QUAL bin" data={binned} series={[{ key: 'titv', label: 'Ts/Tv', color: COLORS.snv }]}
        yFormat={d3.format('.1f')} yLabel="Ts/Tv" valueLabels={d3.format('.2f')} xLabel="QUAL bin"
        tooltip={d => ({ title: `QUAL ${d.cat}`, rows: [['Ts/Tv', isNum(d.values.titv) ? d.values.titv.toFixed(3) : '—'], ['Transitions', fmtNum(d.ts)], ['Transversions', fmtNum(d.tv)], ['SNP calls', fmtNum(d.snps)]] })}
        ariaLabel="Bar chart of transition to transversion ratio per QUAL bin" height={240} />
    </FigureCard>
  );
}

// ── 4/5. Per-sample small multiples ────────────────────────────────
// Metric labels: the file's own "metrics" block (id → label string or object) first,
// then the manifest-wide metrics map.
const metricInfo = (manifest, fileMeta, m) => {
  const v = fileMeta?.metrics?.[m] ?? manifest.metrics?.[m];
  if (!v) return { label: m };
  if (typeof v === 'string') return { label: v };
  return { label: v.label || v.name || m, unit: v.unit, log_x: v.log_x };
};
const capFirst = s => String(s).replace(/^\w/, c => c.toUpperCase());

function SmallMultiples({ histRows, summaryRows, manifest, fileMeta }) {
  const present = Array.from(new Set((histRows || []).map(getMetric).filter(Boolean)));
  const declared = Object.keys(fileMeta?.metrics || manifest.metrics || {});
  const ordered = [...declared.filter(m => present.includes(m)), ...present.filter(m => !declared.includes(m))];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '22px 20px' }}>
      {ordered.map(m => {
        const info = metricInfo(manifest, fileMeta, m);
        const unit = info.unit && !['count', 'ratio'].includes(info.unit) ? info.unit : null;
        const label = capFirst(info.label);
        const s = (summaryRows || []).find(r => getMetric(r) === m) || null;
        const median = num(pick(s, 'median', 'p50')), mean = num(s?.mean), sd = num(pick(s, 'sd', 'std', 'stdev'));
        const below = num(s?.n_below), above = num(s?.n_above);
        const outside = below !== null || above !== null ? (below || 0) + (above || 0) : null;
        const logX = info.log_x === true || (info.log_x === undefined && /singleton/i.test(m));
        const bins = histRows.filter(r => getMetric(r) === m)
          .map(r => ({ x0: num(r.bin_lower), x1: num(r.bin_upper), values: { count: getCount(r) } }));

        return (
          <figure key={m} style={{ margin: 0, minWidth: 0 }}>
            <Histogram bins={bins} series={[{ key: 'count', label: 'Samples', color: COLORS.snv, stroke: COLORS.snvStroke }]}
              legend={false} title={`${label}${unit ? ` (${unit})` : ''}`} xType={logX ? 'symlog' : 'linear'} xTicks={4}
              vlines={isNum(median) ? [{ x: median, label: 'median', color: COLORS.text }] : []}
              yLabel="Samples" height={210}
              tooltip={b => ({
                title: `${fmtStat(b.x0)} – ${fmtStat(b.x1)}${unit ? ` ${unit}` : ''}`,
                rows: [['Samples', fmtNum(b.values.count), COLORS.snv]],
                foot: [isNum(mean) && `mean ${fmtStat(mean)}`, isNum(sd) && `sd ${fmtStat(sd)}`, isNum(median) && `median ${fmtStat(median)}`].filter(Boolean).join(' · '),
              })}
              ariaLabel={`Histogram of ${info.label} across samples`} />
            <figcaption>
              <Caption>
                {[isNum(median) && `Median ${fmtStat(median)}`, isNum(mean) && `mean ${fmtStat(mean)}`, isNum(sd) && `SD ${fmtStat(sd)}`].filter(Boolean).join(' · ')}
                {outside !== null && <><br />{COPY.sampleOutside(fmtNum(outside))}</>}
                {logX && <><br />Symmetric log x axis</>}
              </Caption>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

function SampleMetricsFigure({ id, meta, data, manifest, spec }) {
  const sources = spec.sources.filter(s => Array.isArray(data[s.hist]));
  const [srcKey, setSrcKey] = useState(sources[0]?.key);
  const src = sources.find(s => s.key === srcKey) || sources[0];
  const histRows = data[src.hist] || NO_ROWS;
  const summaryRows = data[src.summary] || NO_ROWS;
  const fileMeta = manifest.files[src.hist] || meta;
  const activeMeta = src.hist === id ? meta : { ...meta, ...fileMeta, title: meta.title };

  const n = d3.max(summaryRows, r => num(r.n));
  const total = num(manifest.cohort_size);

  return (
    <FigureCard id={id} meta={activeMeta} fileSuffix={src.key}
      badges={<>
        {sources.length > 1 && <Pill tone="blue">Showing · {src.label}</Pill>}
        {src.key === 'raw' && <Pill tone="violet">{COPY.rawCalls}</Pill>}
      </>}
      controls={sources.length > 1 && (
        <ToggleGroup ariaLabel="Data source" value={src.key} onChange={setSrcKey}
          options={sources.map(s => ({ value: s.key, label: s.label }))} />
      )}
      note={spec.showAvailability && isNum(n) ? <Note>{COPY.availableFor(fmtNum(n), isNum(total) ? fmtNum(total) : null)}</Note> : null}
      tableRows={summaryRows.length ? summaryRows : histRows}
      downloadRows={histRows}
      downloadData={{ histogram: histRows, summary: summaryRows }}
    >
      <SmallMultiples histRows={histRows} summaryRows={summaryRows} manifest={manifest} fileMeta={fileMeta} />
    </FigureCard>
  );
}

// ── Generic fallback (new files appear without a dedicated renderer) ─
function GenericFigure({ id, meta, data, contig }) {
  const rows = data[id] || NO_ROWS;
  const shown = hasContigCol(rows) ? forContig(rows, contig) : rows;
  return (
    <FigureCard id={id} meta={meta} badges={prelimFor(rows, contig)} tableRows={shown} downloadRows={rows}>
      <DataTable rows={shown} caption={meta.title || id} />
    </FigureCard>
  );
}

// ── Registry ───────────────────────────────────────────────────────
export const FIGURES = {
  variant_counts:       { files: ['variant_counts'], Component: VariantCountsFigure },
  substitution_types_6: { files: ['substitution_types_6', 'substitution_types'], Component: SubstitutionFigure },
  indel_length:         { files: ['indel_length'], Component: IndelLengthFigure },
  maf_log_hist:         { files: ['maf_log_hist'], Component: MafLogHistFigure },
  maf_classes:          { files: ['maf_classes'], Component: MafClassesFigure },
  maf_linear_common:    { files: ['maf_linear_common'], Component: MafLinearFigure },
  titv_by_class:        { files: ['titv_by_class'], Component: TitvFigure },
  missingness_hist:     { files: ['missingness_hist', 'missingness_summary', 'missingness_by_contig'], Component: MissingnessFigure },
  qual_cohort:          { files: ['qual_cohort'], Component: QualFigure },
  vds_hist: {
    files: ['vds_hist', 'vds_summary', 'raw_calls_hist', 'raw_calls_summary'], Component: SampleMetricsFigure,
    sources: [
      { key: 'joint', label: COPY.sourceJoint, hist: 'vds_hist', summary: 'vds_summary' },
      { key: 'raw',   label: COPY.sourceRaw,   hist: 'raw_calls_hist', summary: 'raw_calls_summary' },
    ],
  },
  alignment_hist: {
    files: ['alignment_hist', 'alignment_summary'], Component: SampleMetricsFigure, showAvailability: true,
    sources: [{ key: 'alignment', label: 'Alignment', hist: 'alignment_hist', summary: 'alignment_summary' }],
  },
};

// Companion files are drawn inside their host figure; they get no card of their own
// unless the host is missing from the manifest.
export const COMPANIONS = {
  substitution_types: 'substitution_types_6',
  missingness_summary: 'missingness_hist',
  missingness_by_contig: 'missingness_hist',
  vds_summary: 'vds_hist',
  raw_calls_hist: 'vds_hist',
  raw_calls_summary: 'vds_hist',
  alignment_summary: 'alignment_hist',
};

export const cardIdsFor = (section, manifest) =>
  section.files.filter(fid => {
    if (!manifest.files[fid]) return false;
    const host = COMPANIONS[fid];
    return !(host && manifest.files[host]);
  });

// ── Error boundary: a malformed file breaks one card, not the page ───
class FigureBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidUpdate(prev) { if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null }); }
  render() {
    if (this.state.error) {
      return <FigureCard id={this.props.id} meta={this.props.meta} status="error" error={`could not render (${this.state.error.message})`} />;
    }
    return this.props.children;
  }
}

export function FigureBlock({ id, manifest, contig }) {
  const spec = FIGURES[id];
  const ids = spec ? spec.files : [id];
  const { status, data, error, retry } = useStatsFiles(manifest, ids);
  const meta = manifest.files[id] || { title: id };

  if (status !== 'ready') return <FigureCard id={id} meta={meta} status={status} error={error} onRetry={retry} />;
  const Comp = spec ? spec.Component : GenericFigure;
  return (
    <FigureBoundary id={id} meta={meta} resetKey={contig}>
      <Comp id={id} meta={meta} manifest={manifest} data={data} contig={contig} spec={spec} />
    </FigureBoundary>
  );
}
