import React, { useState, useEffect } from "react";
import Layout from "./LayoutPage";
import { Link } from "react-router-dom";

// ── Sidebar ────────────────────────────────────────────────────────
const sidebarSections = [
  {
    heading: "Standards",
    items: [
      { id: "ga4gh",       label: "GA4GH" },
      { id: "bioschemas",  label: "Bioschemas" },
      { id: "elixir",      label: "ELIXIR / bio.tools" },
      { id: "fair",        label: "FAIR principles" },
      { id: "1mg",         label: "1+MG initiative" },
      { id: "gdi",         label: "GDI project" },
    ],
  },
];

// ── GA4GH data (exact original content) ───────────────────────────
const ga4ghStandards = [
  {
    section: "Large Scale Genomics",
    items: [
      { name: "Read File Formats (SAM/BAM/CRAM)", purpose: "Specifications for storing next-generation sequencing read data.", specificationVersion: "V3.0.0", supportedVersion: "V3.0.0", implementation: "Production" },
      { name: "Variation File Formats (VCF/BCF)", purpose: "The specifications for Variant Call Format Files (VCF) and its binary counterpart BCF.", specificationVersion: "V4.0.0", supportedVersion: "V4.0.0", implementation: "Production" },
    ],
  },
  {
    section: "Discovery",
    items: [
      { name: "Beacon v2", purpose: "Supports discovery of genomic variants, phenotypes, and individuals", specificationVersion: "V2.0", supportedVersion: "V2.0", implementation: <a href="/beacon" style={{ color: "var(--dg-blue)", textDecoration: "none", fontWeight: 500 }}>Beacon →</a> },
    ],
  },
  {
    section: "Data Use / Researcher Identities",
    items: [
      { name: "Data Use Ontology (DUO)", purpose: "Allow users to semantically tag genomic datasets with usage restrictions, allowing them to become automatically discoverable based on a health, clinical, or biomedical researcher's authorisation level or intended use.", specificationVersion: "V1.0", supportedVersion: "—", implementation: "Considering" },
    ],
  },
  {
    section: "Genomic Knowledge Standards",
    items: [
      { name: "Variation Representation (VRS)", purpose: "Provides a flexible framework of computational models, schemas, and algorithms to precisely and consistently exchange genetic variation data across communities.", specificationVersion: "V2.0", supportedVersion: "—", implementation: "Considering" },
    ],
  },
  {
    section: "Clin / Pheno Data Capture",
    items: [
      { name: "Phenopackets", purpose: "Provides information models with different levels of complexity to enable high level clinical phenotype information as well as deep clinical phenotype information to be exchanged.", specificationVersion: "V2.0.0", supportedVersion: "—", implementation: "Exploring" },
    ],
  },
];

// ── Bioschemas markup details ──────────────────────────────────────
const bioschemasTypes = [
  { type: "Dataset",        status: "Production", description: "Top-level structured metadata for the DenGen cohort dataset, including name, description, license, and creator fields, enabling discovery by search engines and data catalogues." },
  { type: "DataCatalog",    status: "Production", description: "Describes the DenGen platform as a catalogue of genomic datasets, linking individual dataset entries and tools." },
  { type: "ComputationalTool", status: "Planned", description: "Markup for DenGen tools including the Allele Frequency Browser and Beacon, enabling discovery via ELIXIR and bio.tools registries." },
];

// ── Reusable primitives ────────────────────────────────────────────
const SectionHeading = ({ id, children }) => (
  <h2 id={id} style={{
    fontSize: "18px", fontWeight: 500, color: "var(--dg-text)",
    marginBottom: "10px", marginTop: "40px", scrollMarginTop: "80px",
  }}>
    {children}
  </h2>
);

const Body = ({ children }) => (
  <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.8, margin: "0 0 16px" }}>
    {children}
  </p>
);

const ExternalLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    style={{ color: "var(--dg-blue)", textDecoration: "none", fontWeight: 500 }}>
    {children}
  </a>
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

const StatusPill = ({ status }) => {
  const map = {
    Production: { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
    Considering: { bg: "#faf5ff", color: "#6b21a8", border: "#e9d5ff" },
    Exploring:   { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
    Planned:     { bg: "var(--dg-blue-bg)", color: "var(--dg-blue)", border: "var(--dg-blue-border)" },
  };
  const s = map[status] || map.Planned;
  return (
    <span style={{
      display: "inline-block", fontSize: "11px", fontWeight: 500,
      background: s.bg, color: s.color,
      border: `0.5px solid ${s.border}`,
      borderRadius: "99px", padding: "2px 9px", whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
};

const LogoCard = ({ src, alt, href, height = 56 }) => (
  <div style={{
    border: "0.5px solid var(--dg-border)", borderRadius: "10px",
    padding: "20px 28px", background: "#fafcff",
    display: "flex", justifyContent: "center", alignItems: "center",
    marginBottom: "20px",
  }}>
    <a href={href} target="_blank" rel="noopener noreferrer">
      <img src={src} alt={alt} style={{ height, objectFit: "contain", display: "block" }} />
    </a>
  </div>
);

// ── GA4GH table ───────────────────────────────────────────────────
const GA4GHTable = () => (
  <div style={{ border: "0.5px solid var(--dg-border)", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "var(--dg-blue-bg)", borderBottom: "0.5px solid var(--dg-border)" }}>
            {["Technical standard", "Purpose", "Spec version", "Supported", "Implementation"].map(h => (
              <th key={h} style={{
                padding: "10px 14px", textAlign: "left",
                fontSize: "10px", fontWeight: 500,
                textTransform: "uppercase", letterSpacing: "0.07em",
                color: "var(--dg-text-muted)", whiteSpace: "nowrap",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ga4ghStandards.map((section, si) => (
            <React.Fragment key={si}>
              <tr style={{ background: "#f8fbff", borderBottom: "0.5px solid var(--dg-border)" }}>
                <td colSpan={5} style={{
                  padding: "8px 14px", fontSize: "11px", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.07em",
                  color: "var(--dg-blue)",
                }}>
                  {section.section}
                </td>
              </tr>
              {section.items.map((item, ii) => (
                <tr key={ii} style={{ borderBottom: "0.5px solid var(--dg-border)" }}
                  onMouseOver={e => e.currentTarget.style.background = "var(--dg-blue-bg)"}
                  onMouseOut={e => e.currentTarget.style.background = "#fff"}
                >
                  <td style={{ padding: "10px 14px", fontWeight: 500, color: "var(--dg-text)", verticalAlign: "top", minWidth: "180px" }}>{item.name}</td>
                  <td style={{ padding: "10px 14px", color: "var(--dg-text-muted)", verticalAlign: "top", maxWidth: "300px", lineHeight: 1.6 }}>{item.purpose}</td>
                  <td style={{ padding: "10px 14px", color: "var(--dg-text-muted)", verticalAlign: "top", whiteSpace: "nowrap" }}>{item.specificationVersion}</td>
                  <td style={{ padding: "10px 14px", color: "var(--dg-text-muted)", verticalAlign: "top", whiteSpace: "nowrap" }}>{item.supportedVersion}</td>
                  <td style={{ padding: "10px 14px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                    {typeof item.implementation === "string"
                      ? <StatusPill status={item.implementation} />
                      : item.implementation}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ── Main page ──────────────────────────────────────────────────────
function StandardsPage() {
  const [activeId, setActiveId] = useState("ga4gh");

  useEffect(() => {
    const allIds = sidebarSections.flatMap(s => s.items.map(i => i.id));
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); }); },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    allIds.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const scrollTo = id => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Layout>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "0", minHeight: "600px" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          borderRight: "0.5px solid var(--dg-border)", paddingTop: "4px",
          position: "sticky", top: "80px", alignSelf: "start",
          maxHeight: "calc(100vh - 100px)", overflowY: "auto",
        }}>
          {sidebarSections.map(section => (
            <div key={section.heading} style={{ marginBottom: "22px" }}>
              <div style={{
                fontSize: "10px", fontWeight: 500, textTransform: "uppercase",
                letterSpacing: "0.08em", color: "var(--dg-text-muted)",
                padding: "0 16px", marginBottom: "6px",
              }}>
                {section.heading}
              </div>
              {section.items.map(item => {
                const isActive = activeId === item.id;
                return (
                  <button key={item.id} onClick={() => scrollTo(item.id)} style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: isActive ? "var(--dg-blue-bg)" : "none", border: "none",
                    borderRight: isActive ? "2px solid var(--dg-blue)" : "2px solid transparent",
                    padding: "7px 16px", fontSize: "13px", fontFamily: "var(--dg-font)",
                    color: isActive ? "var(--dg-blue)" : "var(--dg-text-muted)",
                    fontWeight: isActive ? 500 : 400, cursor: "pointer", transition: "all 0.15s",
                  }}>
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* ── Content ── */}
        <article style={{ padding: "0 0 60px 48px" }}>

          {/* Page header */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "12px", color: "var(--dg-text-muted)", marginBottom: "10px" }}>
              Documentation › Standards
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "10px", lineHeight: 1.2 }}>
              Standards & Interoperability
            </h1>
            <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.7, maxWidth: "580px", margin: 0 }}>
              DenGen adopts international open standards to ensure genomic data is findable,
              accessible, interoperable, and reusable across clinical and research communities.
            </p>
            <div style={{ marginTop: "14px" }}>
              <Tag>GA4GH</Tag>
              <Tag>Bioschemas</Tag>
              <Tag>ELIXIR</Tag>
              <Tag>FAIR</Tag>
              <Tag>1+MG</Tag>
            </div>
            <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "24px 0 0" }} />
          </div>

          {/* ── GA4GH ── */}
          <SectionHeading id="ga4gh">GA4GH</SectionHeading>
          <LogoCard
            src="https://ega-archive.org/assets/img/GA-logo-horizontal-tag-RGB.svg"
            alt="GA4GH Logo"
            href="https://www.ga4gh.org/"
            height={64}
          />
          <Body>
            DenGen adopts international <ExternalLink href="https://www.ga4gh.org/">GA4GH</ExternalLink> standards
            to ensure interoperable, secure, and reproducible genomic data sharing for clinical and research use.
            The GA4GH framework covers the full data lifecycle — from raw read formats through variant representation,
            clinical phenotype exchange, and federated data discovery via the Beacon protocol.
          </Body>
          <GA4GHTable />

          {/* ── Bioschemas ── */}
          <SectionHeading id="bioschemas">Bioschemas</SectionHeading>
          <LogoCard
            src="https://bioschemas.org/images/square_logo2.png"
            alt="Bioschemas Logo"
            href="https://bioschemas.org/"
            height={56}
          />
          <Body>
            DenGen implements <ExternalLink href="https://bioschemas.org/">Bioschemas</ExternalLink> structured
            markup (JSON-LD) embedded in its web pages, enabling search engines, data catalogues, and FAIR
            aggregators to automatically discover and index DenGen datasets and tools. Bioschemas extends
            Schema.org with life-science-specific types such as <code style={{ fontSize: "12px", background: "var(--dg-blue-bg)", padding: "1px 5px", borderRadius: "3px", color: "var(--dg-blue)" }}>Dataset</code>,{" "}
            <code style={{ fontSize: "12px", background: "var(--dg-blue-bg)", padding: "1px 5px", borderRadius: "3px", color: "var(--dg-blue)" }}>DataCatalog</code>, and{" "}
            <code style={{ fontSize: "12px", background: "var(--dg-blue-bg)", padding: "1px 5px", borderRadius: "3px", color: "var(--dg-blue)" }}>ComputationalTool</code>.
          </Body>

          <div style={{ border: "0.5px solid var(--dg-border)", borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ background: "var(--dg-blue-bg)", borderBottom: "0.5px solid var(--dg-border)", padding: "10px 14px" }}>
              <span style={{ fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--dg-text-muted)" }}>
                Implemented markup types
              </span>
            </div>
            {bioschemasTypes.map((t, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "140px 80px 1fr",
                padding: "12px 14px", gap: "16px", alignItems: "start",
                borderBottom: i < bioschemasTypes.length - 1 ? "0.5px solid var(--dg-border)" : "none",
              }}>
                <code style={{ fontSize: "12.5px", color: "var(--dg-blue)", fontWeight: 500 }}>{t.type}</code>
                <div><StatusPill status={t.status} /></div>
                <div style={{ fontSize: "13px", color: "var(--dg-text-muted)", lineHeight: 1.65 }}>{t.description}</div>
              </div>
            ))}
          </div>

          {/* ── ELIXIR ── */}
          <SectionHeading id="elixir">ELIXIR / bio.tools</SectionHeading>
          <LogoCard
            src="https://elixir-europe.org/sites/default/files/images/logo-elixir-no-bg.png"
            alt="ELIXIR Logo"
            href="https://elixir-europe.org/"
            height={56}
          />
          <Body>
            DenGen is being registered in the <ExternalLink href="https://bio.tools">bio.tools</ExternalLink> registry,
            the ELIXIR catalogue of bioinformatics software and data resources. bio.tools registration
            makes DenGen tools discoverable through the ELIXIR ecosystem and links them to their Bioschemas
            markup, GA4GH standards compliance, and EDAM ontology annotations for function, topic, and data type.
          </Body>
          <div style={{
            border: "0.5px solid var(--dg-border)", borderRadius: "10px", overflow: "hidden", marginBottom: "20px",
          }}>
            {[
              { tool: "DenGen Allele Frequency Browser", edam: "Allele frequency, Population genomics", status: "Planned" },
              { tool: "DenGen Beacon",                   edam: "Variant discovery, GA4GH Beacon",       status: "Planned" },
              { tool: "DenGen Data Quality Portal",      edam: "Quality control, Sequencing QC",        status: "Planned" },
            ].map((r, i, arr) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 100px",
                padding: "12px 14px", gap: "16px", alignItems: "center",
                borderBottom: i < arr.length - 1 ? "0.5px solid var(--dg-border)" : "none",
                background: i % 2 === 0 ? "#fff" : "#fafcff",
              }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-text)" }}>{r.tool}</div>
                <div style={{ fontSize: "12px", color: "var(--dg-text-muted)" }}>{r.edam}</div>
                <StatusPill status={r.status} />
              </div>
            ))}
          </div>

          {/* ── FAIR ── */}
          <SectionHeading id="fair">FAIR Principles</SectionHeading>
          <Body>
            The <ExternalLink href="https://www.go-fair.org/fair-principles/">FAIR principles</ExternalLink> — Findable,
            Accessible, Interoperable, and Reusable — form the overarching framework guiding DenGen's data
            infrastructure. Bioschemas markup addresses Findability; the GA4GH Beacon and open APIs address
            Accessibility; VCF/BCF/CRAM formats and standard ontologies address Interoperability; and open
            data use terms address Reusability.
          </Body>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginBottom: "20px" }}>
            {[
              { letter: "F", word: "Findable",      desc: "Bioschemas JSON-LD metadata embedded in all pages. Indexed by search engines and data catalogues." },
              { letter: "A", word: "Accessible",    desc: "Open web APIs and GA4GH Beacon v2 endpoint. Data use terms clearly defined." },
              { letter: "I", word: "Interoperable", desc: "Standard file formats (VCF, BAM, CRAM). GA4GH and ELIXIR ontology annotations." },
              { letter: "R", word: "Reusable",      desc: "Clear provenance, GRCh38 reference, and open data use terms enabling downstream research." },
            ].map(f => (
              <div key={f.letter} style={{
                border: "0.5px solid var(--dg-border)", borderRadius: "10px", padding: "16px 18px",
                display: "flex", gap: "14px", alignItems: "flex-start",
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  background: "var(--dg-blue-bg)", border: "0.5px solid var(--dg-blue-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", fontWeight: 700, color: "var(--dg-blue)", flexShrink: 0,
                }}>
                  {f.letter}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "4px" }}>{f.word}</div>
                  <div style={{ fontSize: "12.5px", color: "var(--dg-text-muted)", lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── 1+MG ── */}
          <SectionHeading id="1mg">1+MG Initiative</SectionHeading>
          <Body>
            DenGen contributes to the European <ExternalLink href="https://1milliongenomes.eu/">1+ Million Genomes (1+MG)</ExternalLink> initiative,
            which aims to enable federated access to genomic and health data across EU member states.
            DenGen's adoption of GA4GH standards and the Beacon network positions it as a compatible
            node within the broader European genomics infrastructure, supporting cross-border research
            while maintaining compliance with Danish data protection regulations.
          </Body>
          <div style={{
            background: "var(--dg-blue-bg)", border: "0.5px solid var(--dg-blue-border)",
            borderLeft: "3px solid var(--dg-blue)", borderRadius: "0 8px 8px 0",
            padding: "12px 16px", fontSize: "13.5px", color: "#2a5070", lineHeight: 1.7, marginBottom: "20px",
          }}>
            DenGen's Beacon endpoint is designed to be compatible with the 1+MG Beacon network,
            enabling federated queries across participating European cohorts.
          </div>

          {/* ── GDI ── */}
          <SectionHeading id="gdi">GDI — Genomic Data Infrastructure</SectionHeading>
          <Body>
            The <ExternalLink href="https://gdi.onemilliongenomes.eu/">European Genomic Data Infrastructure (GDI)</ExternalLink> project
            (November 2022 – October 2026, co-funded by the EU Digital Europe Programme, €40M) is building a federated,
            secure infrastructure for accessing genomic and clinical data across 24 European countries.
            GDI directly implements the 1+MG vision through national nodes, GA4GH-compliant APIs, and the Beacon network.
            DenGen's alignment with GA4GH Beacon v2 and open data standards positions it as a compatible data resource
            within the emerging GDI ecosystem.
          </Body>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
            {[
              { label: "Launch", value: "Nov 2022" },
              { label: "Duration", value: "4 years" },
              { label: "Budget", value: "€40M" },
              { label: "Countries", value: "24" },
              { label: "Institutes", value: "70+" },
              { label: "Target deadline", value: "Oct 2026" },
            ].map((s, i) => (
              <div key={i} style={{
                border: "0.5px solid var(--dg-border)", borderRadius: "8px",
                padding: "14px 16px", background: "#fff",
              }}>
                <div style={{ fontSize: "11px", color: "var(--dg-text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: "18px", fontWeight: 500, color: "#0a3a5e" }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{
            background: "var(--dg-blue-bg)", border: "0.5px solid var(--dg-blue-border)",
            borderLeft: "3px solid var(--dg-blue)", borderRadius: "0 8px 8px 0",
            padding: "12px 16px", fontSize: "13.5px", color: "#2a5070", lineHeight: 1.7, marginBottom: "20px",
          }}>
            GDI uses GA4GH Beacon v2 as its primary discovery protocol. DenGen's Beacon endpoint is designed
            to be interoperable with GDI national nodes, enabling federated variant queries across participating
            European cohorts without transferring individual-level data.
          </div>

          {/* Footer nav */}
          <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "40px 0 20px" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Link to="/beacon" style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none" }}>
              ← Danish Beacon
            </Link>
            <Link to="/contact" style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none" }}>
              Contact →
            </Link>
          </div>

        </article>
      </div>
    </Layout>
  );
}

export default StandardsPage;