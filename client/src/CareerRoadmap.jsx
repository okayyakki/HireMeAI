import { useState, useEffect, useRef } from "react";
import { findCareer, getAllCareerSuggestions, getTrendingCareers, FASTEST_GROWING_SKILLS } from "./careerRoadmapData";

export default function CareerRoadmap({ compact }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState(new Set());
  const [completedItems, setCompletedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hm_roadmap_completed") || "{}"); }
    catch { return {}; }
  });
  const [visiblePhases, setVisiblePhases] = useState(new Set());
  const [showTrending, setShowTrending] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const phaseRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedCareer) {
      setVisiblePhases(new Set());
      const timer = setTimeout(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const phaseNum = Number(entry.target.dataset.phase);
                setVisiblePhases((prev) => new Set([...prev, phaseNum]));
              }
            });
          },
          { threshold: 0.15 }
        );
        Object.values(phaseRefs.current).forEach((el) => {
          if (el) observer.observe(el);
        });
        return () => observer.disconnect();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedCareer, expandedPhases]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 1) {
      setSuggestions(getAllCareerSuggestions(val));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCareer = (careerLabel) => {
    const career = findCareer(careerLabel);
    if (career) {
      setSelectedCareer(career);
      setSearchQuery(career.label);
      setShowSuggestions(false);
      setShowTrending(false);
      setExpandedPhases(new Set([career.phases.length > 0 ? career.phases[0].phase : 1]));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      handleSelectCareer(suggestions[0]);
    }
  };

  const togglePhase = (phaseNum) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseNum)) next.delete(phaseNum);
      else next.add(phaseNum);
      return next;
    });
  };

  const toggleItem = (phaseNum, section, itemIndex) => {
    if (!selectedCareer) return;
    const key = `hm_${selectedCareer.label.replace(/\s+/g, "_")}_p${phaseNum}_${section}_${itemIndex}`;
    setCompletedItems(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      localStorage.setItem("hm_roadmap_completed", JSON.stringify(next));
      return next;
    });
  };

  const isItemChecked = (phaseNum, section, itemIndex) => {
    if (!selectedCareer) return false;
    const key = `hm_${selectedCareer.label.replace(/\s+/g, "_")}_p${phaseNum}_${section}_${itemIndex}`;
    return !!completedItems[key];
  };

  const getPhaseProgress = (phase) => {
    if (!selectedCareer) return 0;
    const sections = ["skills", "technologies", "projects", "courses", "youtube", "certifications"];
    let total = 0;
    let done = 0;
    sections.forEach(sec => {
      const items = phase[sec];
      if (items && Array.isArray(items)) {
        items.forEach((_, i) => {
          total++;
          if (isItemChecked(phase.phase, sec, i)) done++;
        });
      }
    });
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  const getAllPhaseProgress = () => {
    if (!selectedCareer) return 0;
    let total = 0;
    let done = 0;
    selectedCareer.phases.forEach(phase => {
      const sections = ["skills", "technologies", "projects", "courses", "youtube", "certifications"];
      sections.forEach(sec => {
        const items = phase[sec];
        if (items && Array.isArray(items)) {
          items.forEach((_, i) => {
            total++;
            if (isItemChecked(phase.phase, sec, i)) done++;
          });
        }
      });
    });
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  const resumeRoadmap = () => {
    if (!selectedCareer) return;
    let lowestIncomplete = null;
    for (const phase of selectedCareer.phases) {
      const progress = getPhaseProgress(phase);
      if (progress < 100) {
        lowestIncomplete = phase.phase;
        break;
      }
    }
    if (lowestIncomplete === null) lowestIncomplete = selectedCareer.phases[selectedCareer.phases.length - 1].phase;
    setExpandedPhases(prev => new Set([...prev, lowestIncomplete]));
    setTimeout(() => {
      const el = phaseRefs.current[lowestIncomplete];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const career = selectedCareer;
  const roleColor = career?.color || "#6366f1";

  if (!career) {
    const trending = getTrendingCareers();
    return (
      <div className="roadmap-section">
        <div className="roadmap-search-container" ref={searchRef}>
          <div className={`roadmap-search-wrapper ${searchFocused ? "focused" : ""}`}>
            <svg className="roadmap-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="roadmap-search-input"
              placeholder="Search any career, technology, or skill..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => { setSearchFocused(true); if (suggestions.length > 0) setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button className="roadmap-search-clear" onClick={() => { setSearchQuery(""); setSuggestions([]); setShowSuggestions(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="roadmap-suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="roadmap-suggestion-item" onClick={() => handleSelectCareer(s)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="roadmap-trending-section">
          <div className="roadmap-trending-header">
            <h3 className="roadmap-trending-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
              Trending Careers
            </h3>
            <p className="roadmap-trending-subtitle">Click any career to view its complete roadmap</p>
          </div>
          <div className="roadmap-trending-grid">
            {trending.map((t, i) => {
              const colors = [
                { primary: "#6366f1", secondary: "#818cf8" },
                { primary: "#10b981", secondary: "#34d399" },
                { primary: "#f59e0b", secondary: "#fbbf24" },
                { primary: "#8b5cf6", secondary: "#a78bfa" },
                { primary: "#ec4899", secondary: "#f472b6" },
                { primary: "#3b82f6", secondary: "#60a5fa" },
                { primary: "#14b8a6", secondary: "#5eead4" },
                { primary: "#f97316", secondary: "#fb923c" },
              ];
              const c = colors[i % colors.length];
              return (
                <button key={i} className="roadmap-trending-card" style={{ "--card-color": c.primary, "--card-glow": `${c.primary}20` }}
                  onClick={() => handleSelectCareer(t.label)}>
                  <div className="roadmap-trending-card-bg" style={{ background: `linear-gradient(135deg, ${c.primary}08, transparent)` }} />
                  <div className="roadmap-trending-card-border" style={{ background: `linear-gradient(135deg, ${c.primary}30, transparent 60%)` }} />
                  <div className="roadmap-trending-card-top">
                    <span className="roadmap-trending-card-icon" style={{ background: `${c.primary}15`, color: c.primary }}>
                      {t.icon || "\uD83D\uDE80"}
                    </span>
                    <span className="roadmap-trending-card-demand" style={{ background: `${c.primary}15`, color: c.primary, borderColor: `${c.primary}20` }}>
                      {t.demand || "High"}
                    </span>
                  </div>
                  <h4 className="roadmap-trending-card-title">{t.label}</h4>
                  <div className="roadmap-trending-card-meta">
                    <span className="roadmap-trending-card-tag" style={{ background: `${c.primary}10`, borderColor: `${c.primary}15` }}>
                      {t.difficulty || "Medium"}
                    </span>
                    <span className="roadmap-trending-card-tag" style={{ background: `${c.primary}10`, borderColor: `${c.primary}15` }}>
                      {t.salaryRange || "$80k - $160k"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="roadmap-fastest-skills">
          <h3 className="roadmap-fastest-skills-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Fastest Growing Skills
          </h3>
          <div className="roadmap-fastest-skills-tags">
            {FASTEST_GROWING_SKILLS.map((skill, i) => (
              <span key={i} className="roadmap-fastest-skill-tag" style={{
                background: `linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))`,
                borderColor: "rgba(99,102,241,0.2)",
                color: "#818cf8",
                animationDelay: `${i * 0.08}s`,
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <style>{`
          .roadmap-section { width: 100%; }
          .roadmap-search-container { position: relative; max-width: 640px; margin: 0 auto 40px; z-index: 100; }
          .roadmap-search-wrapper {
            display: flex; align-items: center; gap: 12px;
            padding: 14px 20px;
            border-radius: 16px;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          }
          .roadmap-search-wrapper.focused {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 8px 32px rgba(0,0,0,0.08);
          }
          .roadmap-search-icon { color: var(--text-muted); flex-shrink: 0; }
          .roadmap-search-input {
            flex: 1; border: none; outline: none; background: transparent;
            font-size: 1rem; color: var(--text-primary); font-family: inherit;
          }
          .roadmap-search-input::placeholder { color: var(--text-muted); }
          .roadmap-search-clear {
            background: none; border: none; cursor: pointer; color: var(--text-muted);
            padding: 4px; border-radius: 8px; display: flex; transition: all 0.2s;
          }
          .roadmap-search-clear:hover { background: var(--bg-tertiary); color: var(--text-primary); }
          .roadmap-suggestions {
            position: absolute; top: calc(100% + 8px); left: 0; right: 0;
            background: var(--card-bg); border: 1px solid var(--card-border);
            border-radius: 16px; overflow: hidden;
            box-shadow: var(--shadow-lg);
            animation: roadmapFadeIn 0.2s ease;
          }
          @keyframes roadmapFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
          .roadmap-suggestion-item {
            width: 100%; padding: 12px 16px; border: none; background: transparent;
            display: flex; align-items: center; gap: 10px; cursor: pointer;
            font-size: 0.9rem; color: var(--text-primary); font-family: inherit;
            transition: all 0.15s;
          }
          .roadmap-suggestion-item:hover { background: rgba(99,102,241,0.08); }
          .roadmap-trending-section { margin-bottom: 32px; }
          .roadmap-trending-header { margin-bottom: 20px; }
          .roadmap-trending-title {
            display: flex; align-items: center; gap: 8px;
            font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0 0 6px;
          }
          .roadmap-trending-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }
          .roadmap-trending-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px;
          }
          .roadmap-trending-card {
            position: relative; padding: 18px; border-radius: 16px;
            background: var(--card-bg); border: 1px solid var(--card-border);
            cursor: pointer; text-align: left; font-family: inherit;
            transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
            overflow: hidden;
          }
          .roadmap-trending-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.1);
            border-color: var(--card-color);
          }
          .dark .roadmap-trending-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
          .roadmap-trending-card-bg { position: absolute; inset: 0; pointer-events: none; }
          .roadmap-trending-card-border {
            position: absolute; inset: 0; border-radius: 16px; padding: 1px;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor; mask-composite: exclude;
            opacity: 0; transition: opacity 0.4s; pointer-events: none;
          }
          .roadmap-trending-card:hover .roadmap-trending-card-border { opacity: 1; }
          .roadmap-trending-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
          .roadmap-trending-card-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
          .roadmap-trending-card-demand { padding: 2px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; border: 1px solid; }
          .roadmap-trending-card-title { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0 0 10px; }
          .roadmap-trending-card-meta { display: flex; gap: 6px; flex-wrap: wrap; }
          .roadmap-trending-card-tag { padding: 2px 8px; border-radius: 6px; font-size: 0.65rem; font-weight: 600; border: 1px solid; color: var(--text-secondary); }

          .roadmap-fastest-skills {
            margin-bottom: 40px; padding: 20px 24px; border-radius: 16px;
            background: var(--card-bg); border: 1px solid var(--card-border);
          }
          .roadmap-fastest-skills-title {
            display: flex; align-items: center; gap: 8px;
            font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin: 0 0 14px;
          }
          .roadmap-fastest-skills-tags { display: flex; flex-wrap: wrap; gap: 8px; }
          .roadmap-fastest-skill-tag {
            padding: 6px 14px; border-radius: 100px; font-size: 0.78rem; font-weight: 600;
            border: 1px solid; animation: roadmapFadeIn 0.4s ease forwards; opacity: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="roadmap-section roadmap-section--active">
      <div className="roadmap-search-container roadmap-search-container--result" ref={searchRef}>
        <div className={`roadmap-search-wrapper ${searchFocused ? "focused" : ""}`}>
          <svg className="roadmap-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="roadmap-search-input"
            placeholder="Search another career..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => { setSearchFocused(true); if (suggestions.length > 0) setShowSuggestions(true); }}
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <button className="roadmap-search-clear" onClick={() => { setSearchQuery(""); setSuggestions([]); setShowSuggestions(false); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="roadmap-suggestions">
            {suggestions.map((s, i) => (
              <button key={i} className="roadmap-suggestion-item" onClick={() => handleSelectCareer(s)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="roadmap-career-header" style={{ "--role-color": roleColor }}>
        <div className="roadmap-career-header-bg" style={{ background: `linear-gradient(135deg, ${roleColor}08, transparent 60%)` }} />
        <div className="roadmap-career-header-border" style={{ background: `linear-gradient(135deg, ${roleColor}20, transparent 70%)` }} />

        <div className="roadmap-career-header-top">
          <div className="roadmap-career-header-info">
            <div className="roadmap-career-header-icon" style={{ background: `${roleColor}15`, color: roleColor }}>
              {career.icon || "\uD83D\uDE80"}
            </div>
            <div>
              <h2 className="roadmap-career-header-title" style={{ color: roleColor }}>
                {career.label}
                {career.isGenerated && <span className="roadmap-career-header-badge">AI Generated</span>}
              </h2>
              <p className="roadmap-career-header-growth">{career.growthPath}</p>
            </div>
          </div>
          <div className="roadmap-career-header-stats">
            <div className="roadmap-hiring-gauge" style={{ "--gauge-color": roleColor }}>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="24" fill="none" stroke="var(--card-border)" strokeWidth="4"/>
                <circle cx="30" cy="30" r="24" fill="none" stroke={roleColor} strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - career.hiringReadiness / 100)}`}
                  transform="rotate(-90 30 30)"
                  strokeLinecap="round" />
              </svg>
              <div className="roadmap-hiring-gauge-value">
                <span className="roadmap-hiring-gauge-num">{career.hiringReadiness}%</span>
                <span className="roadmap-hiring-gauge-label">Ready</span>
              </div>
            </div>
          </div>
        </div>

        <div className="roadmap-career-header-meta">
          <div className="roadmap-career-meta-item" style={{ background: `${roleColor}08`, borderColor: `${roleColor}15` }}>
            <span className="roadmap-career-meta-label">Difficulty</span>
            <span className="roadmap-career-meta-value" style={{ color: career.difficulty === "Hard" ? "#f87171" : career.difficulty === "Medium" ? "#fbbf24" : "#34d399" }}>
              {career.difficulty}
            </span>
          </div>
          <div className="roadmap-career-meta-item" style={{ background: `${roleColor}08`, borderColor: `${roleColor}15` }}>
            <span className="roadmap-career-meta-label">Demand</span>
            <span className="roadmap-career-meta-value" style={{ color: "#34d399" }}>{career.demand}</span>
          </div>
          <div className="roadmap-career-meta-item" style={{ background: `${roleColor}08`, borderColor: `${roleColor}15` }}>
            <span className="roadmap-career-meta-label">Salary Range</span>
            <span className="roadmap-career-meta-value">{career.salaryRange}</span>
          </div>
          <div className="roadmap-career-meta-item" style={{ background: `${roleColor}08`, borderColor: `${roleColor}15` }}>
            <span className="roadmap-career-meta-label">Est. Timeline</span>
            <span className="roadmap-career-meta-value">{career.estimatedTimeline}</span>
          </div>
        </div>

        {career.prerequisites && career.prerequisites.length > 0 && (
          <div className="roadmap-career-prereqs">
            <span className="roadmap-career-prereqs-label">Prerequisites:</span>
            <div className="roadmap-career-prereqs-tags">
              {career.prerequisites.map((p, i) => (
                <span key={i} className="roadmap-career-prereq-tag" style={{ background: `${roleColor}10`, color: roleColor, borderColor: `${roleColor}20` }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="roadmap-career-actions">
          <div className="roadmap-career-progress-info">
            <div className="roadmap-career-progress-bar-track">
              <div className="roadmap-career-progress-bar-fill" style={{ width: `${getAllPhaseProgress()}%`, background: `linear-gradient(90deg, ${roleColor}, ${roleColor}cc)` }} />
            </div>
            <span className="roadmap-career-progress-text">{getAllPhaseProgress()}% complete</span>
          </div>
          <button className="roadmap-resume-btn" onClick={resumeRoadmap} style={{ background: `${roleColor}15`, color: roleColor, borderColor: `${roleColor}25` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Resume Roadmap
          </button>
        </div>
      </div>

      <div className="roadmap-timeline">
        <div className="roadmap-line" style={{ background: `linear-gradient(180deg, ${roleColor}40, ${roleColor}10)` }} />
        <div className="roadmap-line-progress" style={{
          background: `linear-gradient(180deg, ${roleColor}, ${roleColor}80)`,
          boxShadow: `0 0 16px ${roleColor}60`,
        }} />

        {career.phases.map((phase, index) => {
          const isVisible = visiblePhases.has(phase.phase);
          const isExpanded = expandedPhases.has(phase.phase);
          const progress = getPhaseProgress(phase);
          const coursesList = phase.courses || [];

          return (
            <div
              key={phase.phase}
              className={`roadmap-phase ${isVisible ? "visible" : ""}`}
              ref={(el) => (phaseRefs.current[phase.phase] = el)}
              data-phase={phase.phase}
              style={{ "--delay": `${index * 0.15}s` }}
            >
              <div className="roadmap-phase-dot" style={{ background: roleColor, boxShadow: `0 0 0 4px ${roleColor}20` }}>
                <span>{phase.phase}</span>
              </div>

              <div className="roadmap-phase-card" onClick={() => togglePhase(phase.phase)} style={{ cursor: "pointer" }}>
                <div className="roadmap-phase-card-bg" style={{ background: `linear-gradient(135deg, ${roleColor}06, transparent)` }} />
                <div className="roadmap-phase-card-border" style={{ background: `linear-gradient(135deg, ${roleColor}25, transparent 60%)` }} />

                <div className="roadmap-phase-header">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span className="roadmap-phase-badge" style={{ background: `${roleColor}15`, color: roleColor, borderColor: `${roleColor}20` }}>
                        Phase {phase.phase}
                      </span>
                      <span className="roadmap-phase-difficulty-badge" style={{
                        background: phase.difficulty === "Advanced" || phase.difficulty === "Expert" ? "rgba(248,113,113,0.12)" : phase.difficulty === "Intermediate" ? "rgba(251,191,36,0.12)" : "rgba(52,211,153,0.12)",
                        color: phase.difficulty === "Advanced" || phase.difficulty === "Expert" ? "#f87171" : phase.difficulty === "Intermediate" ? "#fbbf24" : "#34d399",
                        borderColor: phase.difficulty === "Advanced" || phase.difficulty === "Expert" ? "rgba(248,113,113,0.2)" : phase.difficulty === "Intermediate" ? "rgba(251,191,36,0.2)" : "rgba(52,211,153,0.2)",
                      }}>
                        {phase.difficulty}
                      </span>
                      {phase.estimatedWeeks && (
                        <span className="roadmap-phase-weeks-badge" style={{ color: roleColor, background: `${roleColor}10`, borderColor: `${roleColor}20` }}>
                          ~{phase.estimatedWeeks} weeks
                        </span>
                      )}
                    </div>
                    <h3 className="roadmap-phase-title">{phase.title}</h3>
                    <p className="roadmap-phase-subtitle">{phase.subtitle}</p>
                  </div>
                  <div className="roadmap-phase-right">
                    <div className="roadmap-phase-mini-progress">
                      <div className="roadmap-phase-mini-track">
                        <div className="roadmap-phase-mini-fill" style={{ width: `${progress}%`, background: roleColor }} />
                      </div>
                      <span className="roadmap-phase-mini-text">{progress}%</span>
                    </div>
                    <svg className={`roadmap-chevron ${isExpanded ? "rotated" : ""}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="roadmap-phase-body" onClick={e => e.stopPropagation()}>
                    <div className="roadmap-block">
                      <div className="roadmap-block-header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={roleColor} strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                        Skills to Learn
                      </div>
                      <div className="roadmap-check-list">
                        {phase.skills.map((s, i) => (
                          <label key={i} className="roadmap-check-item" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" className="roadmap-checkbox" checked={isItemChecked(phase.phase, "skills", i)}
                              onChange={() => toggleItem(phase.phase, "skills", i)} />
                            <span className="roadmap-checkbox-custom" style={{ borderColor: `${roleColor}40`, "--check-color": roleColor }} />
                            <span className="roadmap-check-label">{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {phase.technologies && phase.technologies.length > 0 && (
                      <div className="roadmap-block">
                        <div className="roadmap-block-header">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={roleColor} strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          Tools & Frameworks
                        </div>
                        <div className="roadmap-techs">
                          {phase.technologies.map((t, i) => (
                            <div key={i} className="roadmap-tech" style={{ borderColor: `${roleColor}15` }}>
                              <span>{t.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {phase.projects && phase.projects.length > 0 && (
                      <div className="roadmap-block">
                        <div className="roadmap-block-header">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={roleColor} strokeWidth="2"><path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
                          Projects to Build
                        </div>
                        <div className="roadmap-check-list">
                          {phase.projects.map((p, i) => (
                            <label key={i} className="roadmap-check-item" onClick={e => e.stopPropagation()}>
                              <input type="checkbox" className="roadmap-checkbox" checked={isItemChecked(phase.phase, "projects", i)}
                                onChange={() => toggleItem(phase.phase, "projects", i)} />
                              <span className="roadmap-checkbox-custom" style={{ borderColor: `${roleColor}40`, "--check-color": roleColor }} />
                              <span className="roadmap-check-label">{p}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {coursesList.length > 0 && (
                      <div className="roadmap-block">
                        <div className="roadmap-block-header">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={roleColor} strokeWidth="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                          Courses
                        </div>
                        <div className="roadmap-check-list">
                          {coursesList.map((c, i) => (
                            <label key={i} className="roadmap-check-item" onClick={e => e.stopPropagation()}>
                              <input type="checkbox" className="roadmap-checkbox" checked={isItemChecked(phase.phase, "courses", i)}
                                onChange={() => toggleItem(phase.phase, "courses", i)} />
                              <span className="roadmap-checkbox-custom" style={{ borderColor: `${roleColor}40`, "--check-color": roleColor }} />
                              <span className="roadmap-check-label">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={roleColor} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                {c}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {phase.youtube && phase.youtube.length > 0 && (
                      <div className="roadmap-block">
                        <div className="roadmap-block-header">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={roleColor} strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29.05 29.05 0 001 12a29.05 29.05 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29.05 29.05 0 0023 12a29.05 29.05 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                          YouTube Channels
                        </div>
                        <div className="roadmap-check-list">
                          {phase.youtube.map((y, i) => (
                            <label key={i} className="roadmap-check-item" onClick={e => e.stopPropagation()}>
                              <input type="checkbox" className="roadmap-checkbox" checked={isItemChecked(phase.phase, "youtube", i)}
                                onChange={() => toggleItem(phase.phase, "youtube", i)} />
                              <span className="roadmap-checkbox-custom" style={{ borderColor: `${roleColor}40`, "--check-color": roleColor }} />
                              <span className="roadmap-check-label">{y}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {phase.certifications && phase.certifications.length > 0 && (
                      <div className="roadmap-block">
                        <div className="roadmap-block-header">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={roleColor} strokeWidth="2"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                          Certifications
                        </div>
                        <div className="roadmap-check-list">
                          {phase.certifications.map((ce, i) => (
                            <label key={i} className="roadmap-check-item" onClick={e => e.stopPropagation()}>
                              <input type="checkbox" className="roadmap-checkbox" checked={isItemChecked(phase.phase, "certifications", i)}
                                onChange={() => toggleItem(phase.phase, "certifications", i)} />
                              <span className="roadmap-checkbox-custom" style={{ borderColor: `${roleColor}40`, "--check-color": roleColor }} />
                              <span className="roadmap-check-label">{ce}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {phase.resources && phase.resources.length > 0 && (
                      <div className="roadmap-block">
                        <div className="roadmap-block-header">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={roleColor} strokeWidth="2"><path d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                          Learning Resources
                        </div>
                        <div className="roadmap-resources">
                          {phase.resources.map((r, i) => (
                            <div key={i} className="roadmap-resource-item" style={{ borderColor: `${roleColor}10` }}>
                              <span className="roadmap-resource-type" style={{
                                background: r.type === "course" ? `${roleColor}12` : r.type === "youtube" ? "rgba(239,68,68,0.12)" : `${roleColor}10`,
                                color: r.type === "course" ? roleColor : r.type === "youtube" ? "#ef4444" : "#f59e0b",
                              }}>
                                {r.type === "course" ? "Course" : r.type === "youtube" ? "YouTube" : "Cert"}
                              </span>
                              <span className="roadmap-resource-title">{r.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .roadmap-section { width: 100%; }
        .roadmap-section--active .roadmap-search-container { max-width: 480px; margin-bottom: 32px; }

        .roadmap-search-container { position: relative; z-index: 100; }
        .roadmap-search-container--result { z-index: 50; }
        .roadmap-search-wrapper {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 20px;
          border-radius: 16px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .roadmap-search-wrapper.focused {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 8px 32px rgba(0,0,0,0.08);
        }
        .roadmap-search-icon { color: var(--text-muted); flex-shrink: 0; }
        .roadmap-search-input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 1rem; color: var(--text-primary); font-family: inherit;
        }
        .roadmap-search-input::placeholder { color: var(--text-muted); }
        .roadmap-search-clear {
          background: none; border: none; cursor: pointer; color: var(--text-muted);
          padding: 4px; border-radius: 8px; display: flex; transition: all 0.2s;
        }
        .roadmap-search-clear:hover { background: var(--bg-tertiary); color: var(--text-primary); }
        .roadmap-suggestions {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: var(--card-bg); border: 1px solid var(--card-border);
          border-radius: 16px; overflow: hidden;
          box-shadow: var(--shadow-lg);
          animation: roadmapFadeIn 0.2s ease;
        }
        @keyframes roadmapFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .roadmap-suggestion-item {
          width: 100%; padding: 12px 16px; border: none; background: transparent;
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          font-size: 0.9rem; color: var(--text-primary); font-family: inherit;
          transition: all 0.15s;
        }
        .roadmap-suggestion-item:hover { background: rgba(99,102,241,0.08); }

        .roadmap-career-header {
          position: relative; border-radius: 20px; padding: 28px;
          margin-bottom: 40px; overflow: hidden;
          background: var(--card-bg); border: 1px solid var(--card-border);
        }
        .roadmap-career-header-bg { position: absolute; inset: 0; pointer-events: none; }
        .roadmap-career-header-border {
          position: absolute; inset: 0; border-radius: 20px; padding: 1px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          pointer-events: none;
        }
        .roadmap-career-header-top { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 20px; position: relative; flex-wrap: wrap; }
        .roadmap-career-header-info { display: flex; align-items: center; gap: 16px; }
        .roadmap-career-header-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
        .roadmap-career-header-title { font-size: 1.5rem; font-weight: 800; margin: 0 0 2px; letter-spacing: -0.3px; display: flex; align-items: center; gap: 10px; }
        .roadmap-career-header-badge { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 10px; border-radius: 6px; background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.2); }
        .roadmap-career-header-growth { font-size: 0.82rem; color: var(--text-secondary); margin: 0; }
        .roadmap-hiring-gauge { position: relative; width: 60px; height: 60px; flex-shrink: 0; }
        .roadmap-hiring-gauge-value { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .roadmap-hiring-gauge-num { font-size: 0.85rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
        .roadmap-hiring-gauge-label { font-size: 0.55rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; }

        .roadmap-career-header-meta { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; position: relative; }
        .roadmap-career-meta-item { padding: 10px 16px; border-radius: 12px; border: 1px solid; flex: 1; min-width: 120px; }
        .roadmap-career-meta-label { display: block; font-size: 0.65rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 4px; }
        .roadmap-career-meta-value { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }

        .roadmap-career-prereqs { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; position: relative; }
        .roadmap-career-prereqs-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; }
        .roadmap-career-prereqs-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .roadmap-career-prereq-tag { padding: 4px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 500; border: 1px solid; }

        .roadmap-career-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; position: relative; }
        .roadmap-career-progress-info { flex: 1; display: flex; align-items: center; gap: 12px; min-width: 180px; }
        .roadmap-career-progress-bar-track { flex: 1; height: 6px; background: var(--card-border); border-radius: 3px; overflow: hidden; }
        .roadmap-career-progress-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
        .roadmap-career-progress-text { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); white-space: nowrap; }
        .roadmap-resume-btn {
          display: flex; align-items: center; gap: 8px; padding: 8px 16px;
          border-radius: 10px; border: 1px solid; cursor: pointer;
          font-size: 0.78rem; font-weight: 600; font-family: inherit;
          transition: all 0.3s ease; white-space: nowrap;
        }
        .roadmap-resume-btn:hover { transform: translateY(-2px); filter: brightness(1.2); }

        .roadmap-timeline { position: relative; max-width: 800px; margin: 0 auto; padding-left: 40px; }
        .roadmap-line { position: absolute; left: 17px; top: 0; bottom: 0; width: 2px; z-index: 0; }
        .roadmap-line-progress { position: absolute; left: 17px; top: 0; bottom: 0; width: 2px; z-index: 1; animation: roadmapLineGrow 1.5s ease-out forwards; transform-origin: top; }
        @keyframes roadmapLineGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }

        .roadmap-phase { position: relative; margin-bottom: 32px; opacity: 0; transform: translateX(-20px); transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1); transition-delay: var(--delay, 0s); }
        .roadmap-phase.visible { opacity: 1; transform: translateX(0); }
        .roadmap-phase-dot { position: absolute; left: -32px; top: 28px; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 800; color: #fff; z-index: 2; transition: transform 0.4s ease, box-shadow 0.4s ease; }
        .roadmap-phase.visible .roadmap-phase-dot { animation: roadmapDotPulse 0.6s ease-out; }
        @keyframes roadmapDotPulse { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }

        .roadmap-phase-card { position: relative; border-radius: 20px; padding: 24px; overflow: hidden; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
        .dark .roadmap-phase-card { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.04); }
        .roadmap-phase-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(0,0,0,0.12); border-color: rgba(255,255,255,0.1); }
        .dark .roadmap-phase-card:hover { box-shadow: 0 16px 48px rgba(0,0,0,0.3); }
        .roadmap-phase-card-bg { position: absolute; inset: 0; opacity: 0.5; pointer-events: none; }
        .roadmap-phase-card-border { position: absolute; inset: 0; border-radius: 20px; padding: 1px; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0.3; transition: opacity 0.4s ease; pointer-events: none; }
        .roadmap-phase-card:hover .roadmap-phase-card-border { opacity: 0.7; }

        .roadmap-phase-header { display: flex; align-items: flex-start; gap: 16px; }
        .roadmap-phase-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .roadmap-chevron { transition: transform 0.3s ease; color: var(--text-muted); flex-shrink: 0; }
        .roadmap-chevron.rotated { transform: rotate(180deg); }

        .roadmap-phase-mini-progress { display: flex; align-items: center; gap: 8px; }
        .roadmap-phase-mini-track { width: 60px; height: 4px; background: var(--card-border); border-radius: 2px; overflow: hidden; }
        .roadmap-phase-mini-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
        .roadmap-phase-mini-text { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); }

        .roadmap-phase-badge { display: inline-block; padding: 3px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; border: 1px solid; text-transform: uppercase; letter-spacing: 0.5px; }
        .roadmap-phase-difficulty-badge { padding: 2px 10px; border-radius: 6px; font-size: 0.62rem; font-weight: 700; border: 1px solid; text-transform: uppercase; letter-spacing: 0.3px; }
        .roadmap-phase-weeks-badge { padding: 2px 8px; border-radius: 6px; font-size: 0.62rem; font-weight: 600; border: 1px solid; }
        .roadmap-phase-title { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin: 8px 0 4px; }
        .roadmap-phase-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }

        .roadmap-phase-body { display: flex; flex-direction: column; gap: 20px; margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--card-border); }
        .roadmap-block {}
        .roadmap-block-header { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }

        .roadmap-check-list { display: flex; flex-direction: column; gap: 6px; }
        .roadmap-check-item { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 6px 8px; border-radius: 8px; transition: background 0.15s; font-size: 0.85rem; color: var(--text-primary); }
        .roadmap-check-item:hover { background: rgba(255,255,255,0.03); }
        .roadmap-checkbox { display: none; }
        .roadmap-checkbox-custom { width: 18px; height: 18px; border-radius: 5px; border: 2px solid; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; position: relative; }
        .roadmap-checkbox:checked + .roadmap-checkbox-custom { background: var(--check-color, #6366f1); border-color: var(--check-color, #6366f1); }
        .roadmap-checkbox:checked + .roadmap-checkbox-custom::after { content: ''; width: 5px; height: 9px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); position: absolute; top: 1px; }
        .roadmap-check-label { display: flex; align-items: center; gap: 6px; }
        .roadmap-checkbox:checked ~ .roadmap-check-label { text-decoration: line-through; opacity: 0.5; }

        .roadmap-techs { display: flex; flex-wrap: wrap; gap: 8px; }
        .roadmap-tech { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 10px; border: 1px solid; background: rgba(255,255,255,0.03); backdrop-filter: blur(4px); font-size: 0.78rem; font-weight: 500; color: var(--text-primary); transition: all 0.3s ease; }
        .roadmap-tech:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

        .roadmap-resources { display: flex; flex-direction: column; gap: 6px; }
        .roadmap-resource-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid; transition: all 0.3s ease; }
        .roadmap-resource-item:hover { background: rgba(255,255,255,0.04); transform: translateX(4px); }
        .roadmap-resource-type { padding: 2px 8px; border-radius: 5px; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; flex-shrink: 0; }
        .roadmap-resource-title { font-size: 0.82rem; color: var(--text-primary); }

        @media (max-width: 768px) {
          .roadmap-timeline { padding-left: 32px; }
          .roadmap-phase-dot { left: -24px; width: 28px; height: 28px; font-size: 0.7rem; }
          .roadmap-line, .roadmap-line-progress { left: 12px; }
          .roadmap-career-header-top { flex-direction: column; align-items: flex-start; }
          .roadmap-career-header-meta { flex-direction: column; }
          .roadmap-trending-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
