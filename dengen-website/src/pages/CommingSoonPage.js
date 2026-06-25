import React, { useEffect, useState } from "react";
import Layout from "./LayoutPage";
import { Link } from "react-router-dom";

// Animated sequence loader — looks like bases being read
const SequenceLoader = () => {
  const bases  = ["A", "T", "G", "C"];
  const colors = { A: "#1a6fa8", T: "#2a9d8f", G: "#e76f51", C: "#e9c46a" };
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % bases.length), 600);
    return () => clearInterval(t);
  }, []);

  const seq = ["A","T","G","C","G","A","T","C","G","A","A","T","G","C","T","A"];

  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap", maxWidth: "360px", margin: "0 auto" }}>
      {seq.map((base, i) => {
        const lit = i % bases.length === active;
        return (
          <div key={i} style={{
            width: "32px", height: "32px", borderRadius: "6px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 600,
            fontFamily: "ui-monospace, monospace",
            background: lit ? colors[base] : "var(--dg-blue-bg)",
            color: lit ? "#fff" : "var(--dg-text-muted)",
            border: `0.5px solid ${lit ? colors[base] : "var(--dg-blue-border)"}`,
            transition: "all 0.3s ease",
            transform: lit ? "scale(1.15)" : "scale(1)",
          }}>
            {base}
          </div>
        );
      })}
    </div>
  );
};

// Animated progress bar — pipeline stages
const stages = [
  { label: "Design",      done: true  },
  { label: "Development", done: true  },
  { label: "Testing",     done: false },
  { label: "Deployment",  done: false },
];

const Pipeline = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "0", maxWidth: "480px", margin: "0 auto" }}>
    {stages.map((s, i) => (
      <React.Fragment key={s.label}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: s.done ? "var(--dg-blue)" : "var(--dg-blue-bg)",
            border: `0.5px solid ${s.done ? "var(--dg-blue)" : "var(--dg-blue-border)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px",
          }}>
            {s.done ? (
              <span style={{ color: "#fff", fontWeight: 600 }}>✓</span>
            ) : (
              <span style={{ color: "var(--dg-text-muted)", fontSize: "10px" }}>○</span>
            )}
          </div>
          <div style={{
            fontSize: "11px", marginTop: "6px", fontWeight: s.done ? 500 : 400,
            color: s.done ? "var(--dg-blue)" : "var(--dg-text-muted)",
          }}>
            {s.label}
          </div>
        </div>
        {i < stages.length - 1 && (
          <div style={{
            flex: 2, height: "1px", marginBottom: "18px",
            background: stages[i + 1].done
              ? "var(--dg-blue)"
              : "linear-gradient(to right, var(--dg-blue) 50%, var(--dg-blue-border) 50%)",
          }} />
        )}
      </React.Fragment>
    ))}
  </div>
);

function ComingSoonPage() {
  return (
    <Layout>
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 24px", textAlign: "center",
        minHeight: "480px",
        fontFamily: "var(--dg-font)",
      }}>

        {/* Tag */}
        <span style={{
          display: "inline-block", fontSize: "11px", fontWeight: 500,
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: "var(--dg-blue)", background: "var(--dg-blue-light)",
          borderRadius: "99px", padding: "3px 12px", marginBottom: "28px",
        }}>
          In development
        </span>

        {/* Sequence animation */}
        <SequenceLoader />

        {/* Heading */}
        <h1 style={{
          fontSize: "32px", fontWeight: 500, color: "var(--dg-text)",
          marginTop: "32px", marginBottom: "12px", lineHeight: 1.2,
        }}>
          Coming Soon
        </h1>
        <p style={{
          fontSize: "15px", color: "var(--dg-text-muted)",
          lineHeight: 1.75, maxWidth: "440px", marginBottom: "12px",
        }}>
          We're working hard to bring you something exciting. A new feature will soon be available to explore and interact with DenGen data.
        </p>
        <p style={{
          fontSize: "13px", color: "var(--dg-text-muted)",
          fontStyle: "italic", marginBottom: "40px",
        }}>
          Thank you for your patience. Stay tuned for updates!
        </p>

        {/* Pipeline progress */}
        <div style={{
          width: "100%", maxWidth: "520px",
          border: "0.5px solid var(--dg-border)",
          borderRadius: "12px", padding: "24px 28px",
          background: "#fff", marginBottom: "36px",
        }}>
          <div style={{
            fontSize: "11px", fontWeight: 500, textTransform: "uppercase",
            letterSpacing: "0.08em", color: "var(--dg-text-muted)",
            marginBottom: "20px",
          }}>
            Development pipeline
          </div>
          <Pipeline />
        </div>

        {/* CTA */}
        <Link to="/" style={{
          background: "var(--dg-blue)", color: "#fff",
          fontSize: "13px", fontWeight: 500,
          padding: "10px 24px", borderRadius: "6px",
          textDecoration: "none", transition: "opacity 0.15s",
        }}
          onMouseOver={e => e.currentTarget.style.opacity = "0.88"}
          onMouseOut={e => e.currentTarget.style.opacity = "1"}
        >
          ← Back to DenGen home
        </Link>

      </div>
    </Layout>
  );
}

export default ComingSoonPage;

