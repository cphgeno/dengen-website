import React, { useState, useEffect } from "react";
import Layout from "./LayoutPage";
import { Link } from "react-router-dom";

const sidebarSections = [
  {
    heading: "Overview",
    items: [
      { id: "what-is-dengen", label: "What is DenGen?" },
      { id: "mission",        label: "Our Mission" },
    ],
  },
  {
    heading: "Dataset",
    items: [
      { id: "dataset",     label: "The DenGen Dataset" },
      { id: "privacy",     label: "Privacy & pathogenic variants" },
      { id: "why-matters", label: "Why DenGen Matters" },
    ],
  },
  {
    heading: "Methods",
    items: [
      { id: "methodology", label: "Our Methodology" },
    ],
  },
  {
    heading: "Project",
    items: [
      { id: "acknowledgements", label: "Acknowledgements" },
      { id: "contact",          label: "Contact Us" },
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
        {item}
      </li>
    ))}
  </ul>
);

const InfoBox = ({ children }) => (
  <div style={{
    background: "var(--dg-blue-bg)",
    border: "0.5px solid var(--dg-blue-border)",
    borderLeft: "3px solid var(--dg-blue)",
    borderRadius: "0 8px 8px 0",
    padding: "12px 16px",
    fontSize: "14px", color: "#2a5070", lineHeight: 1.8,
    margin: "0 0 20px",
  }}>
    {children}
  </div>
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

function AboutPage() {
  const [activeId, setActiveId] = useState("what-is-dengen");

  useEffect(() => {
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

          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "12px", color: "var(--dg-text-muted)", marginBottom: "10px" }}>
              Documentation › About
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "10px", lineHeight: 1.2 }}>
              About DenGen
            </h1>
            <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.7, maxWidth: "580px", margin: 0 }}>
              DenGen (Danish Genomes) is a genomics initiative designed to provide a comprehensive resource for understanding the genetic diversity of the Danish population.
            </p>
            <div style={{ marginTop: "14px" }}>
              <Tag>Whole-genome sequencing</Tag>
              <Tag>GRCh38</Tag>
              <Tag>2,211 individuals</Tag>
              <Tag>Proof of concept</Tag>
            </div>
            <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "24px 0 0" }} />
          </div>

          {/* What is DenGen */}
          <SectionHeading id="what-is-dengen">What is DenGen?</SectionHeading>
          <Body>
            DenGen (Danish Genomes) is a genomics initiative designed to provide a comprehensive resource for understanding the genetic diversity of the Danish population. This proof-of-concept database, aims to advance clinical research, genetic diagnostics, and personalized medicine in Denmark. Our goal is to provide a valuable dataset of genomic variants, including Single Nucleotide Variants (SNVs) and Structural Variants (SVs), which will be freely accessible to researchers, clinicians, and the scientific community.
          </Body>

          {/* Mission */}
          <SectionHeading id="mission">Our Mission</SectionHeading>
          <Body>
            DenGen's mission is to map the genetic landscape of Denmark through large-scale whole-genome sequencing. By doing so, we aim to:
          </Body>
          <Ul items={[
            "Identify and catalog genetic variants that are specific to the Danish population.",
            "Provide a resource for improving the accuracy of genetic diagnostics and precision medicine in Denmark.",
            "Facilitate research on the genetic basis of diseases prevalent in the Danish population.",
            "Contribute to global genomics databases for comparative research and variant discovery.",
          ]} />

          {/* Dataset */}
          <SectionHeading id="dataset">The DenGen Dataset</SectionHeading>
          <Body>
            The initial DenGen dataset consists of high-quality whole-genome sequencing data from over 2,000 Danish individuals from patient diagnostics. The dataset is covering a spectrum of the Danish population, and have been filtered to minimise 1st and 2nd degree relations. The dataset includes both Single Nucleotide Variants and Structural Variants.
          </Body>

          {/* Privacy */}
          <SectionHeading id="privacy">Does the database contain person identifiable or pathogenic variants?</SectionHeading>
          <InfoBox>
            The dataset in the database is anonymized, and only variants occuring 5 or more times are displayed. Pathogenic variants are rare variants, and since filtering includes only common variants, potential pathogenic variants are excluded from the dataset.
          </InfoBox>

          {/* Why matters */}
          <SectionHeading id="why-matters">Why DenGen Matters</SectionHeading>
          <Body>
            With an increasing focus on personalized medicine and genomics-based healthcare, having a comprehensive understanding of the genetic variations in a given population is critical. DenGen fills this gap by providing data that can be used to:
          </Body>
          <Ul items={[
            "Enhance disease gene discovery by linking genetic variants with phenotypic traits.",
            "Improve the clinical relevance of genetic tests, enabling better diagnostic accuracy.",
            "Support epidemiological research into genetic risk factors for complex diseases.",
            "Facilitate drug development and clinical trials tailored to the genetic makeup of the Danish population.",
          ]} />

          {/* Methodology */}
          <SectionHeading id="methodology">Our Methodology</SectionHeading>
          <Body>
            DenGen uses state-of-the-art sequencing platforms and bioinformatics pipelines to process and analyze genomic data. Our process includes:
          </Body>
          <Ul items={[
            "Whole-genome sequencing on the Illumina NovaSeq 6000 platform with PCR-free library preparation.",
            "Bioinformatics pipelines for variant calling, including SNVs and structural variants, using tools like GATK, Delly, Manta, and CNVnator.",
            "Comprehensive quality control and annotation to ensure data accuracy and usability.",
            "Aggregation of variant frequencies specific to the Danish population to improve genetic analysis and filtering.",
          ]} />
          <Body>
            Learn more about the{" "}
            <Link to="/pipelines" style={{ color: "var(--dg-blue)", textDecoration: "none", fontWeight: 500 }}>
              DenGen Pipelines
            </Link>.
          </Body>

          {/* Acknowledgements */}
          <SectionHeading id="acknowledgements">Acknowledgements</SectionHeading>
          {[
            {
              org: "Danish National Genome Center (NGC)",
              text: "The NGC provided the computational infrastructure necessary for large-scale data processing, analysis, and long-term storage. This included secure high-performance computing resources and data hosting platforms that enabled efficient handling of the entire DenGen dataset.",
            },
            {
              org: "Broad Institute",
              text: "Valueable technical insights, academic discussions and general contribiutions to open source clinical bioinformatics software.",
            },
          ].map((ack) => (
            <div key={ack.org} style={{
              border: "0.5px solid var(--dg-border)", borderRadius: "8px",
              padding: "16px 18px", marginBottom: "10px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-text)", marginBottom: "5px" }}>
                {ack.org}
              </div>
              <div style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.7 }}>
                {ack.text}
              </div>
            </div>
          ))}

          {/* Contact */}
          <SectionHeading id="contact">Contact Us</SectionHeading>
          <Body>
            If you have questions, want to collaborate, or would like more information about DenGen, please visit our{" "}
            <Link to="/contact" style={{ color: "var(--dg-blue)", textDecoration: "none", fontWeight: 500 }}>
              Contact Page
            </Link>.
          </Body>

          <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "40px 0 20px" }} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Link to="/pipelines" style={{
              fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none",
            }}>
              Pipelines →
            </Link>
          </div>

        </article>
      </div>
    </Layout>
  );
}

export default AboutPage;


