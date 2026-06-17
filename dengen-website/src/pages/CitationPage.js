import React, { useState } from "react";
import Layout from "./LayoutPage";
import { Link } from "react-router-dom";

const citations = [
  {
    style: "APA",
    text: `DenGen Research Team. (2025). DenGen: The Danish Genomic Database for Clinical and Research Applications. Available at https://www.dengen.dk`,
    copyText: `DenGen Research Team. (2025). DenGen: The Danish Genomic Database for Clinical and Research Applications. Available at https://www.dengen.dk`,
  },
  {
    style: "MLA",
    text: `DenGen Research Team. "DenGen: The Danish Genomic Database for Clinical and Research Applications." 2025. https://www.dengen.dk.`,
    copyText: `DenGen Research Team. "DenGen: The Danish Genomic Database for Clinical and Research Applications." 2025. https://www.dengen.dk.`,
  },
  {
    style: "Chicago",
    text: `DenGen Research Team. 2025. "DenGen: The Danish Genomic Database for Clinical and Research Applications." Accessed January 13, 2025. https://www.dengen.dk`,
    copyText: `DenGen Research Team. 2025. "DenGen: The Danish Genomic Database for Clinical and Research Applications." Accessed January 13, 2025. https://www.dengen.dk`,
  },
];

const bibtex = `@misc{denGen2025,
  author = {DenGen Research Team},
  title  = {DenGen: The Danish Genomic Database for Clinical and Research Applications},
  year   = {2025},
  url    = {https://www.dengen.dk}
}`;

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button onClick={copy} style={{
      background: "none",
      border: "0.5px solid var(--dg-border)",
      borderRadius: "4px", padding: "3px 10px",
      fontSize: "11px", fontFamily: "var(--dg-font)",
      color: copied ? "#2a7a2a" : "var(--dg-text-muted)",
      cursor: "pointer", transition: "color 0.2s",
      whiteSpace: "nowrap", flexShrink: 0,
    }}>
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
};

function CitationPage() {
  return (
    <Layout>
      <div style={{ maxWidth: "680px" }}>

        <div style={{ fontSize: "12px", color: "var(--dg-text-muted)", marginBottom: "10px" }}>
          Documentation › Citation
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "10px", lineHeight: 1.2 }}>
          Cite DenGen
        </h1>

        {/* How to Cite heading preserved */}
        <h2 style={{ fontSize: "16px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "10px", marginTop: "0" }}>
          How to Cite DenGen
        </h2>
        <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.8, margin: "0 0 28px" }}>
          A formal publication describing DenGen is forthcoming. In the meantime, we recommend the following provisional citation formats for acknowledging DenGen in your publications, presentations, or other academic work.
        </p>

        <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", marginBottom: "28px" }} />

        {/* APA / MLA / Chicago cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          {citations.map(c => (
            <div key={c.style} style={{
              border: "0.5px solid var(--dg-border)", borderRadius: "10px", overflow: "hidden",
            }}>
              <div style={{
                background: "var(--dg-blue-bg)", borderBottom: "0.5px solid var(--dg-blue-border)",
                padding: "10px 16px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--dg-blue)" }}>
                  {c.style} Style
                </span>
                <CopyButton text={c.copyText} />
              </div>
              <div style={{
                padding: "14px 16px",
                fontSize: "13.5px", color: "var(--dg-text-muted)", lineHeight: 1.8,
              }}>
                {c.text.includes("https://www.dengen.dk") ? (
                  <>
                    {c.text.split("https://www.dengen.dk")[0]}
                    <a href="https://www.dengen.dk" style={{ color: "var(--dg-blue)", textDecoration: "none", fontWeight: 500 }}>
                      https://www.dengen.dk
                    </a>
                    {c.text.split("https://www.dengen.dk")[1]}
                  </>
                ) : c.text}
              </div>
            </div>
          ))}
        </div>

        {/* BibTeX card */}
        <div style={{
          border: "0.5px solid var(--dg-border)", borderRadius: "10px",
          overflow: "hidden", marginBottom: "32px",
        }}>
          <div style={{
            background: "var(--dg-blue-bg)", borderBottom: "0.5px solid var(--dg-blue-border)",
            padding: "10px 16px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--dg-blue)" }}>
              BibTeX Style
            </span>
            <CopyButton text={bibtex} />
          </div>
          <pre style={{
            margin: 0, padding: "16px",
            fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace",
            fontSize: "12.5px", color: "var(--dg-text-muted)", lineHeight: 1.75,
            background: "#fafcff", overflowX: "auto",
          }}>
            {bibtex}
          </pre>
        </div>

        {/* Footer note */}
        <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.7, marginBottom: "32px" }}>
          For further information on how to cite or use DenGen, please{" "}
          <Link to="/contact" style={{ color: "var(--dg-blue)", textDecoration: "none", fontWeight: 500 }}>
            contact us
          </Link>.
        </p>

        <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", marginBottom: "20px" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link to="/data-access" style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none" }}>
            ← Data access
          </Link>
          <Link to="/contact" style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none" }}>
            Contact →
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default CitationPage;