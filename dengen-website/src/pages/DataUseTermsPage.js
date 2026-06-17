import React, { useState, useEffect } from "react";
import Layout from "./LayoutPage";
import { Link } from "react-router-dom";

const sidebarSections = [
  {
    heading: "Terms of Use",
    items: [
      { id: "introduction",  label: "Introduction" },
      { id: "purpose",       label: "Purpose" },
      { id: "data-use",      label: "Data use & restrictions" },
      { id: "privacy",       label: "Privacy & data protection" },
      { id: "liability",     label: "Limitation of liability" },
      { id: "modifications", label: "Modifications" },
      { id: "governing-law", label: "Governing law" },
      { id: "contact",       label: "Contact information" },
    ],
  },
];

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

const Strong = ({ children }) => (
  <strong style={{ color: "var(--dg-text)", fontWeight: 500 }}>{children}</strong>
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

function DataUseTermsPage() {
  const [activeId, setActiveId] = useState("introduction");

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
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "12px", color: "var(--dg-text-muted)", marginBottom: "10px" }}>
              Documentation › Terms of Use
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "10px", lineHeight: 1.2 }}>
              Terms of Use
            </h1>
            <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.7, maxWidth: "580px", margin: 0 }}>
              Please read these terms carefully before accessing or using the DenGen Genome Aggregation Browser.
            </p>
            <div style={{ marginTop: "14px" }}>
              <Tag>Non-commercial use</Tag>
              <Tag>GDPR compliant</Tag>
              <Tag>Danish law</Tag>
            </div>
            <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "24px 0 0" }} />
          </div>

          <SectionHeading id="introduction">Introduction</SectionHeading>
          <Body>
            Welcome to the DenGen Genome Aggregation Browser. By accessing or using this platform, you agree to comply with the following terms and conditions. If you do not agree with any part of these terms, please refrain from using the platform.
          </Body>

          <SectionHeading id="purpose">Purpose</SectionHeading>
          <Body>
            The DenGen Genome Aggregation Browser is designed to make genomic datasets more findable and accessible, promoting collaboration, fostering new research, and increasing public benefit.
          </Body>

          <SectionHeading id="data-use">Data Use and Restrictions</SectionHeading>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            {[
              { title: "Non-Commercial Use", text: "The data provided is intended for academic and non-commercial research purposes only. Any commercial use requires explicit permission from DenGen." },
              { title: "Data Integrity", text: "Users must not attempt to re-identify individuals from the aggregated genomic data. Any such attempts are strictly prohibited." },
              { title: "Compliance with Laws", text: "Users are responsible for ensuring that their use of the data complies with all applicable laws and regulations, including Danish data protection laws." },
            ].map(item => (
              <div key={item.title} style={{
                border: "0.5px solid var(--dg-border)", borderRadius: "8px", padding: "14px 18px",
              }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "5px" }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.7 }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          <SectionHeading id="privacy">Privacy and Data Protection</SectionHeading>
          <Body>
            DenGen is committed to protecting the privacy of individuals. While the data is aggregated and anonymized, users must handle it responsibly and in accordance with the General Data Protection Regulation (GDPR).
          </Body>

          <SectionHeading id="liability">Limitation of Liability</SectionHeading>
          <Body>
            DenGen strives to provide accurate and up-to-date data but makes no warranties regarding the completeness or accuracy of the information. DenGen shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the platform or its data.
          </Body>

          <SectionHeading id="modifications">Modifications</SectionHeading>
          <Body>
            DenGen reserves the right to modify these terms at any time. Users are encouraged to review the terms periodically to stay informed of any changes.
          </Body>

          <SectionHeading id="governing-law">Governing Law</SectionHeading>
          <Body>
            These terms are governed by and construed in accordance with the laws of Denmark. Any disputes arising from these terms or the use of the DenGen Genome Aggregation Browser shall be subject to the exclusive jurisdiction of the Danish courts.
          </Body>

          <SectionHeading id="contact">Contact Information</SectionHeading>
          <Body>
            For questions or further information, please{" "}
            <Link to="/contact" style={{ color: "var(--dg-blue)", textDecoration: "none", fontWeight: 500 }}>
              contact us
            </Link>.
          </Body>

          <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "40px 0 20px" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Link to="/pipelines" style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none" }}>
              ← Pipelines
            </Link>
            <Link to="/data-access" style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none" }}>
              Data access →
            </Link>
          </div>
        </article>
      </div>
    </Layout>
  );
}

export default DataUseTermsPage;
