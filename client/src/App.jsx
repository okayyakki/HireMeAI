import { useState, useEffect, useRef, useCallback } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL || "";

function App() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("jobs");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [showPassword, setShowPassword] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState({ jobs: 0, users: 0, matches: 0, satisfaction: 0 });
  const statsRef = useRef(null);
  const scrollRef = useRef({});

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("jobseeker");
  const [newJob, setNewJob] = useState({ title: "", company: "", description: "", skills: "" });
  const [resumeText, setResumeText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [oauthLoading, setOauthLoading] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchJobs();
      if (user?.role === "recruiter") {
        fetchApplications();
      }
    }
  }, [token, user?.role]);

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById("mainNav");
      if (nav) {
        nav.classList.toggle("nav-scrolled", window.scrollY > 50);
      }
      if (statsRef.current) {
        const rect = statsRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8 && !statsVisible) {
          setStatsVisible(true);
        }
      }
      document.querySelectorAll("[data-animate]").forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
          el.classList.add("visible");
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [statsVisible]);

  useEffect(() => {
    if (!statsVisible) return;
    const targets = { jobs: 10000, users: 5000, matches: 25000, satisfaction: 98 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounters({
        jobs: Math.round(targets.jobs * ease),
        users: Math.round(targets.users * ease),
        matches: Math.round(targets.matches * ease),
        satisfaction: Math.round(targets.satisfaction * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [statsVisible]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/api/protected`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/jobs`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setJobs(data);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/applications/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setEmail("");
    setPassword("");
    setView("jobs");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSocialLogin = async (provider, providerName) => {
    console.log(`${providerName} login clicked`);
    setError("");
    setOauthLoading(providerName);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(`${providerName} auth success:`, user);
      const idToken = await user.getIdToken();
      const res = await fetch(`${API_URL}/api/auth/social-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.displayName || user.email?.split("@")[0] || "User",
          email: user.email,
          photo: user.photoURL,
          provider: providerName,
          idToken,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        console.log("Login complete, redirecting to dashboard");
      } else {
        setError(data.message || `${providerName} login failed`);
      }
    } catch (err) {
      console.error(`${providerName} login error:`, err);
      if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked. Please allow popups for this site.");
      } else if (err.code === "auth/popup-closed-by-user") {
        setError(`${providerName} login was cancelled.`);
      } else {
        setError(`${providerName} login failed. Please try again.`);
      }
    }
    setOauthLoading("");
  };

  const handleGoogleLogin = () => handleSocialLogin(googleProvider, "google");
  const handleGithubLogin = () => handleSocialLogin(githubProvider, "github");

  const handlePostJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const skillsArray = newJob.skills.split(",").map(s => s.trim()).filter(s => s);
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newJob.title,
          company: newJob.company,
          description: newJob.description,
          skillsRequired: skillsArray,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Job posted successfully!");
        setNewJob({ title: "", company: "", description: "", skills: "" });
        fetchJobs();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to post job");
    }
    setLoading(false);
  };

  const applyJob = async (jobId) => {
    if (!token) {
      setError("Please login to apply");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/applications/${jobId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to apply. Please try again.");
    }
  };

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) {
      setError("Please enter your resume text");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (res.ok) {
        setAiResult(data.result);
      } else {
        setError(data.message || "Failed to analyze resume");
      }
    } catch (err) {
      setError("Failed to analyze resume. Please try again.");
    }
    setLoading(false);
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const myApplications = applications.filter(app => app.user?._id === user?._id);

  const scrollToSection = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const sampleJobs = [
    { title: "Senior Frontend Engineer", company: "TechCorp", skills: ["React", "TypeScript", "Node.js"], location: "Remote", type: "Full-time", salary: "$120k - $160k", posted: "2 days ago" },
    { title: "AI/ML Engineer", company: "DataFlow AI", skills: ["Python", "TensorFlow", "LLMs"], location: "Hybrid", type: "Full-time", salary: "$140k - $180k", posted: "1 day ago" },
    { title: "Product Designer", company: "Designify", skills: ["Figma", "UI/UX", "Research"], location: "San Francisco", type: "Full-time", salary: "$100k - $130k", posted: "3 days ago" },
    { title: "DevOps Engineer", company: "CloudScale", skills: ["AWS", "Docker", "Kubernetes"], location: "Remote", type: "Full-time", salary: "$130k - $165k", posted: "5 hours ago" },
  ];

  const testimonials = [
    { name: "Sarah Chen", role: "Software Engineer at Google", avatar: "SC", text: "Hire Me AI completely transformed my job search. The AI resume analysis helped me identify gaps I didn't know existed. Landed my dream role within 3 weeks!", rating: 5 },
    { name: "Marcus Johnson", role: "Senior Recruiter at Meta", avatar: "MJ", text: "The AI-powered candidate matching has cut our screening time by 70%. The quality of applicants has improved dramatically since we started using this platform.", rating: 5 },
    { name: "Emily Rodriguez", role: "UX Designer at Spotify", avatar: "ER", text: "The personalized job recommendations are incredibly accurate. It's like having a personal career coach powered by AI. Best job platform I've ever used!", rating: 5 },
  ];

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K+";
    return num + "+";
  };

  return (
    <>
      <style>{`
        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --bg-tertiary: #f1f5f9;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #94a3b8;
          --card-bg: #ffffff;
          --card-border: rgba(0,0,0,0.06);
          --input-bg: #ffffff;
          --input-border: #e2e8f0;
          --input-focus-border: #6366f1;
          --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
          --shadow-lg: 0 12px 40px rgba(0,0,0,0.1);
          --shadow-xl: 0 20px 60px rgba(0,0,0,0.12);
          --gradient-primary: linear-gradient(135deg, #6366f1, #8b5cf6);
          --gradient-accent: linear-gradient(135deg, #3b82f6, #8b5cf6, #d946ef);
          --nav-bg: rgba(255,255,255,0.8);
          --nav-border: rgba(0,0,0,0.06);
        }
        .dark {
          --bg-primary: #0b0f19;
          --bg-secondary: #111827;
          --bg-tertiary: #1e293b;
          --text-primary: #f8fafc;
          --text-secondary: #cbd5e1;
          --text-muted: #64748b;
          --card-bg: #151c2c;
          --card-border: rgba(255,255,255,0.06);
          --input-bg: #1e293b;
          --input-border: #334155;
          --input-focus-border: #818cf8;
          --shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
          --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
          --shadow-lg: 0 12px 40px rgba(0,0,0,0.4);
          --shadow-xl: 0 20px 60px rgba(0,0,0,0.5);
          --nav-bg: rgba(11,15,25,0.85);
          --nav-border: rgba(255,255,255,0.06);
        }
        
        * { box-sizing: border-box; }
        body {
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
          min-height: 100vh;
          margin: 0;
          overflow-x: hidden;
          transition: background 0.4s ease, color 0.4s ease;
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 16px 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-scrolled {
          background: var(--nav-bg) !important;
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid var(--nav-border);
          padding: 10px 0;
          box-shadow: var(--shadow-sm);
        }
        .nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          font-weight: 800;
          font-size: 1.4rem;
          letter-spacing: -0.5px;
          color: white;
          transition: color 0.3s ease;
        }
        .nav-scrolled .nav-brand, .dark .nav-brand {
          color: var(--text-primary);
        }
        .nav-logo {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
          transition: transform 0.3s ease;
        }
        .nav-brand:hover .nav-logo { transform: scale(1.1) rotate(-5deg); }
        .nav-logo svg { width: 20px; height: 20px; }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .nav-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-primary);
        }
        .nav-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .dark-toggle {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        .nav-scrolled .dark-toggle {
          background: var(--bg-tertiary);
          border-color: var(--card-border);
          color: var(--text-primary);
        }
        .dark-toggle:hover { transform: scale(1.1); background: rgba(255,255,255,0.15); }
        .btn-nav {
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          text-decoration: none;
        }
        .btn-nav-ghost {
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.25);
        }
        .nav-scrolled .btn-nav-ghost {
          color: var(--text-primary);
          border-color: var(--card-border);
          background: var(--bg-tertiary);
        }
        .btn-nav-ghost:hover { background: rgba(255,255,255,0.15); transform: translateY(-1px); }
        .btn-nav-primary {
          background: var(--gradient-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99,102,241,0.4);
        }
        .btn-nav-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,0.5); }
        .btn-nav-logout {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--card-border);
          padding: 8px 16px;
        }
        .btn-nav-logout:hover { background: var(--bg-tertiary); color: var(--text-primary); }
        
        .hero-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #0a0a1a;
          padding-top: 80px;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #6366f1 0%, #7c3aed 20%, #a855f7 40%, #6366f1 60%, #3b82f6 80%, #6366f1 100%);
          background-size: 500% 500%;
          animation: gradientShift 15s ease infinite;
          z-index: 0;
        }
        .hero-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 20% 50%, rgba(120, 119, 198, 0.4) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                      radial-gradient(ellipse at 50% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 50%);
          animation: pulseGlow 10s ease-in-out infinite alternate;
        }
        .hero-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 0%, rgba(10,10,26,0.4) 100%);
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 80px 80px;
          z-index: 1;
        }
        .hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 60px 0;
        }
        .hero-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 80px;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .hero-inner { grid-template-columns: 1fr; gap: 50px; text-align: center; }
          .hero-subtitle { margin-left: auto; margin-right: auto; }
          .hero-buttons { justify-content: center; }
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          opacity: 0;
          animation: fadeInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.2s;
        }
        .hero-badge-dot {
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
        }
        .hero-title {
          font-size: clamp(2.5rem, 5.5vw, 4.5rem);
          font-weight: 900;
          line-height: 1.05;
          color: white;
          margin: 24px 0 20px;
          letter-spacing: -1.5px;
          opacity: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.4s;
        }
        .hero-title span {
          background: linear-gradient(135deg, #c084fc 0%, #60a5fa 50%, #34d399 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }
        .hero-subtitle {
          font-size: 1.2rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.7;
          max-width: 560px;
          margin-bottom: 36px;
          font-weight: 400;
          opacity: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.6s;
        }
        .hero-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          opacity: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.8s;
        }
        .btn-cta {
          padding: 15px 32px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }
        .btn-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .btn-cta:hover::before { transform: translateX(100%); }
        .btn-cta-primary {
          background: white;
          color: #6366f1;
          box-shadow: 0 4px 15px rgba(255,255,255,0.3), 0 0 0 1px rgba(255,255,255,0.1);
        }
        .btn-cta-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(255,255,255,0.4), 0 0 0 1px rgba(255,255,255,0.2);
          color: #4f46e5;
        }
        .btn-cta-secondary {
          background: rgba(255,255,255,0.08);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
        }
        .btn-cta-secondary:hover {
          background: rgba(255,255,255,0.15);
          transform: translateY(-3px);
          border-color: rgba(255,255,255,0.35);
        }
        .hero-illustration {
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          animation: fadeInScale 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.5s;
        }
        .hero-illustration svg {
          width: 100%;
          max-width: 480px;
          height: auto;
          filter: drop-shadow(0 20px 40px rgba(0,0,0,0.3));
        }
        .float-1 { animation: float 6s ease-in-out infinite; }
        .float-2 { animation: float 8s ease-in-out infinite 1s; }
        .float-3 { animation: float 7s ease-in-out infinite 2s; }
        .float-4 { animation: float 5s ease-in-out infinite 0.5s; }
        
        .section {
          padding: 100px 0;
        }
        .section-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .section-header {
          text-align: center;
          max-width: 640px;
          margin: 0 auto 64px;
        }
        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        .dark .section-badge {
          background: rgba(129,140,248,0.1);
          border-color: rgba(129,140,248,0.2);
          color: #818cf8;
        }
        .section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 16px;
          letter-spacing: -1px;
          line-height: 1.15;
        }
        .section-subtitle {
          font-size: 1.125rem;
          color: var(--text-secondary);
          line-height: 1.7;
        }
        
        [data-animate] {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        [data-animate].visible {
          opacity: 1;
          transform: translateY(0);
        }
        [data-animate="delay-1"] { transition-delay: 0.1s; }
        [data-animate="delay-2"] { transition-delay: 0.2s; }
        [data-animate="delay-3"] { transition-delay: 0.3s; }
        [data-animate="delay-4"] { transition-delay: 0.4s; }
        
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .feature-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
        }
        .feature-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 36px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, transparent, rgba(99,102,241,0.2), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
        }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: transform 0.3s ease;
        }
        .feature-card:hover .feature-icon { transform: scale(1.1) rotate(-5deg); }
        .feature-icon svg { width: 28px; height: 28px; }
        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 10px;
        }
        .feature-desc {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }
        
        .stats-section {
          background: var(--bg-secondary);
          border-top: 1px solid var(--card-border);
          border-bottom: 1px solid var(--card-border);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
        }
        .stat-item {
          text-align: center;
          padding: 24px;
        }
        .stat-number {
          font-size: clamp(2.5rem, 4vw, 3.5rem);
          font-weight: 900;
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 8px;
          letter-spacing: -1px;
        }
        .stat-label {
          font-size: 0.95rem;
          color: var(--text-secondary);
          font-weight: 500;
          margin: 0;
        }
        
        .auth-section {
          background: var(--bg-secondary);
        }
        .auth-card {
          max-width: 460px;
          margin: 0 auto;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 24px;
          box-shadow: var(--shadow-xl);
          overflow: hidden;
        }
        .auth-header {
          padding: 32px 32px 0;
          text-align: center;
        }
        .auth-tabs {
          display: flex;
          padding: 0 32px;
          gap: 4px;
          background: var(--bg-tertiary);
          border-radius: 12px;
          margin: 20px 32px 0;
          padding: 4px;
        }
        .auth-tab {
          flex: 1;
          padding: 10px 20px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .auth-tab.active {
          background: var(--card-bg);
          color: var(--text-primary);
          box-shadow: var(--shadow-sm);
        }
        .auth-body {
          padding: 28px 32px 32px;
        }
        .social-login {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }
        .btn-social {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--card-border);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-social:hover {
          border-color: var(--input-focus-border);
          background: var(--card-bg);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .btn-social:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .btn-social svg { width: 20px; height: 20px; }
        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 20px 0;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--card-border);
        }
        .input-group {
          position: relative;
          margin-bottom: 18px;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
          transition: color 0.3s ease;
        }
        .input-icon svg { width: 18px; height: 18px; }
        .input-field {
          width: 100%;
          padding: 14px 14px 14px 44px;
          border-radius: 12px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: all 0.3s ease;
          outline: none;
        }
        .input-field:focus {
          border-color: var(--input-focus-border);
          box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
        }
        .input-field:focus + .input-icon, .input-field:focus ~ .input-icon {
          color: #6366f1;
        }
        .input-field::placeholder { color: var(--text-muted); }
        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          transition: color 0.3s ease;
        }
        .password-toggle:hover { color: var(--text-primary); }
        .password-toggle svg { width: 18px; height: 18px; }
        .select-field {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
        }
        .btn-submit {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: var(--gradient-primary);
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99,102,241,0.4);
        }
        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .job-preview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        @media (max-width: 768px) {
          .job-preview-grid { grid-template-columns: 1fr; }
        }
        .job-preview-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }
        .job-preview-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(99,102,241,0.3);
        }
        .job-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .job-preview-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px;
        }
        .job-preview-company {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }
        .job-preview-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(74,222,128,0.1);
          color: #22c55e;
          white-space: nowrap;
        }
        .job-preview-meta {
          display: flex;
          gap: 16px;
          margin: 12px 0;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .job-preview-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .job-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 16px;
        }
        .job-skill {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          background: rgba(99,102,241,0.08);
          color: #6366f1;
        }
        .dark .job-skill {
          background: rgba(129,140,248,0.12);
          color: #818cf8;
        }
        
        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .testimonial-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
        }
        .testimonial-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s ease;
          position: relative;
        }
        .testimonial-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
        }
        .testimonial-card::before {
          content: '"';
          position: absolute;
          top: 20px;
          right: 24px;
          font-size: 5rem;
          font-weight: 900;
          line-height: 1;
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          opacity: 0.15;
          font-family: Georgia, serif;
        }
        .testimonial-stars {
          display: flex;
          gap: 2px;
          margin-bottom: 16px;
        }
        .testimonial-stars svg { width: 18px; height: 18px; fill: #fbbf24; }
        .testimonial-text {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.7;
          margin: 0 0 20px;
          font-style: italic;
        }
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .testimonial-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--gradient-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .testimonial-name {
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 2px;
          font-size: 0.95rem;
        }
        .testimonial-role {
          color: var(--text-muted);
          font-size: 0.8rem;
          margin: 0;
        }
        
        .ai-demo-section {
          background: var(--bg-secondary);
          border-top: 1px solid var(--card-border);
        }
        .ai-demo-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .ai-demo-inner { grid-template-columns: 1fr; }
        }
        .ai-demo-content h3 {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 16px;
          letter-spacing: -0.5px;
        }
        .ai-demo-content p {
          color: var(--text-secondary);
          font-size: 1.05rem;
          line-height: 1.7;
          margin: 0 0 24px;
        }
        .ai-demo-features {
          list-style: none;
          padding: 0;
          margin: 0 0 32px;
        }
        .ai-demo-features li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .ai-demo-features li svg {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
        }
        .ai-demo-preview {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 28px;
          box-shadow: var(--shadow-lg);
        }
        .ai-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid var(--card-border);
        }
        .ai-result-item:last-child { border-bottom: none; }
        .ai-result-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ai-result-icon svg { width: 18px; height: 18px; }
        .ai-result-label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
          margin: 0 0 2px;
        }
        .ai-result-value {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }
        .ai-score-bar {
          flex: 1;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }
        .ai-score-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .dashboard-wrapper {
          padding-top: 100px;
          min-height: 100vh;
          background: var(--bg-primary);
        }
        .dashboard-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .dashboard-tab {
          padding: 10px 20px;
          border-radius: 10px;
          border: 1px solid var(--card-border);
          background: var(--card-bg);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        .dashboard-tab.active {
          background: var(--gradient-primary);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }
        .dashboard-tab:hover:not(.active) {
          border-color: var(--input-focus-border);
          color: var(--text-primary);
        }
        .dashboard-search {
          position: relative;
          margin-bottom: 24px;
        }
        .dashboard-search .input-field {
          padding-left: 48px;
          background: var(--card-bg);
        }
        .dashboard-search .input-icon {
          left: 16px;
        }
        .job-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
          margin-bottom: 16px;
        }
        .job-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(99,102,241,0.3);
        }
        .job-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px;
        }
        .job-card-company {
          color: var(--text-secondary);
          margin: 0 0 12px;
        }
        .job-card-desc {
          color: var(--text-muted);
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0 0 16px;
        }
        .skill-tag {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          background: rgba(99,102,241,0.08);
          color: #6366f1;
          margin: 0 6px 6px 0;
        }
        .dark .skill-tag {
          background: rgba(129,140,248,0.12);
          color: #818cf8;
        }
        .btn-apply {
          padding: 10px 24px;
          border-radius: 10px;
          border: none;
          background: var(--gradient-primary);
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-apply:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
        }
        .result-box {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          padding: 24px;
          border-radius: 16px;
          color: var(--text-primary);
          white-space: pre-wrap;
          line-height: 1.8;
          margin-top: 24px;
        }
        
        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--card-border);
          padding: 64px 0 32px;
        }
        .footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr; }
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 1.3rem;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .footer-brand svg { width: 32px; height: 32px; }
        .footer-desc {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.6;
          max-width: 320px;
          margin: 0 0 20px;
        }
        .footer-heading {
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-primary);
          margin: 0 0 16px;
        }
        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer-links li { margin-bottom: 10px; }
        .footer-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }
        .footer-links a:hover { color: #6366f1; }
        .footer-bottom {
          padding-top: 24px;
          border-top: 1px solid var(--card-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        @media (max-width: 768px) {
          .footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }
        .footer-socials {
          display: flex;
          gap: 12px;
        }
        .footer-social {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .footer-social:hover {
          background: var(--gradient-primary);
          color: white;
          border-color: transparent;
          transform: translateY(-2px);
        }
        .footer-social svg { width: 18px; height: 18px; }
        
        .error-alert {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #ef4444;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulseGlow {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      <nav className="navbar" id="mainNav">
        <div className="nav-inner">
          <a className="nav-brand" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            <div className="nav-logo">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" opacity="0.5"/>
              </svg>
            </div>
            Hire Me AI
          </a>
          <div className="nav-actions">
            {!token ? (
              <>
                <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Light mode" : "Dark mode"}>
                  {darkMode ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </button>
                <button className="btn-nav btn-nav-ghost" onClick={() => scrollToSection("auth")}>Log In</button>
                <button className="btn-nav btn-nav-primary" onClick={() => { setShowRegister(true); scrollToSection("auth"); }}>Get Started</button>
              </>
            ) : (
              <>
                <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Light mode" : "Dark mode"}>
                  {darkMode ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </button>
                <div className="nav-user-info">
                  <div className="nav-user-avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
                  <span style={{ fontWeight: 500 }}>{user?.name}</span>
                </div>
                <button className="btn-nav btn-nav-logout" onClick={logout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {!token ? (
        <>
          <div className="hero-container">
            <div className="hero-bg"></div>
            <div className="hero-grid"></div>
            <div className="hero-content">
              <div className="hero-inner">
                <div>
                  <div className="hero-badge">
                    <span className="hero-badge-dot"></span>
                    AI-Powered Job Matching
                  </div>
                  <h1 className="hero-title">
                    Land Your Dream Job with <span>AI Precision</span>
                  </h1>
                  <p className="hero-subtitle">
                    Smart resume analysis, personalized job recommendations, and instant apply powered by artificial intelligence. Your next career move starts here.
                  </p>
                  <div className="hero-buttons">
                    <button className="btn-cta btn-cta-primary" onClick={() => { setShowRegister(true); scrollToSection("auth"); }}>
                      Get Started
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button className="btn-cta btn-cta-secondary" onClick={() => scrollToSection("features")}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2"/>
                        <path d="M10 7V10L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Explore Jobs
                    </button>
                  </div>
                </div>
                <div className="hero-illustration">
                  <svg viewBox="0 0 500 450" fill="none">
                    <rect x="100" y="50" width="300" height="200" rx="16" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                    <rect x="120" y="70" width="260" height="8" rx="4" fill="rgba(255,255,255,0.2)" className="float-1"/>
                    <rect x="120" y="90" width="180" height="8" rx="4" fill="rgba(255,255,255,0.15)" className="float-2"/>
                    <rect x="120" y="120" width="100" height="36" rx="8" fill="rgba(255,255,255,0.2)" className="float-1"/>
                    <rect x="230" y="120" width="100" height="36" rx="8" fill="rgba(255,255,255,0.1)" className="float-2"/>
                    <rect x="120" y="180" width="260" height="6" rx="3" fill="rgba(255,255,255,0.1)"/>
                    <rect x="120" y="195" width="200" height="6" rx="3" fill="rgba(255,255,255,0.08)"/>
                    <rect x="120" y="210" width="220" height="6" rx="3" fill="rgba(255,255,255,0.06)"/>
                    <g className="float-3">
                      <circle cx="80" cy="120" r="50" fill="rgba(99,102,241,0.3)" stroke="rgba(99,102,241,0.5)" strokeWidth="2"/>
                      <path d="M65 115L75 125L95 105" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                    <g className="float-4">
                      <circle cx="420" cy="160" r="40" fill="rgba(168,85,247,0.3)" stroke="rgba(168,85,247,0.5)" strokeWidth="2"/>
                      <path d="M405 160H435M410 150H430M410 170H420" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round"/>
                    </g>
                    <g className="float-2">
                      <rect x="150" y="280" width="200" height="120" rx="16" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
                      <circle cx="200" cy="320" r="20" fill="rgba(52,211,153,0.3)" stroke="rgba(52,211,153,0.5)" strokeWidth="2"/>
                      <path d="M192 320L198 326L210 314" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="235" y="310" width="90" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
                      <rect x="235" y="325" width="60" height="6" rx="3" fill="rgba(255,255,255,0.12)"/>
                      <rect x="180" y="365" width="140" height="24" rx="12" fill="rgba(99,102,241,0.4)" className="float-1"/>
                      <rect x="215" y="373" width="70" height="8" rx="4" fill="rgba(255,255,255,0.8)"/>
                    </g>
                    <g className="float-3">
                      <rect x="380" y="300" width="80" height="80" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
                      <circle cx="420" cy="330" r="12" fill="rgba(251,191,36,0.3)"/>
                      <path d="M415 330L418 333L425 326" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="395" y="350" width="50" height="6" rx="3" fill="rgba(255,255,255,0.15)"/>
                      <rect x="405" y="360" width="30" height="6" rx="3" fill="rgba(255,255,255,0.1)"/>
                    </g>
                    <circle cx="50" cy="280" r="6" fill="rgba(255,255,255,0.15)" className="float-1"/>
                    <circle cx="450" cy="80" r="8" fill="rgba(255,255,255,0.1)" className="float-4"/>
                    <circle cx="250" cy="420" r="5" fill="rgba(255,255,255,0.12)" className="float-2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div id="features" className="section" data-animate>
            <div className="section-inner">
              <div className="section-header">
                <div className="section-badge">Features</div>
                <h2 className="section-title">Everything You Need to Land Your Next Role</h2>
                <p className="section-subtitle">Powered by cutting-edge AI to match you with opportunities that fit your skills, experience, and career goals.</p>
              </div>
              <div className="feature-grid">
                <div className="feature-card" data-animate="delay-1">
                  <div className="feature-icon" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    </svg>
                  </div>
                  <h3 className="feature-title">Smart Search</h3>
                  <p className="feature-desc">AI-powered job matching that understands your skills, preferences, and career trajectory to find perfect matches.</p>
                </div>
                <div className="feature-card" data-animate="delay-2">
                  <div className="feature-icon" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/>
                    </svg>
                  </div>
                  <h3 className="feature-title">AI Analysis</h3>
                  <p className="feature-desc">Get instant, actionable feedback on your resume with AI-powered insights on strengths, gaps, and improvements.</p>
                </div>
                <div className="feature-card" data-animate="delay-3">
                  <div className="feature-icon" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                    </svg>
                  </div>
                  <h3 className="feature-title">Easy Apply</h3>
                  <p className="feature-desc">One-click applications with your optimized profile ready to go. Apply to multiple jobs in seconds.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-section section" ref={statsRef} data-animate>
            <div className="section-inner">
              <div className="stats-grid">
                <div className="stat-item" data-animate="delay-1">
                  <div className="stat-number">{formatNumber(counters.jobs)}</div>
                  <p className="stat-label">Active Jobs</p>
                </div>
                <div className="stat-item" data-animate="delay-2">
                  <div className="stat-number">{formatNumber(counters.users)}</div>
                  <p className="stat-label">Registered Users</p>
                </div>
                <div className="stat-item" data-animate="delay-3">
                  <div className="stat-number">{formatNumber(counters.matches)}</div>
                  <p className="stat-label">AI Matches Made</p>
                </div>
                <div className="stat-item" data-animate="delay-4">
                  <div className="stat-number">{counters.satisfaction}%</div>
                  <p className="stat-label">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>

          <div className="section" data-animate>
            <div className="section-inner">
              <div className="section-header">
                <div className="section-badge">Preview</div>
                <h2 className="section-title">Latest Opportunities</h2>
                <p className="section-subtitle">Browse through some of the top positions available right now. Sign up to see all listings and apply instantly.</p>
              </div>
              <div className="job-preview-grid">
                {sampleJobs.map((job, i) => (
                  <div className="job-preview-card" key={i} data-animate={`delay-${Math.min(i + 1, 4)}`}>
                    <div className="job-preview-header">
                      <div>
                        <h3 className="job-preview-title">{job.title}</h3>
                        <p className="job-preview-company">{job.company}</p>
                      </div>
                      <span className="job-preview-badge">{job.type}</span>
                    </div>
                    <div className="job-preview-meta">
                      <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {job.location}
                      </span>
                      <span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        {job.salary}
                      </span>
                      <span>{job.posted}</span>
                    </div>
                    <div className="job-skills">
                      {job.skills.map((skill, j) => (
                        <span className="job-skill" key={j}>{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="ai-demo-section section" data-animate>
            <div className="section-inner">
              <div className="ai-demo-inner">
                <div className="ai-demo-content" data-animate>
                  <div className="section-badge">AI Powered</div>
                  <h3>Resume Analysis in Seconds</h3>
                  <p>Our AI analyzes your resume against job descriptions, providing a detailed breakdown of your match score, skill gaps, and personalized improvement suggestions.</p>
                  <ul className="ai-demo-features">
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                      ATS compatibility score
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                      Keyword optimization suggestions
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                      Skill gap analysis
                    </li>
                    <li>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                      Personalized improvement tips
                    </li>
                  </ul>
                  <button className="btn-cta btn-cta-primary" onClick={() => { setShowRegister(true); scrollToSection("auth"); }} style={{ color: "#6366f1" }}>
                    Try AI Analyzer
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="ai-demo-preview" data-animate="delay-2">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/></svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>AI Analysis Result</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Sample analysis preview</div>
                    </div>
                  </div>
                  <div className="ai-result-item">
                    <div className="ai-result-icon" style={{ background: "rgba(74,222,128,0.1)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="ai-result-label">Overall Match Score</div>
                      <div className="ai-result-value">85 out of 100</div>
                    </div>
                    <div className="ai-score-bar">
                      <div className="ai-score-fill" style={{ width: "85%", background: "linear-gradient(90deg, #22c55e, #4ade80)" }}></div>
                    </div>
                  </div>
                  <div className="ai-result-item">
                    <div className="ai-result-icon" style={{ background: "rgba(99,102,241,0.1)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="ai-result-label">ATS Compatibility</div>
                      <div className="ai-result-value">92% compatible</div>
                    </div>
                    <div className="ai-score-bar">
                      <div className="ai-score-fill" style={{ width: "92%", background: "var(--gradient-primary)" }}></div>
                    </div>
                  </div>
                  <div className="ai-result-item">
                    <div className="ai-result-icon" style={{ background: "rgba(251,191,36,0.1)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="ai-result-label">Skills Match</div>
                      <div className="ai-result-value">7 of 9 required skills</div>
                    </div>
                    <div className="ai-score-bar">
                      <div className="ai-score-fill" style={{ width: "78%", background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }}></div>
                    </div>
                  </div>
                  <div className="ai-result-item">
                    <div className="ai-result-icon" style={{ background: "rgba(239,68,68,0.1)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="ai-result-label">Improvement Needed</div>
                      <div className="ai-result-value">Add more quantifiable achievements</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section" data-animate>
            <div className="section-inner">
              <div className="section-header">
                <div className="section-badge">Testimonials</div>
                <h2 className="section-title">Loved by Thousands of Job Seekers</h2>
                <p className="section-subtitle">See what our users have to say about their experience with Hire Me AI.</p>
              </div>
              <div className="testimonial-grid">
                {testimonials.map((t, i) => (
                  <div className="testimonial-card" key={i} data-animate={`delay-${i + 1}`}>
                    <div className="testimonial-stars">
                      {[...Array(t.rating)].map((_, j) => (
                        <svg key={j} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      ))}
                    </div>
                    <p className="testimonial-text">{t.text}</p>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar">{t.avatar}</div>
                      <div>
                        <p className="testimonial-name">{t.name}</p>
                        <p className="testimonial-role">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="auth" className="section auth-section" data-animate>
            <div className="section-inner">
              <div className="section-header">
                <div className="section-badge">Get Started</div>
                <h2 className="section-title">Create Your Account</h2>
                <p className="section-subtitle">Join thousands of professionals who are already using AI to accelerate their careers.</p>
              </div>
              <div className="auth-card">
                <div className="auth-header">
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--gradient-primary)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
                    </svg>
                  </div>
                  <h3 style={{ fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", fontSize: "1.3rem" }}>
                    {showRegister ? "Create your account" : "Welcome back"}
                  </h3>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem" }}>
                    {showRegister ? "Start your AI-powered job search today" : "Log in to continue your journey"}
                  </p>
                </div>
                <div className="auth-tabs">
                  <button className={`auth-tab ${!showRegister ? "active" : ""}`} onClick={() => { setShowRegister(false); setError(""); }}>Login</button>
                  <button className={`auth-tab ${showRegister ? "active" : ""}`} onClick={() => { setShowRegister(true); setError(""); }}>Register</button>
                </div>
                <div className="auth-body">
                  <div className="social-login">
                    <button className="btn-social" type="button" onClick={handleGoogleLogin} disabled={oauthLoading === "google"}>
                      {oauthLoading === "google" ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      {oauthLoading === "google" ? "Connecting..." : "Google"}
                    </button>
                    <button className="btn-social" type="button" onClick={handleGithubLogin} disabled={oauthLoading === "github"}>
                      {oauthLoading === "github" ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 2.619.97.759-.211 1.583-.316 2.417-.322.827.006 1.645.111 2.395.322 1.606-1.292 2.613-.97 2.613-.97.656 1.652.244 2.873.12 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      )}
                      {oauthLoading === "github" ? "Connecting..." : "GitHub"}
                    </button>
                  </div>
                  <div className="divider">or continue with email</div>
                  {error && <div className="error-alert">{error}</div>}
                  <form onSubmit={showRegister ? handleRegister : handleLogin}>
                    {showRegister && (
                      <>
                        <div className="input-group">
                          <span className="input-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          </span>
                          <input className="input-field" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="input-group">
                          <span className="input-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          </span>
                          <select className="input-field select-field" value={role} onChange={e => setRole(e.target.value)}>
                            <option value="jobseeker">Job Seeker</option>
                            <option value="recruiter">Recruiter</option>
                          </select>
                        </div>
                      </>
                    )}
                    <div className="input-group">
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
                      </span>
                      <input type="email" className="input-field" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </span>
                      <input type={showPassword ? "text" : "password"} className="input-field" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                          Processing...
                        </span>
                      ) : showRegister ? "Create Account" : "Sign In"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <footer className="footer">
            <div className="footer-inner">
              <div className="footer-grid">
                <div>
                  <div className="footer-brand">
                    <svg viewBox="0 0 36 36" fill="none">
                      <rect width="36" height="36" rx="10" fill="url(#fGrad)"/>
                      <path d="M11 18L15 22L25 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <defs><linearGradient id="fGrad" x1="0" y1="0" x2="36" y2="36"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs>
                    </svg>
                    Hire Me AI
                  </div>
                  <p className="footer-desc">AI-powered job matching and resume analysis platform helping professionals land their dream roles faster.</p>
                  <div className="footer-socials">
                    <div className="footer-social">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                    </div>
                    <div className="footer-social">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 2.619.97.759-.211 1.583-.316 2.417-.322.827.006 1.645.111 2.395.322 1.606-1.292 2.613-.97 2.613-.97.656 1.652.244 2.873.12 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    </div>
                    <div className="footer-social">
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="footer-heading">Product</h4>
                  <ul className="footer-links">
                    <li><a href="#">Features</a></li>
                    <li><a href="#">Pricing</a></li>
                    <li><a href="#">AI Analyzer</a></li>
                    <li><a href="#">Job Board</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="footer-heading">Company</h4>
                  <ul className="footer-links">
                    <li><a href="#">About</a></li>
                    <li><a href="#">Careers</a></li>
                    <li><a href="#">Blog</a></li>
                    <li><a href="#">Contact</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="footer-heading">Legal</h4>
                  <ul className="footer-links">
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                    <li><a href="#">Cookie Policy</a></li>
                  </ul>
                </div>
              </div>
              <div className="footer-bottom">
                <span>&copy; 2026 Hire Me AI. All rights reserved.</span>
                <span>Built with AI & care.</span>
              </div>
            </div>
          </footer>
        </>
      ) : (
        <div className="dashboard-wrapper">
          <div className="section-inner">
            {error && <div className="error-alert">{error}</div>}

            <div className="dashboard-tabs">
              <button className={`dashboard-tab ${view === "jobs" ? "active" : ""}`} onClick={() => setView("jobs")}>Browse Jobs</button>
              {user?.role === "recruiter" && (
                <>
                  <button className={`dashboard-tab ${view === "post" ? "active" : ""}`} onClick={() => setView("post")}>Post Job</button>
                  <button className={`dashboard-tab ${view === "applications" ? "active" : ""}`} onClick={() => setView("applications")}>Applications</button>
                </>
              )}
              {user?.role === "jobseeker" && (
                <>
                  <button className={`dashboard-tab ${view === "applied" ? "active" : ""}`} onClick={() => setView("applied")}>My Applications</button>
                  <button className={`dashboard-tab ${view === "ai" ? "active" : ""}`} onClick={() => setView("ai")}>AI Resume Analyzer</button>
                </>
              )}
            </div>

            {view === "jobs" && (
              <>
                <div className="dashboard-search">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  </span>
                  <input type="text" className="input-field" placeholder="Search jobs by title, company, or description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                {filteredJobs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 16, opacity: 0.5 }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                    <h4 style={{ margin: "0 0 8px" }}>No jobs found</h4>
                    <p style={{ margin: 0 }}>Try adjusting your search terms</p>
                  </div>
                ) : (
                  filteredJobs.map(job => (
                    <div className="job-card" key={job._id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                        <div>
                          <h3 className="job-card-title">{job.title}</h3>
                          <p className="job-card-company">{job.company}</p>
                        </div>
                        {user?.role === "jobseeker" && <button className="btn-apply" onClick={() => applyJob(job._id)}>Apply Now</button>}
                      </div>
                      <p className="job-card-desc">{job.description.substring(0, 150)}...</p>
                      {job.skillsRequired?.length > 0 && (
                        <div>
                          {job.skillsRequired.map((skill, i) => (
                            <span key={i} className="skill-tag">{skill}</span>
                          ))}
                        </div>
                      )}
                      <div style={{ marginTop: 12, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Posted by {job.postedBy?.name}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {view === "post" && user?.role === "recruiter" && (
              <div className="auth-card" style={{ maxWidth: 600, margin: "0 auto" }}>
                <div className="auth-header">
                  <h3 style={{ fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Post a New Job</h3>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem" }}>Fill in the details to publish your job listing</p>
                </div>
                <div className="auth-body">
                  <form onSubmit={handlePostJob}>
                    <div className="input-group">
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </span>
                      <input className="input-field" placeholder="Job Title (e.g. Software Engineer)" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} required />
                    </div>
                    <div className="input-group">
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>
                      </span>
                      <input className="input-field" placeholder="Company Name" value={newJob.company} onChange={e => setNewJob({...newJob, company: e.target.value})} required />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <textarea className="input-field" rows="4" placeholder="Job description..." value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} required style={{ paddingLeft: 14, resize: "vertical" }} />
                    </div>
                    <div className="input-group">
                      <span className="input-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                      </span>
                      <input className="input-field" placeholder="Required skills (comma separated)" value={newJob.skills} onChange={e => setNewJob({...newJob, skills: e.target.value})} />
                    </div>
                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading ? "Posting..." : "Publish Job"}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {view === "applications" && user?.role === "recruiter" && (
              <div className="auth-card" style={{ maxWidth: 900 }}>
                <div className="auth-header">
                  <h3 style={{ fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>Job Applications</h3>
                </div>
                <div className="auth-body">
                  {applications.length === 0 ? (
                    <p style={{ textAlign: "center", color: "var(--text-muted)" }}>No applications yet</p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                            {["Job Title", "Applicant", "Email", "Status", "Date"].map(h => (
                              <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {applications.map(app => (
                            <tr key={app._id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                              <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text-primary)" }}>{app.job?.title}</td>
                              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{app.user?.name}</td>
                              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{app.user?.email}</td>
                              <td style={{ padding: "12px 16px" }}>
                                <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>{app.status}</span>
                              </td>
                              <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: "0.85rem" }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === "applied" && user?.role === "jobseeker" && (
              <div className="auth-card" style={{ maxWidth: 900 }}>
                <div className="auth-header">
                  <h3 style={{ fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>My Applications</h3>
                </div>
                <div className="auth-body">
                  {myApplications.length === 0 ? (
                    <p style={{ textAlign: "center", color: "var(--text-muted)" }}>You haven't applied to any jobs yet</p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--card-border)" }}>
                            {["Job Title", "Company", "Status", "Date Applied"].map(h => (
                              <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {myApplications.map(app => (
                            <tr key={app._id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                              <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text-primary)" }}>{app.job?.title}</td>
                              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{app.job?.company}</td>
                              <td style={{ padding: "12px 16px" }}>
                                <span style={{ padding: "4px 10px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, background: "rgba(74,222,128,0.1)", color: "#22c55e" }}>{app.status}</span>
                              </td>
                              <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: "0.85rem" }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === "ai" && user?.role === "jobseeker" && (
              <div className="auth-card" style={{ maxWidth: 700 }}>
                <div className="auth-header">
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--gradient-primary)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/></svg>
                  </div>
                  <h3 style={{ fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>AI Resume Analyzer</h3>
                  <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "0.9rem" }}>Paste your resume and get AI-powered feedback</p>
                </div>
                <div className="auth-body">
                  <div style={{ marginBottom: 18 }}>
                    <textarea className="input-field" rows="10" placeholder="Paste your resume here..." value={resumeText} onChange={e => setResumeText(e.target.value)} style={{ paddingLeft: 14, resize: "vertical" }} />
                  </div>
                  <button className="btn-submit" onClick={handleAnalyzeResume} disabled={loading}>
                    {loading ? "Analyzing..." : "Analyze Resume"}
                  </button>
                  {aiResult && <div className="result-box"><h5 style={{ borderBottom: "1px solid var(--card-border)", paddingBottom: 12, marginBottom: 16, marginTop: 0 }}>Analysis Result</h5><p style={{ margin: 0 }}>{aiResult}</p></div>}
                </div>
              </div>
            )}
          </div>

          <footer className="footer">
            <div className="footer-inner">
              <div className="footer-bottom" style={{ borderTop: "none", paddingTop: 0 }}>
                <span>&copy; 2026 Hire Me AI. All rights reserved.</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export default App;
