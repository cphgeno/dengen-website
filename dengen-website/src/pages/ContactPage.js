import React from "react";
import Layout from "./LayoutPage";

function ContactPage() {
  return (
    <Layout>
      <div style={{ maxWidth: "560px" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: "12px", color: "var(--dg-text-muted)", marginBottom: "10px" }}>
          Documentation › Contact
        </div>

        <h1 style={{
          fontSize: "28px", fontWeight: 500, color: "var(--dg-text)",
          marginBottom: "10px", lineHeight: 1.2,
        }}>
          Contact Us
        </h1>
        <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.7, marginBottom: "32px" }}>
          For additional information about DenGen, please contact:
        </p>

        <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", marginBottom: "28px" }} />

        {/* Contact card */}
        <div style={{
          border: "0.5px solid var(--dg-border)",
          borderRadius: "10px",
          overflow: "hidden",
        }}>
          <div style={{
            background: "var(--dg-blue-bg)",
            borderBottom: "0.5px solid var(--dg-blue-border)",
            padding: "14px 20px",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <span style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "var(--dg-blue-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px",
            }}>✉️</span>
            <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--dg-text)" }}>
              DenGen support
            </span>
          </div>
          <div style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: "13px", color: "var(--dg-text-muted)", marginBottom: "8px" }}>
              Email
            </div>
            <a
              href="mailto:support@dengen.dk"
              style={{
                fontSize: "15px", fontWeight: 500,
                color: "var(--dg-blue)", textDecoration: "none",
              }}
            >
              support@dengen.dk
            </a>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default ContactPage;

