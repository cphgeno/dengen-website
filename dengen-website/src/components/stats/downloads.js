// ── Data and chart downloads ───────────────────────────────────────

const save = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

export const toCSV = rows => {
  if (!Array.isArray(rows) || !rows.length) return '';
  const cols = [];
  rows.forEach(r => Object.keys(r || {}).forEach(k => { if (!cols.includes(k)) cols.push(k); }));
  const esc = v => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(','), ...rows.map(r => cols.map(c => esc(r?.[c])).join(','))].join('\n');
};

export const downloadCSV  = (rows, name) => save(new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8' }), `${name}.csv`);
export const downloadJSON = (data, name) => save(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `${name}.json`);

// Compose every <svg> inside a container into one standalone SVG (keeps layout of small multiples).
export const composeSVG = container => {
  const svgs = Array.from(container?.querySelectorAll('svg') || []);
  if (!svgs.length) return null;
  const box = container.getBoundingClientRect();
  const width = Math.ceil(box.width);
  const height = Math.ceil(box.height);
  const font = window.getComputedStyle(svgs[0]).fontFamily || 'sans-serif';

  const NS = 'http://www.w3.org/2000/svg';
  const out = document.createElementNS(NS, 'svg');
  out.setAttribute('xmlns', NS);
  out.setAttribute('width', width);
  out.setAttribute('height', height);
  out.setAttribute('viewBox', `0 0 ${width} ${height}`);
  out.setAttribute('font-family', font);

  const bg = document.createElementNS(NS, 'rect');
  bg.setAttribute('width', width); bg.setAttribute('height', height); bg.setAttribute('fill', '#ffffff');
  out.appendChild(bg);

  svgs.forEach(svg => {
    const r = svg.getBoundingClientRect();
    const clone = svg.cloneNode(true);
    clone.removeAttribute('style');
    clone.setAttribute('x', Math.round(r.left - box.left));
    clone.setAttribute('y', Math.round(r.top - box.top));
    clone.querySelectorAll('[data-export-ignore]').forEach(n => n.remove());
    out.appendChild(clone);
  });

  return { markup: new XMLSerializer().serializeToString(out), width, height };
};

export const downloadSVG = (container, name) => {
  const svg = composeSVG(container);
  if (svg) save(new Blob([svg.markup], { type: 'image/svg+xml;charset=utf-8' }), `${name}.svg`);
};

export const downloadPNG = (container, name, scale = 2) => {
  const svg = composeSVG(container);
  if (!svg) return;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svg.width * scale; canvas.height = svg.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(b => b && save(b, `${name}.png`), 'image/png');
  };
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.markup)}`;
};
