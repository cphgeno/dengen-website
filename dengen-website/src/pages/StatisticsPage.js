import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "./LayoutPage";
import { useManifest } from "../components/stats/useStatsData";
import { FigureBlock, cardIdsFor } from "../components/stats/figures";
import { COPY } from "../components/stats/copy";
import { CONTIGS, DEFAULT_CONTIG, contigLabel, fmtNum, includesSex, num, pick } from "../components/stats/statsConfig";
import { Note, PrelimBadge, Skeleton } from "../components/stats/ui";

// ── Page building blocks (mirrors BeaconPage) ──────────────────────
const SectionHeading = ({ id, children }) => (
  <h2 id={id} style={{
    fontSize: "18px", fontWeight: 500, color: "var(--dg-text)",
    marginBottom: "8px", marginTop: "44px", scrollMarginTop: "120px",
  }}>
    {children}
  </h2>
);

const Body = ({ children }) => (
  <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.8, margin: "0 0 18px" }}>
    {children}
  </p>
);

const Ul = ({ items }) => (
  <ul style={{ margin: "0", paddingLeft: "0", listStyle: "none" }}>
    {items.map((item, i) => (
      <li key={i} style={{
        display: "flex", gap: "10px",
        fontSize: "13px", color: "var(--dg-text-muted)",
        lineHeight: 1.7, padding: "5px 0",
        borderBottom: i < items.length - 1 ? "0.5px solid var(--dg-border)" : "none",
      }}>
        <span style={{
          width: "5px", height: "5px", borderRadius: "50%",
          background: "var(--dg-blue)", flexShrink: 0, marginTop: "9px",
        }} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Tag = ({ children }) => (
  <span style={{
    display: "inline-block", fontSize: "11px", fontWeight: 500,
    background: "var(--dg-blue-light)", color: "var(--dg-blue)",
    border: "0.5px solid var(--dg-blue-border)",
    borderRadius: "99px", padding: "2px 9px",
    marginRight: "6px", marginBottom: "8px",
  }}>
    {children}
  </span>
);

const useIsNarrow = (bp = 900) => {
  const query = `(max-width: ${bp}px)`;
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const on = e => setNarrow(e.matches);
    setNarrow(mq.matches);
    mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on));
  }, [query]);
  return narrow;
};

// ── Contig selector ────────────────────────────────────────────────
const ContigSelector = ({ value, onChange }) => (
  <div style={{
    position: "sticky", top: "72px", zIndex: 4,
    display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px",
    padding: "10px 14px", margin: "0 0 8px",
    background: "rgba(255, 255, 255, 0.92)", backdropFilter: "blur(6px)",
    border: "0.5px solid var(--dg-border)", borderRadius: "10px",
  }}>
    <label htmlFor="stats-contig" style={{
      fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--dg-text-muted)",
    }}>
      {COPY.contigLabel}
    </label>
    <select id="stats-contig" value={value} onChange={e => onChange(e.target.value)} style={{
      height: "32px", padding: "0 10px", fontSize: "13px", fontFamily: "var(--dg-font)",
      color: "var(--dg-text)", background: "#fff",
      border: "0.5px solid var(--dg-border)", borderRadius: "6px", cursor: "pointer",
    }}>
      <optgroup label="Roll-ups">
        <option value="autosomes">{contigLabel("autosomes")}</option>
        <option value="all">{contigLabel("all")}</option>
      </optgroup>
      <optgroup label="Single contig">
        {CONTIGS.map(c => <option key={c} value={c}>{c}</option>)}
      </optgroup>
    </select>
    {includesSex(value) && <PrelimBadge>{value === "all" ? "Includes chrX/chrY — preliminary" : `${value} — preliminary`}</PrelimBadge>}
    <span style={{ fontSize: "12px", color: "var(--dg-text-muted)", marginLeft: "auto" }}>
      Applies to figures with per-contig data
    </span>
  </div>
);

// ── Page ───────────────────────────────────────────────────────────
function StatisticsPage() {
  const { status, manifest, error, retry } = useManifest();
  const [contig, setContig] = useState(DEFAULT_CONTIG);
  const [activeId, setActiveId] = useState(null);
  const narrow = useIsNarrow();

  const sections = manifest
    ? manifest.sections.map(s => ({ ...s, cards: cardIdsFor(s, manifest) })).filter(s => s.cards.length)
    : [];

  useEffect(() => {
    if (!sections.length) return undefined;
    setActiveId(a => a || sections[0].id);
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); }); },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sections.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [sections.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollTo = id => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cohort = manifest ? num(pick(manifest, "cohort_size", "n_individuals", "n_samples")) : null;

  return (
    <Layout>
      <Helmet><title>Statistics · DenGen</title></Helmet>
      <div style={{
        display: "grid", gridTemplateColumns: narrow ? "minmax(0, 1fr)" : "200px minmax(0, 1fr)",
        gap: "0", minHeight: "600px", fontFamily: "var(--dg-font)",
      }}>

        {/* ── Sidebar (sections from the manifest) ── */}
        {!narrow && (
          <aside aria-label="Statistics sections" style={{
            borderRight: "0.5px solid var(--dg-border)", paddingTop: "4px",
            position: "sticky", top: "80px", alignSelf: "start",
            maxHeight: "calc(100vh - 100px)", overflowY: "auto",
          }}>
            <div style={{
              fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em",
              color: "var(--dg-text-muted)", padding: "0 16px", marginBottom: "6px",
            }}>
              Statistics
            </div>
            {sections.map(s => {
              const isActive = activeId === s.id;
              return (
                <button key={s.id} type="button" onClick={() => scrollTo(s.id)} style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: isActive ? "var(--dg-blue-bg)" : "none", border: "none",
                  borderRight: isActive ? "2px solid var(--dg-blue)" : "2px solid transparent",
                  padding: "7px 16px", fontSize: "13px", fontFamily: "var(--dg-font)",
                  color: isActive ? "var(--dg-blue)" : "var(--dg-text-muted)",
                  fontWeight: isActive ? 500 : 400, cursor: "pointer", transition: "all 0.15s",
                }}>
                  {s.title || s.id}
                </button>
              );
            })}
          </aside>
        )}

        {/* ── Content ── */}
        <article style={{ padding: narrow ? "0 0 60px" : "0 0 60px 48px", minWidth: 0 }}>

          {/* Page header */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", color: "var(--dg-text-muted)", marginBottom: "10px" }}>
              {COPY.breadcrumb}
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "10px", lineHeight: 1.2 }}>
              {manifest?.title || COPY.pageTitle}
            </h1>
            <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.7, maxWidth: "640px", margin: 0 }}>
              {manifest?.description || COPY.introFallback}
            </p>
            {manifest && (
              <div style={{ marginTop: "14px" }}>
                {cohort !== null && <Tag>{fmtNum(cohort)} individuals</Tag>}
                {manifest.assembly && <Tag>{manifest.assembly}</Tag>}
                <Tag>Joint call set</Tag>
              </div>
            )}
            <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "20px 0 0" }} />
          </div>

          {status === "loading" && <Skeleton height={320} />}

          {status === "error" && (
            <div role="alert" style={{
              border: "0.5px solid #fca5a5", borderRadius: "8px", background: "#fff5f5",
              padding: "16px 18px", fontSize: "13px", color: "#b91c1c",
            }}>
              Could not load the statistics manifest: {error}
              <button type="button" onClick={retry} style={{
                marginLeft: "10px", background: "none", border: "none", cursor: "pointer",
                color: "#b91c1c", textDecoration: "underline", fontFamily: "var(--dg-font)", fontSize: "13px",
              }}>
                Retry
              </button>
            </div>
          )}

          {status === "ready" && (
            <>
              {manifest.mock && <Note tone="amber"><strong style={{ fontWeight: 500 }}>{COPY.mockBanner}</strong></Note>}

              {/* Intro notes */}
              <Note>{COPY.callsetNote}</Note>
              <Note tone="amber">{COPY.sexChromNote}</Note>

              {manifest.conventions.length > 0 && (
                <details style={{
                  border: "0.5px solid var(--dg-border)", borderRadius: "10px",
                  background: "rgba(240, 249, 255, 0.6)", padding: "12px 16px", margin: "0 0 22px",
                }}>
                  <summary style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", cursor: "pointer" }}>
                    {COPY.conventions}
                  </summary>
                  <div style={{ marginTop: "8px" }}><Ul items={manifest.conventions} /></div>
                </details>
              )}

              <ContigSelector value={contig} onChange={setContig} />

              {/* Sections and cards, in manifest order */}
              {sections.map(s => (
                <section key={s.id} aria-labelledby={s.id}>
                  <SectionHeading id={s.id}>{s.title || s.id}</SectionHeading>
                  {s.description && <Body>{s.description}</Body>}
                  {s.cards.map(fid => (
                    <FigureBlock key={fid} id={fid} manifest={manifest} contig={contig} />
                  ))}
                </section>
              ))}
            </>
          )}
        </article>
      </div>
    </Layout>
  );
}

export default StatisticsPage;
