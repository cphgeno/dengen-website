import React, { useState, useEffect } from "react";
import Layout from "./LayoutPage";
import { Link } from "react-router-dom";

const sidebarSections = [
  {
    heading: "Pipeline",
    items: [
      { id: "overview",        label: "Overview" },
      { id: "preprocessing",  label: "1. Data preprocessing" },
      { id: "alignment",      label: "2. Alignment" },
      { id: "variant-calling",label: "3. Variant calling" },
      { id: "annotation",     label: "4. Variant annotation" },
    ],
  },
];

const SectionHeading = ({ id, children }) => (
  <h2 id={id} style={{
    fontSize: "18px",
    fontWeight: 500,
    color: "var(--dg-text)",
    marginBottom: "10px",
    marginTop: "40px",
    scrollMarginTop: "80px",
  }}>
    {children}
  </h2>
);

const Body = ({ children }) => (
  <p style={{
    fontSize: "14px",
    color: "var(--dg-text-muted)",
    lineHeight: 1.8,
    margin: "0 0 16px",
  }}>
    {children}
  </p>
);

const Tag = ({ children }) => (
  <span style={{
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 500,
    background: "var(--dg-blue-light)",
    color: "var(--dg-blue)",
    border: "0.5px solid var(--dg-blue-border)",
    borderRadius: "99px",
    padding: "2px 9px",
    marginRight: "6px",
    marginBottom: "8px",
  }}>
    {children}
  </span>
);

const Strong = ({ children }) => (
  <strong style={{ color: "var(--dg-text)", fontWeight: 500 }}>{children}</strong>
);

const StepCard = ({ number, title, children }) => (
  <div id={`step-${number}`} style={{
    border: "0.5px solid var(--dg-border)",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "12px",
  }}>
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "14px 18px",
      borderBottom: "0.5px solid var(--dg-border)",
      background: "var(--dg-blue-bg)",
    }}>
      <span style={{
        width: "26px", height: "26px", borderRadius: "50%",
        background: "var(--dg-blue)",
        color: "#fff",
        fontSize: "12px", fontWeight: 500,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {number}
      </span>
      <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--dg-text)" }}>
        {title}
      </span>
    </div>
    <div style={{ padding: "16px 18px", fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.8 }}>
      {children}
    </div>
  </div>
);

function PipelinesPage() {
  const [activeId, setActiveId] = useState("overview");

  useEffect(() => {
    const allIds = sidebarSections.flatMap(s => s.items.map(i => i.id));
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    allIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
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
          position: "sticky",
          top: "80px",
          alignSelf: "start",
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
        }}>
          {sidebarSections.map((section) => (
            <div key={section.heading} style={{ marginBottom: "22px" }}>
              <div style={{
                fontSize: "10px", fontWeight: 500,
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: "var(--dg-text-muted)",
                padding: "0 16px", marginBottom: "6px",
              }}>
                {section.heading}
              </div>
              {section.items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      background: isActive ? "var(--dg-blue-bg)" : "none",
                      border: "none",
                      borderRight: isActive ? "2px solid var(--dg-blue)" : "2px solid transparent",
                      padding: "7px 16px",
                      fontSize: "13px", fontFamily: "var(--dg-font)",
                      color: isActive ? "var(--dg-blue)" : "var(--dg-text-muted)",
                      fontWeight: isActive ? 500 : 400,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
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
              Documentation › Pipelines
            </div>
            <h1 style={{
              fontSize: "28px", fontWeight: 500,
              color: "var(--dg-text)", marginBottom: "10px", lineHeight: 1.2,
            }}>
              DenGen Bioinformatics Pipeline
            </h1>
            <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.7, maxWidth: "580px", margin: 0 }}>
              End-to-end processing of clinical whole-genome sequencing data into a population-wide
              variant frequency resource for Denmark.
            </p>
            <div style={{ marginTop: "14px" }}>
              <Tag>Illumina NovaSeq 6000</Tag>
              <Tag>GATK HaplotypeCaller</Tag>
              <Tag>BWA / Sentieon</Tag>
              <Tag>GRCh38</Tag>
              <Tag>2,916 individuals</Tag>
              <Tag>52× avg depth</Tag>
            </div>
            <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "24px 0 0" }} />
          </div>

          {/* ── Intro ── */}
          <div id="overview" style={{ scrollMarginTop: "80px" }}>
            <Body>
              To generate a population-wide variant frequency resource for Denmark, we analyzed whole-genome sequencing (WGS) data from 2,916 individuals obtained through routine clinical pipelines. Sequencing was performed using paired-end reads on an Illumina NovaSeq6000 platform with the Illumina DNA PCR-free (tagmentation) kit, achieving an average read depth of at least 52X per sample.
            </Body>
            <Body>
              High-quality variant discovery and filtering were performed using a standardized in-house bioinformatics pipeline optimized for both single-nucleotide variants (SNVs) and structural variants (SVs). SNVs were identified using GATK's HaplotypeCaller, providing sensitive and accurate detection. Structural variants, including copy-number variants (CNVs), were detected using a consensus approach that integrates multiple SV callers, CNVnator, Delly, Lumpy, and Manta to enhance robustness and mitigate the limitations of individual tools.
            </Body>
          </div>

          <SectionHeading id="overview-steps">Overview</SectionHeading>
          <Body>
            The DenGen pipeline follows a systematic multi-step process to transform raw sequencing data into a reliable set of annotated variants:
          </Body>

          {/* ── Step cards ── */}
          <div style={{ marginTop: "20px" }}>

            <div id="preprocessing" style={{ scrollMarginTop: "80px" }}>
              <StepCard number="1" title="Data Preprocessing">
                Raw sequencing data generated by the <Strong>Illumina NovaSeq 6000</Strong> system are demultiplexed using <Strong>bcl2fastq</Strong>, and quality metrics are assessed to ensure each sample has sufficient reads for downstream analysis. Subsequently, FASTQ files are trimmed with <Strong>bbduk</Strong> to remove adapter sequences and low-quality bases.
              </StepCard>
            </div>

            <div id="alignment" style={{ scrollMarginTop: "80px" }}>
              <StepCard number="2" title="Alignment">
                Trimmed reads are aligned to the human reference genome using the <Strong>Sentieon implementation of the Burrows-Wheeler Aligner (BWA)</Strong>, configured for paired-end sequencing data. This step ensures accurate placement of reads within the genome. Alignment quality is assessed using metrics such as median coverage, and only samples achieving a minimum median coverage of 30× are retained for downstream analyses.
              </StepCard>
            </div>

            <div id="variant-calling" style={{ scrollMarginTop: "80px" }}>
              <StepCard number="3" title="Variant Calling">
                Variant detection is performed using the <Strong>GATK HaplotypeCaller</Strong> for SNVs, providing high sensitivity and accuracy. For structural variants, a consensus approach combining tools such as <Strong>CNVnator</Strong>, <Strong>Delly</Strong>, <Strong>Lumpy</Strong>, and <Strong>Manta</Strong> is employed to detect copy number variations (CNVs) and SVs.
              </StepCard>
            </div>

            <div id="annotation" style={{ scrollMarginTop: "80px" }}>
              <StepCard number="4" title="Variant Annotation">
                Once variants are called, they are annotated with information such as functional impact, allele frequency, and related clinical information using tools like <Strong>VEP (Variant Effect Predictor)</Strong>.
              </StepCard>
            </div>

          </div>

          {/* Page nav footer */}
          <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "40px 0 20px" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Link to="/about" style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "13px", fontWeight: 500, color: "var(--dg-blue)", textDecoration: "none",
            }}>
              ← About DenGen
            </Link>
            <Link to="/data-use-terms" style={{
              display: "flex", alignItems: "center", gap: "6px",
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

export default PipelinesPage;
