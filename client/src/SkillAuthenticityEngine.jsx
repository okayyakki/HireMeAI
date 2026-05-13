import { useState, useMemo, useRef, useEffect } from "react";
import { generateSkillAuthenticityData, sampleCandidates, roleColorMap } from "./skillAuthenticityData";

function RadarChart({ scores, colors }) {
  const size = 180;
  const center = size / 2;
  const radius = 70;
  const levels = 4;
  const angleStep = (2 * Math.PI) / scores.length;

  const polygonPoints = scores.map((score, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const r = (score / 100) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(" ");

  const gridLines = [...Array(levels)].map((_, level) => {
    const r = ((level + 1) / levels) * radius;
    const pts = scores.map((_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(" ");
    return pts;
  });

  const axisLines = scores.map((_, i) => {
    const angle = angleStep * i - Math.PI / 2;
    return {
      x2: center + radius * Math.cos(angle),
      y2: center + radius * Math.sin(angle),
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLines.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {axisLines.map((line, i) => (
        <line key={i} x1={center} y1={center} x2={line.x2} y2={line.y2} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      <polygon points={polygonPoints} fill={colors.glow} stroke={colors.primary} strokeWidth="2" opacity="0.8">
        <animate attributeName="opacity" from="0" to="0.8" dur="1s" fill="freeze" />
      </polygon>
      {scores.map((score, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (score / 100) * radius;
        return (
          <circle key={i} cx={center + r * Math.cos(angle)} cy={center + r * Math.sin(angle)} r="3" fill={colors.primary}>
            <animate attributeName="r" from="0" to="3" dur="0.5s" begin={`${i * 0.1}s`} fill="freeze" />
          </circle>
        );
      })}
    </svg>
  );
}

function AnimatedScoreCard({ label, score, size = "md", icon, color, subtitle, animate = true }) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score);
  const circleRef = useRef(null);
  const circumference = 2 * Math.PI * (size === "lg" ? 50 : size === "sm" ? 28 : 38);

  useEffect(() => {
    if (!animate) { setDisplayScore(score); return; }
    const duration = 1200;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(progress * score));
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [score, animate]);

  const numericScore = typeof score === "number" ? score : parseInt(score) || 0;
  const clamped = Math.min(100, Math.max(0, numericScore));
  const offset = circumference - (clamped / 100) * circumference;
  const strokeColor = clamped >= 80 ? "#10b981" : clamped >= 60 ? "#f59e0b" : clamped >= 40 ? "#f97316" : "#ef4444";

  return (
    <div style={{
      background: "var(--card-bg)",
      border: "1px solid var(--card-border)",
      borderRadius: "16px",
      padding: size === "lg" ? "28px" : "20px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s ease",
      animation: animate ? "cardFadeIn 0.6s ease both" : "none",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)"; e.currentTarget.style.borderColor = color || "var(--card-border)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "var(--card-border)"; }}
    >
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: color || "var(--gradient-primary)",
        opacity: 0.7
      }} />
      {icon && (
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: `${color || "#6366f1"}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
          color: color || "#6366f1",
        }}>
          {icon}
        </div>
      )}
      <div style={{ position: "relative", width: size === "lg" ? 120 : size === "sm" ? 72 : 96, height: size === "lg" ? 120 : size === "sm" ? 72 : 96, margin: "0 auto 8px" }}>
        <svg width="100%" height="100%" viewBox={`0 0 120 120`}>
          <circle cx="60" cy="60" r={size === "sm" ? 28 : size === "lg" ? 50 : 38} fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" />
          <circle cx="60" cy="60" r={size === "sm" ? 28 : size === "lg" ? 50 : 38} fill="none" stroke={strokeColor} strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontSize: size === "lg" ? "2rem" : size === "sm" ? "1.1rem" : "1.5rem",
            fontWeight: 800, color: "var(--text-primary)", lineHeight: 1,
          }}>{displayScore}</span>
          {size !== "sm" && <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 2 }}>out of 100</span>}
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: size === "sm" ? "0.8rem" : "0.9rem", color: "var(--text-primary)", marginBottom: subtitle ? 4 : 0 }}>
        {label}
      </div>
      {subtitle && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{subtitle}</div>}
      {typeof score !== "number" && (
        <div style={{ marginTop: 8 }}>
          <span style={{
            display: "inline-block", padding: "3px 12px", borderRadius: "20px",
            fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.3px",
            background: clamped >= 80 ? "rgba(16,185,129,0.1)" : clamped >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
            color: clamped >= 80 ? "#10b981" : clamped >= 60 ? "#f59e0b" : "#ef4444"
          }}>
            {clamped >= 80 ? "Verifiable" : clamped >= 60 ? "Partial" : "Unverified"}
          </span>
        </div>
      )}
    </div>
  );
}

function VerificationBadge({ skill, verified }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "4px 12px 4px 10px",
      borderRadius: "20px",
      fontSize: "0.78rem",
      fontWeight: 600,
      background: verified ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
      color: verified ? "#10b981" : "#ef4444",
      border: `1px solid ${verified ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.15)"}`,
      transition: "all 0.2s ease",
      cursor: "default",
      animation: "badgePop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) both",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)" }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)" }}
    >
      {verified ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      )}
      {skill}
    </span>
  );
}

function TrustMeter({ level, score }) {
  const segments = [...Array(5)];
  const activeSegments = score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : score >= 20 ? 2 : 1;
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#10b981"];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ display: "flex", gap: "4px", flex: 1 }}>
        {segments.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: "8px", borderRadius: "4px",
            background: i < activeSegments ? colors[i] : "var(--bg-tertiary)",
            transition: "background 0.5s ease",
            boxShadow: i < activeSegments ? `0 0 8px ${colors[i]}40` : "none",
          }} />
        ))}
      </div>
      <span style={{
        fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase",
        letterSpacing: "0.3px", color: score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444",
        flexShrink: 0, whiteSpace: "nowrap",
      }}>
        {level}
      </span>
    </div>
  );
}

function SkillBar({ name, score, isSuspicious, isVerified }) {
  const fillColor = isVerified ? "#10b981" : isSuspicious ? "#ef4444" : score >= 70 ? "#6366f1" : score >= 50 ? "#f59e0b" : "#f97316";
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{name}</span>
          {isVerified && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
          {isSuspicious && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </div>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: fillColor }}>{score}%</span>
      </div>
      <div style={{ height: "6px", background: "var(--bg-tertiary)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          width: `${score}%`, height: "100%", borderRadius: "3px",
          background: fillColor,
          transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: `0 0 8px ${fillColor}40`,
        }} />
      </div>
    </div>
  );
}

function AIInsightCard({ text, type = "info" }) {
  const icons = {
    positive: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
    ),
    warning: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
    ),
    suspicious: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
    ),
    info: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
    ),
  };

  const bgColors = {
    positive: "rgba(16,185,129,0.05)",
    warning: "rgba(245,158,11,0.05)",
    suspicious: "rgba(239,68,68,0.05)",
    info: "rgba(99,102,241,0.05)",
  };

  const borderColors = {
    positive: "rgba(16,185,129,0.15)",
    warning: "rgba(245,158,11,0.15)",
    suspicious: "rgba(239,68,68,0.15)",
    info: "rgba(99,102,241,0.15)",
  };

  return (
    <div style={{
      display: "flex",
      gap: "10px",
      padding: "10px 14px",
      borderRadius: "12px",
      background: bgColors[type],
      border: `1px solid ${borderColors[type]}`,
      transition: "all 0.2s ease",
      animation: "insightSlide 0.4s ease both",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ flexShrink: 0, marginTop: "1px" }}>{icons[type]}</div>
      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function ImprovementRoadmap({ roadmap }) {
  if (!roadmap || roadmap.length === 0) {
    return (
      <div style={{
        padding: "24px", textAlign: "center", color: "var(--text-muted)",
        background: "rgba(16,185,129,0.05)", borderRadius: "12px",
        border: "1px solid rgba(16,185,129,0.1)",
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" style={{ marginBottom: "8px" }}>
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <div style={{ fontWeight: 600, color: "#10b981", marginBottom: "4px" }}>All skills verified</div>
        <div style={{ fontSize: "0.8rem" }}>No improvement roadmap needed at this time.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {roadmap.map((item, idx) => (
        <div key={idx} style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "14px",
          padding: "18px",
          transition: "all 0.3s ease",
          animation: `insightSlide 0.4s ease ${idx * 0.1}s both`,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>{item.skill}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Current</span>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: item.currentScore < 50 ? "#ef4444" : "#f59e0b" }}>{item.currentScore}%</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Target</span>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#10b981" }}>{item.targetScore}%</span>
            </div>
          </div>
          <div style={{ height: "4px", background: "var(--bg-tertiary)", borderRadius: "2px", marginBottom: "12px", overflow: "hidden" }}>
            <div style={{
              width: `${(item.currentScore / item.targetScore) * 100}%`,
              height: "100%", borderRadius: "2px",
              background: "linear-gradient(90deg, #f59e0b, #10b981)",
              transition: "width 1.5s ease",
            }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {item.suggestions?.slice(0, 3).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" style={{ flexShrink: 0, marginTop: "2px" }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                {s}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RecruiterSkillView({ data, candidateName, candidateAvatar, onClose }) {
  if (!data) return null;
  const colors = roleColorMap[data.role] || roleColorMap.General;

  return (
    <div style={{
      background: "var(--card-bg)",
      border: "1px solid var(--card-border)",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "var(--shadow-xl)",
      animation: "slideUp 0.4s ease",
      maxWidth: "800px",
      margin: "0 auto",
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
        padding: "28px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "16px",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 800, fontSize: "1.3rem",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            {candidateAvatar || candidateName?.charAt(0) || "?"}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, color: "white", fontSize: "1.4rem", fontWeight: 700 }}>{candidateName || "Candidate"}</h2>
            <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>{data.role} Engineer · {data.overallScore >= 80 ? "Premium" : data.overallScore >= 60 ? "Standard" : "Basic"} Profile</p>
          </div>
          <div style={{
            padding: "8px 16px",
            borderRadius: "12px",
            background: data.flaggedForReview ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)",
            border: `1px solid ${data.flaggedForReview ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
            color: data.flaggedForReview ? "#fca5a5" : "#6ee7b7",
            fontWeight: 700, fontSize: "0.85rem",
            backdropFilter: "blur(10px)",
          }}>
            {data.flaggedForReview ? "⚠ Flagged" : "✓ Clear"}
          </div>
        </div>
      </div>

      <div style={{ padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <AnimatedScoreCard label="Skill Authenticity" score={data.overallScore} size="md" subtitle={`${data.verifiedBadges.length} verified skills`} color={colors.primary} />
          <AnimatedScoreCard label="Hiring Confidence" score={data.hiringConfidenceScore} size="md" subtitle={data.hiringConfidence} color="#8b5cf6" />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <TrustMeter level={data.trustMeter} score={data.overallScore} />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M16 8l-4 4-4-4" /><path d="M8 16l4-4 4 4" /></svg>
            Skill Breakdown
          </h4>
          {data.skillScores.map(s => (
            <SkillBar key={s.name} name={s.name} score={s.authenticityScore}
              isSuspicious={s.flags.includes("inflated")}
              isVerified={s.flags.includes("verified")} />
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
          {data.verifiedBadges.length > 0 && (
            <div style={{ width: "100%" }}>
              <h5 style={{ margin: "0 0 8px", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>✓ Verified Skills</h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {data.verifiedBadges.map(s => <VerificationBadge key={s} skill={s} verified />)}
              </div>
            </div>
          )}
          {data.suspiciousFlags.length > 0 && (
            <div style={{ width: "100%", marginTop: "12px" }}>
              <h5 style={{ margin: "0 0 8px", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>⚠ Suspicious Skills</h5>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {data.suspiciousFlags.map(s => <VerificationBadge key={s} skill={s} verified={false} />)}
              </div>
            </div>
          )}
        </div>

        {data.topVerifiedSkill && (
          <div style={{
            padding: "14px",
            borderRadius: "12px",
            background: "rgba(16,185,129,0.05)",
            border: "1px solid rgba(16,185,129,0.15)",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Top Verified Skill</div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{data.topVerifiedSkill}</div>
            </div>
          </div>
        )}

        {data.weakestClaim && (
          <div style={{
            padding: "14px",
            borderRadius: "12px",
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.15)",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Weakest Claim — Needs Review</div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{data.weakestClaim}</div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            AI Insights
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data.insights.map((insight, i) => {
              let type = "info";
              if (insight.toLowerCase().includes("strong") || insight.toLowerCase().includes("exceptional") || insight.toLowerCase().includes("excellent") || insight.toLowerCase().includes("no suspicious") || insight.toLowerCase().includes("verified")) type = "positive";
              if (insight.toLowerCase().includes("flagged") || insight.toLowerCase().includes("inflated") || insight.toLowerCase().includes("suspicious") || insight.toLowerCase().includes("rushing")) type = "suspicious";
              if (insight.toLowerCase().includes("recommend") || insight.toLowerCase().includes("requires") || insight.toLowerCase().includes("gap")) type = "warning";
              return <AIInsightCard key={i} text={insight} type={type} />;
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "Response Consistency", value: `${data.consistencyScore}%`, color: data.consistencyScore >= 70 ? "#10b981" : "#f59e0b" },
            { label: "Accuracy Pattern", value: `${data.accuracyPattern}%`, color: data.accuracyPattern >= 70 ? "#10b981" : "#f59e0b" },
            { label: "Avg Response Time", value: `${data.responseTimeAvg}s`, color: data.responseTimeAvg <= 20 ? "#10b981" : data.responseTimeAvg <= 40 ? "#f59e0b" : "#ef4444" },
            { label: "Completion Rate", value: `${data.completionRate}%`, color: data.completionRate >= 90 ? "#10b981" : "#f59e0b" },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: "14px", borderRadius: "12px",
              border: "1px solid var(--card-border)",
              background: "var(--bg-secondary)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {data.improvementRoadmap && data.improvementRoadmap.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "0.95rem" }}>📈 Improvement Roadmap</h4>
            <ImprovementRoadmap roadmap={data.improvementRoadmap} />
          </div>
        )}

        {onClose && (
          <button onClick={onClose} style={{
            width: "100%", padding: "12px", borderRadius: "12px",
            border: "1px solid var(--card-border)", background: "var(--bg-tertiary)",
            color: "var(--text-secondary)", cursor: "pointer",
            fontWeight: 600, fontSize: "0.9rem",
            transition: "all 0.2s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
            Close
          </button>
        )}
      </div>
    </div>
  );
}

function CandidateAuthenticityDashboard({ data, candidateName, colors }) {
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setChartLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);

  if (!data) return null;
  const col = colors || roleColorMap[data.role] || roleColorMap.General;
  const scoreLabels = data.skillScores.map(s => s.name.substring(0, 4));
  const scoreValues = data.skillScores.map(s => s.authenticityScore);

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "16px",
            background: `linear-gradient(135deg, ${col.primary}, ${col.secondary})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 800, fontSize: "1.4rem",
            boxShadow: `0 8px 24px ${col.glow}`,
          }}>
            {candidateName?.charAt(0) || "?"}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {candidateName || "Your"} Skill Authenticity Profile
            </h2>
            <p style={{ margin: "2px 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              {data.role} Engineer · AI-Verified Profile
            </p>
          </div>
        </div>

        <div style={{
          padding: "16px", borderRadius: "14px",
          background: `linear-gradient(135deg, ${col.primary}08, ${col.secondary}08)`,
          border: `1px solid ${col.primary}20`,
          display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Hiring Readiness</div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                fontSize: "1.8rem", fontWeight: 900,
                background: `linear-gradient(135deg, ${col.primary}, ${col.secondary})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>{data.hiringConfidenceScore}%</span>
              <span style={{
                padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
                background: data.hiringConfidenceScore >= 80 ? "rgba(16,185,129,0.1)" : data.hiringConfidenceScore >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                color: data.hiringConfidenceScore >= 80 ? "#10b981" : data.hiringConfidenceScore >= 60 ? "#f59e0b" : "#ef4444",
              }}>
                {data.hiringConfidence}
              </span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>Skill Trust</div>
            <TrustMeter level={data.trustMeter} score={data.overallScore} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <AnimatedScoreCard label="Overall Authenticity" score={data.overallScore} size="md" subtitle={`${data.verifiedBadges.length} verified badges`} color={col.primary} />
        <AnimatedScoreCard label="Consistency Score" score={data.consistencyScore} size="md" subtitle="Response pattern" color="#8b5cf6" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "16px",
          padding: "20px",
          textAlign: "center",
        }}>
          <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 600 }}>Skill Radar</h4>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {chartLoaded && <RadarChart scores={scoreValues} colors={col} />}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center", marginTop: "8px" }}>
            {data.skillScores.map((s, i) => (
              <span key={s.name} style={{ fontSize: "0.65rem", color: "var(--text-muted)", padding: "2px 6px", background: "var(--bg-tertiary)", borderRadius: "4px" }}>
                {s.name}
              </span>
            ))}
          </div>
        </div>

        <div style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "16px",
          padding: "20px",
        }}>
          <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 600 }}>Verification Badges</h4>
          {data.verifiedBadges.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {data.skillScores.map(s => (
                <div key={s.name} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", borderRadius: "10px",
                  background: s.flags.includes("verified") ? "rgba(16,185,129,0.05)" : s.flags.includes("inflated") ? "rgba(239,68,68,0.05)" : "var(--bg-secondary)",
                  border: `1px solid ${s.flags.includes("verified") ? "rgba(16,185,129,0.15)" : s.flags.includes("inflated") ? "rgba(239,68,68,0.15)" : "var(--card-border)"}`,
                  transition: "all 0.2s ease",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateX(3px)" }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {s.flags.includes("verified") ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    ) : s.flags.includes("inflated") ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 9v2m0 4h.01" /></svg>
                    )}
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</span>
                  </div>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
                    color: s.flags.includes("verified") ? "#10b981" : s.flags.includes("inflated") ? "#ef4444" : "#f59e0b",
                  }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No verified badges yet. Complete assessments to earn badges.
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          AI Insights & Recommendations
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {data.insights.map((insight, i) => {
            let type = "info";
            if (insight.toLowerCase().includes("strong") || insight.toLowerCase().includes("exceptional") || insight.toLowerCase().includes("excellent") || insight.toLowerCase().includes("verified")) type = "positive";
            if (insight.toLowerCase().includes("flagged") || insight.toLowerCase().includes("inflated") || insight.toLowerCase().includes("suspicious")) type = "suspicious";
            if (insight.toLowerCase().includes("recommend") || insight.toLowerCase().includes("requires") || insight.toLowerCase().includes("gap")) type = "warning";
            return <AIInsightCard key={i} text={insight} type={type} />;
          })}
        </div>
      </div>

      <div>
        <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "0.95rem" }}>📈 AI-Generated Improvement Roadmap</h4>
        <ImprovementRoadmap roadmap={data.improvementRoadmap} />
      </div>
    </div>
  );
}

function SmartDetectionPanel({ data }) {
  if (!data) return null;
  const flags = [];

  if (data.flaggedForReview) flags.push({ type: "suspicious", title: "Resume vs. Assessment Mismatch", desc: `${data.resumeAssessmentGap} skill(s) claimed on resume but not verified by assessment results.`, severity: "high" });
  if (data.suspiciousFlags.length > 0) flags.push({ type: "suspicious", title: "Inflated Skill Claims Detected", desc: `${data.suspiciousFlags.join(", ")} — claimed expertise level significantly higher than demonstrated.`, severity: "high" });
  if (data.responseTimeAvg < 10) flags.push({ type: "suspicious", title: "Unusually Fast Responses", desc: `Average response time of ${data.responseTimeAvg}s suggests possible random answering.`, severity: "medium" });
  if (data.consistencyScore < 50) flags.push({ type: "warning", title: "Inconsistent Answer Patterns", desc: `Low consistency score (${data.consistencyScore}%) indicates possible guessing on technical questions.`, severity: "medium" });
  if (data.accuracyPattern < 60) flags.push({ type: "warning", title: "Below Expected Accuracy", desc: `Accuracy pattern (${data.accuracyPattern}%) is lower than typical for claimed experience level.`, severity: "low" });
  if (data.verifiedBadges.length >= 3) flags.push({ type: "positive", title: "Strong Verification Rate", desc: `${data.verifiedBadges.length} skills verified across multiple assessment dimensions.`, severity: "positive" });

  return (
    <div style={{
      background: "var(--card-bg)",
      border: "1px solid var(--card-border)",
      borderRadius: "16px",
      padding: "20px",
    }}>
      <h4 style={{ margin: "0 0 16px", color: "var(--text-primary)", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Smart Detection Analysis
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {flags.map((flag, i) => (
          <div key={i} style={{
            display: "flex", gap: "10px", padding: "12px", borderRadius: "12px",
            background: flag.type === "positive" ? "rgba(16,185,129,0.05)" : flag.type === "suspicious" ? "rgba(239,68,68,0.05)" : "rgba(245,158,11,0.05)",
            border: `1px solid ${flag.type === "positive" ? "rgba(16,185,129,0.15)" : flag.type === "suspicious" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)"}`,
            animation: `insightSlide 0.4s ease ${i * 0.08}s both`,
          }}>
            <div style={{ flexShrink: 0, marginTop: "1px" }}>
              {flag.type === "positive" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              ) : flag.type === "suspicious" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)", marginBottom: "2px" }}>{flag.title}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{flag.desc}</div>
            </div>
            {flag.severity !== "positive" && (
              <span style={{
                padding: "2px 8px", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                background: flag.severity === "high" ? "rgba(239,68,68,0.1)" : flag.severity === "medium" ? "rgba(245,158,11,0.1)" : "rgba(99,102,241,0.1)",
                color: flag.severity === "high" ? "#ef4444" : flag.severity === "medium" ? "#f59e0b" : "#6366f1",
                flexShrink: 0, alignSelf: "flex-start",
              }}>
                {flag.severity}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SkillAuthenticityEngine({ view = "candidate", role, skills, candidateName, onClose }) {
  const [data, setData] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetailData, setCandidateDetailData] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const result = generateSkillAuthenticityData(role || "Frontend", skills || []);
      setData(result);
      setGenerating(false);
    }, 800);
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateDetailData(candidate.data);
  };

  const col = data ? (roleColorMap[data.role] || roleColorMap.General) : roleColorMap.General;

  if (!data && !selectedCandidate && view !== "recruiter-list") {
    return (
      <div style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "20px",
        padding: "48px 32px",
        textAlign: "center",
        animation: "slideUp 0.4s ease",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "20px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
          animation: "float 6s ease-in-out infinite",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <h2 style={{ color: "var(--text-primary)", margin: "0 0 8px", fontSize: "1.3rem" }}>Skill Authenticity Engine</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto 24px", fontSize: "0.9rem", lineHeight: 1.6 }}>
          AI-powered analysis that detects whether a candidate's claimed skills are genuine by comparing resume data, assessment performance, coding answers, and application behavior.
        </p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <button onClick={handleGenerate} disabled={generating} style={{
            padding: "14px 36px", borderRadius: "14px", border: "none",
            background: generating ? "var(--bg-tertiary)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "white", fontWeight: 700, fontSize: "1rem",
            cursor: generating ? "not-allowed" : "pointer",
            transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: "10px",
            boxShadow: generating ? "none" : "0 4px 15px rgba(99,102,241,0.3)",
            opacity: generating ? 0.7 : 1,
          }}
            onMouseEnter={e => { if (!generating) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(99,102,241,0.4)"; } }}
            onMouseLeave={e => { if (!generating) { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 15px rgba(99,102,241,0.3)"; } }}
          >
            {generating ? (
              <><span className="spinner"></span> Analyzing...</>
            ) : (
              <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Generate My Skill Authenticity Report</>
            )}
          </button>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
            Analyzes resume claims, test performance, coding accuracy, and response patterns
          </p>
        </div>
      </div>
    );
  }

  if (view === "recruiter-list") {
    return (
      <div>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ color: "var(--text-primary)", margin: "0 0 4px", fontSize: "1.3rem" }}>Skill Authenticity Engine</h2>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem" }}>
            AI-powered verification for candidate skills — select a candidate to view detailed analysis.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sampleCandidates.map((candidate, idx) => {
            const c = roleColorMap[candidate.role] || roleColorMap.General;
            return (
              <div key={candidate.id} style={{
                background: "var(--card-bg)",
                border: `1px solid ${selectedCandidate?.id === candidate.id ? `${c.primary}40` : "var(--card-border)"}`,
                borderRadius: "16px",
                padding: "18px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                animation: `insightSlide 0.4s ease ${idx * 0.05}s both`,
                borderLeft: `3px solid ${c.primary}`,
              }}
                onClick={() => handleViewCandidate(candidate)}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "12px",
                    background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 800, fontSize: "1rem",
                    flexShrink: 0,
                  }}>
                    {candidate.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>{candidate.name}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{candidate.role} Engineer · {candidate.skills.join(", ")}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative",
                    }}>
                      <svg width="44" height="44" viewBox="0 0 44 44">
                        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--bg-tertiary)" strokeWidth="3" />
                        <circle cx="22" cy="22" r="18" fill="none" stroke={candidate.data.overallScore >= 80 ? "#10b981" : candidate.data.overallScore >= 60 ? "#f59e0b" : "#ef4444"} strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 18}
                          strokeDashoffset={2 * Math.PI * 18 - (candidate.data.overallScore / 100) * 2 * Math.PI * 18}
                          transform="rotate(-90 22 22)" style={{ transition: "stroke-dashoffset 1.2s ease" }} />
                      </svg>
                      <span style={{ position: "absolute", fontSize: "0.75rem", fontWeight: 800, color: "var(--text-primary)" }}>{candidate.data.overallScore}</span>
                    </div>
                    {candidate.data.flaggedForReview && <span title="Flagged for review" style={{ fontSize: "1.2rem" }}>⚠️</span>}
                    {candidate.data.verifiedBadges.length >= 3 && <span title="Verified candidate" style={{ fontSize: "1.2rem" }}>✅</span>}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedCandidate && candidateDetailData && (
          <div style={{ marginTop: "32px" }}>
            <RecruiterSkillView
              data={candidateDetailData}
              candidateName={selectedCandidate.name}
              candidateAvatar={selectedCandidate.avatar}
              onClose={() => { setSelectedCandidate(null); setCandidateDetailData(null); }}
            />
          </div>
        )}
      </div>
    );
  }

  if (data && view === "candidate") {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ color: "var(--text-primary)", margin: 0, fontSize: "1.2rem" }}>Your Skill Authenticity Report</h2>
            <p style={{ color: "var(--text-secondary)", margin: "2px 0 0", fontSize: "0.85rem" }}>
              Generated {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleGenerate} disabled={generating} style={{
              padding: "10px 20px", borderRadius: "10px", border: "1px solid var(--card-border)",
              background: "var(--bg-tertiary)", color: "var(--text-secondary)",
              cursor: generating ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.85rem",
              transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: "6px",
            }}
              onMouseEnter={e => { if (!generating) { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; } }}
              onMouseLeave={e => { if (!generating) { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
            >
              {generating ? <><span className="spinner"></span> Regenerating...</> : <>🔄 Regenerate</>}
            </button>
          </div>
        </div>

        <SmartDetectionPanel data={data} />

        <div style={{ marginTop: "24px" }}>
          <CandidateAuthenticityDashboard data={data} candidateName={candidateName || "Candidate"} colors={col} />
        </div>
      </div>
    );
  }

  return null;
}

const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes cardFadeIn {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes insightSlide {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes badgePop {
    from { transform: scale(0); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;
document.head.appendChild(styleTag);
