import { useEffect, useState, useCallback } from 'react';
import { STATS_BASE_URL } from './statsConfig';

// ── Module-level cache: each URL is fetched once per page load ──────
const cache = new Map();

export const fetchJSON = url => {
  if (!cache.has(url)) {
    const p = fetch(url).then(r => {
      if (!r.ok) throw new Error(`${r.status} ${r.statusText || 'error'} (${url})`);
      return r.json();
    });
    p.catch(() => cache.delete(url));   // a failed fetch can be retried
    cache.set(url, p);
  }
  return cache.get(url);
};

export const fileUrl = file => `${STATS_BASE_URL}/${file}`;

// ── Manifest normalisation ─────────────────────────────────────────
// Real DenGen manifest:
//   dataset:  { name, version, samples, generated }
//   sections: [{ id, title }]                      (no file lists)
//   files:    [{ id, file, section, title, description, source, chart, columns, notes }]
// Also accepted: files as an object keyed by id, sections that carry their own
// "files" list, and top-level cohort_size / metrics.
const prettify = s => String(s).replace(/[-_]/g, ' ').replace(/^\w/, c => c.toUpperCase());

export const normalizeManifest = raw => {
  const list = Array.isArray(raw?.files)
    ? raw.files
    : Object.entries(raw?.files || {}).map(([id, f]) => ({ id, ...f }));

  const files = {};
  const order = [];
  list.forEach(f => {
    if (!f || !f.id) return;
    files[f.id] = { ...f, file: f.file || f.filename || f.path || `${f.id}.json` };
    order.push(f.id);
  });

  // Sections: keep manifest order; fill each from its own "files" list if present,
  // otherwise from the files whose "section" field points at it (manifest file order).
  const declared = Array.isArray(raw?.sections) ? raw.sections : [];
  const sections = declared.map((s, i) => {
    const id = s.id || `section-${i + 1}`;
    const own = s.files || s.file_ids;
    return {
      ...s,
      id,
      files: Array.isArray(own) && own.length ? own : order.filter(fid => files[fid].section === id),
    };
  });

  // Files whose section is not declared (or that have none) still appear, grouped at the end
  const placed = new Set(sections.flatMap(s => s.files));
  const extra = {};
  const extraOrder = [];
  order.filter(fid => !placed.has(fid)).forEach(fid => {
    const key = files[fid].section || 'other';
    if (!extra[key]) { extra[key] = []; extraOrder.push(key); }
    extra[key].push(fid);
  });
  extraOrder.forEach(key => sections.push({ id: key, title: key === 'other' ? 'Other statistics' : prettify(key), files: extra[key] }));

  // Metrics: top-level "metrics", plus any "metrics" block on a file entry
  const toMap = m => (Array.isArray(m) ? Object.fromEntries(m.map(x => [x.id || x.metric || x.name, x])) : (m || {}));
  const metrics = { ...toMap(raw?.metrics) };
  list.forEach(f => { if (f?.metrics) Object.assign(metrics, toMap(f.metrics)); });

  const dataset = raw?.dataset || {};

  return {
    ...raw,
    dataset,
    files,
    sections,
    metrics,
    cohort_size: raw?.cohort_size ?? dataset.samples ?? dataset.n_samples ?? null,
    assembly: raw?.assembly ?? dataset.assembly ?? dataset.reference ?? null,
    conventions: Array.isArray(raw?.conventions) ? raw.conventions : (raw?.conventions ? [raw.conventions] : []),
  };
};

// ── Hooks ──────────────────────────────────────────────────────────
export function useManifest() {
  const [state, setState] = useState({ status: 'loading', manifest: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setState(s => ({ ...s, status: 'loading', error: null }));
    fetchJSON(fileUrl('manifest.json'))
      .then(raw => { if (alive) setState({ status: 'ready', manifest: normalizeManifest(raw), error: null }); })
      .catch(e => { if (alive) setState({ status: 'error', manifest: null, error: e.message }); });
    return () => { alive = false; };
  }, [attempt]);

  const retry = useCallback(() => setAttempt(a => a + 1), []);
  return { ...state, retry };
}

// ids[0] is required; the rest are optional companions (null when absent or failing)
export function useStatsFiles(manifest, ids) {
  const key = ids.join('|');
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading', data: null, error: null });

    const load = (id, required) => {
      const meta = manifest?.files?.[id];
      if (!meta) {
        return required ? Promise.reject(new Error(`"${id}" is not listed in manifest.json`)) : Promise.resolve([id, null]);
      }
      return fetchJSON(fileUrl(meta.file))
        .then(d => {
          if (!Array.isArray(d)) throw new Error(`${meta.file}: expected a JSON array of rows`);
          return [id, d];
        })
        .catch(e => (required ? Promise.reject(e) : [id, null]));
    };

    Promise.all(ids.map((id, i) => load(id, i === 0)))
      .then(entries => { if (alive) setState({ status: 'ready', data: Object.fromEntries(entries), error: null }); })
      .catch(e => { if (alive) setState({ status: 'error', data: null, error: e.message }); });

    return () => { alive = false; };
  }, [manifest, key, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = useCallback(() => setAttempt(a => a + 1), []);
  return { ...state, retry };
}
