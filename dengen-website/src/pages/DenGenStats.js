import React, { useState } from "react";
import Layout from "./LayoutPage";

// ── Data ──────────────────────────────────────────────────────────
const statGroups = [
  {
    heading: "Cohort",
    items: [
      { label: "Cohort Size",                                value: "2,916" },
      { label: "Unrelated Participants",                     value: "2,211" },
      { label: "Average Age",                                value: "41.8 years" },
      { label: "Gender Distribution",                        value: "47.3% XY" },
      { label: "Countries Represented",                      value: "Denmark" },
      { label: "Research Collaborators",                     value: "Rigshospitalet, Danish National Genome Center" },
    ],
  },
  {
    heading: "Variants",
    items: [
      { label: "SNP Variants Detected",                             value: "80,969,313" },
      { label: "INDEL Variants Detected",                           value: "18,366,910" },
      { label: "Avg. SNP Variants per Sample",                      value: "~4,000,000" },
      { label: "Avg. INDEL Variants per Sample",                    value: "~1,000,000" },
      { label: "Avg. Structural Variants per Sample",               value: "~5,000" },
    ],
  },
  {
    heading: "Sequencing",
    items: [
      { label: "Sequencing Platform",      value: "Illumina NovaSeq6000" },
      { label: "Library Preparation",      value: "Illumina DNA PCR-free (tagmentation) kit" },
      { label: "Sequencing Depth",         value: "52×+" },
      { label: "Variant Calling Reference",value: "GRCh38" },
      { label: "Sequencing Center",        value: "DGM" },
    ],
  },
  {
    heading: "Dataset",
    items: [
      { label: "Number of Files",  value: "13,266 files" },
      { label: "Dataset Size",     value: "303 TB" },
    ],
  },
];

const images = [
  { src: "dengen.png",                                    title: "Age and Gender Distribution" },
  { src: "sequencing_depth_histogram_with_density.png",  title: "Average Sequencing Depth" },
  { src: "dengen_maf_bcftools_v2.png",                   title: "Minor Allele Frequency" },
  { src: "dengen_variant_mean_depth_v2.png",             title: "Variant Mean Depth" },
  { src: "dengen_variant_mean_depth_individual_v2.png",  title: "Individual Mean Depth" },
  { src: "dengen_variant_quality_v2.png",                title: "Variant Quality" },
  { src: "dengen_variant_missingness_v2.png",            title: "Variant Missingness" },
  { src: "dengen_variant_missingness_individual_v2.png", title: "Variant Missingness Individual" },
  { src: "averages.png",                                 title: "Average SNV and INDEL per Sample" },
  { src: "histogram.png",                                title: "Distribution of SNV and INDEL per Sample" },
];

// ── Stat card ─────────────────────────────────────────────────────
const StatCard = ({ label, value }) => (
  <div style={{
    border: "0.5px solid var(--dg-border)",
    borderRadius: "8px",
    padding: "16px 18px",
    background: "#fff",
  }}>
    <div style={{ fontSize: "12px", color: "var(--dg-text-muted)", marginBottom: "6px" }}>
      {label}
    </div>
    <div style={{ fontSize: "20px", fontWeight: 500, color: "#0a3a5e", lineHeight: 1.2 }}>
      {value}
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────
const DenGenStats = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeGroup, setActiveGroup]             = useState("Cohort");

  const prevImage = () =>
    setCurrentImageIndex(i => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () =>
    setCurrentImageIndex(i => (i === images.length - 1 ? 0 : i + 1));

  const currentGroup = statGroups.find(g => g.heading === activeGroup);

  return (
    <Layout>

      {/* ── Page header ── */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "12px", color: "var(--dg-text-muted)", marginBottom: "10px" }}>
          DenGen › Cohort statistics
        </div>
        <h1 style={{
          fontSize: "28px", fontWeight: 500, color: "var(--dg-text)",
          marginBottom: "10px", lineHeight: 1.2,
        }}>
          DenGen in Numbers
        </h1>
        <p style={{ fontSize: "14px", color: "var(--dg-text-muted)", lineHeight: 1.7, margin: 0 }}>
          Key metrics from the DenGen whole-genome sequencing cohort.
        </p>
        <hr style={{ border: "none", borderTop: "0.5px solid var(--dg-border)", margin: "24px 0 0" }} />
      </div>

      {/* ── Tab strip ── */}
      <div style={{
        display: "flex", gap: "0",
        borderBottom: "0.5px solid var(--dg-border)",
        marginBottom: "24px",
      }}>
        {statGroups.map(g => {
          const active = activeGroup === g.heading;
          return (
            <button
              key={g.heading}
              onClick={() => setActiveGroup(g.heading)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--dg-font)",
                fontSize: "13px", fontWeight: active ? 500 : 400,
                color: active ? "var(--dg-blue)" : "var(--dg-text-muted)",
                padding: "8px 18px",
                borderBottom: active ? "2px solid var(--dg-blue)" : "2px solid transparent",
                marginBottom: "-1px",
                transition: "all 0.15s",
              }}
            >
              {g.heading}
            </button>
          );
        })}
      </div>

      {/* ── Stat grid for active tab ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px",
        marginBottom: "48px",
      }}>
        {currentGroup.items.map((item, i) => (
          <StatCard key={i} label={item.label} value={item.value} />
        ))}
      </div>

      {/* ── Image carousel ── */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{
          fontSize: "11px", fontWeight: 500,
          textTransform: "uppercase", letterSpacing: "0.08em",
          color: "var(--dg-text-muted)", marginBottom: "16px",
        }}>
          DenGen Statistics — {currentImageIndex + 1} / {images.length}
        </div>

        <div style={{
          border: "0.5px solid var(--dg-border)",
          borderRadius: "10px", overflow: "hidden", background: "#fff",
        }}>
          {/* Title bar */}
          <div style={{
            padding: "12px 18px",
            borderBottom: "0.5px solid var(--dg-border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--dg-text)" }}>
              {images[currentImageIndex].title}
            </span>
            {/* Dot indicators */}
            <div style={{ display: "flex", gap: "5px" }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  style={{
                    width: i === currentImageIndex ? "16px" : "6px",
                    height: "6px",
                    borderRadius: "99px",
                    background: i === currentImageIndex ? "var(--dg-blue)" : "var(--dg-border)",
                    border: "none", cursor: "pointer", padding: 0,
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Image */}
          <div style={{ position: "relative", padding: "24px" }}>
            <img
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].title}
              style={{
                display: "block", margin: "0 auto",
                maxWidth: "100%", maxHeight: "420px",
                borderRadius: "6px",
              }}
            />

            {/* Nav arrows */}
            {[
              { side: "left",  label: "←", fn: prevImage },
              { side: "right", label: "→", fn: nextImage },
            ].map(({ side, label, fn }) => (
              <button
                key={side}
                onClick={fn}
                style={{
                  position: "absolute",
                  [side]: "12px",
                  top: "50%", transform: "translateY(-50%)",
                  width: "34px", height: "34px", borderRadius: "50%",
                  background: "#fff",
                  border: "0.5px solid var(--dg-border)",
                  boxShadow: "0 2px 8px rgba(15,31,46,0.10)",
                  cursor: "pointer",
                  fontSize: "16px", color: "var(--dg-text)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color 0.15s",
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = "var(--dg-blue)"}
                onMouseOut={e => e.currentTarget.style.borderColor = "var(--dg-border)"}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

    </Layout>
  );
};

export default DenGenStats;
