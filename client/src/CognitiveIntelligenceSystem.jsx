import { useState, useEffect, useRef } from "react";
import { cognitiveDimensions, generateCognitiveProfile, sampleCognitiveCandidates, roleColorMap } from "./cognitiveProfileData";

function AnimatedGauge({ value, label, color, size = 80, subtitle }) {
  const [display, setDisplay] = useState(0);
  const circumference = 2 * Math.PI * ((size / 2) - 6);
  const clamped = Math.min(100, Math.max(0, value));

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(progress * clamped));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [clamped]);

  const offset = circumference - (clamped / 100) * circumference;
  const strokeColor = clamped >= 80 ? "#10b981" : clamped >= 65 ? "#6366f1" : clamped >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: size, height: size, margin: "0 auto 6px" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={(size / 2) - 6} fill="none" stroke="var(--bg-tertiary)" strokeWidth="5" />
          <circle cx={size / 2} cy={size / 2} r={(size / 2) - 6} fill="none" stroke={strokeColor} strokeWidth="5"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: size > 60 ? "1.2rem" : "0.9rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{display}</span>
          {size > 60 && <span style={{ fontSize: "0.55rem", color: "var(--text-muted)" }}>/100</span>}
        </div>
      </div>
      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
      {subtitle && <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 1 }}>{subtitle}</div>}
    </div>
  );
}

function CognitiveBar({ label, score, maxScore = 100, color, detail, animate = true }) {
  const [width, setWidth] = useState(animate ? 0 : (score / maxScore) * 100);
  const pct = (score / maxScore) * 100;
  const barColor = pct >= 80 ? "#10b981" : pct >= 65 ? color || "#6366f1" : pct >= 45 ? "#f59e0b" : "#ef4444";

  useEffect(() => {
    if (animate) setTimeout(() => setWidth(pct), 100);
    else setWidth(pct);
  }, [pct, animate]);

  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>{label}</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: barColor }}>{score}</span>
      </div>
      <div style={{ height: "5px", background: "var(--bg-tertiary)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ width: `${width}%`, height: "100%", borderRadius: "3px", background: barColor, transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: `0 0 6px ${barColor}40` }} />
      </div>
      {detail && <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "2px" }}>{detail}</div>}
    </div>
  );
}

function CognitiveRadar({ scores, size = 200 }) {
  const center = size / 2;
  const radius = size * 0.35;
  const angleStep = (2 * Math.PI) / scores.length;

  const polygonPoints = scores.map((s, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const r = (s.score / 100) * radius;
    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
  }).join(" ");

  const gridLines = [...Array(4)].map((_, level) => {
    const r = ((level + 1) / 4) * radius;
    return scores.map((_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(" ");
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLines.map((pts, i) => <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />)}
      {scores.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        return <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
      })}
      <polygon points={polygonPoints} fill="rgba(99,102,241,0.15)" stroke="#818cf8" strokeWidth="2" opacity="0.9">
        <animate attributeName="opacity" from="0" to="0.9" dur="1s" fill="freeze" />
      </polygon>
      {scores.map((s, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const r = (s.score / 100) * radius;
        return <circle key={i} cx={center + r * Math.cos(angle)} cy={center + r * Math.sin(angle)} r="3.5" fill="#818cf8">
          <animate attributeName="r" from="0" to="3.5" dur="0.4s" begin={`${i * 0.08}s`} fill="freeze" />
        </circle>;
      })}
      {scores.map((s, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const labelR = radius + 20;
        const lx = center + labelR * Math.cos(angle);
        const ly = center + labelR * Math.sin(angle);
        const short = s.label?.substring(0, 10) || "";
        return (
          <text key={`l${i}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            fill="var(--text-muted)" fontSize="8" fontWeight="500">
            {short}
          </text>
        );
      })}
    </svg>
  );
}

function InsightCard({ text, type = "info" }) {
  const config = {
    info: { icon: "💡", bg: "rgba(99,102,241,0.05)", border: "rgba(99,102,241,0.15)" },
    positive: { icon: "✅", bg: "rgba(16,185,129,0.05)", border: "rgba(16,185,129,0.15)" },
    warning: { icon: "⚠️", bg: "rgba(245,158,11,0.05)", border: "rgba(245,158,11,0.15)" },
    critical: { icon: "🔴", bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.15)" },
  };
  const c = config[type] || config.info;

  return (
    <div style={{
      display: "flex", gap: "8px", padding: "10px 14px", borderRadius: "12px",
      background: c.bg, border: `1px solid ${c.border}`,
      animation: "cogSlide 0.4s ease both", transition: "all 0.2s ease",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <span style={{ flexShrink: 0, fontSize: "1rem" }}>{c.icon}</span>
      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function HeatmapCell({ label, value, w, h = 36 }) {
  const intensity = value / 100;
  const r = Math.round(99 + (16 - 99) * intensity);
  const g = Math.round(102 + (185 - 102) * intensity);
  const b = Math.round(241 + (129 - 241) * intensity);
  const bgColor = `rgba(${r},${g},${b},${0.15 + intensity * 0.4})`;
  const borderColor = `rgba(${r},${g},${b},${0.2 + intensity * 0.3})`;

  return (
    <div title={`${label}: ${value}`} style={{
      padding: "6px 8px", borderRadius: "8px", background: bgColor,
      border: `1px solid ${borderColor}`, textAlign: "center",
      fontSize: "0.7rem", fontWeight: 600, color: "var(--text-primary)",
      minWidth: w || 70, height,
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "transform 0.2s ease",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
    >
      {label}
    </div>
  );
}

function IntelligenceBadge({ label, icon, color = "#6366f1", reason }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "14px 18px", borderRadius: "14px",
      background: `linear-gradient(135deg, ${color}12, ${color}06)`,
      border: `1px solid ${color}25`,
      transition: "all 0.3s ease", cursor: "default",
      animation: "cogSlide 0.5s ease both",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${color}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: "12px",
        background: `${color}18`, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "1.3rem", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>{label}</div>
        {reason && <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "1px" }}>{reason}</div>}
      </div>
    </div>
  );
}

function ConfidenceMeter({ level, score }) {
  const segColor = score >= 80 ? "#10b981" : score >= 60 ? "#6366f1" : score >= 40 ? "#f59e0b" : "#ef4444";
  const bars = 5;
  const active = Math.round((score / 100) * bars);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ display: "flex", gap: "3px", flex: 1 }}>
        {[...Array(bars)].map((_, i) => (
          <div key={i} style={{
            flex: 1, height: "10px", borderRadius: "3px",
            background: i < active ? segColor : "var(--bg-tertiary)",
            transition: "background 0.4s ease",
            boxShadow: i < active ? `0 0 6px ${segColor}50` : "none",
          }} />
        ))}
      </div>
      <span style={{
        fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", whiteSpace: "nowrap",
        color: segColor,
      }}>{level}</span>
    </div>
  );
}

function RecruiterCognitiveDashboard({ data, candidateName, candidateAvatar, onClose }) {
  if (!data) return null;

  const dims = cognitiveDimensions.map(d => ({
    ...d,
    score: data.cognitiveScores[d.id]?.score || 0,
    level: data.cognitiveScores[d.id]?.level || "unknown",
  }));
  const cols = roleColorMap[data.role] || roleColorMap.General;

  return (
    <div style={{
      background: "var(--card-bg)", border: "1px solid var(--card-border)",
      borderRadius: "20px", overflow: "hidden", boxShadow: "var(--shadow-xl)",
      animation: "slideUp 0.4s ease", maxWidth: "900px", margin: "0 auto",
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${cols.primary}, ${cols.secondary})`,
        padding: "28px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 40%, rgba(255,255,255,0.12) 0%, transparent 60%)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "16px",
            background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center",
            justifyContent: "center", color: "white", fontWeight: 800, fontSize: "1.3rem",
            backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)",
          }}>
            {candidateAvatar || candidateName?.charAt(0) || "?"}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, color: "white", fontSize: "1.4rem", fontWeight: 700 }}>{candidateName || "Candidate"}</h2>
            <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>{data.role} · {data.thinkingStyle}</p>
          </div>
          <IntelligenceBadge label={data.recommendation.label} icon={data.recommendation.icon} color={data.recommendation.color} reason={data.recommendation.reason} />
        </div>
      </div>

      <div style={{ padding: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div style={{
            padding: "16px", borderRadius: "14px",
            border: "1px solid var(--card-border)", textAlign: "center",
          }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, background: `linear-gradient(135deg, ${cols.primary}, ${cols.secondary})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {data.overallCognitive}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>COGNITIVE IQ</div>
          </div>
          <div style={{
            padding: "16px", borderRadius: "14px",
            border: "1px solid var(--card-border)", textAlign: "center",
          }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: data.iqScore >= 120 ? "#10b981" : data.iqScore >= 100 ? "#6366f1" : "#f59e0b" }}>
              {data.iqScore}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>IQ ESTIMATE</div>
          </div>
          <div style={{
            padding: "16px", borderRadius: "14px",
            border: "1px solid var(--card-border)", textAlign: "center",
          }}>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: data.interviewReadiness >= 80 ? "#10b981" : data.interviewReadiness >= 60 ? "#6366f1" : "#f59e0b" }}>
              {data.interviewReadiness}%
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>INTERVIEW READINESS</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          <div>
            <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "0.95rem" }}>🧠 Cognitive Dimensions</h4>
            {dims.map(d => (
              <CognitiveBar key={d.id} label={d.label} score={d.score} color={cols.primary} detail={d.level.replace("_", " ")} />
            ))}
          </div>
          <div>
            <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "0.95rem" }}>📊 Cognitive Radar</h4>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CognitiveRadar scores={dims} size={220} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "0.95rem" }}>🔥 Cognitive Heatmap</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {dims.map(d => (
              <HeatmapCell key={d.id} label={d.label} value={d.score} />
            ))}
            <HeatmapCell label="Decision Speed" value={data.behaviorMetrics.decisionMakingSpeed} />
            <HeatmapCell label="Accuracy" value={data.behaviorMetrics.problemSolvingAccuracy} />
            <HeatmapCell label="Consistency" value={data.behaviorMetrics.consistencyOfAnswers} />
            <HeatmapCell label="Focus" value={data.behaviorMetrics.focusConsistency} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div style={{
            padding: "16px", borderRadius: "14px",
            border: "1px solid var(--card-border)",
          }}>
            <h5 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: "0.85rem" }}>💪 Stress-Performance Indicator</h5>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "2rem" }}>{data.behaviorMetrics.stressPerformance.includes("Thrives") ? "🛡️" : "⚖️"}</span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{data.behaviorMetrics.stressPerformance}</span>
            </div>
            <ConfidenceMeter level={data.behaviorMetrics.burnoutRisk < 25 ? "Low Risk" : data.behaviorMetrics.burnoutRisk < 50 ? "Moderate" : "High Risk"} score={100 - data.behaviorMetrics.burnoutRisk} />
            <div style={{ marginTop: "8px", fontSize: "0.7rem", color: "var(--text-muted)" }}>Burnout Risk: {data.behaviorMetrics.burnoutRisk}%</div>
          </div>
          <div style={{
            padding: "16px", borderRadius: "14px",
            border: "1px solid var(--card-border)",
          }}>
            <h5 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: "0.85rem" }}>🧩 Problem-Solving Profile</h5>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px" }}>{data.thinkingStyle}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Speed</span>
                <span style={{ fontWeight: 700, color: data.behaviorMetrics.decisionMakingSpeed >= 70 ? "#10b981" : "#f59e0b" }}>{data.behaviorMetrics.decisionMakingSpeed}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Accuracy</span>
                <span style={{ fontWeight: 700, color: data.behaviorMetrics.problemSolvingAccuracy >= 70 ? "#10b981" : "#f59e0b" }}>{data.behaviorMetrics.problemSolvingAccuracy}%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Consistency</span>
                <span style={{ fontWeight: 700, color: data.behaviorMetrics.consistencyOfAnswers >= 70 ? "#10b981" : "#f59e0b" }}>{data.behaviorMetrics.consistencyOfAnswers}%</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: "0.95rem" }}>🧪 AI Behavioral Insights</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data.insights.map((insight, i) => {
              let type = "info";
              if (insight.toLowerCase().includes("exceptional") || insight.toLowerCase().includes("strong") || insight.toLowerCase().includes("excellent") || insight.toLowerCase().includes("high") || insight.toLowerCase().includes("above average") || insight.toLowerCase().includes("highly consistent")) type = "positive";
              if (insight.toLowerCase().includes("area for development") || insight.toLowerCase().includes("needs development") || insight.toLowerCase().includes("needing development") || insight.toLowerCase().includes("needs improvement")) type = "warning";
              if (insight.toLowerCase().includes("burnout") || insight.toLowerCase().includes("below average") || insight.toLowerCase().includes("variable") || insight.toLowerCase().includes("risk")) type = "critical";
              return <InsightCard key={i} text={insight} type={type} />;
            })}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: "0.95rem" }}>🏆 Hiring Recommendation</h4>
          <IntelligenceBadge label={data.recommendation.label} icon={data.recommendation.icon} color={data.recommendation.color} reason={data.recommendation.reason} />
        </div>

        {data.strengths.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h5 style={{ margin: "0 0 8px", color: "var(--text-primary)", fontSize: "0.85rem" }}>✅ Cognitive Strengths</h5>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {data.strengths.map(s => (
                <span key={s} style={{
                  padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600,
                  background: "rgba(16,185,129,0.1)", color: "#10b981",
                  border: "1px solid rgba(16,185,129,0.2)", transition: "transform 0.2s ease",
                  cursor: "default",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.improvements.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h5 style={{ margin: "0 0 8px", color: "var(--text-primary)", fontSize: "0.85rem" }}>📈 Areas for Development</h5>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {data.improvements.map(s => (
                <span key={s} style={{
                  padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600,
                  background: "rgba(245,158,11,0.1)", color: "#f59e0b",
                  border: "1px solid rgba(245,158,11,0.2)", transition: "transform 0.2s ease",
                  cursor: "default",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  ↑ {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.careerRecommendations?.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h5 style={{ margin: "0 0 8px", color: "var(--text-primary)", fontSize: "0.85rem" }}>🎯 AI Career Recommendations</h5>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {data.careerRecommendations.map(r => (
                <span key={r} style={{
                  padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 600,
                  background: `${cols.primary}15`, color: cols.primary,
                  border: `1px solid ${cols.primary}25`, transition: "transform 0.2s ease",
                  cursor: "default",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {onClose && (
          <button onClick={onClose} style={{
            width: "100%", padding: "12px", borderRadius: "12px",
            border: "1px solid var(--card-border)", background: "var(--bg-tertiary)",
            color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem",
            transition: "all 0.2s ease",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

function CandidateCognitiveDashboard({ data, candidateName }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t); }, []);

  if (!data) return null;
  const cols = roleColorMap[data.role] || roleColorMap.General;
  const dims = cognitiveDimensions.map(d => ({
    ...d,
    score: data.cognitiveScores[d.id]?.score || 0,
    level: data.cognitiveScores[d.id]?.level || "unknown",
  }));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "24px" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "16px",
          background: `linear-gradient(135deg, ${cols.primary}, ${cols.secondary})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 800, fontSize: "1.4rem",
          boxShadow: `0 8px 24px ${cols.glow}`,
        }}>
          {candidateName?.charAt(0) || "?"}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Your Cognitive Intelligence Profile
          </h2>
          <p style={{ margin: "2px 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {data.role} · {data.thinkingStyle}
          </p>
        </div>
      </div>

      <div style={{
        padding: "20px", borderRadius: "16px",
        background: `linear-gradient(135deg, ${cols.primary}08, ${cols.secondary}08)`,
        border: `1px solid ${cols.primary}20`, marginBottom: "24px",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <AnimatedGauge value={data.overallCognitive} label="Cognitive IQ" color={cols.primary} size={100} subtitle="Overall score" />
          <AnimatedGauge value={data.iqScore} label="IQ Estimate" color="#8b5cf6" size={100} subtitle="Percentile rank" />
          <AnimatedGauge value={data.interviewReadiness} label="Interview Readiness" color="#10b981" size={100} subtitle="Preparedness" />
        </div>
        <ConfidenceMeter level={data.overallCognitive >= 80 ? "Excellent" : data.overallCognitive >= 65 ? "Strong" : data.overallCognitive >= 50 ? "Developing" : "Needs Work"} score={data.overallCognitive} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        <div style={{
          background: "var(--card-bg)", border: "1px solid var(--card-border)",
          borderRadius: "16px", padding: "20px", textAlign: "center",
        }}>
          <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 600 }}>Cognitive Radar</h4>
          {loaded && <CognitiveRadar scores={dims} size={220} />}
        </div>
        <div style={{
          background: "var(--card-bg)", border: "1px solid var(--card-border)",
          borderRadius: "16px", padding: "20px",
        }}>
          <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 600 }}>Dimension Scores</h4>
          {dims.map(d => (
            <CognitiveBar key={d.id} label={d.label} score={d.score} color={cols.primary} detail={`${d.level.replace("_", " ")} · ${d.score}th percentile`} />
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        <div style={{
          padding: "16px", borderRadius: "14px",
          background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.15)",
        }}>
          <h5 style={{ margin: "0 0 10px", color: "#10b981", fontSize: "0.85rem" }}>✅ Cognitive Strengths</h5>
          {data.strengths.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {data.strengths.map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  {s}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Complete assessments to identify strengths.</div>
          )}
        </div>
        <div style={{
          padding: "16px", borderRadius: "14px",
          background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)",
        }}>
          <h5 style={{ margin: "0 0 10px", color: "#f59e0b", fontSize: "0.85rem" }}>📈 Improvement Suggestions</h5>
          {data.improvements.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {data.improvements.map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  {s}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>All cognitive dimensions are strong!</div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "0.95rem" }}>💡 Thinking Style Summary</h4>
        <div style={{
          padding: "16px", borderRadius: "14px",
          background: "var(--card-bg)", border: "1px solid var(--card-border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <span style={{
              fontSize: "2rem", width: 48, height: 48, borderRadius: "14px",
              background: `${cols.primary}15`, display: "flex", alignItems: "center",
              justifyContent: "center",
            }}>🧠</span>
            <div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "1rem" }}>{data.thinkingStyle}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Your dominant cognitive style</div>
            </div>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            You are a <strong>{data.thinkingStyle}</strong>. {data.stylisticDescriptors?.map((d, i) => (
              <span key={i}>{i > 0 && ", "}<strong>{d}</strong></span>
            ))}.
            {data.overallCognitive >= 80 ? " Your cognitive profile indicates exceptional readiness for challenging technical roles." :
             data.overallCognitive >= 65 ? " Your cognitive profile shows strong potential with focused areas for growth." :
             " Your cognitive profile is developing — targeted practice will accelerate growth."}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <h4 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: "0.95rem" }}>🧪 AI Insights</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {data.insights.map((insight, i) => {
            let type = "info";
            if (insight.toLowerCase().includes("exceptional") || insight.toLowerCase().includes("strong") || insight.toLowerCase().includes("excellent") || insight.toLowerCase().includes("high") || insight.toLowerCase().includes("above average") || insight.toLowerCase().includes("highly consistent")) type = "positive";
            if (insight.toLowerCase().includes("area for development") || insight.toLowerCase().includes("needs development") || insight.toLowerCase().includes("needing development") || insight.toLowerCase().includes("needs improvement")) type = "warning";
            if (insight.toLowerCase().includes("burnout") || insight.toLowerCase().includes("below average") || insight.toLowerCase().includes("variable") || insight.toLowerCase().includes("risk")) type = "critical";
            return <InsightCard key={i} text={insight} type={type} />;
          })}
        </div>
      </div>

      {data.careerRecommendations?.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 12px", color: "var(--text-primary)", fontSize: "0.95rem" }}>🎯 AI-Generated Career Recommendations</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.careerRecommendations.map((rec, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 18px", borderRadius: "14px",
                background: "var(--card-bg)", border: "1px solid var(--card-border)",
                transition: "all 0.2s ease",
                animation: `cogSlide 0.4s ease ${i * 0.08}s both`,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${cols.primary}30`; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.transform = ""; }}
              >
                <span style={{
                  width: 36, height: 36, borderRadius: "10px",
                  background: `${cols.primary}15`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.1rem", flexShrink: 0,
                }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "⭐"}
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{rec}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {i === 0 ? "Best match based on cognitive profile" : i === 1 ? "Strong alternative career path" : "Also consider this role"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecruiterCandidateList({ onSelectCandidate }) {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ color: "var(--text-primary)", margin: "0 0 4px", fontSize: "1.3rem" }}>Cognitive Hiring Intelligence</h2>
        <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem" }}>
          AI-powered cognitive analysis for candidates — select a candidate to view their full profile.
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {sampleCognitiveCandidates.map((candidate, idx) => {
          const c = roleColorMap[candidate.role] || roleColorMap.General;
          const p = candidate.profile;
          return (
            <div key={candidate.id} style={{
              background: "var(--card-bg)", border: `1px solid var(--card-border)`,
              borderRadius: "16px", padding: "18px", cursor: "pointer",
              transition: "all 0.3s ease", borderLeft: `3px solid ${c.primary}`,
              animation: `cogSlide 0.4s ease ${idx * 0.05}s both`,
            }}
              onClick={() => onSelectCandidate(candidate)}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "12px",
                  background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 800, fontSize: "1rem", flexShrink: 0,
                }}>
                  {candidate.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>{candidate.name}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{candidate.role} · {p.thinkingStyle}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <div style={{
                    padding: "3px 10px", borderRadius: "8px", fontSize: "0.65rem", fontWeight: 700,
                    background: p.recommendation.label === "Highly Recommended" ? "rgba(16,185,129,0.1)" : p.recommendation.label === "Excellent Problem Solver" ? "rgba(99,102,241,0.1)" : p.recommendation.label === "Fast Learner" ? "rgba(139,92,246,0.1)" : "rgba(245,158,11,0.1)",
                    color: p.recommendation.color,
                  }}>
                    {p.recommendation.label}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </div>
              </div>
              <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", padding: "2px 8px", background: "var(--bg-tertiary)", borderRadius: "6px" }}>🧠 IQ: {p.iqScore}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", padding: "2px 8px", background: "var(--bg-tertiary)", borderRadius: "6px" }}>🎯 Cognitive: {p.overallCognitive}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", padding: "2px 8px", background: "var(--bg-tertiary)", borderRadius: "6px" }}>📊 Readiness: {p.interviewReadiness}%</span>
                {p.strengths.slice(0, 2).map(s => (
                  <span key={s} style={{ fontSize: "0.65rem", color: "#10b981", padding: "2px 8px", background: "rgba(16,185,129,0.08)", borderRadius: "6px" }}>✓ {s}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CognitiveIntelligenceSystem({ view = "candidate", role, candidateName, onClose }) {
  const [data, setData] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetailData, setCandidateDetailData] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const result = generateCognitiveProfile(role || "Frontend", "medium");
      setData(result);
      setGenerating(false);
    }, 900);
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setCandidateDetailData(candidate.profile);
  };

  if (!data && !selectedCandidate && view !== "recruiter-list") {
    return (
      <div style={{
        background: "var(--card-bg)", border: "1px solid var(--card-border)",
        borderRadius: "20px", padding: "48px 32px", textAlign: "center",
        animation: "slideUp 0.4s ease",
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "20px",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 8px 24px rgba(99,102,241,0.3)",
          animation: "float 6s ease-in-out infinite",
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="8" r="1" fill="white" />
            <circle cx="9" cy="11" r="1" fill="white" />
            <circle cx="15" cy="11" r="1" fill="white" />
          </svg>
        </div>
        <h2 style={{ color: "var(--text-primary)", margin: "0 0 8px", fontSize: "1.3rem" }}>Cognitive Hiring Intelligence System</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto 24px", fontSize: "0.9rem", lineHeight: 1.6 }}>
          Advanced AI-powered analysis that evaluates thinking style, problem-solving ability, communication patterns, and behavioral intelligence during assessments.
        </p>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <button onClick={handleGenerate} disabled={generating} style={{
            padding: "14px 36px", borderRadius: "14px", border: "none",
            background: generating ? "var(--bg-tertiary)" : "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
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
              <><span className="spinner"></span> Analyzing Cognitive Profile...</>
            ) : (
              <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Generate My Cognitive Profile</>
            )}
          </button>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
            Analyzes thinking style, problem-solving, communication, and behavioral patterns
          </p>
        </div>
      </div>
    );
  }

  if (view === "recruiter-list") {
    return (
      <div>
        <RecruiterCandidateList onSelectCandidate={handleViewCandidate} />
        {selectedCandidate && candidateDetailData && (
          <div style={{ marginTop: "32px" }}>
            <RecruiterCognitiveDashboard
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
            <h2 style={{ color: "var(--text-primary)", margin: 0, fontSize: "1.2rem" }}>Your Cognitive Profile Report</h2>
            <p style={{ color: "var(--text-secondary)", margin: "2px 0 0", fontSize: "0.85rem" }}>
              Generated {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
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
        <CandidateCognitiveDashboard data={data} candidateName={candidateName || "Candidate"} />
      </div>
    );
  }

  return null;
}

const styleEl = document.createElement("style");
styleEl.textContent = `
  @keyframes cogSlide {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;
document.head.appendChild(styleEl);
