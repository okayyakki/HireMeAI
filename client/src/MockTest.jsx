import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { getQuestionsForJob, calculateLevel, evaluateCodingAnswer } from "./questions";

const TOTAL_SECONDS = 90 * 60;
const WARN_15 = 15 * 60;
const WARN_5 = 5 * 60;
const WARN_1 = 60;
const LS_KEY = "hm_mt_timer";
const LS_ANSWERS = "hm_mt_answers";
const LS_REVIEWED = "hm_mt_reviewed";
const LS_CODE = "hm_mt_code";
const LS_IDX = "hm_mt_idx";
const LS_PHASE = "hm_mt_phase";

const s = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 10001, padding: 16, backdropFilter: "blur(6px)"
  },
  modal: {
    background: "var(--card-bg)", border: "1px solid var(--card-border)",
    borderRadius: "20px", maxWidth: "960px", width: "100%",
    maxHeight: "94vh", display: "flex", flexDirection: "column",
    boxShadow: "var(--shadow-xl)", overflow: "hidden"
  },
  codeEditor: {
    width: "100%", minHeight: 180, padding: "14px 16px", borderRadius: 11,
    border: "1px solid var(--card-border)", background: "#0d1117",
    color: "#e6edf3", fontFamily: "'Fira Code','SF Mono',Consolas,monospace",
    fontSize: "0.85rem", lineHeight: 1.6, resize: "vertical", outline: "none",
    tabSize: 2, whiteSpace: "pre-wrap"
  },
  paletteBtn: (active) => ({
    width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
    fontSize: "0.72rem", fontWeight: 700, display: "flex", alignItems: "center",
    justifyContent: "center", transition: "all 0.15s ease",
    background: active ? "#6366f1" : "var(--bg-tertiary)",
    color: active ? "white" : "var(--text-muted)"
  }),
};

function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const S = sec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(S).padStart(2, "0")}`;
}

function WarningModal({ message, onClose }) {
  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10002,
      borderRadius: "20px"
    }} onClick={onClose}>
      <div style={{
        background: "var(--card-bg)", borderRadius: 16, padding: "28px 32px",
        maxWidth: 400, textAlign: "center", boxShadow: "var(--shadow-xl)",
        border: "1px solid var(--card-border)", animation: "popIn 0.3s ease"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⏰</div>
        <h3 style={{ margin: "0 0 8px", color: "var(--text-primary)", fontSize: "1.1rem" }}>{message}</h3>
        <p style={{ margin: "0 0 16px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>Make sure to save your progress and finish strong!</p>
        <button onClick={onClose} style={{
          padding: "10px 28px", borderRadius: 10, border: "none",
          background: "var(--gradient-primary)", color: "white",
          fontWeight: 600, cursor: "pointer", fontSize: "0.9rem"
        }}>Continue Test</button>
      </div>
    </div>
  );
}

export default function MockTest({ job, onComplete, onClose }) {
  const allQ = useMemo(() => getQuestionsForJob(job), [job]);

  const sections = useMemo(() => [
    { key: "technical", label: "Technical", icon: "💻", questions: allQ.technical },
    { key: "aptitude", label: "Aptitude", icon: "🧮", questions: allQ.aptitude },
    { key: "logical", label: "Logical", icon: "🧠", questions: allQ.logical },
    { key: "coding", label: "Coding", icon: "⚡", questions: allQ.coding },
  ].filter(s => s.questions.length > 0), [allQ]);

  const flatQ = useMemo(() => sections.flatMap(s => s.questions.map(q => ({ ...q, _section: s.key }))), [sections]);

  const sectionBoundaries = useMemo(() => {
    const b = {}; let idx = 0;
    for (const s of sections) {
      b[s.key] = { start: idx, end: idx + s.questions.length - 1 };
      idx += s.questions.length;
    }
    return b;
  }, [sections]);

  const [phase, setPhase] = useState(() => {
    try {
      const savedTimer = localStorage.getItem(LS_KEY);
      const savedPhase = localStorage.getItem(LS_PHASE);
      if (savedPhase === "test" && savedTimer) {
        const { end } = JSON.parse(savedTimer);
        if (Date.now() < end) return "intro";
      }
    } catch {}
    return "intro";
  });
  const [idx, setIdx] = useState(() => {
    try { const s = localStorage.getItem(LS_IDX); return s ? parseInt(s, 10) : 0; } catch { return 0; }
  });
  const [answers, setAnswers] = useState(() => {
    try { const s = localStorage.getItem(LS_ANSWERS); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [reviewed, setReviewed] = useState(() => {
    try { const s = localStorage.getItem(LS_REVIEWED); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const [codeAns, setCodeAns] = useState(() => {
    try { const s = localStorage.getItem(LS_CODE); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const { end } = JSON.parse(saved);
        const rem = Math.max(0, Math.floor((end - Date.now()) / 1000));
        if (rem > 0) return rem;
      }
    } catch {}
    return TOTAL_SECONDS;
  });
  const [timerStarted, setTimerStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [warning, setWarning] = useState(null);
  const [autoNext, setAutoNext] = useState(true);
  const [showPalette, setShowPalette] = useState(false);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(null);
  const [strengths, setStrengths] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);
  const [skillBreakdown, setSkillBreakdown] = useState([]);
  const [codingResults, setCodingResults] = useState([]);
  const [sectionScores, setSectionScores] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  const warningShownRef = useRef({});
  const answersRef = useRef(answers);
  const reviewedRef = useRef(reviewed);
  const codeAnsRef = useRef(codeAns);
  const idxRef = useRef(idx);
  const phaseRef = useRef(phase);
  const submittedRef = useRef(submitted);
  const computeResultsRef = useRef(null);
  const handleAutoSubmitRef = useRef(null);
  useEffect(() => {
    answersRef.current = answers;
    reviewedRef.current = reviewed;
    codeAnsRef.current = codeAns;
    idxRef.current = idx;
    phaseRef.current = phase;
    submittedRef.current = submitted;
    computeResultsRef.current = computeResults;
    handleAutoSubmitRef.current = handleAutoSubmit;
  });

  function clearSavedState() {
    [LS_ANSWERS, LS_REVIEWED, LS_CODE, LS_IDX, LS_PHASE, LS_KEY].forEach(k => localStorage.removeItem(k));
  }

  useEffect(() => {
    if (phase !== "test" || submitted) return;
    const id = setInterval(() => {
      localStorage.setItem(LS_ANSWERS, JSON.stringify(answersRef.current));
      localStorage.setItem(LS_REVIEWED, JSON.stringify(reviewedRef.current));
      localStorage.setItem(LS_CODE, JSON.stringify(codeAnsRef.current));
      localStorage.setItem(LS_IDX, String(idxRef.current));
    }, 30000);
    return () => clearInterval(id);
  }, [phase, submitted]);

  useEffect(() => {
    return () => {
      if (phaseRef.current === "test" && !submittedRef.current) {
        localStorage.setItem(LS_ANSWERS, JSON.stringify(answersRef.current));
        localStorage.setItem(LS_REVIEWED, JSON.stringify(reviewedRef.current));
        localStorage.setItem(LS_CODE, JSON.stringify(codeAnsRef.current));
        localStorage.setItem(LS_IDX, String(idxRef.current));
        localStorage.setItem(LS_PHASE, "test");
      }
    };
  }, []);

  useEffect(() => {
    if (!timerStarted || submitted) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(id);
          (handleAutoSubmitRef.current || handleAutoSubmit)();
          return 0;
        }
        const t = prev - 1;
        localStorage.setItem(LS_KEY, JSON.stringify({ end: Date.now() + t * 1000 }));
        return t;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerStarted, submitted]);

  useEffect(() => {
    if (!timerStarted || submitted || timeLeft <= 0) return;
    if (timeLeft <= WARN_1 && !warningShownRef.current["1m"]) {
      warningShownRef.current["1m"] = true; setWarning("⏰ Only 1 minute remaining!");
    } else if (timeLeft <= WARN_5 && !warningShownRef.current["5m"]) {
      warningShownRef.current["5m"] = true; setWarning("⏰ 5 minutes remaining! Finish up your answers.");
    } else if (timeLeft <= WARN_15 && !warningShownRef.current["15m"]) {
      warningShownRef.current["15m"] = true; setWarning("⏰ 15 minutes remaining! Review your answers.");
    }
  }, [timeLeft, timerStarted, submitted]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 50% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
      @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      .mt-hover:hover { border-color: rgba(99,102,241,0.35) !important; background: rgba(99,102,241,0.04) !important; }
      .mt-fade { animation: fadeIn 0.3s ease forwards; opacity: 0; }
      .mt-pop { animation: popIn 0.4s ease forwards; }
      .mt-code:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  function handleAutoSubmit() {
    if (submitted) return;
    setSubmitted(true);
    setTimerStarted(false);
    clearSavedState();
    (computeResultsRef.current || computeResults)();
  }

  const getCurrentSection = () => {
    const q = flatQ[idx];
    return q ? q._section : sections[0]?.key;
  };

  const getSectionIdx = () => {
    const sk = getCurrentSection();
    const b = sectionBoundaries[sk];
    return idx - (b?.start || 0);
  };

  const currentQ = flatQ[idx];
  const isMcq = currentQ && currentQ._section !== "coding";
  const ans = isMcq ? answers[currentQ?.id] : codeAns[currentQ?.id];
  const isAnswered = ans !== undefined && ans !== null && ans !== "";
  const isReviewed = reviewed[currentQ?.id];

  const totalMcq = flatQ.filter(q => q._section !== "coding").length;
  const totalCoding = flatQ.filter(q => q._section === "coding").length;

  const answeredCount = flatQ.filter(q => {
    if (q._section === "coding") return codeAns[q.id] && codeAns[q.id].trim().length > 0;
    return answers[q.id] !== undefined;
  }).length;

  const reviewedCount = Object.keys(reviewed).length;

  function computeResults() {
    const curAnswers = answersRef.current;
    const curCodeAns = codeAnsRef.current;
    const skills = {};

    let tc = 0, ac = 0, lc = 0;
    let tt = 0, at = 0, lt = 0;

    flatQ.forEach(q => {
      if (q._section === "coding") return;
      const sk = q.skill || "General";
      if (!skills[sk]) skills[sk] = { correct: 0, total: 0 };
      skills[sk].total++;

      const userAns = curAnswers[q.id];
      const correct = userAns === q.answer;
      if (correct) skills[sk].correct++;

      if (q._section === "technical") { tt++; if (correct) tc++; }
      else if (q._section === "aptitude") { at++; if (correct) ac++; }
      else if (q._section === "logical") { lt++; if (correct) lc++; }
    });

    const cResults = flatQ.filter(q => q._section === "coding").map(q => evaluateCodingAnswer(q, curCodeAns[q.id] || ""));
    setCodingResults(cResults);

    const totalCorrect = tc + ac + lc + cResults.filter(Boolean).length;
    const totalQs = flatQ.length;

    setScore(totalCorrect);
    setLevel(calculateLevel(tc + ac + lc, totalMcq, cResults));

    setSectionScores({
      technical: { score: tc, total: tt },
      aptitude: { score: ac, total: at },
      logical: { score: lc, total: lt },
    });

    const bk = Object.entries(skills).map(([skill, d]) => ({
      skill, correct: d.correct, total: d.total,
      pct: Math.round((d.correct / d.total) * 100)
    }));
    setSkillBreakdown(bk);
    setStrengths(bk.filter(s => s.pct >= 60).map(s => s.skill));
    setWeakAreas(bk.filter(s => s.pct < 60).map(s => s.skill));

    const recs = [];
    if (tt > 0 && tc / tt < 0.6) recs.push("Review technical concepts related to this role");
    if (at > 0 && ac / at < 0.6) recs.push("Practice quantitative aptitude — percentages, ratios, and averages");
    if (lt > 0 && lc / lt < 0.6) recs.push("Sharpen logical reasoning with puzzles and pattern exercises");
    if (cResults.filter(Boolean).length < cResults.length) recs.push("Practice coding problems on platforms like LeetCode or HackerRank");
    setRecommendations(recs);
  }

  const handleAnswer = useCallback(function(optIdx) {
    if (submitted || !isMcq) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }));
    if (autoNext && idx < flatQ.length - 1) {
      setTimeout(() => setIdx(i => i + 1), 200);
    }
  }, [submitted, isMcq, currentQ?.id, autoNext, idx, flatQ.length]);

  const handleCodeChange = useCallback(function(code) {
    if (submitted) return;
    setCodeAns(prev => ({ ...prev, [currentQ.id]: code }));
  }, [submitted, currentQ?.id]);

  const toggleReview = useCallback(function() {
    setReviewed(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  }, [currentQ?.id]);

  function startTest() {
    clearSavedState();
    setPhase("loading");
    setTimeout(() => {
      const end = Date.now() + TOTAL_SECONDS * 1000;
      localStorage.setItem(LS_KEY, JSON.stringify({ end }));
      setTimeLeft(TOTAL_SECONDS);
      setTimerStarted(true);
      setPhase("test");
    }, 1000);
  }

  function resumeTest() {
    setTimerStarted(true);
    localStorage.setItem(LS_PHASE, "test");
    setPhase("test");
  }

  const submitTest = useCallback(function() {
    if (answeredCount < flatQ.length) {
      const rem = flatQ.length - answeredCount;
      if (!confirm(`You have ${rem} unanswered question${rem > 1 ? "s" : ""}. Submit anyway?`)) return;
    }
    setSubmitted(true);
    setTimerStarted(false);
    clearSavedState();
    (computeResultsRef.current || computeResults)();
  }, [answeredCount, flatQ.length]);

  const section = getCurrentSection();
  const secIdx = getSectionIdx();
  const sec = sections.find(s => s.key === section);

  const timePct = Math.max(0, (timeLeft / TOTAL_SECONDS) * 100);
  const isUrgent = timeLeft < 60;

  const hasSaved = useMemo(() => {
    try {
      const t = localStorage.getItem(LS_KEY);
      const a = localStorage.getItem(LS_ANSWERS);
      if (!t || !a) return false;
      const { end } = JSON.parse(t);
      return Date.now() < end && Object.keys(JSON.parse(a)).length > 0;
    } catch { return false; }
  }, []);

  // ------- LOADING ----------
  if (phase === "loading") {
    return (
      <div style={s.overlay}>
        <div style={{ ...s.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: "40px 28px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex",
              alignItems: "center", justifyContent: "center",
              animation: "pulse 1.5s ease-in-out infinite"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3 style={{ margin: "0 0 8px", color: "var(--text-primary)", fontSize: "1.1rem" }}>Preparing Your Assessment</h3>
            <p style={{ margin: "0 0 20px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>Loading questions and setting up your test environment...</p>
            <div style={{ width: "100%", height: 4, background: "var(--bg-tertiary)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: "70%", height: "100%", background: "var(--gradient-primary)", borderRadius: 2, animation: "shimmer 1.5s ease-in-out infinite" }}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------- INTRO ----------
  if (phase === "intro") {
    return (
      <div style={s.overlay} onClick={onClose}>
        <div style={{ ...s.modal, maxWidth: 520, overflow: "auto" }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: "32px 28px", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
              background: "rgba(99,102,241,0.12)", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/><path d="M9 14l2 2 4-4"/></svg>
            </div>
            <h2 style={{ margin: "0 0 4px", color: "var(--text-primary)", fontSize: "1.3rem" }}>Skill Assessment</h2>
            <p style={{ margin: "0 0 20px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>{job.title} — {job.company}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Questions", value: flatQ.length, icon: "📝" },
                { label: "Time Limit", value: "90 min", icon: "⏱️" },
                { label: "Difficulty", value: "Adaptive", icon: "🎯" },
              ].map((d, i) => (
                <div key={i} style={{
                  padding: "12px 8px", borderRadius: 12, textAlign: "center",
                  background: "var(--bg-secondary)", border: "1px solid var(--card-border)"
                }}>
                  <div style={{ fontSize: "1.3rem", marginBottom: 4 }}>{d.icon}</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{d.value}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{d.label}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "left", marginBottom: 24 }}>
              <p style={{ margin: "0 0 10px", fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>📋 Sections</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sections.map(s => (
                  <div key={s.key} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", borderRadius: 10,
                    background: "var(--bg-secondary)", border: "1px solid var(--card-border)"
                  }}>
                    <span style={{ color: "var(--text-primary)", fontSize: "0.88rem" }}>{s.icon} {s.label}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{s.questions.length} Q</span>
                  </div>
                ))}
              </div>
            </div>

            {hasSaved && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, marginBottom: 16,
                background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
                display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "#818cf8"
              }}>
                <span>📋</span>
                <span>You have an unfinished assessment. Pick up where you left off!</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={() => { clearSavedState(); onClose(); }} style={{
                padding: "12px 28px", borderRadius: 11, border: "1px solid var(--card-border)",
                background: "transparent", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem"
              }}>Cancel</button>
              {hasSaved ? (
                <button onClick={resumeTest} style={{
                  padding: "12px 32px", borderRadius: 11, border: "none",
                  background: "var(--gradient-primary)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem",
                  transition: "all 0.25s ease"
                }}
                  onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 25px rgba(99,102,241,0.4)"; }}
                  onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}
                >Resume Assessment →</button>
              ) : (
                <button onClick={startTest} style={{
                  padding: "12px 32px", borderRadius: 11, border: "none",
                  background: "var(--gradient-primary)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem",
                  transition: "all 0.25s ease"
                }}
                  onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 25px rgba(99,102,241,0.4)"; }}
                  onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}
                >Start Assessment →</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------- RESULTS ----------
  if (submitted) {
    const totalQs = flatQ.length;
    const pct = Math.round((score / totalQs) * 100);
    return (
      <div style={s.overlay} onClick={onClose}>
        <div style={{ ...s.modal, maxWidth: 640, overflow: "auto" }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: "28px 28px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{
                width: 120, height: 120, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px", fontSize: "2rem", fontWeight: 800, position: "relative"
              }}>
                <svg viewBox="0 0 36 36" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-tertiary)" strokeWidth="3"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={level?.color || "#6366f1"} strokeWidth="3" strokeDasharray={`${pct}, 100`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1.2s ease" }}/>
                </svg>
                <span style={{ position: "relative", zIndex: 1, color: level?.color, fontSize: "1.8rem" }}>{score}<span style={{ fontSize: "1rem", opacity: 0.5 }}>/{totalQs}</span></span>
              </div>
              <div className="mt-pop" style={{ marginBottom: 4 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 28px", borderRadius: 100, fontWeight: 700, fontSize: "1.1rem",
                  background: `${level?.color}15`, color: level?.color, border: `1px solid ${level?.color}30`
                }}><span>{level?.emoji}</span> {level?.label}</div>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "6px 0 0" }}>
                {pct}% overall — {level?.label === "Job Ready" ? "You're fully prepared!" : level?.label === "Intermediate" ? "Good progress, keep improving!" : "Keep learning and practicing!"}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
              {Object.entries(sectionScores).map(([key, d]) => {
                const sp = d.total > 0 ? Math.round((d.score / d.total) * 100) : 0;
                const colors = { technical: "#6366f1", aptitude: "#f59e0b", logical: "#10b981" };
                return (
                  <div key={key} style={{
                    padding: "12px", borderRadius: 12, textAlign: "center",
                    background: "var(--bg-secondary)", border: "1px solid var(--card-border)"
                  }}>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 4, textTransform: "capitalize" }}>{key}</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: colors[key] || "var(--text-primary)" }}>{d.score}/{d.total}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{sp}%</div>
                  </div>
                );
              })}
            </div>

            {skillBreakdown.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: "0 0 10px", color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 600 }}>Skill Breakdown</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {skillBreakdown.map(sk => (
                    <div key={sk.skill} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 100, fontSize: "0.78rem", fontWeight: 500, color: "var(--text-secondary)", flexShrink: 0 }}>{sk.skill}</span>
                      <div style={{ flex: 1, height: 5, background: "var(--bg-tertiary)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${sk.pct}%`, height: "100%", borderRadius: 3, background: sk.pct >= 60 ? "#10b981" : sk.pct >= 40 ? "#f59e0b" : "#ef4444", transition: "width 1s ease" }}/>
                      </div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", width: 32, textAlign: "right" }}>{sk.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 14, borderRadius: 12, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <h5 style={{ margin: "0 0 8px", color: "#10b981", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6 }}><span>✅</span> Strengths</h5>
                {strengths.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {strengths.map(s => <span key={s} style={{ padding: "3px 10px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 600, color: "#34d399", background: "rgba(52,211,153,0.1)" }}>{s}</span>)}
                  </div>
                ) : <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>Keep practicing</p>}
              </div>
              <div style={{ padding: 14, borderRadius: 12, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                <h5 style={{ margin: "0 0 8px", color: "#ef4444", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6 }}><span>🎯</span> Weak Areas</h5>
                {weakAreas.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {weakAreas.map(s => <span key={s} style={{ padding: "3px 10px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 600, color: "#f87171", background: "rgba(248,113,113,0.1)" }}>{s}</span>)}
                  </div>
                ) : <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>No weak areas! 🎉</p>}
              </div>
            </div>

            {recommendations.length > 0 && (
              <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.12)" }}>
                <h5 style={{ margin: "0 0 8px", color: "#818cf8", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6 }}><span>📚</span> Recommended Improvements</h5>
                <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.8 }}>
                  {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={onClose} style={{
                padding: "11px 28px", borderRadius: 11, border: "1px solid var(--card-border)",
                background: "transparent", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem"
              }}>Close</button>
              <button onClick={() => onComplete({ score, total: totalQs, level })} style={{
                padding: "11px 28px", borderRadius: 11, border: "none",
                background: "var(--gradient-primary)", color: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
                transition: "all 0.25s ease"
              }}
                onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 25px rgba(99,102,241,0.4)"; }}
                onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}
              >Proceed to Apply →</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------- WARNING ----------
  if (warning) {
    return (
      <div style={s.overlay}>
        <div style={{ ...s.modal, maxWidth: 960, position: "relative", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
          <WarningModal message={warning} onClose={() => setWarning(null)} />
          {/* render test behind */}
          <TestUI />
        </div>
      </div>
    );
  }

  // ------- TEST ----------
  const TestBody = React.memo(function TestBody({ currentQ, isMcq, idx, answers, codeAns, handleAnswer, handleCodeChange, isAnswered, isReviewed, showPalette, sections, flatQ, reviewed, setIdx, autoNext, setAutoNext, toggleReview, answeredCount, reviewedCount, submitTest }) {
    return (
      <>
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
            {currentQ && isMcq && (
              <div key={currentQ.id} className="mt-fade">
                <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: isAnswered ? "rgba(99,102,241,0.15)" : "var(--bg-tertiary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.78rem", fontWeight: 700, color: isAnswered ? "#818cf8" : "var(--text-muted)", flexShrink: 0
                    }}>{idx + 1}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 6px", fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: 1.5 }}>{currentQ.question}</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={tagStyle}>{currentQ.skill || "General"}</span>
                        <span style={{ ...tagStyle, ...diffStyle(currentQ.difficulty) }}>{currentQ.difficulty || "Medium"}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {currentQ.options.map((opt, oi) => {
                      const sel = answers[currentQ.id] === oi;
                      return (
                        <div key={oi} className="mt-hover" style={{
                          display: "flex", alignItems: "center", gap: 12, padding: "11px 16px",
                          borderRadius: 11, cursor: "pointer", transition: "all 0.2s ease",
                          border: sel ? "1px solid #6366f1" : "1px solid var(--card-border)",
                          background: sel ? "rgba(99,102,241,0.07)" : "var(--card-bg)"
                        }} onClick={() => handleAnswer(oi)}>
                          <div style={{
                            width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                            border: sel ? "2px solid #6366f1" : "2px solid var(--text-muted)",
                            background: sel ? "#6366f1" : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease"
                          }}>
                            {sel && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />}
                          </div>
                          <span style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {currentQ && !isMcq && (
              <div key={currentQ.id} className="mt-fade">
                <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(99,102,241,0.12)", color: "#818cf8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, flexShrink: 0 }}>{idx + 1}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 4px", fontWeight: 600, color: "var(--text-primary)", fontSize: "0.93rem" }}>{currentQ.title}</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={tagStyle}>{currentQ.skill}</span>
                        <span style={{ ...tagStyle, ...diffStyle(currentQ.difficulty) }}>{currentQ.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, margin: "0 0 10px" }}>{currentQ.description}</p>
                  {currentQ.testCases?.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", margin: "0 0 4px" }}>TEST CASES</p>
                      {currentQ.testCases.map((tc, tci) => (
                        <div key={tci} style={{ padding: "5px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--card-border)", fontSize: "0.76rem", color: "var(--text-secondary)", fontFamily: "'SF Mono',Consolas,monospace", marginBottom: 3 }}>
                          <span style={{ color: "#818cf8" }}>Input:</span> {tc.input} <span style={{ color: "#34d399", marginLeft: 6 }}>→</span> <span style={{ color: "#34d399" }}>{tc.expected}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>💡 {currentQ.solutionHint}</p>
                </div>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", margin: "0 0 6px" }}>YOUR SOLUTION</p>
                <textarea className="mt-code" style={s.codeEditor} value={codeAns[currentQ.id] || ""} onChange={e => handleCodeChange(e.target.value)} placeholder="// Write your code here..." spellCheck={false} />
              </div>
            )}
          </div>
          {showPalette && (
            <div style={{ width: 200, borderLeft: "1px solid var(--card-border)", overflow: "auto", flexShrink: 0, padding: "14px 12px", background: "var(--bg-secondary)" }}>
              <p style={{ margin: "0 0 10px", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)" }}>QUESTIONS</p>
              {sections.map(s => (
                <div key={s.key} style={{ marginBottom: 10 }}>
                  <p style={{ margin: "0 0 4px", fontSize: "0.72rem", color: "var(--text-muted)" }}>{s.icon} {s.label}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {s.questions.map((q, qi) => {
                      const globalIdx = flatQ.findIndex(fq => fq.id === q.id);
                      const a = q._section === "coding" ? codeAns[q.id] : answers[q.id];
                      const done = q._section === "coding" ? (a && a.trim().length > 0) : a !== undefined;
                      const rev = reviewed[q.id];
                      return (
                        <button key={q.id} onClick={() => setIdx(globalIdx)} style={{
                          width: 28, height: 28, borderRadius: 6, border: "none", cursor: "pointer",
                          fontSize: "0.65rem", fontWeight: 700, position: "relative",
                          background: globalIdx === idx ? "#6366f1" : done ? "rgba(16,185,129,0.2)" : rev ? "rgba(245,158,11,0.2)" : "var(--bg-tertiary)",
                          color: globalIdx === idx ? "white" : done ? "#10b981" : rev ? "#f59e0b" : "var(--text-muted)",
                          transition: "all 0.15s ease"
                        }}>{qi + 1}</button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--card-border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: "0.8rem", color: "var(--text-muted)" }}>
              <input type="checkbox" checked={autoNext} onChange={e => setAutoNext(e.target.checked)} style={{ accentColor: "#6366f1" }} />
              Auto-next
            </label>
            <button onClick={() => setShowPalette(!showPalette)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--card-border)", background: "transparent", color: "var(--text-secondary)", fontSize: "0.78rem", cursor: "pointer", fontWeight: 500 }}>
              {showPalette ? "Hide" : "Show"} Map
            </button>
            <button onClick={toggleReview} style={{
              padding: "6px 12px", borderRadius: 8, border: `1px solid ${isReviewed ? "#f59e0b" : "var(--card-border)"}`,
              background: isReviewed ? "rgba(245,158,11,0.1)" : "transparent",
              color: isReviewed ? "#f59e0b" : "var(--text-secondary)", fontSize: "0.78rem", cursor: "pointer", fontWeight: 500,
              transition: "all 0.2s"
            }}>
              {isReviewed ? "⭐ Reviewed" : "☆ Mark for Review"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>
              {answeredCount}/{flatQ.length} • {reviewedCount}⭐
            </span>
            {idx > 0 && (
              <button onClick={() => setIdx(i => i - 1)} style={navBtnStyle}>← Prev</button>
            )}
            {idx < flatQ.length - 1 ? (
              <button onClick={() => setIdx(i => i + 1)} style={{ ...navBtnStyle, background: "var(--gradient-primary)", color: "white", border: "none" }}>Next →</button>
            ) : (
              <button onClick={submitTest} style={{
                padding: "9px 22px", borderRadius: 10, border: "none",
                background: "var(--gradient-primary)", color: "white",
                fontWeight: 600, fontSize: "0.85rem", cursor: "pointer",
                transition: "all 0.2s"
              }}
                onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 20px rgba(99,102,241,0.35)"; }}
                onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}
              >Submit Test</button>
            )}
          </div>
        </div>
      </>
    );
  });

  function TestUI() {
    const secNames = { technical: "Technical", aptitude: "Aptitude", logical: "Logical Reasoning", coding: "Coding" };
    return (
      <>
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid var(--card-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 12, flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{job.title}</span>
            <span style={{ ...tagStyle, background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>{secNames[section] || section}</span>
            <span style={{ ...tagStyle, background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
              {sec && <>{sec.icon} Q {secIdx + 1}/{sec.questions.length}</>}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ height: 6, width: 120, background: "var(--bg-tertiary)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${timePct}%`, height: "100%", borderRadius: 3, background: isUrgent ? "#ef4444" : "var(--gradient-primary)", transition: "width 1s linear" }}/>
            </div>
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: "0.95rem", color: isUrgent ? "#ef4444" : "var(--text-primary)", transition: "color 0.3s", display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <TestBody
          currentQ={currentQ} isMcq={isMcq} idx={idx}
          answers={answers} codeAns={codeAns}
          handleAnswer={handleAnswer} handleCodeChange={handleCodeChange}
          isAnswered={isAnswered} isReviewed={isReviewed}
          showPalette={showPalette}
          sections={sections} flatQ={flatQ} reviewed={reviewed}
          setIdx={setIdx}
          autoNext={autoNext} setAutoNext={setAutoNext}
          toggleReview={toggleReview}
          answeredCount={answeredCount} reviewedCount={reviewedCount}
          submitTest={submitTest}
        />
      </>
    );
  }

  return (
    <div style={s.overlay}>
      <div style={{ ...s.modal, maxWidth: 960, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <TestUI />
      </div>
    </div>
  );
}

const tagStyle = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "2px 10px", borderRadius: 7, fontSize: "0.72rem",
  fontWeight: 600, background: "rgba(99,102,241,0.08)", color: "#818cf8"
};

function diffStyle(d) {
  if (d === "Easy") return { background: "rgba(16,185,129,0.1)", color: "#34d399" };
  if (d === "Hard") return { background: "rgba(239,68,68,0.1)", color: "#f87171" };
  return { background: "rgba(245,158,11,0.1)", color: "#fbbf24" };
}

const navBtnStyle = {
  padding: "9px 18px", borderRadius: 10, border: "1px solid var(--card-border)",
  background: "transparent", color: "var(--text-secondary)",
  fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.2s ease"
};
