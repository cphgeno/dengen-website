import React, { useEffect, useState } from "react";
import Layout from "./LayoutPage";
import { Link } from "react-router-dom";

// Animated DNA double helix SVG
const DNAHelix = () => (
  <svg width="120" height="160" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ margin: "0 auto", display: "block" }}>
    <style>{`
      @keyframes helix-drift { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      .helix-group { animation: helix-drift 3s ease-in-out infinite; transform-origin: center; }
    `}</style>
    <g className="helix-group">
      {/* Strand A */}
      <path d="M30 10 C60 30, 90 30, 90 50 C90 70, 30 70, 30 90 C30 110, 90 110, 90 130 C90 150, 60 150, 30 150"
        stroke="#1a6fa8" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Strand B */}
      <path d="M90 10 C60 30, 30 30, 30 50 C30 70, 90 70, 90 90 C90 110, 30 110, 30 130 C30 150, 60 150, 90 150"
        stroke="#1a6fa8" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.35" />
      {/* Rungs */}
      {[32, 50, 80, 100, 128].map((y, i) => (
        <line key={i} x1="32" y1={y} x2="88" y2={y}
          stroke="#1a6fa8" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
      ))}
      {/* Node dots */}
      {[
        [30, 10], [90, 10], [90, 50], [30, 50],
        [30, 90], [90, 90], [90, 130], [30, 130], [60, 150],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#daeeff" stroke="#1a6fa8" strokeWidth="1.5" />
      ))}
    </g>
    {/* 404 ghost nucleotide */}
    <circle cx="60" cy="80" r="10" fill="#f0f7ff" stroke="#cce0f5" strokeWidth="1.5"
      strokeDasharray="3 2" />
    <text x="60" y="84" textAnchor="middle" fontSize="9" fill="#1a6fa8" fontWeight="600">?</text>
  </svg>
);

function NotFoundPage() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 500);
    return () => clearInterval(t);
  }, []);

  return (
    <Layout>
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "60px 24px", textAlign: "center",
        minHeight: "480px",
      }}>

        {/* DNA illustration */}
        <DNAHelix />

        {/* 404 number */}
        <div style={{
          fontSize: "80px", fontWeight: 600, lineHeight: 1,
          color: "var(--dg-blue-bg)",
          letterSpacing: "-4px",
          marginTop: "24px",
          textShadow: "0 2px 0 var(--dg-blue-border)",
          userSelect: "none",
          position: "relative",
        }}>
          <span style={{ color: "var(--dg-blue-border)" }}>4</span>
          <span style={{ color: "var(--dg-blue)" }}>0</span>
          <span style={{ color: "var(--dg-blue-border)" }}>4</span>
        </div>

        {/* Message */}
        <h1 style={{
          fontSize: "22px", fontWeight: 500,
          color: "var(--dg-text)", marginTop: "16px", marginBottom: "8px",
        }}>
          Variant not found{dots}
        </h1>
        <p style={{
          fontSize: "14px", color: "var(--dg-text-muted)",
          lineHeight: 1.7, maxWidth: "380px", marginBottom: "8px",
        }}>
          This locus doesn't exist in our reference , or it may have been filtered,
          relocated, or never sequenced.
        </p>

        {/* Info box */}
        <div style={{
          background: "var(--dg-blue-bg)",
          border: "0.5px solid var(--dg-blue-border)",
          borderLeft: "3px solid var(--dg-blue)",
          borderRadius: "0 8px 8px 0",
          padding: "10px 16px",
          fontSize: "13px", color: "#2a5070",
          lineHeight: 1.6, maxWidth: "380px",
          margin: "16px 0 28px", textAlign: "left",
        }}>
          <strong style={{ color: "var(--dg-text)" }}>Error 404</strong> ; The requested
          page could not be found on this server. Please check the URL or navigate back home.
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

export default NotFoundPage;



