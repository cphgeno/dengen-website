import React from "react";
import Layout from "./LayoutPage";
import config from '../config';
import { Link } from "react-router-dom";

const sidebarSections = [
  {
    heading: "Beacon",
    items: [
      { id: "what-is-beacon",     label: "What is GA4GH Beacon?" },
      { id: "implementation",     label: "DenGen's implementation" },
      { id: "national-beacon",    label: "Beyond DenGen" },
      { id: "how-to-use",         label: "How to use" },
      { id: "api",                label: "API endpoints" },
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

const SubHeading = ({ id, children }) => (
  <h3 id={id} style={{
    fontSize: "15px", fontWeight: 500, color: "var(--dg-text)",
    marginBottom: "8px", marginTop: "28px", scrollMarginTop: "80px",
  }}>
    {children}
  </h3>
);

const Body = ({ children }) => (
  <p style={{
    fontSize: "14px", color: "var(--dg-text-muted)",
    lineHeight: 1.8, margin: "0 0 16px",
  }}>
    {children}
  </p>
);

const Ul = ({ items }) => (
  <ul style={{ margin: "0 0 20px", paddingLeft: "0", listStyle: "none" }}>
    {items.map((item, i) => (
      <li key={i} style={{
        display: "flex", gap: "10px",
        fontSize: "14px", color: "var(--dg-text-muted)",
        lineHeight: 1.7, padding: "6px 0",
        borderBottom: "0.5px solid var(--dg-border)",
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

const Strong = ({ children }) => (
  <strong style={{ color: "var(--dg-text)", fontWeight: 500 }}>{children}</strong>
);

const ExternalLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    style={{ color: "var(--dg-blue)", textDecoration: "none", fontWeight: 500 }}>
    {children}
  </a>
);

function BeaconPage() {
  const [activeId, setActiveId] = React.useState("what-is-beacon");

  React.useEffect(() => {
    const allIds = sidebarSections.flatMap(s => s.items.map(i => i.id));
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); }); },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    allIds.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Layout>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "0", minHeight: "600px" }}>

        {/* ── Sidebar ── */}
        <aside style={{
          borderRight: "0.5px solid var(--dg-border)",
          paddingTop: "4px",
          position: "sticky", top: "80px", alignSelf: "start",
          maxHeight: "calc(100vh - 100px)", overflowY: "auto",
        }}>
          {sidebarSections.map((section) => (
            <div key={section.heading} style={{ marginBottom: "22px" }}>
              <div style={{
                fontSize: "10px", fontWeight: 500,
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: "var(--dg-text-muted)", padding: "0 16px", marginBottom: "6px",
              }}>
                {section.heading}
              </div>
              {section.items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <button key={item.id} onClick={() => scrollTo(item.id)} style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: isActive ? "var(--dg-blue-bg)" : "none",
                    border: "none",
                    borderRight: isActive ? "2px solid var(--dg-blue)" : "2px solid transparent",
                    padding: "7px 16px", fontSize: "13px", fontFamily: "var(--dg-font)",
                    color: isActive ? "var(--dg-blue)" : "var(--dg-text-muted)",
                    fontWeight: isActive ? 500 : 400,
                    cursor: "pointer", transition: "all 0.15s",
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
              Documentation › Beacon
            </div>
            <h1 style={{
              fontSize: "28px", fontWeight: 500, color: "var(--dg-text)",
              marginBottom: "10px", lineHeight: 1.2,
            }}>
              DenGen Beacon: A Gateway to Danish Genomic Data
            </h1>
            <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.7, maxWidth: "580px", margin: 0 }}>
              Privacy-preserving discovery of genomic variants in the Danish population through the GA4GH Beacon protocol.
            </p>
            <div style={{ marginTop: "14px" }}>
              <Tag>GA4GH Beacon v2</Tag>
              <Tag>2,211 individuals</Tag>
              <Tag>GRCh38</Tag>
              <Tag>National initiative</Tag>
            </div>
            <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "24px 0 0" }} />
          </div>

          {/* ── What is GA4GH Beacon ── */}
          <SectionHeading id="what-is-beacon">What is the GA4GH Beacon Protocol?</SectionHeading>

          {/* GA4GH logo card */}
          <div style={{
            border: "0.5px solid var(--dg-border)", borderRadius: "10px",
            padding: "20px", marginBottom: "20px",
            display: "flex", justifyContent: "center", alignItems: "center",
            background: "#fafcff",
          }}>
            <img
              src="https://ega-archive.org/assets/img/GA-logo-horizontal-tag-RGB.svg"
              alt="GA4GH Logo"
              style={{ height: "80px", objectFit: "contain" }}
            />
          </div>

          <Body>
            The <ExternalLink href="https://www.ga4gh.org/">Global Alliance for Genomics and Health (GA4GH)</ExternalLink> Beacon API Beacon Protocol is a standardized framework designed to facilitate the discovery of genomic data. It allows researchers to query genomic datasets to determine whether a dataset contains specific genetic variants of interest, all while maintaining privacy and security.
          </Body>
          <Body>
            Read more about the <ExternalLink href="https://www.ga4gh.org/product/beacon-api/">GA4GH Beacon API</ExternalLink>.
          </Body>

          {/* ── Implementation ── */}
          <SectionHeading id="implementation">DenGen's Beacon Implementation</SectionHeading>
          <Body>
            DenGen's Beacon is built upon the GA4GH Beacon reference implementation, ensuring compatibility with international standards. This powerful tool allows researchers to:
          </Body>
          <Ul items={[
            "Explore aggregated genetic variant frequencies.",
            "Filter and analyze common and rare variants within the Danish population.",
            "Connect with global genomic data resources for comparative analyses.",
          ]} />

          {/* ── National Beacon ── */}
          <SectionHeading id="national-beacon">Beyond DenGen: A National Beacon</SectionHeading>
          <Body>
            While the DenGen Beacon hosts data from the DenGen project, it also serves as a foundation for a broader Danish Beacon initiative. This ambitious effort aims to:
          </Body>
          <Ul items={[
            <><Strong>Expand Data Coverage:</Strong> Host genomic data from up to 60,000 individuals, creating one of the most comprehensive national genomic databases.</>,
            <><Strong>Facilitate Research:</Strong> Provide an essential resource for genomic research, personalized medicine, and population health studies.</>,
            <><Strong>Enhance Collaboration:</Strong> Foster international collaboration by connecting with other GA4GH-compliant beacons worldwide.</>,
          ]} />

          {/* ── How to use ── */}
          <SectionHeading id="how-to-use">How to Use the DenGen Beacon</SectionHeading>
          <Body>
            Users can access the DenGen Beacon through an intuitive interface designed for ease of use.
          </Body>

          {/* CTA card */}
          <div style={{
            border: "0.5px solid var(--dg-blue-border)",
            borderRadius: "10px",
            background: "var(--dg-blue-bg)",
            padding: "20px 24px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "4px" }}>
                DenGen Beacon Interface
              </div>
              <div style={{ fontSize: "13px", color: "var(--dg-text-muted)" }}>
                Query Danish genomic data using the Beacon v2 protocol
              </div>
            </div>
            <a
              href={config.BEACON_UI}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: "var(--dg-blue)", color: "#fff",
                fontSize: "13px", fontWeight: 500,
                padding: "9px 20px", borderRadius: "6px",
                textDecoration: "none", whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "opacity 0.15s",
              }}
              onMouseOver={e => e.currentTarget.style.opacity = "0.88"}
              onMouseOut={e => e.currentTarget.style.opacity = "1"}
            >
              Access the DenGen Beacon Interface
            </a>
          </div>

          {/* ── API ── */}
          <SubHeading id="api">API Endpoints</SubHeading>
          <Body>
            The DenGen Beacon API provides programmatic access to genomic variant queries. You can access the API at:
          </Body>

          {/* Code block */}
          <div style={{
            background: "var(--dg-blue-bg)",
            border: "0.5px solid var(--dg-blue-border)",
            borderRadius: "8px",
            padding: "14px 18px",
            fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace",
            fontSize: "13px",
            color: "var(--dg-blue)",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}>
            <span>http://beacon.dengen.dk</span>
            <button
              onClick={() => navigator.clipboard.writeText("http://beacon.dengen.dk")}
              title="Copy to clipboard"
              style={{
                background: "none", border: "0.5px solid var(--dg-blue-border)",
                borderRadius: "4px", padding: "3px 8px",
                fontSize: "11px", color: "var(--dg-blue)", cursor: "pointer",
                fontFamily: "var(--dg-font)",
              }}
            >
              Copy
            </button>
          </div>

          <Body>
            For detailed API documentation and query parameters, please refer to the{" "}
            <ExternalLink href="https://docs.genomebeacons.org/">GA4GH Beacon v2 Specification</ExternalLink>.
          </Body>

          {/* Page nav footer */}
          <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "40px 0 20px" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Link to="/pipelines" style={{
              fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none",
            }}>
              ← Pipelines
            </Link>
            <Link to="/data-use-terms" style={{
              fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none",
            }}>
              Data use terms →
            </Link>
          </div>

        </article>
      </div>
    </Layout>
  );
}

export default BeaconPage;
