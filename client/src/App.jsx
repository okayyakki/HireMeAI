import { useState, useEffect, useRef, useCallback } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "./firebase";
import SkillGapAnalyzer from "./SkillGapAnalyzer";
import CareerAccelerator from "./CareerAccelerator";
import CareerRoadmap from "./CareerRoadmap";
import SkillsDisplay from "./SkillsDisplay";
import MockTest from "./MockTest";
import SkillAuthenticityEngine from "./SkillAuthenticityEngine";
import CognitiveIntelligenceSystem from "./CognitiveIntelligenceSystem";
import { extractSkillsFromAnalysis } from "./skillExtractor";

// FormData is available globally in modern browsers

const API_URL = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("landing");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [showPassword, setShowPassword] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState({ jobs: 0, users: 0, matches: 0, satisfaction: 0 });
  const statsRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("jobseeker");
  const [newJob, setNewJob] = useState({ title: "", company: "", description: "", skills: "" });
  const [resumeText, setResumeText] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [oauthLoading, setOauthLoading] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [savedJobs, setSavedJobs] = useState(() => JSON.parse(localStorage.getItem("savedJobs") || "[]"));
  const [jobsLoading, setJobsLoading] = useState(false);
  const [myApplications, setMyApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [categorizedSkills, setCategorizedSkills] = useState(null);
  const [dragOver, setDragOver] = useState(false);
const [dashboardTab, setDashboardTab] = useState("jobs");
const [showApplyChoice, setShowApplyChoice] = useState(false);
const [applyChoiceJob, setApplyChoiceJob] = useState(null);
const [showMockTest, setShowMockTest] = useState(false);
const [mockTestJob, setMockTestJob] = useState(null);
const [mockTestResult, setMockTestResult] = useState(null);
const [showApplyModal, setShowApplyModal] = useState(false);
const [selectedJob, setSelectedJob] = useState(null);
const [applicationData, setApplicationData] = useState({
  fullName: "",
  email: "",
  phone: "",
  coverLetter: "",
  resumeFile: null,
  resumeText: "",
  portfolioUrl: "",
  linkedInUrl: "",
  yearsOfExperience: ""
});
const [formErrors, setFormErrors] = useState({});
const [submitting, setSubmitting] = useState(false);
const [appliedJobs, setAppliedJobs] = useState([]);
const [showChatbot, setShowChatbot] = useState(false);
const [recruiterTab, setRecruiterTab] = useState("stats");
const [recruiterStats, setRecruiterStats] = useState({ totalJobs: 0, activeJobs: 0, totalApplicants: 0, interviewsScheduled: 0 });
const [recruiterJobs, setRecruiterJobs] = useState([]);
const [recruiterJobsLoading, setRecruiterJobsLoading] = useState(false);
const [selectedJobApplicants, setSelectedJobApplicants] = useState([]);
const [applicantsLoading, setApplicantsLoading] = useState(false);
const [selectedApplicantJob, setSelectedApplicantJob] = useState(null);
const [editJob, setEditJob] = useState(null);
const [createJobForm, setCreateJobForm] = useState({ title: "", company: "", description: "", location: "", salary: "", type: "Full-time", experience: "Mid-level", workplaceType: "remote", skillsRequired: "", requirements: "", benefits: "", companyLogo: "🏢" });
const [skillTags, setSkillTags] = useState([]);
const [skillInput, setSkillInput] = useState("");
const [benefitTags, setBenefitTags] = useState([]);
const [benefitInput, setBenefitInput] = useState("");
const [recruiterFormErrors, setRecruiterFormErrors] = useState({});
const [creatingJob, setCreatingJob] = useState(false);
const [updatingStatus, setUpdatingStatus] = useState(null);
const suggestionOptions = [
  "Skills Improvement",
  "Project Ideas",
  "Learning Roadmap",
  "Interview Tips",
  "Resume Feedback"
];
const [chatMessages, setChatMessages] = useState([
  { role: "assistant", content: "Hey there! 👋 I'm your AI Career Mentor. I can help you figure out what skills to learn next, suggest projects to build, create a learning roadmap, give interview tips, or provide feedback on your resume. What would you like to work on?", ts: new Date() }
]);
const [chatInput, setChatInput] = useState("");
const [chatLoading, setChatLoading] = useState(false);
const [showSuggestions, setShowSuggestions] = useState(true);
const [showSkillGap, setShowSkillGap] = useState(false);
const [jobSkillCompare, setJobSkillCompare] = useState("");
const [skillGapResult, setSkillGapResult] = useState(null);

const [filters, setFilters] = useState({ type: "", experience: "", remote: "" });
const searchTimeoutRef = useRef(null);
const chatEndRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
  }, [savedJobs]);

  useEffect(() => {
    if (token) {
      fetchUser();
      fetchJobs();
    }
  }, [token]);

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById("mainNav");
      if (nav) nav.classList.toggle("nav-scrolled", window.scrollY > 50);
      if (statsRef.current) {
        const rect = statsRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8 && !statsVisible) setStatsVisible(true);
      }
      document.querySelectorAll("[data-animate]").forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) el.classList.add("visible");
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

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (showChatbot && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showChatbot]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

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

  const fetchJobs = async (searchVal = "", filterOverrides = {}) => {
    setJobsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchVal) params.set("search", searchVal);
      const activeFilters = { ...filters, ...filterOverrides };
      if (activeFilters.type) params.set("type", activeFilters.type);
      if (activeFilters.experience) params.set("experience", activeFilters.experience);
      if (activeFilters.remote) params.set("remote", activeFilters.remote);
      const qs = params.toString();
      const url = `${API_URL}/api/jobs${qs ? '?' + qs : ''}`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      showToast("Failed to fetch jobs", "error");
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    setApplicationsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/applications/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyApplications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      showToast("Failed to fetch applications", "error");
    } finally {
      setApplicationsLoading(false);
    }
  };

  const fetchRecruiterStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/applications/recruiter/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecruiterStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch recruiter stats:", err);
    }
  };

  const fetchRecruiterJobs = async () => {
    setRecruiterJobsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecruiterJobs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      showToast("Failed to fetch your jobs", "error");
    } finally {
      setRecruiterJobsLoading(false);
    }
  };

  const fetchJobApplicants = async (jobId) => {
    setApplicantsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/applications/job/${jobId}/applicants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedJobApplicants(Array.isArray(data) ? data : []);
        setSelectedApplicantJob(jobId);
      }
    } catch (err) {
      showToast("Failed to fetch applicants", "error");
    } finally {
      setApplicantsLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setRecruiterFormErrors({});

    const errors = {};
    if (!createJobForm.title.trim()) errors.title = "Job title is required";
    if (!createJobForm.company.trim()) errors.company = "Company is required";
    if (!createJobForm.description.trim()) errors.description = "Description is required";
    if (!createJobForm.location.trim()) errors.location = "Location is required";
    if (skillTags.length === 0) errors.skills = "At least one skill is required";

    if (Object.keys(errors).length > 0) {
      setRecruiterFormErrors(errors);
      return;
    }

    setCreatingJob(true);
    try {
      const payload = {
        title: createJobForm.title.trim(),
        company: createJobForm.company.trim(),
        description: createJobForm.description.trim(),
        location: createJobForm.location.trim(),
        salary: createJobForm.salary.trim(),
        type: createJobForm.type,
        experience: createJobForm.experience,
        workplaceType: createJobForm.workplaceType,
        companyLogo: createJobForm.companyLogo,
        skillsRequired: skillTags,
        requirements: createJobForm.requirements.split(",").map(r => r.trim()).filter(Boolean),
        benefits: benefitTags,
      };

      let res;
      if (editJob) {
        res = await fetch(`${API_URL}/api/jobs/${editJob._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/api/jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        showToast(editJob ? "Job updated successfully!" : "Job posted successfully!", "success");
        setCreateJobForm({ title: "", company: "", description: "", location: "", salary: "", type: "Full-time", experience: "Mid-level", workplaceType: "remote", skillsRequired: "", requirements: "", benefits: "", companyLogo: "🏢" });
        setSkillTags([]);
        setBenefitTags([]);
        setEditJob(null);
        fetchRecruiterJobs();
        fetchRecruiterStats();
        setRecruiterTab("posted-jobs");
      } else {
        showToast(data.message || "Failed to save job", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setCreatingJob(false);
    }
  };

  const handleUpdateJobStatus = async (appId, status) => {
    setUpdatingStatus(appId);
    try {
      const res = await fetch(`${API_URL}/api/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(`Application ${status}`, "success");
        if (selectedApplicantJob) fetchJobApplicants(selectedApplicantJob);
        fetchRecruiterStats();
      }
    } catch (err) {
      showToast("Failed to update status", "error");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      const res = await fetch(`${API_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast("Job deleted", "success");
        fetchRecruiterJobs();
        fetchRecruiterStats();
      }
    } catch (err) {
      showToast("Failed to delete job", "error");
    }
  };

  const handleToggleJobStatus = async (jobId) => {
    try {
      const res = await fetch(`${API_URL}/api/jobs/${jobId}/toggle-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchRecruiterJobs();
        fetchRecruiterStats();
      }
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchJobs(value, filters), 300);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchJobs(searchTerm, newFilters);
  };

  const openApplyModal = (job) => {
    if (!token) {
      showToast("Please login to apply", "error");
      return;
    }
    const jobId = job.id || job._id;
    if (appliedJobs.includes(jobId)) {
      showToast("You have already applied to this job", "error");
      return;
    }
    setApplyChoiceJob(job);
    requestAnimationFrame(() => setShowApplyChoice(true));
  };

  const handleQuickApply = () => {
    const job = applyChoiceJob;
    if (!job) return;
    setShowApplyChoice(false);
    setApplyChoiceJob(null);
    setSelectedJob(job);
    setFormErrors({});
    setApplicationData({
      fullName: user?.name || "",
      email: user?.email || "",
      phone: "",
      coverLetter: "",
      resumeFile: null,
      resumeText: "",
      portfolioUrl: "",
      linkedInUrl: "",
      yearsOfExperience: ""
    });
    requestAnimationFrame(() => setShowApplyModal(true));
  };

  const handleOpenAssessment = () => {
    const job = applyChoiceJob;
    if (!job) return;
    const jobId = job.id || job._id;
    const prevResult = mockTestResult;
    if (prevResult && prevResult.jobId === jobId) {
      setShowApplyChoice(false);
      setApplyChoiceJob(null);
      setSelectedJob(job);
      setFormErrors({});
      setApplicationData({
        fullName: user?.name || "",
        email: user?.email || "",
        phone: "",
        coverLetter: "",
        resumeFile: null,
        resumeText: "",
        portfolioUrl: "",
        linkedInUrl: "",
        yearsOfExperience: ""
      });
      requestAnimationFrame(() => setShowApplyModal(true));
      return;
    }
    setShowApplyChoice(false);
    setApplyChoiceJob(null);
    setMockTestJob(job);
    requestAnimationFrame(() => setShowMockTest(true));
  };

  const handleMockTestComplete = (result) => {
    const mockJob = mockTestJob;
    setMockTestResult({ ...result, jobId: mockJob.id || mockJob._id });
    setShowMockTest(false);
    setMockTestJob(null);
    setSelectedJob(mockJob);
    setFormErrors({});
    setApplicationData({
      fullName: user?.name || "",
      email: user?.email || "",
      phone: "",
      coverLetter: "",
      resumeFile: null,
      resumeText: "",
      portfolioUrl: "",
      linkedInUrl: "",
      yearsOfExperience: ""
    });
    requestAnimationFrame(() => setShowApplyModal(true));
  };

  const validateForm = () => {
    const errors = {};
    if (!applicationData.fullName.trim()) errors.fullName = "Full name is required";
    if (!applicationData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicationData.email)) errors.email = "Invalid email format";
    if (applicationData.portfolioUrl && !/^https?:\/\/.+/.test(applicationData.portfolioUrl)) errors.portfolioUrl = "Must start with http:// or https://";
    if (applicationData.linkedInUrl && !/^https?:\/\/(www\.)?linkedin\.com\/.+/.test(applicationData.linkedInUrl)) errors.linkedInUrl = "Must be a valid LinkedIn URL";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("fullName", applicationData.fullName.trim());
      formData.append("email", applicationData.email.trim());
      formData.append("phone", applicationData.phone);
      formData.append("coverLetter", applicationData.coverLetter);
      formData.append("portfolioUrl", applicationData.portfolioUrl);
      formData.append("linkedInUrl", applicationData.linkedInUrl);
      formData.append("yearsOfExperience", applicationData.yearsOfExperience);

      if (applicationData.resumeFile) {
        formData.append("resume", applicationData.resumeFile);
      } else if (applicationData.resumeText) {
        formData.append("resumeText", applicationData.resumeText);
      }

      const res = await fetch(`${API_URL}/api/applications/${selectedJob.id || selectedJob._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Application submitted successfully!", "success");
        setAppliedJobs(prev => [...prev, selectedJob.id || selectedJob._id]);
        setShowApplyModal(false);
        setSelectedJob(null);
        if (dashboardTab === "my-applications") fetchMyApplications();
      } else {
        showToast(data.message || "Application failed", "error");
      }
    } catch (err) {
      showToast("Failed to submit application", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSaveJob = (jobId) => {
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleFileSelect = (file) => {
    const allowedTypes = [".pdf", ".doc", ".docx", ".txt"];
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      showToast("Only PDF, DOC, DOCX, and TXT files are allowed", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB", "error");
      return;
    }
    setSelectedFile(file);
    setResumeText(""); // Clear text input when file is selected
    showToast(`File "${file.name}" selected`, "success");
  };

  const analyzeResume = async () => {
    if (!selectedFile && !resumeText.trim()) {
      showToast("Please upload a file or paste resume text", "error");
      return;
    }
    if (resumeText.trim().length < 50 && !selectedFile) {
      showToast("Please provide more resume content (minimum 50 characters)", "error");
      return;
    }
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("resume", selectedFile);
        console.log("Analyzing file:", selectedFile.name, "Size:", selectedFile.size, "Type:", selectedFile.type);
      } else {
        formData.append("resumeText", resumeText);
      }
      const res = await fetch(`${API_URL}/api/ai/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok && data.result) {
        setAnalysisResult(data.result);
        const textToExtract = selectedFile ? resumeText || data.result.summary || "" : resumeText;
        setCategorizedSkills(extractSkillsFromAnalysis(data.result.skills, textToExtract));
        showToast("Resume analyzed successfully!", "success");
      } else {
        // Show the actual error message from backend
        const errorMsg = data.message || data.details || `Analysis failed (${res.status})`;
        showToast(errorMsg, "error");
        
        // If fallback is available, still show basic analysis
        if (data.fallback && data.result) {
          setAnalysisResult(data.result);
          const textToExtract = selectedFile ? resumeText || data.result.summary || "" : resumeText;
          setCategorizedSkills(extractSkillsFromAnalysis(data.result.skills, textToExtract));
          showToast("Basic analysis complete. For detailed analysis, configure AI API key.", "success");
        }
      }
    } catch (err) {
      console.error("Analyze error:", err);
      showToast("Server error during analysis. Please try again.", "error");
    } finally {
      setAnalyzing(false);
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
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setView(data.user?.role === "recruiter" ? "recruiter-dashboard" : "dashboard");
      } else {
        setError(data.message || "Invalid login credentials");
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
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setView(data.user?.role === "recruiter" ? "recruiter-dashboard" : "dashboard");
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
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setEmail("");
    setPassword("");
    setView("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSocialLogin = async (provider, providerName) => {
    setError("");
    setOauthLoading(providerName);
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const res = await fetch(`${API_URL}/api/auth/social-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: result.user.displayName || result.user.email?.split("@")[0] || "User",
          email: result.user.email,
          photo: result.user.photoURL,
          provider: providerName,
          idToken,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setView(data.user?.role === "recruiter" ? "recruiter-dashboard" : "dashboard");
      } else {
        setError(data.message || `${providerName} login failed`);
      }
    } catch (err) {
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

  useEffect(() => {
    if (dashboardTab === "my-applications") fetchMyApplications();
  }, [dashboardTab]);

  useEffect(() => {
    if (view === "recruiter-dashboard") {
      fetchRecruiterStats();
      fetchRecruiterJobs();
    }
  }, [view]);

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

  const renderMarkdown = (text) => {
    const lines = text.split("\n");
    const elements = [];
    let inList = false;
    let listItems = [];
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inList && listItems.length > 0) {
          elements.push(<ul key={`ul-${i}`} style={{ margin: "4px 0", paddingLeft: 18 }}>{listItems}</ul>);
          listItems = [];
          inList = false;
        }
        return;
      }
      const listMatch = trimmed.match(/^(\d+[.)]|[-*])\s(.+)/);
      if (listMatch) {
        inList = true;
        listItems.push(<li key={`li-${i}`} style={{ marginBottom: 3 }}>{formatInline(listMatch[2])}</li>);
        return;
      }
      if (inList && listItems.length > 0) {
        elements.push(<ul key={`ul-${i}`} style={{ margin: "4px 0", paddingLeft: 18 }}>{listItems}</ul>);
        listItems = [];
        inList = false;
      }
      elements.push(<p key={`p-${i}`} style={{ margin: "0 0 6px" }}>{formatInline(trimmed)}</p>);
    });
    if (inList && listItems.length > 0) {
      elements.push(<ul key="ul-last" style={{ margin: "4px 0", paddingLeft: 18 }}>{listItems}</ul>);
    }
    return elements;
  };

  const formatInline = (text) => {
    const parts = [];
    let remaining = text;
    let key = 0;
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
      if (boldMatch) {
        parts.push(<strong key={key++}>{boldMatch[2]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(<code key={key++} style={{ background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: 4, fontSize: "0.85rem", fontFamily: "'SF Mono', Consolas, monospace" }}>{codeMatch[1]}</code>);
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    }
    return parts;
  };

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + "K+";
    return num + "+";
  };

  const getTypingDelay = (text) => {
    const len = text.length;
    const base = len <= 50 ? 1000 : len <= 200 ? 2000 : 3000;
    const variance = Math.random() * 1000;
    return base + variance;
  };

  useEffect(() => {
    if (!chatLoading) return;
    const id = setInterval(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
    return () => clearInterval(id);
  }, [chatLoading]);

  const mapPinIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, verticalAlign: "middle", marginRight: 4 }}>
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  );

  const moneyIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, verticalAlign: "middle", marginRight: 4 }}>
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.436 6 8.742v.054a4.5 4.5 0 003.5 4.405v.095a1 1 0 10-2 0v-.095a2.5 2.5 0 01-2-2.418V8.742a2.5 2.5 0 012.602-2.414c.28-.065.544-.15.793-.252V5a1 1 0 112 0v.076c.25.102.514.187.793.252a2.5 2.5 0 012.602 2.414v.054a2.5 2.5 0 01-2 2.418v.095a1 1 0 10-2 0v-.095a4.5 4.5 0 003.5-4.405V8.742a4.5 4.5 0 00-1.324-3.09A4.535 4.535 0 0011 5.092V5z" clipRule="evenodd" />
    </svg>
  );

  const briefcaseIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, verticalAlign: "middle", marginRight: 4 }}>
      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A6.95 6.95 0 0110 16c-1.93 0-3.68-.782-4.95-2.05L2 12.586V10a2 2 0 012-2h2zm4-1v1H8V5a1 1 0 011-1h2a1 1 0 011 1v1H10z" clipRule="evenodd" />
      <path d="M12 9H8v2h4V9z" />
    </svg>
  );

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

        .recruiter-stat-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          cursor: default;
        }
        .recruiter-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          border-radius: 20px 20px 0 0;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
        .recruiter-stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.3);
        }
        .recruiter-stat-card:hover::before {
          opacity: 1;
        }
        @keyframes statGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(99,102,241,0.1); }
          50% { box-shadow: 0 0 20px rgba(99,102,241,0.2), 0 0 40px rgba(99,102,241,0.05); }
        }
        .recruiter-stat-card.glowing {
          animation: statGlow 3s ease-in-out infinite;
        }
        .recruiter-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          transition: transform 0.3s ease;
        }
        .recruiter-stat-card:hover .recruiter-stat-icon {
          transform: scale(1.1);
        }
        .recruiter-stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }
        .recruiter-stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .recruiter-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .recruiter-stats-grid { grid-template-columns: 1fr !important; }
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
          position: relative;
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
        .btn-apply:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .save-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.4rem;
          padding: 4px;
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
        .analysis-section {
          margin: 16px 0;
          padding: 16px;
          border: 1px solid var(--card-border);
          border-radius: 12px;
          background: var(--bg-secondary);
        }
        .analysis-section h4 {
          color: var(--text-primary);
          margin: 0 0 8px;
          font-size: 1rem;
        }
        .analysis-section ul {
          margin: 0;
          padding-left: 20px;
          color: var(--text-secondary);
        }
        .analysis-section li {
          margin-bottom: 4px;
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

        .skeleton {
          background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--card-bg) 50%, var(--bg-tertiary) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        .skeleton-card {
          height: 200px;
          margin-bottom: 16px;
          border-radius: 16px;
        }
        .skeleton-line {
          height: 16px;
          margin: 8px 0;
          width: 80%;
          border-radius: 4px;
        }
        .skeleton-line-short { width: 60%; }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
        }
        .empty-state h3 {
          color: var(--text-primary);
          margin: 16px 0 8px;
        }

        .toast {
          position: fixed;
          top: 80px;
          right: 20px;
          padding: 14px 24px;
          border-radius: 12px;
          color: white;
          z-index: 10000;
          animation: slideIn 0.3s ease;
          font-weight: 500;
          font-size: 0.9rem;
          box-shadow: var(--shadow-lg);
        }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .toast-success { background-color: #10b981; }
        .toast-error { background-color: #ef4444; }

        .status-applied { background-color: #3b82f6; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
        .status-reviewing { background-color: #f59e0b; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
        .status-accepted { background-color: #10b981; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
        .status-rejected { background-color: #ef4444; color: white; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }

        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

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
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .upload-zone {
          border: 2px dashed var(--input-border);
          border-radius: 20px;
          padding: 48px 32px;
          text-align: center;
          background: var(--bg-secondary);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .upload-zone::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .upload-zone:hover::before,
        .upload-zone.dragover::before { opacity: 1; }
        .upload-zone:hover {
          border-color: rgba(99,102,241,0.3);
          background: var(--card-bg);
        }
        .upload-zone.dragover {
          border-color: #6366f1;
          background: rgba(99,102,241,0.05);
          transform: scale(1.01);
          box-shadow: 0 0 40px rgba(99,102,241,0.15);
        }
        .upload-zone.has-file {
          padding: 24px 32px;
          border-style: solid;
          border-color: rgba(16,185,129,0.3);
          background: rgba(16,185,129,0.03);
        }
        .upload-icon-wrap {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99,102,241,0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .upload-zone.dragover .upload-icon-wrap {
          transform: scale(1.15) rotate(-5deg);
          background: rgba(99,102,241,0.2);
        }
        .upload-zone.has-file .upload-icon-wrap {
          background: rgba(16,185,129,0.1);
        }
        .upload-icon-wrap svg {
          width: 32px;
          height: 32px;
          color: #6366f1;
          transition: all 0.4s ease;
        }
        .upload-zone.dragover .upload-icon-wrap svg {
          color: #4f46e5;
          transform: translateY(-4px);
        }
        .upload-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 8px;
        }
        .upload-subtext {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0 0 20px;
        }
        .upload-formats {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .format-badge {
          padding: 5px 14px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          background: rgba(99,102,241,0.08);
          color: #6366f1;
          border: 1px solid rgba(99,102,241,0.15);
          text-transform: uppercase;
          transition: all 0.3s ease;
        }
        .upload-zone.dragover .format-badge {
          background: rgba(99,102,241,0.15);
          border-color: rgba(99,102,241,0.3);
        }
        .dark .format-badge {
          background: rgba(129,140,248,0.1);
          color: #818cf8;
          border-color: rgba(129,140,248,0.2);
        }
        .file-preview {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 14px;
          animation: fadeInUp 0.3s ease;
        }
        .file-preview-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .file-preview-icon.pdf { background: rgba(239,68,68,0.1); color: #ef4444; }
        .file-preview-icon.doc { background: rgba(59,130,246,0.1); color: #3b82f6; }
        .file-preview-icon.txt { background: rgba(16,185,129,0.1); color: #10b981; }
        .file-preview-icon svg { width: 24px; height: 24px; }
        .file-preview-info { flex: 1; min-width: 0; }
        .file-preview-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.95rem;
          margin: 0 0 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .file-preview-size {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }
        .file-preview-remove {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--card-border);
          background: var(--bg-tertiary);
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .file-preview-remove:hover {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
          border-color: rgba(239,68,68,0.2);
        }
        .upload-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .upload-divider::before,
        .upload-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--card-border);
        }
        .analyze-btn {
          padding: 14px 36px;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--gradient-primary);
          color: white;
          box-shadow: 0 4px 15px rgba(99,102,241,0.3);
          position: relative;
          overflow: hidden;
        }
        .analyze-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .analyze-btn:hover::before { transform: translateX(100%); }
        .analyze-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(99,102,241,0.4);
        }
        .analyze-btn:active {
          transform: translateY(-1px);
        }
        .analyze-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }
        .analyze-btn .spinner-modern {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .analyze-status {
          margin-top: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-radius: 14px;
          background: rgba(99,102,241,0.05);
          border: 1px solid rgba(99,102,241,0.1);
          animation: fadeInUp 0.3s ease;
        }
        .dark .analyze-status {
          background: rgba(129,140,248,0.05);
          border-color: rgba(129,140,248,0.1);
        }
        .analyze-status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #6366f1;
          animation: pulse 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        .analyze-status-text {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin: 0;
        }
        .analyze-status-steps {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }
        .analyze-status-step {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .analyze-status-step.active { color: var(--text-primary); font-weight: 500; }
        .analyze-status-step.done { color: #10b981; }
        .analyze-status-step svg { width: 16px; height: 16px; flex-shrink: 0; }

        .analysis-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 24px;
        }
        @media (max-width: 768px) {
          .analysis-grid { grid-template-columns: 1fr; }
        }
        .analysis-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .analysis-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: linear-gradient(135deg, transparent, rgba(99,102,241,0.1), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .analysis-card:hover::before { opacity: 1; }
        .analysis-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .analysis-card-full { grid-column: 1 / -1; }
        .analysis-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .analysis-card-header svg {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
        }
        .analysis-card-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .ats-score-wrap {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .ats-circle {
          position: relative;
          width: 100px;
          height: 100px;
          flex-shrink: 0;
        }
        .ats-circle svg {
          width: 100px;
          height: 100px;
          transform: rotate(-90deg);
        }
        .ats-circle-bg {
          fill: none;
          stroke: var(--bg-tertiary);
          stroke-width: 8;
        }
        .ats-circle-fill {
          fill: none;
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ats-circle-label {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .ats-circle-score {
          font-size: 1.6rem;
          font-weight: 800;
          line-height: 1;
        }
        .ats-circle-sub {
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        .ats-breakdown {
          flex: 1;
          display: grid;
          gap: 10px;
        }
        .ats-bar {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ats-bar-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          width: 80px;
          flex-shrink: 0;
          text-transform: capitalize;
        }
        .ats-bar-track {
          flex: 1;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }
        .ats-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ats-bar-value {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          width: 28px;
          text-align: right;
        }
        .summary-text {
          font-size: 0.9rem;
          line-height: 1.7;
          color: var(--text-secondary);
          margin: 0;
        }
        .skill-tag-modern {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          background: rgba(99,102,241,0.08);
          color: #6366f1;
          border: 1px solid rgba(99,102,241,0.15);
          transition: all 0.3s ease;
          margin: 0 6px 8px 0;
        }
        .skill-tag-modern:hover {
          background: rgba(99,102,241,0.15);
          transform: translateY(-1px);
        }
        .dark .skill-tag-modern {
          background: rgba(129,140,248,0.1);
          color: #818cf8;
          border-color: rgba(129,140,248,0.2);
        }
        .skill-tag-role {
          background: rgba(16,185,129,0.1);
          color: #10b981;
          border-color: rgba(16,185,129,0.2);
        }
        .dark .skill-tag-role {
          background: rgba(52,211,153,0.1);
          color: #34d399;
          border-color: rgba(52,211,153,0.2);
        }
        .skill-tag-missing {
          background: rgba(239,68,68,0.08);
          color: #ef4444;
          border-color: rgba(239,68,68,0.15);
        }
        .dark .skill-tag-missing {
          background: rgba(248,113,113,0.1);
          color: #f87171;
          border-color: rgba(248,113,113,0.2);
        }
        .analysis-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .analysis-list-item {
          display: flex;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--card-border);
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .analysis-list-item:last-child { border-bottom: none; }
        .analysis-list-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .analysis-list-icon.green { color: #10b981; }
        .analysis-list-icon.amber { color: #f59e0b; }
        .analysis-list-icon.red { color: #ef4444; }
        .analysis-list-icon.purple { color: #8b5cf6; }

        .filter-bar {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .filter-select {
          padding: 10px 16px;
          border-radius: 10px;
          border: 1px solid var(--input-border);
          background: var(--card-bg);
          color: var(--text-primary);
          font-size: 0.9rem;
          cursor: pointer;
          outline: none;
          min-width: 140px;
          transition: border-color 0.3s ease;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }
        .filter-select:focus {
          border-color: var(--input-focus-border);
        }
        .filter-clear {
          padding: 10px 18px;
          border-radius: 10px;
          border: 1px solid var(--card-border);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        .filter-clear:hover {
          border-color: var(--input-focus-border);
          color: var(--text-primary);
        }
        .job-card-new {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 16px;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          gap: 20px;
        }
        .job-card-new:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(99,102,241,0.3);
        }
        .job-logo {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          flex-shrink: 0;
          background: var(--bg-tertiary);
          border: 1px solid var(--card-border);
        }
        .job-body { flex: 1; min-width: 0; }
        .job-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;
        }
        .job-title-new {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .job-company-new {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .job-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .badge-type {
          background: rgba(99,102,241,0.08);
          color: #6366f1;
        }
        .badge-remote {
          background: rgba(16,185,129,0.08);
          color: #10b981;
        }
        .badge-onsite {
          background: rgba(239,68,68,0.08);
          color: #ef4444;
        }
        .badge-hybrid {
          background: rgba(245,158,11,0.08);
          color: #f59e0b;
        }
        .dark .badge-type { background: rgba(129,140,248,0.12); color: #818cf8; }
        .dark .badge-remote { background: rgba(52,211,153,0.1); color: #34d399; }
        .dark .badge-onsite { background: rgba(248,113,113,0.1); color: #f87171; }
        .dark .badge-hybrid { background: rgba(251,191,36,0.1); color: #fbbf24; }
        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin: 10px 0;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .job-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .job-meta span svg {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
        }
        .job-desc-preview {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 8px 0 12px;
        }
        .job-skills-new {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 10px 0;
        }
        .skill-tag-new {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 500;
          background: rgba(99,102,241,0.08);
          color: #6366f1;
        }
        .dark .skill-tag-new {
          background: rgba(129,140,248,0.12);
          color: #818cf8;
        }
        .job-card-actions {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--card-border);
        }
        .job-salary {
          font-size: 1.05rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .job-experience-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(245,158,11,0.08);
          color: #f59e0b;
        }
        .dark .job-experience-badge {
          background: rgba(251,191,36,0.1);
          color: #fbbf24;
        }
        .job-posted-date {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .save-btn-new {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--card-border);
          background: var(--bg-tertiary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .save-btn-new:hover {
          border-color: rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.05);
          transform: scale(1.1);
        }
        .save-btn-new.saved {
          border-color: rgba(239,68,68,0.3);
          background: rgba(239,68,68,0.1);
        }
        .jobs-count {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .form-error {
          font-size: 0.8rem;
          color: #ef4444;
          margin-top: -14px;
          margin-bottom: 12px;
          padding-left: 4px;
        }
        .input-field.input-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }

        .chat-container-glass {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.3);
        }
        .dark .chat-container-glass {
          background: rgba(15,15,25,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .chat-msg {
          max-width: 85%;
          animation: slideInMsg 0.3s ease;
        }
        @keyframes slideInMsg {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-msg-user {
          align-self: flex-end;
        }
        .chat-msg-bot {
          align-self: flex-start;
        }
        .chat-bubble {
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 0.9rem;
          line-height: 1.5;
          word-wrap: break-word;
        }
        .chat-bubble p { margin: 0 0 6px; }
        .chat-bubble p:last-child { margin-bottom: 0; }
        .chat-bubble code {
          background: rgba(0,0,0,0.06);
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-family: 'SF Mono', Consolas, monospace;
        }
        .dark .chat-bubble code { background: rgba(255,255,255,0.1); }
        .chat-bubble strong { font-weight: 700; }
        .chat-bubble ul { margin: 4px 0; padding-left: 18px; }
        .chat-bubble li { margin-bottom: 3px; }
        .chat-ts {
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-top: 2px;
          padding: 0 4px;
        }
        .chat-ts-right { text-align: right; }
        .typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--text-muted);
          animation: typingBounce 1.4s ease-in-out infinite;
        }
        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes avatarGlow {
          0%, 100% { box-shadow: 0 0 8px rgba(99,102,241,0.3); }
          50% { box-shadow: 0 0 20px rgba(99,102,241,0.6), 0 0 40px rgba(99,102,241,0.2); }
        }
        .avatar-glow {
          animation: avatarGlow 2s ease-in-out infinite;
        }
        .suggestions-wrap {
          padding: 8px 14px 6px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          border-top: 1px solid var(--card-border);
        }
        .suggestion-chip {
          padding: 6px 14px;
          border-radius: 16px;
          border: 1px solid var(--card-border);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          font-size: 0.78rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .suggestion-chip:hover {
          border-color: var(--input-focus-border);
          color: var(--text-primary);
          background: var(--card-bg);
          transform: translateY(-1px);
        }
        #chat-messages::-webkit-scrollbar {
          width: 4px;
        }
        #chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }
        #chat-messages::-webkit-scrollbar-thumb {
          background: var(--text-muted);
          border-radius: 4px;
        }
        .fab-button::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: transparent;
          border: 2px solid rgba(99,102,241,0.25);
          animation: fabPulse 2s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes fabPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0; }
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .status-badge.applied { background: rgba(99,102,241,0.1); color: #6366f1; }
        .status-badge.reviewing { background: rgba(245,158,11,0.1); color: #f59e0b; }
        .status-badge.interviewing { background: rgba(16,185,129,0.1); color: #10b981; }
        .status-badge.accepted { background: rgba(52,211,153,0.1); color: #34d399; }
        .status-badge.rejected { background: rgba(239,68,68,0.1); color: #ef4444; }

        .recruiter-form input, .recruiter-form textarea, .recruiter-form select {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }
        .recruiter-form input:focus, .recruiter-form textarea:focus, .recruiter-form select:focus {
          border-color: var(--input-focus-border);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .recruiter-form label {
          display: block;
          margin-bottom: 6px;
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .recruiter-form select {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }
        .dark .recruiter-form select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
        }
        .recruiter-form textarea::placeholder, .recruiter-form input::placeholder {
          color: var(--text-muted);
          opacity: 0.7;
        }

        .applicants-table {
          width: 100%;
          border-collapse: collapse;
        }
        .applicants-table th {
          text-align: left;
          padding: 12px 16px;
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--card-border);
        }
        .applicants-table td {
          padding: 14px 16px;
          color: var(--text-primary);
          font-size: 0.9rem;
          border-bottom: 1px solid var(--card-border);
        }
        .applicants-table tr:hover td {
          background: var(--bg-tertiary);
        }

        .empty-state {
          text-align: center;
          padding: 60px 24px;
          color: var(--text-muted);
        }
        .empty-state svg {
          margin-bottom: 16px;
          opacity: 0.4;
        }
        .empty-state h3 {
          color: var(--text-secondary);
          margin: 0 0 8px;
          font-size: 1.2rem;
        }
        .empty-state p {
          margin: 0;
          font-size: 0.9rem;
        }

        .job-card-recruiter {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        .job-card-recruiter:hover {
          border-color: rgba(99,102,241,0.2);
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .dark .job-card-recruiter:hover {
          box-shadow: 0 4px 20px rgba(99,102,241,0.08);
        }

        .ats-gauge {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          position: relative;
          flex-shrink: 0;
        }
        .ats-gauge svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .ats-gauge circle {
          fill: none;
          stroke-width: 3;
          cx: 24;
          cy: 24;
          r: 20;
        }
        .ats-gauge .bg { stroke: var(--bg-tertiary); }
        .ats-gauge .fill { stroke-linecap: round; transition: stroke-dashoffset 0.8s ease; }

        .applicant-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .applicant-card:hover {
          border-color: rgba(99,102,241,0.25);
          box-shadow: 0 8px 30px rgba(99,102,241,0.08);
          transform: translateY(-2px);
        }
        .applicant-card .action-btn {
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--card-border);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 500;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }
        .applicant-card .action-btn:hover {
          border-color: #6366f1;
          color: #6366f1;
          background: rgba(99,102,241,0.05);
        }
        .applicant-card .action-btn.danger:hover {
          border-color: #ef4444;
          color: #ef4444;
          background: rgba(239,68,68,0.05);
        }
        .applicant-card .action-btn.success:hover {
          border-color: #10b981;
          color: #10b981;
          background: rgba(16,185,129,0.05);
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
                <div className="nav-user-info">
                  <div className="nav-user-avatar">{user?.name?.charAt(0) || "U"}</div>
                  <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{user?.name || "User"}</span>
                </div>
                <button className="btn-nav btn-nav-primary" onClick={() => { setView(user?.role === "recruiter" ? "recruiter-dashboard" : "dashboard"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Dashboard</button>
                <button className="btn-nav btn-nav-logout" onClick={logout}>Log Out</button>
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
              </>
            )}
          </div>
        </div>
      </nav>

      {view === "landing" && (
        <>
          <div className="hero-container">
            <div className="hero-bg"></div>
            <div className="hero-grid"></div>
            <div className="hero-content">
              <div className="hero-inner">
                <div>
                  <div className="hero-badge">
                    <span className="hero-badge-dot"></span>
                    Now with AI-powered matching
                  </div>
                  <h1 className="hero-title">
                    Find Your <span>Dream Job</span> with AI
                  </h1>
                  <p className="hero-subtitle">
                    Hire Me AI revolutionizes job searching and recruitment with cutting-edge AI technology. Match with the perfect role or candidate in seconds, not weeks.
                  </p>
                  <div className="hero-buttons">
                    <button className="btn-cta btn-cta-primary" onClick={() => { if (token) { setView(user?.role === "recruiter" ? "recruiter-dashboard" : "dashboard"); window.scrollTo({ top: 0, behavior: "smooth" }); } else scrollToSection("auth"); }}>
                      {token ? "Go to Dashboard" : "Get Started Free"}
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </button>
                    <button className="btn-cta btn-cta-secondary" onClick={() => scrollToSection("features")}>
                      Learn More
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 9l-7 7-7-7"/></svg>
                    </button>
                  </div>
                </div>
                <div className="hero-illustration">
                  <svg viewBox="0 0 500 500" fill="none">
                    <circle cx="250" cy="250" r="200" fill="rgba(255,255,255,0.05)" className="float-1"/>
                    <circle cx="250" cy="250" r="150" fill="rgba(255,255,255,0.05)" className="float-2"/>
                    <rect x="150" y="150" width="200" height="200" rx="24" fill="rgba(255,255,255,0.1)" className="float-3"/>
                    <rect x="175" y="175" width="150" height="40" rx="8" fill="rgba(255,255,255,0.2)" className="float-4"/>
                    <rect x="175" y="230" width="120" height="12" rx="6" fill="rgba(255,255,255,0.3)" className="float-1"/>
                    <rect x="175" y="255" width="100" height="12" rx="6" fill="rgba(255,255,255,0.3)" className="float-2"/>
                    <rect x="175" y="280" width="130" height="12" rx="6" fill="rgba(255,255,255,0.3)" className="float-3"/>
                    <circle cx="320" cy="190" r="20" fill="#c084fc" opacity="0.8" className="float-4"/>
                    <circle cx="180" cy="320" r="15" fill="#60a5fa" opacity="0.8" className="float-1"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <section className="section" id="features">
            <div className="section-inner">
              <div className="section-header" data-animate>
                <span className="section-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Features
                </span>
                <h2 className="section-title">Everything You Need to Succeed</h2>
                <p className="section-subtitle">Powerful tools designed to streamline your job search and recruitment process with AI-driven insights.</p>
              </div>
              <div className="feature-grid">
                {[
                  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>, bg: "rgba(99,102,241,0.1)", title: "Smart Job Matching", desc: "Our AI analyzes your skills and preferences to match you with the perfect job opportunities automatically." },
                  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>, bg: "rgba(139,92,246,0.1)", title: "AI Resume Analysis", desc: "Get instant feedback on your resume with actionable insights to improve your chances of landing interviews." },
                  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>, bg: "rgba(59,130,246,0.1)", title: "Talent Discovery", desc: "Recruiters can find the perfect candidates using our advanced AI-powered search and filtering system." },
                ].map((feature, i) => (
                  <div className="feature-card" data-animate={`delay-${i+1}`} key={i}>
                    <div className="feature-icon" style={{ background: feature.bg }}>{feature.icon}</div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-desc">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="stats-section">
            <div className="section-inner">
              <div className="stats-grid" ref={statsRef}>
                {[
                  { value: counters.jobs, label: "Active Jobs" },
                  { value: counters.users, label: "Happy Users" },
                  { value: counters.matches, label: "Successful Matches" },
                  { value: counters.satisfaction, label: "Satisfaction Rate" },
                ].map((stat, i) => (
                  <div className="stat-item" data-animate={`delay-${i+1}`} key={i}>
                    <div className="stat-number">{stat.label === "Satisfaction Rate" ? `${stat.value}%` : formatNumber(stat.value)}</div>
                    <p className="stat-label">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-inner">
              <div className="section-header" data-animate>
                <span className="section-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  Featured
                </span>
                <h2 className="section-title">Popular Job Opportunities</h2>
                <p className="section-subtitle">Discover hand-picked job opportunities that match your skills and career aspirations.</p>
              </div>
              <div className="job-preview-grid">
                {sampleJobs.map((job, i) => (
                  <div className="job-preview-card" data-animate={`delay-${i+1}`} key={i}>
                    <div className="job-preview-header">
                      <div>
                        <h3 className="job-preview-title">{job.title}</h3>
                        <p className="job-preview-company">{job.company}</p>
                      </div>
                      <span className="job-preview-badge">{job.type}</span>
                    </div>
                    <div className="job-preview-meta">
                      <span>{mapPinIcon} {job.location}</span>
                      <span>{moneyIcon} {job.salary}</span>
                    </div>
                    <div className="job-skills">
                      {job.skills.map((skill) => <span className="job-skill" key={skill}>{skill}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-inner">
              <div className="section-header" data-animate>
                <span className="section-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  Testimonials
                </span>
                <h2 className="section-title">What Our Users Say</h2>
                <p className="section-subtitle">Don't just take our word for it. Here's what our community has to say about Hire Me AI.</p>
              </div>
              <div className="testimonial-grid">
                {testimonials.map((t, i) => (
                  <div className="testimonial-card" data-animate={`delay-${i+1}`} key={i}>
                    <div className="testimonial-stars">
                      {[...Array(t.rating)].map((_, j) => <svg viewBox="0 0 24 24" key={j}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                    </div>
                    <p className="testimonial-text">"{t.text}"</p>
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
          </section>

          <section className="section" id="career-accelerator">
            <div className="section-inner">
              <div className="section-header" data-animate>
                <span className="section-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  Courses
                </span>
                <h2 className="section-title">Career Accelerator</h2>
                <p className="section-subtitle">Beginner-friendly courses designed to take you from zero to job-ready. Start learning today.</p>
              </div>
              <div data-animate="delay-1">
                <CareerAccelerator compact />
              </div>
            </div>
          </section>

          <section className="section" id="career-roadmap" style={{ background: "var(--bg-secondary)" }}>
            <div className="section-inner">
              <div className="section-header" data-animate>
                <span className="section-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                  Roadmap
                </span>
                <h2 className="section-title">AI Career Roadmap</h2>
                <p className="section-subtitle">Choose your path and follow a step-by-step roadmap with skills, projects, and resources tailored to your dream role.</p>
              </div>
              <div data-animate="delay-1">
                <CareerRoadmap compact />
              </div>
            </div>
          </section>

          <section className="ai-demo-section">
            <div className="section-inner">
              <div className="ai-demo-inner">
                <div className="ai-demo-content" data-animate>
                  <span className="section-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                    AI Powered
                  </span>
                  <h3>AI Resume Analyzer</h3>
                  <p>Our advanced AI analyzes your resume against job requirements, providing detailed insights on strengths, weaknesses, and improvement suggestions.</p>
                  <ul className="ai-demo-features">
                    {[
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, text: "Score your resume from 0-100" },
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>, text: "Identify key strengths & weaknesses" },
                      { icon: <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>, text: "Get actionable suggestions" },
                    ].map((item, i) => <li key={i}>{item.icon} {item.text}</li>)}
                  </ul>
                  <button className="btn-cta btn-cta-primary" onClick={() => { if (token) { setView(user?.role === "recruiter" ? "recruiter-dashboard" : "dashboard"); if (user?.role !== "recruiter") setDashboardTab("ai-analyzer"); window.scrollTo({ top: 0, behavior: "smooth" }); } else scrollToSection("auth"); }}>
                    Try AI Analyzer
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
                <div className="ai-demo-preview" data-animate="delay-2">
                  <div className="ai-result-item">
                    <div className="ai-result-icon" style={{ background: "rgba(99,102,241,0.1)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p className="ai-result-label">Resume Score</p>
                      <div className="ai-score-bar">
                        <div className="ai-score-fill" style={{ width: "85%", background: "var(--gradient-primary)" }}></div>
                      </div>
                    </div>
                    <span className="ai-result-value" style={{ fontWeight: 700, color: "#6366f1" }}>85/100</span>
                  </div>
                  <div className="ai-result-item">
                    <div className="ai-result-icon" style={{ background: "rgba(16,185,129,0.1)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <p className="ai-result-label">Strengths</p>
                      <p className="ai-result-value">Strong technical skills, clear formatting</p>
                    </div>
                  </div>
                  <div className="ai-result-item">
                    <div className="ai-result-icon" style={{ background: "rgba(245,158,11,0.1)" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                    </div>
                    <div>
                      <p className="ai-result-label">Improvements</p>
                      <p className="ai-result-value">Add more metrics, expand project details</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="auth-section" id="auth">
            <div className="section-inner">
              <div className="section-header" data-animate>
                <span className="section-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
                  Get Started
                </span>
                <h2 className="section-title">Join Hire Me AI Today</h2>
                <p className="section-subtitle">Create your free account and unlock the power of AI-driven job matching.</p>
              </div>
              <div className="auth-card" data-animate>
                <div className="auth-header">
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px" }}>
                    {showRegister ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p style={{ color: "var(--text-secondary)", margin: "0 0 8px" }}>
                    {showRegister ? "Sign up to get started" : "Sign in to your account"}
                  </p>
                </div>
                <div className="auth-tabs">
                  <button className={`auth-tab ${!showRegister ? "active" : ""}`} onClick={() => { setShowRegister(false); setError(""); }}>Login</button>
                  <button className={`auth-tab ${showRegister ? "active" : ""}`} onClick={() => { setShowRegister(true); setError(""); }}>Register</button>
                </div>
                {error && <div className="error-alert" style={{ margin: "16px 32px 0" }}>{error}</div>}
                <div className="auth-body">
                  <div className="social-login">
                    <button className="btn-social" onClick={() => handleSocialLogin(googleProvider, "google")} disabled={oauthLoading === "google"}>
                      <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      {oauthLoading === "google" ? "Loading..." : "Google"}
                    </button>
                    <button className="btn-social" onClick={() => handleSocialLogin(githubProvider, "github")} disabled={oauthLoading === "github"}>
                      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      {oauthLoading === "github" ? "Loading..." : "GitHub"}
                    </button>
                  </div>
                  <div className="divider">or continue with email</div>
                  <form onSubmit={showRegister ? handleRegister : handleLogin}>
                    {showRegister && (
                      <>
                        <div className="input-group">
                          <div className="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div>
                          <input type="text" className="input-field" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        {showRegister && (
                          <div className="input-group">
                            <div className="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div>
                            <select className="input-field select-field" value={role} onChange={(e) => setRole(e.target.value)}>
                              <option value="jobseeker">Job Seeker</option>
                              <option value="recruiter">Recruiter</option>
                            </select>
                          </div>
                        )}
                      </>
                    )}
                    <div className="input-group">
                      <div className="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div>
                      <input type="email" className="input-field" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                      <div className="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></div>
                      <input type={showPassword ? "text" : "password"} className="input-field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m3.878-3.878L21 3m-3.878 3.878l-1.06 1.06"/></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading ? "Please wait..." : showRegister ? "Create Account" : "Sign In"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          <footer className="footer">
            <div className="footer-inner">
              <div className="footer-grid">
                <div>
                  <div className="footer-brand">
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 32, height: 32 }}>
                      <rect width="24" height="24" rx="6" fill="url(#footerGrad)"/><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" opacity="0.5"/>
                      <defs><linearGradient id="footerGrad" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs>
                    </svg>
                    Hire Me AI
                  </div>
                  <p className="footer-desc">Revolutionizing job searching and recruitment with AI-powered matching and insights.</p>
                </div>
                <div>
                  <h4 className="footer-heading">Product</h4>
                  <ul className="footer-links">
                    <li><a href="#">Features</a></li>
                    <li><a href="#">Pricing</a></li>
                    <li><a href="#">AI Analyzer</a></li>
                    <li><a href="#">Career Tips</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="footer-heading">Company</h4>
                  <ul className="footer-links">
                    <li><a href="#">About Us</a></li>
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
                <div className="footer-socials">
                  <div className="footer-social"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></div>
                  <div className="footer-social"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></div>
                  <div className="footer-social"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></div>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}

      {view === "dashboard" && (
        <div className="dashboard-wrapper">
          <div className="section-inner">
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 8px" }}>Dashboard</h1>
            <p style={{ color: "var(--text-secondary)", margin: "0 0 32px" }}>Welcome back, {user?.name || "User"}!</p>

            <div className="dashboard-tabs">
              {["jobs", "my-applications", "saved-jobs", "ai-analyzer", "skill-authenticity", "cognitive-intelligence", "career-accelerator", "career-roadmap"].map((tab) => (
                <button
                  key={tab}
                  className={`dashboard-tab ${dashboardTab === tab ? "active" : ""}`}
                  onClick={() => setDashboardTab(tab)}
                >
                  {tab === "career-accelerator" ? "🚀 Career Accelerator" : tab === "career-roadmap" ? "🗺️ Career Roadmap" : tab === "skill-authenticity" ? "🛡️ Skill Authenticity" : tab === "cognitive-intelligence" ? "🧠 Cognitive IQ" : tab.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </button>
              ))}
            </div>

            {dashboardTab === "jobs" && (
              <div>
                <div className="dashboard-search">
                  <div className="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></div>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Search jobs by title, company, skills..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>

                <div className="filter-bar">
                  <select className="filter-select" value={filters.type} onChange={(e) => handleFilterChange("type", e.target.value)}>
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                  <select className="filter-select" value={filters.experience} onChange={(e) => handleFilterChange("experience", e.target.value)}>
                    <option value="">All Levels</option>
                    <option value="Entry">Entry Level</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="2-5 years">2-5 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="3-6 years">3-6 years</option>
                    <option value="4-7 years">4-7 years</option>
                    <option value="3+ years">3+ years</option>
                    <option value="4+ years">4+ years</option>
                    <option value="5+ years">5+ years</option>
                    <option value="8+ years">8+ years</option>
                  </select>
                  <select className="filter-select" value={filters.remote} onChange={(e) => handleFilterChange("remote", e.target.value)}>
                    <option value="">All Locations</option>
                    <option value="true">Remote Only</option>
                    <option value="false">On-site Only</option>
                  </select>
                  {(filters.type || filters.experience || filters.remote) && (
                    <button className="filter-clear" onClick={() => {
                      setFilters({ type: "", experience: "", remote: "" });
                      fetchJobs(searchTerm, { type: "", experience: "", remote: "" });
                    }}>Clear Filters</button>
                  )}
                </div>

                {!jobsLoading && <div className="jobs-count">Showing {jobs.length} job{jobs.length !== 1 ? "s" : ""}</div>}

                {jobsLoading ? (
                  <div>
                    {[1,2,3].map((i) => (
                      <div className="skeleton skeleton-card" key={i}>
                        <div className="skeleton skeleton-line" style={{ margin: 16, width: "60%" }}></div>
                        <div className="skeleton skeleton-line" style={{ margin: 16, width: "40%" }}></div>
                        <div className="skeleton skeleton-line" style={{ margin: 16, width: "80%" }}></div>
                      </div>
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="empty-state">
                    {briefcaseIcon}
                    <h3>No jobs found</h3>
                    <p>Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div>
                    {jobs.map((job) => {
                      const formatSalary = (s) => {
                        if (!s || s === "Not specified") return null;
                        const parts = s.split("-");
                        if (parts.length === 2) {
                          return `$${Number(parts[0]).toLocaleString()} - $${Number(parts[1]).toLocaleString()}`;
                        }
                        return `$${Number(s).toLocaleString()}`;
                      };
                      const jobId = job.id || job._id;
                      const isSaved = savedJobs.includes(jobId);
                      const isApplied = appliedJobs.includes(jobId);
                      const isRemote = job.remote;
                      const loc = job.location || "Remote";
                      const isHybrid = loc.toLowerCase().includes("hybrid");
                      const daysAgo = Math.floor((Date.now() - new Date(job.postedDate).getTime()) / 86400000);
                      const postedStr = daysAgo === 0 ? "Today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;
                      return (
                        <div className="job-card-new" key={jobId}>
                          <div className="job-logo">{job.companyLogo || "🏢"}</div>
                          <div className="job-body">
                            <div className="job-title-row">
                              <div>
                                <h3 className="job-title-new">{job.title}</h3>
                                <p className="job-company-new">{job.company}</p>
                              </div>
                              <button className={`save-btn-new ${isSaved ? "saved" : ""}`} onClick={() => toggleSaveJob(jobId)} title={isSaved ? "Unsave" : "Save"}>
                                {isSaved ? "❤️" : "🤍"}
                              </button>
                            </div>
                            <div className="job-badges">
                              <span className="badge badge-type">{job.type || "Full-time"}</span>
                              {isRemote ? (
                                <span className="badge badge-remote">🌍 Remote</span>
                              ) : isHybrid ? (
                                <span className="badge badge-hybrid">🏢 Hybrid</span>
                              ) : (
                                <span className="badge badge-onsite">📍 On-site</span>
                              )}
                              {job.experience && <span className="job-experience-badge">⭐ {job.experience}</span>}
                            </div>
                            <div className="job-meta">
                              <span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                                {loc}
                              </span>
                              <span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><circle cx="12" cy="12" r="5"/></svg>
                                {formatSalary(job.salary) || "Not specified"}
                              </span>
                              <span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                {postedStr}
                              </span>
                            </div>
                            <p className="job-desc-preview">{job.description?.substring(0, 200) || "No description"}{job.description?.length > 200 ? "..." : ""}</p>
                            {job.skillsRequired?.length > 0 && (
                              <div className="job-skills-new">
                                {job.skillsRequired.slice(0, 6).map((skill) => <span className="skill-tag-new" key={skill}>{skill}</span>)}
                                {job.skillsRequired.length > 6 && <span className="skill-tag-new">+{job.skillsRequired.length - 6} more</span>}
                              </div>
                            )}
                            <div className="job-card-actions">
                              {isApplied ? (
                                <span className="status-applied">✓ Applied</span>
                              ) : (
                                <button className="btn-apply" onClick={() => openApplyModal(job)}>
                                  Apply Now
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {dashboardTab === "my-applications" && (
              <div>
                {applicationsLoading ? (
                  <p style={{ color: "var(--text-secondary)" }}>Loading applications...</p>
                ) : myApplications.length === 0 ? (
                  <div className="empty-state">
                    <h3>No applications yet</h3>
                    <p>You haven't applied to any jobs yet</p>
                  </div>
                ) : (
                  <div>
                    {myApplications.map((app) => {
                      const job = app.jobId || {};
                      const daysAgo = Math.floor((Date.now() - new Date(app.createdAt).getTime()) / 86400000);
                      const appliedStr = daysAgo === 0 ? "Today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;
                      return (
                        <div className="job-card-new" key={app.id || app._id}>
                          <div className="job-logo">{job.companyLogo || "🏢"}</div>
                          <div className="job-body">
                            <div className="job-title-row">
                              <div>
                                <h3 className="job-title-new">{job.title || "Job"}</h3>
                                <p className="job-company-new">{job.company || "Company"}</p>
                              </div>
                              <span className={`status-${(app.status || "applied").toLowerCase()}`} style={{ textTransform: "capitalize", padding: "6px 14px", borderRadius: "10px", fontSize: "0.8rem" }}>
                                {app.status || "Applied"}
                              </span>
                            </div>
                            <div className="job-badges">
                              {job.type && <span className="badge badge-type">{job.type}</span>}
                              {job.remote === true ? (
                                <span className="badge badge-remote">🌍 Remote</span>
                              ) : job.remote === false ? (
                                <span className="badge badge-onsite">📍 On-site</span>
                              ) : null}
                            </div>
                            <div className="job-meta">
                              {job.location && <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>{job.location}</span>}
                              {job.salary && <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><circle cx="12" cy="12" r="5"/></svg>{app.jobId?.salary ? `$${Number(app.jobId.salary.split("-")[0]).toLocaleString()}${app.jobId.salary.includes("-") ? ` - $${Number(app.jobId.salary.split("-")[1]).toLocaleString()}` : ""}` : "Not specified"}</span>}
                              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Applied {appliedStr}</span>
                            </div>
                            {app.coverLetter && (
                              <p className="job-desc-preview" style={{ fontSize: "0.85rem", fontStyle: "italic" }}>"{app.coverLetter.substring(0, 150)}{app.coverLetter.length > 150 ? "..." : ""}"</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {dashboardTab === "saved-jobs" && (
              <div>
                {savedJobs.length === 0 ? (
                  <div className="empty-state">
                    <h3>No saved jobs</h3>
                    <p>Save jobs you're interested in to view them later</p>
                  </div>
                ) : (
                  <div>
                    {jobs.filter((job) => savedJobs.includes(job.id || job._id)).map((job) => (
                      <div className="job-card" key={job.id || job._id}>
                        <h3 className="job-card-title">{briefcaseIcon} {job.title}</h3>
                        <p className="job-card-company">{job.company}</p>
                        <div style={{ display: "flex", gap: "16px", margin: "12px 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                          <span>{mapPinIcon} {job.location || "Remote"}</span>
                          <span>{moneyIcon} {job.salary ? `$${Number(job.salary).toLocaleString()}` : "Not specified"}</span>
                        </div>
                        <button className="save-btn" onClick={() => toggleSaveJob(job.id || job._id)}>❤️</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {dashboardTab === "ai-analyzer" && (
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <div
                    className={`upload-zone ${dragOver ? "dragover" : ""} ${selectedFile ? "has-file" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleFileSelect(file);
                    }}
                    onClick={() => !selectedFile && document.getElementById("resume-upload").click()}
                  >
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files[0]) handleFileSelect(e.target.files[0]);
                      }}
                    />

                    {!selectedFile ? (
                      <>
                        <div className="upload-icon-wrap">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <p className="upload-text">Drop your resume here</p>
                        <p className="upload-subtext">or click to browse files</p>
                        <div className="upload-formats">
                          <span className="format-badge">PDF</span>
                          <span className="format-badge">DOC</span>
                          <span className="format-badge">DOCX</span>
                          <span className="format-badge">TXT</span>
                        </div>
                      </>
                    ) : (
                      <div className="file-preview">
                        <div className={`file-preview-icon ${selectedFile.name.toLowerCase().endsWith('.pdf') ? 'pdf' : selectedFile.name.toLowerCase().endsWith('.doc') ? 'doc' : selectedFile.name.toLowerCase().endsWith('.docx') ? 'doc' : 'txt'}`}>
                          {selectedFile.name.toLowerCase().endsWith('.pdf') ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                          ) : selectedFile.name.toLowerCase().endsWith('.docx') || selectedFile.name.toLowerCase().endsWith('.doc') ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                          )}
                        </div>
                        <div className="file-preview-info" onClick={(e) => e.stopPropagation()}>
                          <p className="file-preview-name">{selectedFile.name}</p>
                          <p className="file-preview-size">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          className="file-preview-remove"
                          onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                          title="Remove file"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="upload-divider">or paste your resume text</div>

                <textarea
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    setSelectedFile(null);
                  }}
                  placeholder="Copy and paste your resume content here for AI analysis..."
                  style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-primary)", marginBottom: "24px", minHeight: "180px", fontSize: "0.95rem", outline: "none", resize: "vertical", transition: "border-color 0.3s ease" }}
                  onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                  onBlur={(e) => e.target.style.borderColor = "var(--input-border)"}
                />

                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <button
                    onClick={analyzeResume}
                    disabled={analyzing || (!resumeText.trim() && !selectedFile)}
                    className="analyze-btn"
                  >
                    {analyzing ? (
                      <><span className="spinner-modern"></span>Analyzing...</>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                        Analyze with AI
                      </>
                    )}
                  </button>
                  {selectedFile && !analyzing && (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      {selectedFile.name.toLowerCase().endsWith('.pdf') ? 'PDF ready' : selectedFile.name.toLowerCase().endsWith('.docx') ? 'DOCX ready' : selectedFile.name.toLowerCase().endsWith('.doc') ? 'DOC ready' : 'TXT ready'} for analysis
                    </span>
                  )}
                </div>

                {analyzing && (
                  <div className="analyze-status">
                    <div className="analyze-status-dot"></div>
                    <div>
                      <p className="analyze-status-text" style={{ fontWeight: 500, marginBottom: 8 }}>AI Analysis in Progress</p>
                      <div className="analyze-status-steps">
                        <div className="analyze-status-step active">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          Parsing resume content...
                        </div>
                        <div className="analyze-status-step">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          Analyzing with AI...
                        </div>
                        <div className="analyze-status-step">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          Generating insights...
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {analysisResult && (
                  <div style={{ marginTop: "24px" }}>
                    <div className="analysis-grid">
                      <div className="analysis-card analysis-card-full">
                        <div className="ats-score-wrap">
                          <div className="ats-circle">
                            <svg viewBox="0 0 36 36">
                              <path className="ats-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              <path className="ats-circle-fill"
                                stroke={analysisResult.score >= 80 ? "#10b981" : analysisResult.score >= 60 ? "#f59e0b" : "#ef4444"}
                                strokeDasharray={`${analysisResult.score || 0}, 100`}
                                strokeDashoffset="0"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <div className="ats-circle-label">
                              <span className="ats-circle-score" style={{ color: analysisResult.score >= 80 ? "#10b981" : analysisResult.score >= 60 ? "#f59e0b" : "#ef4444" }}>{analysisResult.score || "?"}</span>
                              <span className="ats-circle-sub">/ 100</span>
                            </div>
                          </div>
                          <div className="ats-breakdown">
                            {["formatting", "keywords", "experience", "education", "skills"].map((key) => {
                              const val = analysisResult.atsBreakdown?.[key] || 60;
                              return (
                                <div className="ats-bar" key={key}>
                                  <span className="ats-bar-label">{key}</span>
                                  <div className="ats-bar-track">
                                    <div className="ats-bar-fill" style={{
                                      width: `${val}%`,
                                      background: val >= 80 ? "#10b981" : val >= 60 ? "#f59e0b" : "#ef4444"
                                    }}></div>
                                  </div>
                                  <span className="ats-bar-value">{val}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: 4 }}>Status</div>
                            <span style={{
                              display: "inline-block",
                              padding: "6px 16px",
                              borderRadius: "10px",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              background: analysisResult.score >= 80 ? "rgba(16,185,129,0.1)" : analysisResult.score >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                              color: analysisResult.score >= 80 ? "#10b981" : analysisResult.score >= 60 ? "#f59e0b" : "#ef4444"
                            }}>
                              {analysisResult.score >= 80 ? "Excellent" : analysisResult.score >= 60 ? "Good" : "Needs Work"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {analysisResult.summary && (
                        <div className="analysis-card analysis-card-full">
                          <div className="analysis-card-header">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                            <h3 className="analysis-card-title">Resume Summary</h3>
                          </div>
                          <p className="summary-text">{analysisResult.summary}</p>
                        </div>
                      )}

                      {categorizedSkills && (
                        <div className="analysis-card analysis-card-full">
                          <SkillsDisplay skills={categorizedSkills} resumeText={resumeText} />
                        </div>
                      )}

                      {analysisResult.bestRoles?.length > 0 && (
                        <div className="analysis-card">
                          <div className="analysis-card-header">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            <h3 className="analysis-card-title">Best Matching Roles</h3>
                          </div>
                          <div>
                            {analysisResult.bestRoles.map((r, i) => <span className="skill-tag-modern skill-tag-role" key={i}>{r}</span>)}
                          </div>
                        </div>
                      )}

                      <div className="analysis-card">
                        <div className="analysis-card-header">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          <h3 className="analysis-card-title">Strengths</h3>
                        </div>
                        {analysisResult.strengths?.length > 0 ? (
                          <ul className="analysis-list">
                            {analysisResult.strengths.map((s, i) => (
                              <li className="analysis-list-item" key={i}>
                                <svg className="analysis-list-icon green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                {s}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No strengths identified</p>
                        )}
                      </div>

                      <div className="analysis-card">
                        <div className="analysis-card-header">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                          <h3 className="analysis-card-title">Recommendations</h3>
                        </div>
                        {analysisResult.suggestions?.length > 0 ? (
                          <ul className="analysis-list">
                            {analysisResult.suggestions.map((s, i) => (
                              <li className="analysis-list-item" key={i}>
                                <svg className="analysis-list-icon amber" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                                {s}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No suggestions available</p>
                        )}
                      </div>

                      {analysisResult.missingKeywords?.length > 0 && (
                        <div className="analysis-card">
                          <div className="analysis-card-header">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            <h3 className="analysis-card-title">Missing Skills</h3>
                          </div>
                          <div>
                            {analysisResult.missingKeywords.map((k, i) => <span className="skill-tag-modern skill-tag-missing" key={i}>{k}</span>)}
                          </div>
                        </div>
                      )}

                      <div className="analysis-card" style={{ marginTop: 20 }}>
                        <div className="analysis-card-header">
                          <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                          <h3 className="analysis-card-title">Compare with a Job</h3>
                        </div>
                        <div>
                          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 12 }}>
                            Enter skills required by a job to see how your resume matches up
                          </p>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                            {["React", "Node.js", "Python", "AWS", "Docker", "TypeScript", "MongoDB", "SQL"].map((s) => (
                              <button key={s} onClick={() => {
                                const current = jobSkillCompare ? jobSkillCompare.split(",").map(x => x.trim()) : [];
                                if (current.includes(s)) {
                                  setJobSkillCompare(current.filter(x => x !== s).join(", "));
                                } else {
                                  setJobSkillCompare([...current, s].join(", "));
                                }
                              }}
                                style={{
                                  padding: "4px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
                                  background: (jobSkillCompare || "").includes(s) ? "rgba(99,102,241,0.15)" : "var(--bg-tertiary)",
                                  color: (jobSkillCompare || "").includes(s) ? "#818cf8" : "var(--text-secondary)",
                                  border: `1px solid ${(jobSkillCompare || "").includes(s) ? "rgba(99,102,241,0.3)" : "var(--card-border)"}`,
                                  transition: "all 0.2s"
                                }}
                              >{s}</button>
                            ))}
                          </div>
                          <textarea
                            value={jobSkillCompare}
                            onChange={(e) => setJobSkillCompare(e.target.value)}
                            placeholder="Or type job skills separated by commas..."
                            style={{
                              width: "100%", padding: "10px", borderRadius: "8px", marginBottom: 12,
                              border: "1px solid var(--input-border)", background: "var(--input-bg)",
                              color: "var(--text-primary)", fontSize: "0.85rem", minHeight: "50px", resize: "vertical"
                            }}
                          />
                          {jobSkillCompare && jobSkillCompare.split(",").filter(s => s.trim()).length > 0 && (
                            <SkillGapAnalyzer
                              token={token}
                              jobSkills={jobSkillCompare.split(",").map(s => s.trim()).filter(Boolean)}
                              resumeText={resumeText || "Resume content available from file upload"}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {dashboardTab === "career-accelerator" && (
              <div>
                <CareerAccelerator />
              </div>
            )}
            {dashboardTab === "career-roadmap" && (
              <div>
                <CareerRoadmap />
              </div>
            )}
            {dashboardTab === "skill-authenticity" && (
              <div>
                <SkillAuthenticityEngine view="candidate" role="Frontend" skills={[]} candidateName={user?.name} />
              </div>
            )}
            {dashboardTab === "cognitive-intelligence" && (
              <div>
                <CognitiveIntelligenceSystem view="candidate" role="Frontend" candidateName={user?.name} />
              </div>
            )}
          </div>
        </div>
      )}

      {view === "recruiter-dashboard" && (
        <div className="dashboard-wrapper">
          <div className="section-inner" style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px", marginBottom: "8px" }}>
              <div>
                <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px" }}>Recruiter Dashboard</h1>
                <p style={{ color: "var(--text-secondary)", margin: "0" }}>Welcome back, {user?.name || "Recruiter"}!</p>
              </div>
            </div>

            <div className="dashboard-tabs" style={{ marginTop: "24px" }}>
              {["stats", "posted-jobs", "create-job", "applicants", "skill-authenticity", "cognitive-intelligence", "analytics", "messages"].map((tab) => (
                <button
                  key={tab}
                  className={`dashboard-tab ${recruiterTab === tab ? "active" : ""}`}
                  onClick={() => { setRecruiterTab(tab); if (tab === "applicants" && recruiterJobs.length > 0 && !selectedApplicantJob) { fetchJobApplicants(recruiterJobs[0]._id); } if (tab === "posted-jobs") fetchRecruiterJobs(); }}
                >
                  {tab === "stats" && "📊"} {tab === "posted-jobs" && "📋"} {tab === "create-job" && "➕"} {tab === "applicants" && "👥"} {tab === "skill-authenticity" && "🛡️"} {tab === "cognitive-intelligence" && "🧠"} {tab === "analytics" && "📈"} {tab === "messages" && "💬"}{" "}
                  {tab.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </button>
              ))}
            </div>

            {recruiterTab === "stats" && (
              <>
                <div className="recruiter-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
                  <div className="recruiter-stat-card glowing" style={{ borderTop: "3px solid #6366f1" }}>
                    <div className="recruiter-stat-icon" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                    </div>
                    <div className="recruiter-stat-value" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{recruiterStats.totalJobs}</div>
                    <div className="recruiter-stat-label">Total Jobs Posted</div>
                  </div>
                  <div className="recruiter-stat-card" style={{ borderTop: "3px solid #10b981" }}>
                    <div className="recruiter-stat-icon" style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/><path d="M9 14l2 2 4-4"/></svg>
                    </div>
                    <div className="recruiter-stat-value" style={{ background: "linear-gradient(135deg, #10b981, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{recruiterStats.activeJobs}</div>
                    <div className="recruiter-stat-label">Active Jobs</div>
                  </div>
                  <div className="recruiter-stat-card" style={{ borderTop: "3px solid #f59e0b" }}>
                    <div className="recruiter-stat-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                    </div>
                    <div className="recruiter-stat-value" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{recruiterStats.totalApplicants}</div>
                    <div className="recruiter-stat-label">Total Applicants</div>
                  </div>
                  <div className="recruiter-stat-card" style={{ borderTop: "3px solid #ec4899" }}>
                    <div className="recruiter-stat-icon" style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <div className="recruiter-stat-value" style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{recruiterStats.interviewsScheduled}</div>
                    <div className="recruiter-stat-label">Interviews Scheduled</div>
                  </div>
                </div>

                <div className="auth-card" style={{ padding: "28px" }}>
                  <h3 style={{ color: "var(--text-primary)", margin: "0 0 16px", fontSize: "1.1rem" }}>Quick Actions</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                    <button className="btn-nav btn-nav-primary" onClick={() => setRecruiterTab("create-job")} style={{ justifyContent: "center", padding: "14px" }}>
                      ➕ Post a New Job
                    </button>
                    <button className="btn-nav btn-nav-ghost" onClick={() => { setRecruiterTab("posted-jobs"); fetchRecruiterJobs(); }} style={{ justifyContent: "center", padding: "14px" }}>
                      📋 View My Jobs
                    </button>
                    <button className="btn-nav btn-nav-ghost" onClick={() => { if (recruiterJobs.length > 0) { setRecruiterTab("applicants"); fetchJobApplicants(recruiterJobs[0]._id); } }} style={{ justifyContent: "center", padding: "14px" }}>
                      👥 View Applicants
                    </button>
                  </div>
                </div>
              </>
            )}

            {recruiterTab === "posted-jobs" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ color: "var(--text-primary)", margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>Your Job Listings</h3>
                    <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: "0.85rem" }}>{recruiterJobs.length} job{recruiterJobs.length !== 1 ? "s" : ""} posted</p>
                  </div>
                  <button className="btn-nav btn-nav-primary" onClick={() => setRecruiterTab("create-job")} style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                    Create Job
                  </button>
                </div>
                {recruiterJobsLoading ? (
                  <div className="empty-state"><div className="spinner"></div></div>
                ) : recruiterJobs.length === 0 ? (
                  <div className="empty-state" style={{ padding: "80px 24px" }}>
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                    <h3 style={{ marginTop: "16px" }}>No jobs posted yet</h3>
                    <p>Create your first job listing to start receiving applications.</p>
                    <button className="btn-cta btn-cta-primary" onClick={() => setRecruiterTab("create-job")} style={{ marginTop: "20px" }}>Post Your First Job</button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
                    {recruiterJobs.map(job => (
                      <div key={job._id} style={{
                        background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px",
                        overflow: "hidden", transition: "all 0.3s ease", position: "relative"
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
                      >
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: job.status === "active" ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #6b7280, #9ca3af)" }}></div>

                        <div style={{ padding: "20px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div style={{ width: 44, height: 44, borderRadius: "12px", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                                {job.companyLogo || "🏢"}
                              </div>
                              <div>
                                <h4 style={{ margin: 0, color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.3 }}>{job.title}</h4>
                                <p style={{ margin: "2px 0 0", color: "var(--text-secondary)", fontSize: "0.82rem" }}>{job.company}</p>
                              </div>
                            </div>
                            <span className={`status-badge ${job.status || "active"}`} style={{ fontSize: "0.7rem", padding: "3px 10px" }}>
                              {job.status === "active" ? "● Active" : "○ Closed"}
                            </span>
                          </div>

                          <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", margin: "0 0 14px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {job.description}
                          </p>

                          <div className="job-badges" style={{ marginBottom: "14px" }}>
                            <span className="badge badge-type">{job.type}</span>
                            {job.workplaceType === "remote" && <span className="badge badge-remote">🌍 Remote</span>}
                            {job.workplaceType === "hybrid" && <span className="badge badge-hybrid">🏢 Hybrid</span>}
                            {job.workplaceType === "onsite" && <span className="badge badge-onsite">📍 On-site</span>}
                            <span className="badge badge-type">{job.experience}</span>
                          </div>

                          <div style={{ display: "flex", gap: "16px", padding: "12px 0", borderTop: "1px solid var(--card-border)", borderBottom: "1px solid var(--card-border)", marginBottom: "14px" }}>
                            <div style={{ textAlign: "center", flex: 1 }}>
                              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{job.applicantsCount || 0}</div>
                              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.3px" }}>Applicants</div>
                            </div>
                            <div style={{ textAlign: "center", flex: 1 }}>
                              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{job.views || 0}</div>
                              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.3px" }}>Views</div>
                            </div>
                            <div style={{ textAlign: "center", flex: 1 }}>
                              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                                {new Date(job.createdAt || job.postedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>
                              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.3px" }}>Posted</div>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => { setEditJob(job); setCreateJobForm({ title: job.title, company: job.company, description: job.description, location: job.location || "", salary: job.salary || "", type: job.type || "Full-time", experience: job.experience || "Mid-level", workplaceType: job.workplaceType || (job.remote ? "remote" : "onsite"), skillsRequired: "", requirements: (job.requirements || []).join(", "), benefits: "", companyLogo: job.companyLogo || "🏢" }); setSkillTags(job.skillsRequired || []); setBenefitTags(job.benefits || []); setRecruiterTab("create-job"); }} style={{
                              flex: 1, padding: "8px 12px", borderRadius: "10px", border: "1px solid var(--card-border)",
                              background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem",
                              fontWeight: 500, transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                              ✏️ Edit
                            </button>
                            <button onClick={() => handleToggleJobStatus(job._id)} style={{
                              flex: 1, padding: "8px 12px", borderRadius: "10px", border: "1px solid var(--card-border)",
                              background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem",
                              fontWeight: 500, transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = job.status === "active" ? "#ef4444" : "#10b981"; e.currentTarget.style.color = job.status === "active" ? "#ef4444" : "#10b981"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                              {job.status === "active" ? "🔒 Close" : "🔓 Reopen"}
                            </button>
                            <button onClick={() => { setRecruiterTab("applicants"); fetchJobApplicants(job._id); }} style={{
                              flex: 1, padding: "8px 12px", borderRadius: "10px", border: "1px solid var(--card-border)",
                              background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem",
                              fontWeight: 500, transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                              👥 Applicants
                            </button>
                            <button onClick={() => handleDeleteJob(job._id)} style={{
                              padding: "8px 12px", borderRadius: "10px", border: "1px solid var(--card-border)",
                              background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.8rem",
                              fontWeight: 500, transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {recruiterTab === "create-job" && (
              <div className="auth-card" style={{ padding: "36px", maxWidth: "720px", margin: "0 auto", position: "relative", overflow: "visible" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899)", borderRadius: "24px 24px 0 0" }}></div>
                <h3 style={{ color: "var(--text-primary)", margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 700 }}>{editJob ? "Edit Job" : "Create a New Job"}</h3>
                <p style={{ color: "var(--text-secondary)", margin: "0 0 28px", fontSize: "0.85rem" }}>
                  {editJob ? "Update the details of your job listing." : "Fill in the details below to publish a new job listing."}
                </p>
                <form className="recruiter-form" onSubmit={handleCreateJob} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        Job Title <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={createJobForm.title}
                        onChange={e => { setCreateJobForm({...createJobForm, title: e.target.value}); setRecruiterFormErrors(prev => ({...prev, title: ""})); }}
                        placeholder="e.g. Senior Frontend Engineer"
                        style={{ borderColor: recruiterFormErrors.title ? "#ef4444" : undefined }}
                      />
                      {recruiterFormErrors.title && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "4px 0 0" }}>{recruiterFormErrors.title}</p>}
                    </div>
                    <div>
                      <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        Company <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={createJobForm.company}
                        onChange={e => { setCreateJobForm({...createJobForm, company: e.target.value}); setRecruiterFormErrors(prev => ({...prev, company: ""})); }}
                        placeholder="e.g. Google"
                        style={{ borderColor: recruiterFormErrors.company ? "#ef4444" : undefined }}
                      />
                      {recruiterFormErrors.company && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "4px 0 0" }}>{recruiterFormErrors.company}</p>}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      Description <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      rows="4"
                      value={createJobForm.description}
                      onChange={e => { setCreateJobForm({...createJobForm, description: e.target.value}); setRecruiterFormErrors(prev => ({...prev, description: ""})); }}
                      placeholder="Describe the role, responsibilities, and ideal candidate..."
                      style={{ borderColor: recruiterFormErrors.description ? "#ef4444" : undefined, resize: "vertical" }}
                    />
                    {recruiterFormErrors.description && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "4px 0 0" }}>{recruiterFormErrors.description}</p>}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                    <div>
                      <label>Location <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>(required)</span></label>
                      <input
                        type="text"
                        value={createJobForm.location}
                        onChange={e => { setCreateJobForm({...createJobForm, location: e.target.value}); setRecruiterFormErrors(prev => ({...prev, location: ""})); }}
                        placeholder="e.g. San Francisco, CA"
                        style={{ borderColor: recruiterFormErrors.location ? "#ef4444" : undefined }}
                      />
                      {recruiterFormErrors.location && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "4px 0 0" }}>{recruiterFormErrors.location}</p>}
                    </div>
                    <div>
                      <label>Salary Range</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.85rem" }}>$</span>
                        <input
                          type="text"
                          value={createJobForm.salary}
                          onChange={e => setCreateJobForm({...createJobForm, salary: e.target.value})}
                          placeholder="80,000 - 150,000"
                          style={{ paddingLeft: "24px" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label>Experience Level</label>
                      <select value={createJobForm.experience} onChange={e => setCreateJobForm({...createJobForm, experience: e.target.value})}>
                        <option value="Entry">🌱 Entry</option>
                        <option value="Junior">🌿 Junior</option>
                        <option value="Mid-level">🌳 Mid-level</option>
                        <option value="Senior">🌲 Senior</option>
                        <option value="Lead">🚀 Lead</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label>Job Type</label>
                      <div style={{ position: "relative" }}>
                        <select value={createJobForm.type} onChange={e => setCreateJobForm({...createJobForm, type: e.target.value})} style={{ appearance: "none", WebkitAppearance: "none", paddingRight: "36px" }}>
                          <option value="Full-time">⏰ Full-time</option>
                          <option value="Part-time">⏳ Part-time</option>
                          <option value="Contract">📄 Contract</option>
                          <option value="Internship">🎓 Internship</option>
                        </select>
                        <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                      </div>
                    </div>
                    <div>
                      <label>Workplace Type</label>
                      <div style={{ position: "relative" }}>
                        <select value={createJobForm.workplaceType} onChange={e => setCreateJobForm({...createJobForm, workplaceType: e.target.value})} style={{ appearance: "none", WebkitAppearance: "none", paddingRight: "36px" }}>
                          <option value="remote">🌍 Remote</option>
                          <option value="hybrid">🏢 Hybrid</option>
                          <option value="onsite">📍 On-site</option>
                        </select>
                        <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      Skills Required <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px 14px", borderRadius: "10px", border: `1px solid ${recruiterFormErrors.skills ? "#ef4444" : "var(--input-border)"}`, background: "var(--input-bg)", minHeight: "44px", cursor: "text" }}
                      onClick={() => document.getElementById("skill-input")?.focus()}>
                      {skillTags.map((tag, i) => (
                        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "8px", background: "rgba(99,102,241,0.12)", color: "#818cf8", fontSize: "0.82rem", fontWeight: 500 }}>
                          {tag}
                          <button type="button" onClick={() => setSkillTags(skillTags.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#818cf8", cursor: "pointer", padding: "0 0 0 2px", fontSize: "14px", lineHeight: 1, opacity: 0.6, transition: "opacity 0.2s" }}
                            onMouseEnter={e => e.target.style.opacity = "1"} onMouseLeave={e => e.target.style.opacity = "0.6"}>
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        id="skill-input"
                        type="text"
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => {
                          if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
                            e.preventDefault();
                            if (!skillTags.includes(skillInput.trim())) {
                              setSkillTags([...skillTags, skillInput.trim()]);
                              setRecruiterFormErrors(prev => ({...prev, skills: ""}));
                            }
                            setSkillInput("");
                          }
                          if (e.key === "Backspace" && !skillInput && skillTags.length > 0) {
                            setSkillTags(skillTags.slice(0, -1));
                          }
                        }}
                        style={{ flex: 1, minWidth: "120px", border: "none", outline: "none", background: "transparent", color: "var(--text-primary)", fontSize: "0.88rem", padding: "2px 0" }}
                        placeholder={skillTags.length === 0 ? "Type a skill and press Enter..." : "Add more..."}
                      />
                    </div>
                    {recruiterFormErrors.skills && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "4px 0 0" }}>{recruiterFormErrors.skills}</p>}
                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: "4px 0 0" }}>
                      Press Enter or comma after each skill. Backspace to remove last.
                    </p>
                  </div>

                  <div>
                    <label>Requirements</label>
                    <div style={{ position: "relative" }}>
                      <select value="" onChange={e => {
                        const val = e.target.value;
                        if (val && !createJobForm.requirements.split(",").map(r => r.trim()).includes(val)) {
                          setCreateJobForm({...createJobForm, requirements: createJobForm.requirements ? createJobForm.requirements + ", " + val : val});
                        }
                      }} style={{ appearance: "none", WebkitAppearance: "none", paddingRight: "36px", color: "var(--text-muted)" }}>
                        <option value="">+ Add common requirement...</option>
                        <option value="Bachelor's degree in Computer Science or related field">Bachelor's in CS or related</option>
                        <option value="Master's degree preferred">Master's degree preferred</option>
                        <option value="3+ years of professional experience">3+ years experience</option>
                        <option value="5+ years of professional experience">5+ years experience</option>
                        <option value="Strong communication skills">Strong communication skills</option>
                        <option value="Experience with agile methodologies">Agile/Scrum experience</option>
                      </select>
                      <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                    <textarea
                      rows="3"
                      value={createJobForm.requirements}
                      onChange={e => setCreateJobForm({...createJobForm, requirements: e.target.value})}
                      placeholder="One requirement per line, or comma-separated..."
                      style={{ marginTop: "8px", resize: "vertical" }}
                    />
                  </div>

                  <div>
                    <label>Benefits</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--input-border)", background: "var(--input-bg)", minHeight: "44px", cursor: "text" }}
                      onClick={() => document.getElementById("benefit-input")?.focus()}>
                      {benefitTags.map((tag, i) => (
                        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", borderRadius: "8px", background: "rgba(16,185,129,0.12)", color: "#34d399", fontSize: "0.82rem", fontWeight: 500 }}>
                          {tag}
                          <button type="button" onClick={() => setBenefitTags(benefitTags.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#34d399", cursor: "pointer", padding: "0 0 0 2px", fontSize: "14px", lineHeight: 1, opacity: 0.6, transition: "opacity 0.2s" }}
                            onMouseEnter={e => e.target.style.opacity = "1"} onMouseLeave={e => e.target.style.opacity = "0.6"}>
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        id="benefit-input"
                        type="text"
                        value={benefitInput}
                        onChange={e => setBenefitInput(e.target.value)}
                        onKeyDown={e => {
                          if ((e.key === "Enter" || e.key === ",") && benefitInput.trim()) {
                            e.preventDefault();
                            if (!benefitTags.includes(benefitInput.trim())) {
                              setBenefitTags([...benefitTags, benefitInput.trim()]);
                            }
                            setBenefitInput("");
                          }
                          if (e.key === "Backspace" && !benefitInput && benefitTags.length > 0) {
                            setBenefitTags(benefitTags.slice(0, -1));
                          }
                        }}
                        style={{ flex: 1, minWidth: "120px", border: "none", outline: "none", background: "transparent", color: "var(--text-primary)", fontSize: "0.88rem", padding: "2px 0" }}
                        placeholder={benefitTags.length === 0 ? "e.g. Health Insurance, 401k matching..." : "Add more..."}
                      />
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: "4px 0 0" }}>
                      Press Enter to add each benefit.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "8px", borderTop: "1px solid var(--card-border)", paddingTop: "20px" }}>
                    <button type="submit" disabled={creatingJob} style={{
                      flex: 1, padding: "14px 24px", borderRadius: "12px", border: "none",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white",
                      fontWeight: 600, fontSize: "0.95rem", cursor: creatingJob ? "not-allowed" : "pointer",
                      opacity: creatingJob ? 0.7 : 1, transition: "all 0.3s ease", display: "flex",
                      alignItems: "center", justifyContent: "center", gap: "8px"
                    }}>
                      {creatingJob ? <><span className="spinner"></span> {editJob ? "Updating..." : "Publishing..."}</> : (
                        <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        {editJob ? "Update Job" : "Publish Job"}</>
                      )}
                    </button>
                    <button type="button" onClick={() => { setEditJob(null); setCreateJobForm({ title: "", company: "", description: "", location: "", salary: "", type: "Full-time", experience: "Mid-level", workplaceType: "remote", skillsRequired: "", requirements: "", benefits: "", companyLogo: "🏢" }); setSkillTags([]); setBenefitTags([]); setRecruiterFormErrors({}); setRecruiterTab("stats"); }} style={{
                      flex: "0 0 auto", padding: "14px 24px", borderRadius: "12px", border: "1px solid var(--card-border)",
                      background: "transparent", color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.95rem",
                      cursor: "pointer", transition: "all 0.2s ease"
                    }}>
                      Discard
                    </button>
                  </div>
                </form>
              </div>
            )}

            {recruiterTab === "applicants" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ color: "var(--text-primary)", margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>Applicants</h3>
                    <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: "0.85rem" }}>
                      {selectedJobApplicants.length} applicant{selectedJobApplicants.length !== 1 ? "s" : ""}
                      {selectedJobApplicants.some(a => a.matchedSkills) && ` · ${selectedJobApplicants.filter(a => a.atsScore >= 80).length} strong matches`}
                    </p>
                  </div>
                  {recruiterJobs.length > 0 && (
                    <div style={{ position: "relative" }}>
                      <select value={selectedApplicantJob || (recruiterJobs[0]?._id) || ""} onChange={e => { setSelectedApplicantJob(e.target.value); fetchJobApplicants(e.target.value); }} style={{ padding: "10px 36px 10px 14px", borderRadius: "10px", border: "1px solid var(--card-border)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: "0.88rem", appearance: "none", WebkitAppearance: "none", cursor: "pointer", minWidth: "200px" }}>
                        {recruiterJobs.map(job => <option key={job._id} value={job._id}>{job.title}</option>)}
                      </select>
                      <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-muted)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  )}
                </div>

                {applicantsLoading ? (
                  <div className="empty-state"><div className="spinner"></div></div>
                ) : selectedJobApplicants.length === 0 ? (
                  <div className="empty-state" style={{ padding: "80px 24px" }}>
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <h3 style={{ marginTop: "16px" }}>No applicants yet</h3>
                    <p>Applications will appear here once candidates start applying to your jobs.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {selectedJobApplicants.map((app, idx) => {
                      const scoreColor = app.atsScore >= 80 ? "#10b981" : app.atsScore >= 50 ? "#f59e0b" : "#ef4444";
                      const circumference = 2 * Math.PI * 20;
                      const offset = circumference - (app.atsScore / 100) * circumference;
                      return (
                        <div key={app._id} className="applicant-card" style={{ animation: `slideInMsg 0.3s ease ${idx * 0.05}s both` }}>
                          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                            {/* Left: Avatar + Info */}
                            <div style={{ display: "flex", gap: "14px", flex: 1, minWidth: "240px" }}>
                              <div style={{ width: 48, height: 48, borderRadius: "14px", background: "var(--gradient-primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", flexShrink: 0 }}>
                                {app.fullName?.charAt(0) || "?"}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                                  <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-primary)" }}>{app.fullName}</span>
                                  <span className={`status-badge ${app.status}`} style={{ fontSize: "0.7rem", padding: "2px 8px" }}>
                                    {app.status === "applied" && "📩"} {app.status === "reviewing" && "📋"} {app.status === "interviewing" && "📞"} {app.status === "accepted" && "✅"} {app.status === "rejected" && "❌"}{" "}
                                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                  </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                                  <span>{app.email}</span>
                                  {app.phone && <span>· {app.phone}</span>}
                                  <span>· {app.yearsOfExperience || "N/A"} exp</span>
                                  {app.linkedInUrl && <a href={app.linkedInUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", textDecoration: "none" }}>LinkedIn ↗</a>}
                                  {app.portfolioUrl && <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", textDecoration: "none" }}>Portfolio ↗</a>}
                                </div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                  {(app.skills || []).slice(0, 6).map((skill, i) => (
                                    <span key={i} className="skill-tag-modern" style={{
                                      background: "rgba(99,102,241,0.08)", color: "#818cf8", fontSize: "0.75rem",
                                      padding: "3px 10px", borderRadius: "8px", fontWeight: 500
                                    }}>{skill}</span>
                                  ))}
                                  {(app.skills || []).length > 6 && (
                                    <span className="skill-tag-modern" style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "8px" }}>
                                      +{app.skills.length - 6}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right: ATS Score */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: "90px", flexShrink: 0 }}>
                              <div className="ats-gauge" style={{ color: scoreColor }}>
                                <svg viewBox="0 0 48 48">
                                  <circle className="bg" cx="24" cy="24" r="20" />
                                  <circle className="fill" cx="24" cy="24" r="20" stroke={scoreColor} strokeDasharray={circumference} strokeDashoffset={offset} />
                                </svg>
                                <span>{app.atsScore}%</span>
                              </div>
                              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.3px" }}>ATS Score</span>
                            </div>
                          </div>

                          {/* Cover Letter */}
                          {app.coverLetter && (
                            <div style={{ marginTop: "12px", padding: "12px", background: "var(--bg-tertiary)", borderRadius: "10px", fontSize: "0.82rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                              <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.78rem", display: "block", marginBottom: "4px" }}>📝 Cover Letter</span>
                              {app.coverLetter}
                            </div>
                          )}

                          {/* Actions */}
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--card-border)" }}>
                            <button className="action-btn" onClick={() => handleUpdateJobStatus(app._id, "reviewing")} disabled={updatingStatus === app._id} style={app.status === "reviewing" ? { borderColor: "#f59e0b", color: "#f59e0b" } : {}}>
                              📋 Shortlist
                            </button>
                            <button className="action-btn" onClick={() => handleUpdateJobStatus(app._id, "interviewing")} disabled={updatingStatus === app._id} style={app.status === "interviewing" ? { borderColor: "#10b981", color: "#10b981" } : {}}>
                              📞 Schedule Interview
                            </button>
                            <button className="action-btn success" onClick={() => handleUpdateJobStatus(app._id, "accepted")} disabled={updatingStatus === app._id} style={app.status === "accepted" ? { borderColor: "#10b981", color: "#10b981" } : {}}>
                              ✅ Accept
                            </button>
                            <button className="action-btn danger" onClick={() => handleUpdateJobStatus(app._id, "rejected")} disabled={updatingStatus === app._id} style={app.status === "rejected" ? { borderColor: "#ef4444", color: "#ef4444" } : {}}>
                              ❌ Reject
                            </button>
                            <button className="action-btn" onClick={async () => {
                              try {
                                const res = await fetch(`${API_URL}/api/applications/${app._id}/download`, {
                                  headers: { Authorization: `Bearer ${token}` },
                                });
                                if (res.ok) {
                                  const blob = await res.blob();
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `${app.fullName.replace(/\s+/g, "_")}_Resume.txt`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }
                              } catch (e) { console.error(e); }
                            }}>
                              📄 Download Resume
                            </button>
                            {app.linkedInUrl && (
                              <button className="action-btn" onClick={() => window.open(app.linkedInUrl, "_blank")}>
                                👤 View Profile
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {recruiterTab === "analytics" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                  <div className="recruiter-stat-card" style={{ borderTop: "3px solid #6366f1" }}>
                    <div className="recruiter-stat-label">Total Applicants</div>
                    <div className="recruiter-stat-value" style={{ fontSize: "2.5rem", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{recruiterStats.totalApplicants}</div>
                  </div>
                  <div className="recruiter-stat-card" style={{ borderTop: "3px solid #10b981" }}>
                    <div className="recruiter-stat-label">Applicants / Job</div>
                    <div className="recruiter-stat-value" style={{ fontSize: "2.5rem", background: "linear-gradient(135deg, #10b981, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {recruiterStats.totalJobs > 0 ? (recruiterStats.totalApplicants / recruiterStats.totalJobs).toFixed(1) : 0}
                    </div>
                  </div>
                  <div className="recruiter-stat-card" style={{ borderTop: "3px solid #f59e0b" }}>
                    <div className="recruiter-stat-label">Conversion Rate</div>
                    <div className="recruiter-stat-value" style={{ fontSize: "2.5rem", background: "linear-gradient(135deg, #f59e0b, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {recruiterStats.totalApplicants > 0 ? ((recruiterStats.interviewsScheduled / recruiterStats.totalApplicants) * 100).toFixed(0) : 0}%
                    </div>
                  </div>
                  <div className="recruiter-stat-card" style={{ borderTop: "3px solid #ec4899" }}>
                    <div className="recruiter-stat-label">Active Jobs</div>
                    <div className="recruiter-stat-value" style={{ fontSize: "2.5rem", background: "linear-gradient(135deg, #ec4899, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{recruiterStats.activeJobs}</div>
                  </div>
                </div>

                <div className="auth-card" style={{ padding: "28px" }}>
                  <h3 style={{ color: "var(--text-primary)", margin: "0 0 16px", fontSize: "1.1rem" }}>Application Pipeline</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { label: "Applied", value: recruiterStats.totalApplicants, color: "#6366f1", pct: 100 },
                      { label: "Reviewed", value: recruiterStats.totalApplicants - (recruiterStats.totalApplicants > 0 ? recruiterStats.totalApplicants - recruiterStats.totalApplicants : 0), color: "#f59e0b", pct: recruiterStats.totalApplicants > 0 ? 100 : 0 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>{item.label}</span>
                          <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{item.value}</span>
                        </div>
                        <div style={{ height: "8px", background: "var(--bg-tertiary)", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: `${item.pct}%`, height: "100%", background: item.color, borderRadius: "4px", transition: "width 0.5s ease" }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", margin: "16px 0 0", textAlign: "center" }}>
                    📊 Detailed analytics coming soon — including time-to-hire, source tracking, and candidate demographics.
                  </p>
                </div>
              </div>
            )}

            {recruiterTab === "skill-authenticity" && (
              <div>
                <div style={{ marginBottom: "24px" }}>
                  <SkillAuthenticityEngine view="recruiter-list" />
                </div>
              </div>
            )}
            {recruiterTab === "cognitive-intelligence" && (
              <div>
                <div style={{ marginBottom: "24px" }}>
                  <CognitiveIntelligenceSystem view="recruiter-list" />
                </div>
              </div>
            )}
            {recruiterTab === "messages" && (
              <div className="auth-card" style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.5 }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </div>
                <h3 style={{ color: "var(--text-primary)", margin: "0 0 8px" }}>Messages Coming Soon</h3>
                <p style={{ color: "var(--text-secondary)", maxWidth: "400px", margin: "0 auto" }}>
                  Communicate directly with applicants and manage all your candidate conversations in one place.
                </p>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Apply Choice Modal */}
      {showApplyChoice && applyChoiceJob && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10001,
          padding: 24,
          backdropFilter: "blur(4px)"
        }} onClick={() => { setShowApplyChoice(false); setApplyChoiceJob(null); }}>
          <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "480px",
            width: "100%",
            boxShadow: "var(--shadow-xl)",
            animation: "slideUp 0.3s ease"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(99,102,241,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 style={{ margin: "0 0 4px", color: "var(--text-primary)", fontSize: "1.25rem" }}>Apply to {applyChoiceJob.title}</h2>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>{applyChoiceJob.company}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={handleQuickApply}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 20px",
                  borderRadius: 14,
                  border: "1px solid var(--card-border)",
                  background: "var(--card-bg)",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  textAlign: "left",
                  width: "100%"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "rgba(99,102,241,0.04)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.background = "var(--card-bg)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(16,185,129,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: 2 }}>Quick Apply</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Apply instantly without test</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>

              <button
                onClick={handleOpenAssessment}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 20px",
                  borderRadius: 14,
                  border: "1px solid var(--card-border)",
                  background: "var(--card-bg)",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  textAlign: "left",
                  width: "100%"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.background = "rgba(99,102,241,0.04)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.background = "var(--card-bg)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(99,102,241,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    <path d="M9 14l2 2 4-4"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem", marginBottom: 2 }}>Take Skill Assessment</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Test your skills before applying</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>

            <button
              onClick={() => { setShowApplyChoice(false); setApplyChoiceJob(null); }}
              style={{
                display: "block",
                margin: "16px auto 0",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                cursor: "pointer",
                padding: "8px 16px",
                transition: "color 0.2s ease"
              }}
              onMouseEnter={e => e.target.style.color = "var(--text-primary)"}
              onMouseLeave={e => e.target.style.color = "var(--text-muted)"}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mock Test Modal */}
      {showMockTest && mockTestJob && (
        <MockTest
          job={mockTestJob}
          onComplete={handleMockTestComplete}
          onClose={() => { setShowMockTest(false); setMockTestJob(null); }}
        />
      )}

      {showApplyModal && selectedJob && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10001,
          padding: 24,
          backdropFilter: "blur(4px)"
        }} onClick={() => setShowApplyModal(false)}>
          <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "20px",
            padding: "32px",
            maxWidth: "540px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "var(--shadow-xl)"
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 4px", color: "var(--text-primary)", fontSize: "1.3rem" }}>Apply to {selectedJob.title}</h2>
            <p style={{ margin: "0 0 24px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>{selectedJob.company} — {selectedJob.location || "Remote"}</p>

            <form onSubmit={handleApplySubmit} noValidate>
              <div className="input-group" style={{ marginBottom: 4 }}>
                <div className="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div>
                <input type="text" className={`input-field${formErrors.fullName ? " input-error" : ""}`} placeholder="Full Name *" value={applicationData.fullName} onChange={(e) => { setApplicationData({...applicationData, fullName: e.target.value}); setFormErrors(prev => ({...prev, fullName: ""})); }} />
              </div>
              {formErrors.fullName && <div className="form-error">{formErrors.fullName}</div>}

              <div className="input-group" style={{ marginBottom: 4 }}>
                <div className="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div>
                <input type="email" className={`input-field${formErrors.email ? " input-error" : ""}`} placeholder="Email *" value={applicationData.email} onChange={(e) => { setApplicationData({...applicationData, email: e.target.value}); setFormErrors(prev => ({...prev, email: ""})); }} />
              </div>
              {formErrors.email && <div className="form-error">{formErrors.email}</div>}

              <div className="input-group">
                <div className="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.5 4.5a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.5 1.5a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></div>
                <input type="tel" className="input-field" placeholder="Phone (optional)" value={applicationData.phone} onChange={(e) => setApplicationData({...applicationData, phone: e.target.value})} />
              </div>

              <div className="input-group">
                <div className="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
                <select className="input-field select-field" value={applicationData.yearsOfExperience} onChange={(e) => setApplicationData({...applicationData, yearsOfExperience: e.target.value})}>
                  <option value="">Years of Experience (optional)</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-2">1-2 years</option>
                  <option value="2-4">2-4 years</option>
                  <option value="4-6">4-6 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <div className="input-group">
                <div className="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></div>
                <input type="url" className={`input-field${formErrors.portfolioUrl ? " input-error" : ""}`} placeholder="Portfolio URL (optional)" value={applicationData.portfolioUrl} onChange={(e) => { setApplicationData({...applicationData, portfolioUrl: e.target.value}); setFormErrors(prev => ({...prev, portfolioUrl: ""})); }} />
              </div>
              {formErrors.portfolioUrl && <div className="form-error">{formErrors.portfolioUrl}</div>}

              <div className="input-group">
                <div className="input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"/></svg></div>
                <input type="url" className={`input-field${formErrors.linkedInUrl ? " input-error" : ""}`} placeholder="LinkedIn URL (optional)" value={applicationData.linkedInUrl} onChange={(e) => { setApplicationData({...applicationData, linkedInUrl: e.target.value}); setFormErrors(prev => ({...prev, linkedInUrl: ""})); }} />
              </div>
              {formErrors.linkedInUrl && <div className="form-error">{formErrors.linkedInUrl}</div>}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 500 }}>
                  Resume (optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setApplicationData({...applicationData, resumeFile: e.target.files[0], resumeText: ""});
                    }
                  }}
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}
                />
                <textarea
                  value={applicationData.resumeText}
                  onChange={(e) => setApplicationData({...applicationData, resumeText: e.target.value, resumeFile: null})}
                  placeholder="Or paste resume text here..."
                  style={{ width: "100%", marginTop: "8px", padding: "10px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-primary)", minHeight: "60px", fontSize: "0.85rem", resize: "vertical" }}
                />

                {(applicationData.resumeText || applicationData.resumeFile) && selectedJob.skillsRequired?.length > 0 && (
                  <SkillGapAnalyzer
                    token={token}
                    jobSkills={selectedJob.skillsRequired}
                    resumeText={applicationData.resumeText || "file uploaded"}
                  />
                )}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 500 }}>
                  Cover Letter (optional)
                </label>
                <textarea
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({...applicationData, coverLetter: e.target.value})}
                  placeholder="Tell us why you're a great fit for this role..."
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--input-bg)", color: "var(--text-primary)", minHeight: "80px", fontSize: "0.85rem", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" className="btn-nav btn-nav-ghost" onClick={() => setShowApplyModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? <><span className="spinner"></span>Submitting...</> : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <div style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 10000,
      }}>
        {showChatbot && (
          <div className="chat-container-glass" style={{
            width: "380px",
            height: "520px",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            marginBottom: "16px",
            animation: "slideInMsg 0.3s ease"
          }}>
            {/* Header */}
            <div style={{
              padding: "14px 18px",
              background: "var(--gradient-primary)",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="avatar-glow" style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>AI Career Mentor</div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.8, display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}></span>
                    {chatLoading ? "Typing..." : "Online"}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowChatbot(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", padding: "4px", opacity: 0.8, transition: "opacity 0.2s" }}
                onMouseEnter={e => e.target.style.opacity = "1"} onMouseLeave={e => e.target.style.opacity = "0.8"}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Messages */}
            <div id="chat-messages" style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              scrollBehavior: "smooth"
            }}>
              {chatMessages.map((msg, i) => (
                <div className={`chat-msg ${msg.role === "user" ? "chat-msg-user" : "chat-msg-bot"}`} key={i}>
                  <div className="chat-bubble" style={{
                    background: msg.role === "user" ? "var(--gradient-primary)" : "var(--bg-tertiary)",
                    color: msg.role === "user" ? "white" : "var(--text-primary)",
                    borderBottomRightRadius: msg.role === "user" ? 4 : 12,
                    borderBottomLeftRadius: msg.role === "user" ? 12 : 4
                  }}>
                    {msg.ts && msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                  </div>
                  <div className={`chat-ts ${msg.role === "user" ? "chat-ts-right" : ""}`}>
                    {msg.ts ? new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="chat-msg chat-msg-bot">
                  <div className="chat-bubble typing-dots" style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", borderBottomLeftRadius: 4 }}>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestion chips */}
            {showSuggestions && chatMessages.length <= 2 && (
              <div className="suggestions-wrap">
                {suggestionOptions.map((chip) => (
                  <button key={chip} className="suggestion-chip" onClick={async () => {
                    setShowSuggestions(false);
                    const userMessage = chip;
                    setChatMessages(prev => [...prev, { role: "user", content: userMessage, ts: new Date() }]);
                    setChatLoading(true);
                    try {
                      const body = { message: userMessage, userId: user?._id || "anonymous" };
                      if (analysisResult) body.resumeContext = { score: analysisResult.score, skills: analysisResult.skills, strengths: analysisResult.strengths, weaknesses: analysisResult.weaknesses, missingKeywords: analysisResult.missingKeywords, bestRoles: analysisResult.bestRoles, summary: analysisResult.summary };
                      const res = await fetch(`${API_URL}/api/chat`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify(body),
                      });
                      const data = await res.json();
                      const text = data.response || "I'm here to help!";
                      await new Promise(r => setTimeout(r, getTypingDelay(text)));
                      setChatMessages(prev => [...prev, { role: "assistant", content: text, ts: new Date() }]);
                    } catch (err) {
                      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting.", ts: new Date() }]);
                    } finally {
                      setChatLoading(false);
                    }
                  }}>
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!chatInput.trim() || chatLoading) return;

              const userMessage = chatInput;
              setChatMessages(prev => [...prev, { role: "user", content: userMessage, ts: new Date() }]);
              setChatInput("");
              setChatLoading(true);
              setShowSuggestions(false);

              try {
                const formBody = { message: userMessage, userId: user?._id || "anonymous" };
                if (analysisResult) formBody.resumeContext = { score: analysisResult.score, skills: analysisResult.skills, strengths: analysisResult.strengths, weaknesses: analysisResult.weaknesses, missingKeywords: analysisResult.missingKeywords, bestRoles: analysisResult.bestRoles, summary: analysisResult.summary };
                const res = await fetch(`${API_URL}/api/chat`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify(formBody),
                });
                const data = await res.json();
                const text = data.response || "I'm here to help!";
                await new Promise(r => setTimeout(r, getTypingDelay(text)));
                setChatMessages(prev => [...prev, { role: "assistant", content: text, ts: new Date() }]);
              } catch (err) {
                setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again.", ts: new Date() }]);
              } finally {
                setChatLoading(false);
              }
            }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask me anything..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--input-border)",
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
              <button type="submit" disabled={chatLoading || !chatInput.trim()} style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                background: chatLoading || !chatInput.trim() ? "var(--text-muted)" : "var(--gradient-primary)",
                color: "white",
                cursor: chatLoading || !chatInput.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="fab-button"
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            border: "none",
            background: "var(--gradient-primary)",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            fontSize: "24px",
            position: "relative"
          }}
          onMouseEnter={(e) => { e.target.style.transform = "scale(1.1)"; e.target.style.boxShadow = "0 6px 30px rgba(99,102,241,0.6)"; }}
          onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 4px 20px rgba(99,102,241,0.4)"; }}
        >
          {showChatbot ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          )}
        </button>
      </div>

      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}
