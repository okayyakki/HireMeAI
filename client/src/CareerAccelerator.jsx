import { useState } from "react";

const COURSES = [
  {
    id: "react",
    title: "React",
    subtitle: "Build Modern UIs",
    thumbnail: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    difficulty: "Beginner",
    duration: "6 hours",
    lessons: 24,
    progress: 0,
    color: "#61dafb",
    topics: ["Components", "State & Props", "Hooks", "Routing", "API Integration"],
    desc: "Learn React from scratch. Build components, manage state, and create dynamic single-page applications."
  },
  {
    id: "dsa",
    title: "DSA",
    subtitle: "Crack Coding Interviews",
    thumbnail: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
    difficulty: "Beginner",
    duration: "12 hours",
    lessons: 48,
    progress: 0,
    color: "#f59e0b",
    topics: ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "Sorting", "Searching"],
    desc: "Master DSA patterns used in top tech interviews. Practice with real coding problems."
  },
  {
    id: "resume",
    title: "Resume Building",
    subtitle: "ATS-Optimized Resumes",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    difficulty: "Beginner",
    duration: "2 hours",
    lessons: 8,
    progress: 0,
    color: "#10b981",
    topics: ["ATS Keywords", "Formatting", "Experience Writing", "Skills Section", "Cover Letters"],
    desc: "Create a standout resume that passes ATS filters. Learn what recruiters look for."
  },
  {
    id: "interview",
    title: "Interview Prep",
    subtitle: "Ace Your Interviews",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
    difficulty: "Beginner",
    duration: "8 hours",
    lessons: 32,
    progress: 0,
    color: "#8b5cf6",
    topics: ["Behavioral Questions", "Technical Rounds", "System Design", "Salary Negotiation", "Mock Interviews"],
    desc: "Comprehensive interview preparation covering behavioral, technical, and system design rounds."
  },
  {
    id: "git",
    title: "Git & GitHub",
    subtitle: "Version Control Essentials",
    thumbnail: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
    difficulty: "Beginner",
    duration: "3 hours",
    lessons: 12,
    progress: 0,
    color: "#f97316",
    topics: ["Git Basics", "Branching", "Pull Requests", "Collaboration", "CI/CD Basics"],
    desc: "Learn Git fundamentals and GitHub workflows. Essential for any developer."
  },
];

export default function CareerAccelerator({ compact }) {
  const [expanded, setExpanded] = useState(null);
  const [courseProgress, setCourseProgress] = useState({});

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const startCourse = (course) => {
    setCourseProgress((prev) => ({
      ...prev,
      [course.id]: { started: true, progress: Math.min((prev[course.id]?.progress || 0) + 20, 100) },
    }));
  };

  return (
      <div className="career-accelerator-section">
      {!compact && (
        <div className="career-header">
          <div className="career-header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div>
            <h2 className="career-title">Career Accelerator</h2>
            <p className="career-subtitle">Beginner-friendly courses to launch your tech career</p>
          </div>
        </div>
      )}

      <div className="career-grid">
        {COURSES.map((course) => {
          const prog = courseProgress[course.id];
          const progress = prog?.progress || 0;
          const isStarted = prog?.started || false;

          return (
            <div
              key={course.id}
              className={`career-card ${expanded === course.id ? "expanded" : ""}`}
              onClick={() => toggleExpand(course.id)}
            >
              <div className="career-card-glow" style={{ background: `radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), ${course.color}15, transparent 50%)` }} />
              <div className="career-card-bg" style={{ background: `linear-gradient(135deg, ${course.color}08, ${course.color}02)` }} />
              <div className="career-card-border" style={{ background: `linear-gradient(135deg, ${course.color}30, transparent 50%, ${course.color}10)` }} />

              <div className="career-card-inner">
                <div className="career-card-top">
                  <div className="career-thumb-wrap">
                    <div className="career-thumb-glow" style={{ background: `${course.color}20` }} />
                    <div className="career-thumb" style={{ borderColor: `${course.color}30` }}>
                      <img src={course.thumbnail} alt={course.title} />
                    </div>
                  </div>
                  <div className="career-meta">
                    <h3 className="career-course-title">{course.title}</h3>
                    <p className="career-course-subtitle">{course.subtitle}</p>
                    <div className="career-tags">
                      <span className="career-tag" style={{
                        background: `${course.color}15`,
                        color: course.color,
                        borderColor: `${course.color}25`,
                      }}>
                        {course.difficulty}
                      </span>
                      <span className="career-tag career-tag-muted">
                        {course.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="career-progress-wrap">
                  <div className="career-progress-header">
                    <span>{isStarted ? "In Progress" : "Not Started"}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="career-progress-track">
                    <div className="career-progress-fill" style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${course.color}, ${course.color}aa)`,
                      boxShadow: `0 0 12px ${course.color}60`,
                    }} />
                  </div>
                </div>

                {expanded === course.id && (
                  <div className="career-expanded">
                    <p className="career-desc">{course.desc}</p>
                    <div className="career-topics">
                      {course.topics.map((t, i) => (
                        <span key={i} className="career-topic" style={{
                          background: `${course.color}12`,
                          color: course.color,
                          borderColor: `${course.color}20`,
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>
                    <button
                      className="career-start-btn"
                      style={{
                        background: isStarted
                          ? `${course.color}15`
                          : `linear-gradient(135deg, ${course.color}, ${course.color}aa)`,
                        color: isStarted ? course.color : "#fff",
                        borderColor: isStarted ? `${course.color}30` : "transparent",
                      }}
                      onClick={(e) => { e.stopPropagation(); startCourse(course); }}
                    >
                      {isStarted ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5"/><polyline points="17 6 23 6 23 12"/><path d="M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h14.34"/></svg>
                          Continue
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          Start Course
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!isStarted && !expanded && (
                  <div className="career-hint">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .career-accelerator-section {
          width: 100%;
        }

        .career-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .career-header-icon {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15));
          border: 1px solid rgba(99,102,241,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #818cf8;
          flex-shrink: 0;
          backdrop-filter: blur(10px);
        }

        .career-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }

        .career-subtitle {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.95rem;
        }

        .career-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .career-card {
          position: relative;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
        }

        .career-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.5s ease;
          z-index: 0;
        }

        .dark .career-card::before {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.06);
        }

        .career-card-glow {
          position: absolute;
          inset: -100px;
          opacity: 0;
          transition: opacity 0.6s ease;
          pointer-events: none;
          z-index: 1;
        }

        .career-card:hover .career-card-glow {
          opacity: 1;
        }

        .career-card-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.6;
        }

        .career-card-border {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.3;
          transition: opacity 0.5s ease;
          z-index: 1;
        }

        .career-card:hover .career-card-border {
          opacity: 0.8;
        }

        .career-card:hover {
          transform: translateY(-8px) scale(1.01);
        }

        .career-card.expanded {
          transform: translateY(-4px);
        }

        .career-card-inner {
          position: relative;
          z-index: 2;
          padding: 24px;
        }

        .career-card-top {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .career-thumb-wrap {
          position: relative;
          width: 64px;
          height: 64px;
          flex-shrink: 0;
        }

        .career-thumb-glow {
          position: absolute;
          inset: -8px;
          border-radius: 20px;
          filter: blur(16px);
          opacity: 0.4;
          transition: opacity 0.4s ease;
        }

        .career-card:hover .career-thumb-glow {
          opacity: 0.7;
        }

        .career-thumb {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(8px);
          overflow: hidden;
          position: relative;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .career-card:hover .career-thumb {
          transform: scale(1.05);
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        }

        .career-thumb img {
          width: 32px;
          height: 32px;
          object-fit: contain;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .career-meta {
          flex: 1;
          min-width: 0;
        }

        .career-course-title {
          margin: 0 0 2px;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 700;
        }

        .career-course-subtitle {
          margin: 0 0 10px;
          color: var(--text-secondary);
          font-size: 0.82rem;
        }

        .career-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .career-tag {
          padding: 3px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 600;
          border: 1px solid;
          letter-spacing: 0.2px;
          text-transform: uppercase;
        }

        .career-tag-muted {
          background: rgba(99,102,241,0.08);
          color: #818cf8;
          border-color: rgba(99,102,241,0.15);
        }

        .career-progress-wrap {
          margin-bottom: 4px;
        }

        .career-progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .career-progress-track {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }

        .dark .career-progress-track {
          background: rgba(255,255,255,0.04);
        }

        .career-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s cubic-bezier(0.23, 1, 0.32, 1);
          position: relative;
        }

        .career-progress-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: careerShimmer 2s ease-in-out infinite;
        }

        @keyframes careerShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .career-expanded {
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
          animation: careerFadeUp 0.35s ease;
        }

        @keyframes careerFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .career-desc {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin: 0 0 14px;
          line-height: 1.6;
        }

        .career-topics {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .career-topic {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 500;
          border: 1px solid;
          backdrop-filter: blur(4px);
        }

        .career-start-btn {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          backdrop-filter: blur(8px);
        }

        .career-start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        .career-start-btn:active {
          transform: translateY(0);
        }

        .career-hint {
          position: absolute;
          bottom: 20px;
          right: 24px;
          opacity: 0;
          transition: opacity 0.4s ease;
          color: var(--text-muted);
        }

        .career-card:hover .career-hint {
          opacity: 0.6;
        }

        @media (max-width: 768px) {
          .career-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
