import React, { useState, useEffect, useCallback } from "react";
import Layout from "./LayoutPage";

const PAGE_SIZE  = 25;
const FETCH_SIZE = 200;
const BASE       = "https://dengen.dk/api/qc";

// ── Badge colours per column type ─────────────────────────────────
const badges = {
  fastqc: {
    r1: { label: "R1", bg: "var(--dg-blue-bg)", color: "var(--dg-blue)", border: "var(--dg-blue-border)" },
    r2: { label: "R2", bg: "var(--dg-blue-bg)", color: "var(--dg-blue)", border: "var(--dg-blue-border)" },
  },
  alignment: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
  snp:       { bg: "#faf5ff", color: "#6b21a8", border: "#e9d5ff" },
  sv:        { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
};

const Badge = ({ href, label, style }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={{
    display: "inline-flex", alignItems: "center",
    fontSize: "11px", fontWeight: 500,
    padding: "3px 10px", borderRadius: "99px",
    border: `0.5px solid ${style.border}`,
    background: style.bg, color: style.color,
    textDecoration: "none", transition: "opacity 0.15s",
    whiteSpace: "nowrap",
  }}
    onMouseOver={e => e.currentTarget.style.opacity = "0.75"}
    onMouseOut={e => e.currentTarget.style.opacity = "1"}
  >
    {label}
  </a>
);

const QCLandingPage = () => {
  const [rows, setRows]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [query, setQuery]           = useState("");
  const [page, setPage]             = useState(0);
  const [apiOffset, setApiOffset]   = useState(0);
  const [searchMode, setSearchMode] = useState(false);

  // ── Fetch window ──
  const fetchWindow = useCallback((offset) => {
    setLoading(true); setError(false);
    fetch(`${BASE}?limit=${FETCH_SIZE}&offset=${offset}`)
      .then(r => r.json())
      .then(json => {
        setRows(Array.isArray(json?.data) ? json.data : []);
        setTotal(json?.total ?? 0);
        setApiOffset(offset);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  useEffect(() => { fetchWindow(0); }, [fetchWindow]);

  // ── Search ──
  useEffect(() => {
    if (!query) {
      if (searchMode) { setSearchMode(false); setPage(0); fetchWindow(0); }
      return;
    }
    setSearchMode(true);
    const t = setTimeout(() => {
      fetch(`${BASE}/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(json => { setRows(Array.isArray(json?.data) ? json.data : []); setTotal(json?.count ?? 0); setPage(0); setLoading(false); })
        .catch(() => { setRows([]); setLoading(false); });
    }, 300);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pagination ──
  const totalPages      = searchMode ? Math.ceil(rows.length / PAGE_SIZE) : Math.ceil(total / PAGE_SIZE);
  const globalPageStart = page * PAGE_SIZE;
  const localStart      = globalPageStart - apiOffset;
  const pageRows        = rows.slice(localStart, localStart + PAGE_SIZE);

  const handlePrev = () => {
    const newPage = page - 1;
    if (!searchMode && newPage * PAGE_SIZE < apiOffset) fetchWindow(Math.max(0, apiOffset - FETCH_SIZE));
    setPage(newPage);
  };
  const handleNext = () => {
    const newPage = page + 1;
    if (!searchMode && newPage * PAGE_SIZE >= apiOffset + FETCH_SIZE) fetchWindow(apiOffset + FETCH_SIZE);
    setPage(newPage);
  };

  const displayStart = searchMode ? page * PAGE_SIZE + 1 : globalPageStart + 1;
  const displayEnd   = searchMode ? Math.min((page + 1) * PAGE_SIZE, rows.length) : Math.min(globalPageStart + PAGE_SIZE, total);
  const displayTotal = searchMode ? rows.length : total;

  // ── Status indicator ──
  const statusColor = error ? "#ef4444" : loading ? "#f59e0b" : "#22c55e";
  const statusLabel = error ? "Error" : loading ? "Loading…" : searchMode ? "Search" : "Live";

  return (
    <Layout>
      <div style={{ fontFamily: "var(--dg-font)" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "12px", color: "var(--dg-text-muted)", marginBottom: "10px" }}>
            DenGen › Data quality portal
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "8px", lineHeight: 1.2 }}>
            DenGen QC Browser
          </h1>
          <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", margin: 0 }}>
            Sample-level quality control reports · FastQC · Alignment · Variants · Structural Variants
          </p>
          <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "20px 0 0" }} />
        </div>

        {/* ── Stats strip ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          border: "0.5px solid var(--dg-border)", borderRadius: "10px",
          overflow: "hidden", marginBottom: "20px",
        }}>
          {[
            { label: "Total samples",   value: loading ? "—" : total.toLocaleString() },
            { label: searchMode ? "Search results" : "Loaded window", value: loading ? "—" : rows.length.toLocaleString() },
            { label: "Page",            value: loading ? "—" : `${page + 1} / ${totalPages || 1}` },
            { label: "Status",          value: null },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "16px 20px",
              borderRight: i < 3 ? "0.5px solid var(--dg-border)" : "none",
              background: "#fff",
            }}>
              <div style={{ fontSize: "11px", color: "var(--dg-text-muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>
                {s.label}
              </div>
              {s.value !== null ? (
                <div style={{ fontSize: "18px", fontWeight: 500, color: "var(--dg-text)" }}>{s.value}</div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "4px" }}>
                  <span style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: statusColor, display: "inline-block",
                    boxShadow: loading ? `0 0 0 3px ${statusColor}33` : "none",
                  }} />
                  <span style={{ fontSize: "13px", color: "var(--dg-text)", fontWeight: 500 }}>{statusLabel}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Search bar ── */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" }}>
            🔍
          </span>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0); }}
            placeholder="Search by sample ID, e.g. DENGEN000012345"
            autoComplete="off"
            style={{
              width: "100%", height: "40px",
              paddingLeft: "36px", paddingRight: query ? "36px" : "12px",
              border: "0.5px solid var(--dg-border)", borderRadius: "8px",
              fontSize: "13px", fontFamily: "var(--dg-font)",
              color: "var(--dg-text)", background: "#fff",
              outline: "none", transition: "border-color 0.15s",
              boxSizing: "border-box",
            }}
            onFocus={e => e.target.style.borderColor = "var(--dg-blue)"}
            onBlur={e => e.target.style.borderColor = "var(--dg-border)"}
          />
          {query && (
            <button onClick={() => { setQuery(""); setPage(0); }} style={{
              position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              fontSize: "18px", color: "var(--dg-text-muted)", lineHeight: 1,
            }}>×</button>
          )}
        </div>

        {/* ── Table ── */}
        <div style={{
          border: "0.5px solid var(--dg-border)",
          borderRadius: "10px", overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
            background: "var(--dg-blue-bg)",
            borderBottom: "0.5px solid var(--dg-border)",
            padding: "10px 16px",
          }}>
            {["Sample ID", "FastQC", "Alignment", "Variants / SV"].map(h => (
              <div key={h} style={{
                fontSize: "10px", fontWeight: 500,
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: "var(--dg-text-muted)",
              }}>
                {h}
              </div>
            ))}
          </div>

          {/* Body */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", fontSize: "13px", color: "var(--dg-text-muted)" }}>
              Loading QC data…
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "60px", fontSize: "13px", color: "#ef4444" }}>
              Failed to load data.{" "}
              <button onClick={() => fetchWindow(apiOffset)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#ef4444", textDecoration: "underline", fontFamily: "var(--dg-font)", fontSize: "13px",
              }}>
                Retry
              </button>
            </div>
          ) : pageRows.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", fontSize: "13px", color: "var(--dg-text-muted)" }}>
              No samples found
            </div>
          ) : (
            pageRows.map((row, i) => {
              const id = row.sampleId || "NA";
              return (
                <div key={id} style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  padding: "10px 16px",
                  borderBottom: "0.5px solid var(--dg-border)",
                  alignItems: "center",
                  background: i % 2 === 0 ? "#fff" : "#fafcff",
                  transition: "background 0.1s",
                }}
                  onMouseOver={e => e.currentTarget.style.background = "var(--dg-blue-bg)"}
                  onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafcff"}
                >
                  <div style={{
                    fontFamily: "ui-monospace, 'Cascadia Code', monospace",
                    fontSize: "12.5px", color: "var(--dg-text)", fontWeight: 500,
                  }}>
                    {id}
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <Badge href={`/qc/fastqc/${id}/r1`} label="R1" style={badges.fastqc.r1} />
                    <Badge href={`/qc/fastqc/${id}/r2`} label="R2" style={badges.fastqc.r2} />
                  </div>

                  <div>
                    <Badge href={`/alignments/${id}`} label="Alignment" style={badges.alignment} />
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <Badge href={`/variant/${id}`}            label="SNP" style={badges.snp} />
                    <Badge href={`/structural-variant/${id}`} label="SV"  style={badges.sv} />
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination */}
          {!loading && !error && rows.length > 0 && (
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px",
              borderTop: "0.5px solid var(--dg-border)",
              background: "var(--dg-blue-bg)",
            }}>
              <span style={{ fontSize: "12px", color: "var(--dg-text-muted)" }}>
                Showing {displayStart.toLocaleString()}–{displayEnd.toLocaleString()} of {displayTotal.toLocaleString()} {searchMode ? "results" : "samples"}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button onClick={handlePrev} disabled={page === 0} style={{
                  padding: "5px 14px", fontSize: "12px", fontFamily: "var(--dg-font)",
                  border: "0.5px solid var(--dg-border)", borderRadius: "6px",
                  background: "#fff", color: "var(--dg-text)", cursor: "pointer",
                  opacity: page === 0 ? 0.4 : 1, transition: "opacity 0.15s",
                }}>
                  ← Prev
                </button>
                <span style={{ fontSize: "12px", color: "var(--dg-text-muted)", minWidth: "90px", textAlign: "center" }}>
                  Page {page + 1} of {totalPages.toLocaleString()}
                </span>
                <button onClick={handleNext} disabled={page >= totalPages - 1} style={{
                  padding: "5px 14px", fontSize: "12px", fontFamily: "var(--dg-font)",
                  border: "0.5px solid var(--dg-border)", borderRadius: "6px",
                  background: "#fff", color: "var(--dg-text)", cursor: "pointer",
                  opacity: page >= totalPages - 1 ? 0.4 : 1, transition: "opacity 0.15s",
                }}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default QCLandingPage;