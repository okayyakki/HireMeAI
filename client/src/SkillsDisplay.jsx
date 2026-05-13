import React, { useState, useEffect, useMemo } from "react";

const CATEGORIES = {
  programmingLanguages: {
    label: "Programming Languages",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    glow: "rgba(99,102,241,0.3)",
    lightBg: "rgba(99,102,241,0.06)",
    tagColor: "#818cf8",
    tagBg: "rgba(129,140,248,0.1)",
    tagBorder: "rgba(129,140,248,0.2)",
  },
  frameworks: {
    label: "Frameworks & Libraries",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, #10b981, #34d399)",
    glow: "rgba(16,185,129,0.3)",
    lightBg: "rgba(16,185,129,0.06)",
    tagColor: "#34d399",
    tagBg: "rgba(52,211,153,0.1)",
    tagBorder: "rgba(52,211,153,0.2)",
  },
  databases: {
    label: "Databases & Data Stores",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    glow: "rgba(245,158,11,0.3)",
    lightBg: "rgba(245,158,11,0.06)",
    tagColor: "#fbbf24",
    tagBg: "rgba(251,191,36,0.1)",
    tagBorder: "rgba(251,191,36,0.2)",
  },
  tools: {
    label: "Tools & Platforms",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    glow: "rgba(139,92,246,0.3)",
    lightBg: "rgba(139,92,246,0.06)",
    tagColor: "#a78bfa",
    tagBg: "rgba(167,139,250,0.1)",
    tagBorder: "rgba(167,139,250,0.2)",
  },
};

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  card: {
    background: "var(--card-bg)",
    border: "1px solid var(--card-border)",
    borderRadius: "18px",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: "skillCardIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) both",
    cursor: "default",
  },
  cardHovered: {
    transform: "translateY(-3px)",
    boxShadow: "var(--shadow-md)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "14px",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  iconBox: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconBoxSvg: {
    width: "18px",
    height: "18px",
    color: "white",
  },
  categoryName: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
  },
  countBadge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: "8px",
    flexShrink: 0,
  },
  tagWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    minHeight: "28px",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "5px 12px",
    borderRadius: "9px",
    fontSize: "0.75rem",
    fontWeight: 600,
    transition: "all 0.25s ease",
    animation: "skillTagIn 0.45s cubic-bezier(0.23, 1, 0.32, 1) both",
    cursor: "default",
  },
  emptyText: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    fontStyle: "italic",
  },
};

function SkillCard({ categoryKey, skills, delay }) {
  const [hovered, setHovered] = useState(false);
  const config = CATEGORIES[categoryKey];

  return (
    <div
      style={{
        ...styles.card,
        ...(hovered ? styles.cardHovered : {}),
        animationDelay: `${delay}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "18px",
          padding: "1px",
          background: config.gradient,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      />
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div
            style={{
              ...styles.iconBox,
              background: config.gradient,
              boxShadow: `0 4px 12px ${config.glow}`,
            }}
          >
            <div style={styles.iconBoxSvg}>{config.icon}</div>
          </div>
          <p style={styles.categoryName}>{config.label}</p>
        </div>
        <span
          style={{
            ...styles.countBadge,
            background: config.tagBg,
            color: config.tagColor,
            border: `1px solid ${config.tagBorder}`,
          }}
        >
          {skills.length}
        </span>
      </div>
      <div style={styles.tagWrap}>
        {skills.length > 0 ? (
          skills.map((skill, i) => (
            <span
              key={skill}
              style={{
                ...styles.tag,
                background: config.tagBg,
                color: config.tagColor,
                border: `1px solid ${config.tagBorder}`,
                animationDelay: `${delay + 0.08 + i * 0.04}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
                e.currentTarget.style.boxShadow = `0 4px 12px ${config.glow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              {skill}
            </span>
          ))
        ) : (
          <span style={styles.emptyText}>No skills detected in this category</span>
        )}
      </div>
    </div>
  );
}

export default function SkillsDisplay({ skills, resumeText }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const hasAny = useMemo(
    () =>
      skills &&
      Object.values(skills).some((arr) => arr && arr.length > 0),
    [skills]
  );

  if (!hasAny) return null;

  const entries = Object.entries(CATEGORIES);

  return (
    <div style={{ marginTop: "24px", animation: visible ? "skillSectionIn 0.5s ease both" : "none" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#818cf8"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          Categorized Skills
        </h3>
      </div>
      <div className="skill-grid" style={styles.container}>
        {entries.map(([key, _], idx) => {
          const skillArr = skills[key] || [];
          return (
            <SkillCard key={key} categoryKey={key} skills={skillArr} delay={0.1 + idx * 0.12} />
          );
        })}
      </div>
      <style>{`
        @keyframes skillCardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes skillTagIn {
          from { opacity: 0; transform: translateY(8px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes skillSectionIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 768px) {
          .skill-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
