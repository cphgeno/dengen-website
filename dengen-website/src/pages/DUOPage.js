import React from "react";
import Layout from "./LayoutPage";
import { Link } from "react-router-dom";

// ── DUO codes applied to DenGen ────────────────────────────────────
const dengenDUO = [
  {
    code: "DUO:0000042",
    shorthand: "GRU",
    label: "General Research Use",
    description: "Use is allowed for general research use for any research purpose.",
    rationale: "DenGen is a population-scale allele frequency resource intended for broad biomedical research use. Variant frequencies may be queried and used freely for any health-related research purpose.",
    color: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" },
  },
  {
    code: "DUO:0000046",
    shorthand: "NCU",
    label: "Non-Commercial Use Only",
    description: "Use of the data is limited to non-profit use.",
    rationale: "Consistent with DenGen's Terms of Use, commercial applications of the data require explicit written permission from the Department of Genomic Medicine, Rigshospitalet.",
    color: { bg: "#faf5ff", border: "#e9d5ff", text: "#6b21a8" },
  },
  {
    code: "DUO:0000019",
    shorthand: "PUB",
    label: "Publication Required",
    description: "Requestor agrees to make results of studies using the data available to the larger scientific community.",
    rationale: "Any published work using DenGen data must cite DenGen as the source. See the Citation page for recommended citation formats.",
    color: { bg: "var(--dg-blue-bg)", border: "var(--dg-blue-border)", text: "var(--dg-blue)" },
  },
  {
    code: "DUO:0000021",
    shorthand: "IRB",
    label: "Ethics Approval Required",
    description: "Requestor must provide documentation of local IRB/ERB approval.",
    rationale: "DenGen data originates from clinical whole-genome sequencing of Danish patients. Users intending to use DenGen data in studies involving human subjects must hold local ethics committee approval.",
    color: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412" },
  },
];

const ExternalLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    style={{ color: "var(--dg-blue)", textDecoration: "none", fontWeight: 500 }}>
    {children}
  </a>
);

const Body = ({ children }) => (
  <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.8, margin: "0 0 16px" }}>
    {children}
  </p>
);

function DUOPage() {
  return (
    <Layout>
      <div style={{ maxWidth: "720px" }}>

        {/* ── Breadcrumb ── */}
        <div style={{ fontSize: "12px", color: "var(--dg-text-muted)", marginBottom: "10px" }}>
          Documentation › Standards › Data Use Ontology
        </div>

        {/* ── Header ── */}
        <h1 style={{ fontSize: "28px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "10px", lineHeight: 1.2 }}>
          Data Use Ontology
        </h1>
        <Body>
          DenGen implements the <ExternalLink href="https://www.ga4gh.org/product/data-use-ontology-duo/">GA4GH Data Use Ontology (DUO)</ExternalLink> to
          machine-readably declare the conditions under which its data may be used.
          All DenGen samples carry the same set of DUO codes listed below.
        </Body>
        <Body>
          DUO codes enable automated data discovery and access control across federated genomic
          infrastructures including the <ExternalLink href="https://gdi.onemilliongenomes.eu/">GDI</ExternalLink> and{" "}
          <ExternalLink href="https://beacon-project.io/">Beacon network</ExternalLink>.
          They are displayed here for transparency and to assist researchers in assessing
          whether DenGen data is appropriate for their intended use.
        </Body>

        <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "20px 0 28px" }} />

        {/* ── DUO code cards ── */}
        <div style={{
          fontSize: "11px", fontWeight: 500, textTransform: "uppercase",
          letterSpacing: "0.08em", color: "var(--dg-text-muted)", marginBottom: "14px",
        }}>
          Applied DUO codes — all samples
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
          {dengenDUO.map((duo) => (
            <div key={duo.code} style={{
              border: `0.5px solid ${duo.color.border}`,
              borderLeft: `3px solid ${duo.color.text}`,
              borderRadius: "0 10px 10px 0",
              overflow: "hidden",
            }}>
              {/* Card header */}
              <div style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "12px 18px",
                background: duo.color.bg,
                borderBottom: `0.5px solid ${duo.color.border}`,
              }}>
                <span style={{
                  fontSize: "11px", fontWeight: 600, fontFamily: "ui-monospace, monospace",
                  color: duo.color.text,
                  background: "#fff",
                  border: `0.5px solid ${duo.color.border}`,
                  borderRadius: "4px", padding: "2px 8px",
                  whiteSpace: "nowrap",
                }}>
                  {duo.code}
                </span>
                <span style={{
                  fontSize: "12px", fontWeight: 600,
                  color: duo.color.text,
                  background: "#fff",
                  border: `0.5px solid ${duo.color.border}`,
                  borderRadius: "99px", padding: "2px 9px",
                }}>
                  {duo.shorthand}
                </span>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--dg-text)" }}>
                  {duo.label}
                </span>
              </div>

              {/* Card body */}
              <div style={{ padding: "14px 18px", background: "#fff" }}>
                <div style={{ fontSize: "13px", color: "var(--dg-text-muted)", lineHeight: 1.7, marginBottom: "10px" }}>
                  <strong style={{ color: "var(--dg-text)", fontWeight: 500 }}>Definition: </strong>
                  {duo.description}
                </div>
                <div style={{
                  fontSize: "13px", color: "var(--dg-text-muted)", lineHeight: 1.7,
                  paddingTop: "10px",
                  borderTop: "0.5px solid var(--dg-border)",
                }}>
                  <strong style={{ color: "var(--dg-text)", fontWeight: 500 }}>DenGen: </strong>
                  {duo.rationale}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Summary table ── */}
        <div style={{
          fontSize: "11px", fontWeight: 500, textTransform: "uppercase",
          letterSpacing: "0.08em", color: "var(--dg-text-muted)", marginBottom: "14px",
        }}>
          Summary
        </div>
        <div style={{ border: "0.5px solid var(--dg-border)", borderRadius: "10px", overflow: "hidden", marginBottom: "32px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "var(--dg-blue-bg)", borderBottom: "0.5px solid var(--dg-border)" }}>
                {["Code", "Shorthand", "Label", "Type"].map(h => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left",
                    fontSize: "10px", fontWeight: 500,
                    textTransform: "uppercase", letterSpacing: "0.07em",
                    color: "var(--dg-text-muted)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dengenDUO.map((duo, i) => (
                <tr key={duo.code} style={{
                  borderBottom: i < dengenDUO.length - 1 ? "0.5px solid var(--dg-border)" : "none",
                  background: i % 2 === 0 ? "#fff" : "#fafcff",
                }}>
                  <td style={{ padding: "10px 14px", fontFamily: "ui-monospace, monospace", fontSize: "12px", color: "var(--dg-text)", whiteSpace: "nowrap" }}>
                    {duo.code}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 600,
                      color: duo.color.text, background: duo.color.bg,
                      border: `0.5px solid ${duo.color.border}`,
                      borderRadius: "99px", padding: "2px 8px",
                    }}>
                      {duo.shorthand}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "var(--dg-text)", fontWeight: 500, fontSize: "13px" }}>{duo.label}</td>
                  <td style={{ padding: "10px 14px", color: "var(--dg-text-muted)", fontSize: "12px" }}>
                    {["GRU", "NCU"].includes(duo.shorthand) ? "Permission" : "Modifier"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Footer note ── */}
        <div style={{
          background: "var(--dg-blue-bg)", border: "0.5px solid var(--dg-blue-border)",
          borderLeft: "3px solid var(--dg-blue)", borderRadius: "0 8px 8px 0",
          padding: "12px 16px", fontSize: "13.5px", color: "#2a5070",
          lineHeight: 1.7, marginBottom: "32px",
        }}>
          DUO codes are subject to review as DenGen evolves. For questions about data use conditions
          or to request access for commercial use, please <Link to="/contact" style={{ color: "var(--dg-blue)", fontWeight: 500, textDecoration: "none" }}>contact us</Link>.
          Full terms are available on the <Link to="/data-use-terms" style={{ color: "var(--dg-blue)", fontWeight: 500, textDecoration: "none" }}>Data Use Terms</Link> page.
        </div>

        {/* ── Page nav ── */}
        <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", marginBottom: "20px" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link to="/standards" style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none" }}>
            ← Standards
          </Link>
          <Link to="/data-use-terms" style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none" }}>
            Data use terms →
          </Link>
        </div>

      </div>
    </Layout>
  );
}

export default DUOPage;
