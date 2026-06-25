import React from "react";
import Layout from "./LayoutPage";
import { Link } from "react-router-dom";

function DataAccessPage() {
  return (
    <Layout>
      <div style={{ maxWidth: "600px" }}>

        <div style={{ fontSize: "12px", color: "var(--dg-text-muted)", marginBottom: "10px" }}>
          Documentation › Data access
        </div>
        <h1 style={{ fontSize: "28px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "10px", lineHeight: 1.2 }}>
          Access DenGen Data
        </h1>
        <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.7, margin: "0 0 28px" }}>
          Information on how to access DenGen genomic data for research purposes.
        </p>

        <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", marginBottom: "32px" }} />

        {/* Overview card */}
        <div style={{
          border: "0.5px solid var(--dg-border)", borderRadius: "10px",
          overflow: "hidden", marginBottom: "16px",
        }}>
          <div style={{
            background: "var(--dg-blue-bg)", borderBottom: "0.5px solid var(--dg-blue-border)",
            padding: "12px 18px",
            fontSize: "11px", fontWeight: 500, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "var(--dg-blue)",
          }}>
            Overview
          </div>
          <div style={{ padding: "18px", fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.8 }}>
            Due to privacy and ethical considerations, no summary or individual-level data are directly available for download from this site.
          </div>
        </div>

        {/* Contact card */}
        <div style={{
          border: "0.5px solid var(--dg-border)", borderRadius: "10px",
          overflow: "hidden", marginBottom: "40px",
        }}>
          <div style={{
            background: "var(--dg-blue-bg)", borderBottom: "0.5px solid var(--dg-blue-border)",
            padding: "12px 18px",
            fontSize: "11px", fontWeight: 500, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "var(--dg-blue)",
          }}>
            Contact Information
          </div>
          <div style={{ padding: "18px", fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.8 }}>
            For questions or further information, please{" "}
            <Link to="/contact" style={{ color: "var(--dg-blue)", textDecoration: "none", fontWeight: 500 }}>
              contact us
            </Link>.
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", marginBottom: "20px" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link to="/data-use-terms" style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none" }}>
            ← Data use terms
          </Link>
          <Link to="/citation" style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none" }}>
            Citation →
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default DataAccessPage;




