import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function SkillGapAnalyzer({ token, jobSkills, resumeText, onClose }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (!resumeText || resumeText.trim().length < 20) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/skill-gap`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ resumeText: resumeText.trim(), jobSkills }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const matchColor = result
    ? result.matchPercentage >= 70 ? "#10b981"
      : result.matchPercentage >= 40 ? "#f59e0b"
      : "#ef4444"
    : "#6366f1";

  return (
    <div style={{
      border: "1px solid var(--card-border)",
      borderRadius: "16px",
      padding: "20px",
      background: "var(--bg-secondary)",
      marginTop: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <h4 style={{ margin: 0, color: "var(--text-primary)", fontSize: "1rem", fontWeight: 700 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, verticalAlign: "middle" }}>
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          AI Skill Gap Analyzer
        </h4>
        {!result && (
          <button
            onClick={analyze}
            disabled={loading || !resumeText || resumeText.trim().length < 20}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              background: loading ? "var(--text-muted)" : "var(--gradient-primary)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? <><span className="spinner-modern" style={{width:14,height:14,borderWidth:2,display:"inline-block",marginRight:6}}></span>Analyzing...</> : "Analyze Skill Gap"}
          </button>
        )}
      </div>

      {result && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
            <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={matchColor} strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - result.matchPercentage / 100)}`}
                  strokeLinecap="round" transform="rotate(-90 40 40)"
                  style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.3rem", fontWeight: 800, color: matchColor
              }}>
                {result.matchPercentage}%
              </div>
            </div>
            <div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 4 }}>Skills Match</div>
              <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem" }}>
                {result.matchedSkills.length} of {jobSkills.length} skills matched
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                {result.resumeSkillsFound.length} total skills found in resume
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
                Matched Skills ({result.matchedSkills.length})
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {result.matchedSkills.length > 0 ? result.matchedSkills.map((s, i) => (
                <span key={i} style={{
                  padding: "4px 10px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 500,
                  background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)"
                }}>{s}</span>
              )) : (
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No matching skills found</span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
                Missing Skills ({result.missingSkills.length})
              </span>
            </div>
            {result.missingSkills.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {result.missingSkills.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 12px", borderRadius: "10px",
                    background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)"
                  }}>
                    <span style={{ color: "#ef4444", fontWeight: 500, fontSize: "0.85rem" }}>{item.skill}</span>
                    {item.resource && (
                      <a href={item.resource} target="_blank" rel="noopener noreferrer"
                        style={{
                          padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600,
                          background: "rgba(99,102,241,0.1)", color: "#818cf8",
                          textDecoration: "none", transition: "all 0.2s"
                        }}
                        onMouseEnter={e => e.target.style.background = "rgba(99,102,241,0.2)"}
                        onMouseLeave={e => e.target.style.background = "rgba(99,102,241,0.1)"}
                      >Learn →</a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>All required skills covered!</span>
            )}
          </div>

          {result.matchPercentage < 70 && (
            <div style={{
              padding: "12px 16px", borderRadius: "12px",
              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span style={{ color: "#f59e0b", fontWeight: 600, fontSize: "0.85rem" }}>Suggestions</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.8 }}>
                <li>Consider learning the missing skills to increase your match rate</li>
                <li>Highlight transferable skills in your cover letter</li>
                <li>Add relevant projects demonstrating these skills to your resume</li>
              </ul>
            </div>
          )}

          <button
            onClick={() => { setResult(null); if (onClose) onClose(); }}
            style={{
              marginTop: "16px", padding: "8px 20px", borderRadius: "10px",
              border: "1px solid var(--card-border)", background: "var(--card-bg)",
              color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.85rem",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.target.style.background = "var(--bg-tertiary)"; e.target.style.color = "var(--text-primary)"; }}
            onMouseLeave={e => { e.target.style.background = "var(--card-bg)"; e.target.style.color = "var(--text-secondary)"; }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}