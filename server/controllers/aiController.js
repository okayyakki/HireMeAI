import axios from "axios";
import multer from "multer";
import path from "path";
import mammoth from "mammoth";
import OpenAI from "openai";
import { PDFParse, VerbosityLevel } from "pdf-parse";
import { createWorker } from "tesseract.js";

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format. Only PDF, DOC, DOCX, and TXT files are allowed"));
    }
  }
});

// Extract text from different file types
const extractTextFromFile = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();

  console.log("=== RESUME EXTRACTION DEBUG ===");
  console.log("File:", file.originalname);
  console.log("Type:", file.mimetype);
  console.log("Size:", file.size, "bytes");
  console.log("Extension:", ext);

  try {
    if (ext === ".txt") {
      const text = file.buffer.toString("utf-8");
      console.log("TXT extracted, length:", text.length);
      if (!text || text.trim().length < 50) {
        throw new Error("Text file is empty or too short (minimum 50 characters required)");
      }
      return text;
    }

    if (ext === ".pdf") {
      try {
        console.log("PDF buffer length:", file.buffer?.length);

        if (!file.buffer || file.buffer.length === 0) {
          throw new Error("PDF file is empty or corrupted");
        }

        const parser = new PDFParse({ data: new Uint8Array(file.buffer), verbosity: VerbosityLevel.ERRORS });
        const result = await parser.getText();
        const text = result?.text || "";

        console.log("PDF extracted, length:", text.length);
        console.log("PDF text preview:", text.substring(0, 200));

        if (!text || text.trim().length < 50) {
          console.log("PDF text extraction returned empty content, attempting OCR...");
          return await extractWithOCR(file);
        }
        return text;
      } catch (pdfError) {
        console.error("PDF parse error:", pdfError.message);
        console.log("Falling back to OCR extraction...");
        try {
          return await extractWithOCR(file);
        } catch (ocrError) {
          throw new Error("Could not extract text from this PDF. Please upload a text-based PDF or paste your resume text manually.");
        }
      }
    }

    if (ext === ".doc" || ext === ".docx") {
      if (!mammoth) {
        throw new Error("DOCX parser not available. Please try again or paste text manually.");
      }
      
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        const text = result?.value || "";
        console.log("DOCX extracted, length:", text.length);
        console.log("DOCX text preview:", text.substring(0, 200));

        if (!text || text.trim().length < 50) {
          throw new Error("Word document appears to be empty or could not be read properly.");
        }
        return text;
      } catch (mammothError) {
        console.error("Mammoth error:", mammothError.message);
        throw new Error("Could not parse Word document. Please ensure the file is not corrupted.");
      }
    }

    throw new Error(`Unsupported file type: ${ext}. Please upload PDF, DOC, DOCX, or TXT.`);
  } catch (error) {
    console.error("Text extraction error:", error.message);
    throw error;
  }
};

// Extract text from scanned PDFs using OCR
const extractWithOCR = async (file) => {
  console.log("=== OCR EXTRACTION ===");
  console.log("Trying advanced OCR extraction...");

  try {
    const parser = new PDFParse({ data: new Uint8Array(file.buffer), verbosity: VerbosityLevel.ERRORS });
    const screenshots = await parser.getScreenshot({ scale: 2, imageBuffer: false });

    let fullText = "";
    const totalPages = screenshots.pages.length;

    console.log(`OCR: Processing ${totalPages} page(s)`);

    const worker = await createWorker("eng");

    for (let i = 0; i < totalPages; i++) {
      const page = screenshots.pages[i];
      console.log(`OCR: Recognizing page ${i + 1}/${totalPages}...`);
      const { data } = await worker.recognize(page.dataUrl);
      fullText += data.text + "\n\n";
    }

    await worker.terminate();
    console.log(`OCR extracted, length: ${fullText.length}`);
    console.log("OCR text preview:", fullText.substring(0, 200));

    return fullText;
  } catch (ocrError) {
    console.error("OCR extraction error:", ocrError.message);
    throw new Error("OCR extraction failed. Please upload a text-based PDF or paste your resume text manually.");
  }
};

// Call OpenAI API for resume analysis
const analyzeWithOpenAI = async (resumeText) => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_openai_api_key_here") {
    return null;
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach. Analyze this resume thoroughly and return ONLY valid JSON, no other text.

Resume text:
${resumeText.substring(0, 5000)}

Return exactly this JSON structure:
{
  "score": <number 0-100, where 100 is perfect>,
  "atsBreakdown": {
    "formatting": <number 0-100>,
    "keywords": <number 0-100>,
    "experience": <number 0-100>,
    "education": <number 0-100>,
    "skills": <number 0-100>
  },
  "skills": [<all technical and soft skills found, as strings>],
  "strengths": [<3-5 specific strengths with context>],
  "weaknesses": [<3-5 areas needing improvement, be specific>],
  "suggestions": [<3-5 actionable, specific recommendations>],
  "missingKeywords": [<important industry keywords NOT found in this resume>],
  "bestRoles": [<3-5 job titles that best match this resume>],
  "summary": "<2-3 sentence professional summary of the resume>"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || "";
    console.log("OpenAI raw response:", content);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("OpenAI analysis error:", error.message);
    return null;
  }
};

// Call HuggingFace API for resume analysis
const analyzeWithHuggingFace = async (resumeText) => {
  if (!process.env.HF_API_KEY || process.env.HF_API_KEY === "hf_your_actual_api_key_here") {
    return null;
  }

  try {
    const prompt = `Analyze this resume for ATS compatibility. Return JSON: {"score": 0-100, "skills": [], "strengths": [], "weaknesses": [], "suggestions": [], "missingKeywords": [], "bestRoles": [], "summary": ""}

Resume: ${resumeText.substring(0, 2000)}`;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          return_full_text: false
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
        timeout: 20000
      }
    );

    const generatedText = response.data[0]?.generated_text || "";
    console.log("HuggingFace raw response:", generatedText);
    
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("HuggingFace analysis error:", error.message);
    return null;
  }
};

// Generate detailed basic analysis without AI (fallback)
const generateBasicAnalysis = (resumeText) => {
  const words = resumeText.toLowerCase();
  const wordCount = resumeText.split(/\s+/).length;

  let score = 50;
  const atsBreakdown = { formatting: 60, keywords: 40, experience: 50, education: 50, skills: 50 };

  if (wordCount > 200) score += 5;
  if (wordCount > 400) score += 5;
  if (words.includes("experience") || words.includes("worked") || words.includes("employed")) { score += 8; atsBreakdown.experience = 70; }
  if (words.includes("project") || words.includes("built") || words.includes("developed")) { score += 5; atsBreakdown.experience += 10; }
  if (words.includes("education") || words.includes("degree") || words.includes("bachelor") || words.includes("master")) { score += 5; atsBreakdown.education = 70; }
  if (words.includes("certif") || words.includes("license")) { score += 3; atsBreakdown.education += 10; }
  if (words.includes("achievement") || words.includes("improved") || words.includes("increased") || words.includes("reduced") || words.includes("launched")) { score += 8; }
  if (words.includes("team") || words.includes("led") || words.includes("managed") || words.includes("mentor")) { score += 5; }
  if (words.includes("skill") || words.includes("proficient") || words.includes("expertise")) { score += 5; atsBreakdown.skills = 65; }

  const allKeywords = [
    "javascript", "python", "react", "node.js", "node", "java", "aws", "sql",
    "docker", "git", "typescript", "css", "html", "mongodb", "express", "api",
    "agile", "machine learning", "data", "cloud", "devops", "kubernetes",
    "rest", "graphql", "redux", "next.js", "tailwind", "postgresql", "redis",
    "ci/cd", "testing", "jest", "cypress", "linux", "nginx", "django", "flask",
    "spring", "microservices", "terraform", "ansible", "jenkins", "azure",
    "gcp", "figma", "leadership", "communication", "problem-solving"
  ];
  const skills = allKeywords.filter(k => words.includes(k));
  const foundCount = skills.length;
  if (foundCount > 3) { score += 5; atsBreakdown.skills += 10; }
  if (foundCount > 6) { score += 5; atsBreakdown.skills += 10; }
  if (foundCount > 10) { score += 5; atsBreakdown.skills += 10; }

  if (words.includes("@") && words.includes(".")) atsBreakdown.formatting += 10;
  if (words.includes("phone") || words.includes("tel") || words.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) atsBreakdown.formatting += 10;
  if (words.includes("linkedin")) atsBreakdown.formatting += 10;
  if (words.includes("github") || words.includes("portfolio")) atsBreakdown.formatting += 10;

  atsBreakdown.keywords = Math.min(100, 40 + foundCount * 5);
  score = Math.min(95, Math.max(20, score));
  for (const k in atsBreakdown) atsBreakdown[k] = Math.min(100, Math.max(10, atsBreakdown[k]));

  const missingKeywords = allKeywords
    .filter(k => !words.includes(k))
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  const s = words.split(".").filter(p => p.trim().length > 20);
  const summary = s.length > 0
    ? s[0].trim().substring(0, 150) + (s[0].length > 150 ? "..." : "")
    : "Resume provided for analysis.";

  return {
    score,
    atsBreakdown,
    skills: skills.length > 0 ? skills : ["Communication", "Problem Solving", "Teamwork"],
    strengths: [
      foundCount > 3 ? `Strong technical foundation with ${foundCount} relevant skills identified` : "Resume content is available for evaluation",
      wordCount > 300 ? "Comprehensive resume with detailed experience" : "Resume structure is clear and organized",
      summary.length > 50 ? "Professional summary or objective present" : "Resume format is readable and parsable"
    ],
    weaknesses: [
      missingKeywords.length > 0 ? `Missing ${missingKeywords.length} industry keywords that ATS systems look for` : "Consider adding more measurable achievements",
      "Limited quantified achievements — add metrics like percentages and numbers",
      !words.includes("summary") && !words.includes("objective") ? "No professional summary at the top" : "Consider tailoring resume per job application"
    ],
    suggestions: [
      "Add measurable achievements with specific numbers (e.g., 'Increased revenue by 25%')",
      missingKeywords.length > 0 ? `Include missing keywords: ${missingKeywords.slice(0, 4).join(", ")}` : "Good keyword coverage",
      "Use action verbs at the start of each bullet point",
      "Add a strong professional summary highlighting key qualifications",
      "Ensure consistent formatting throughout"
    ],
    missingKeywords,
    bestRoles: [
      ...(skills.includes("javascript") || skills.includes("react") ? ["Frontend Developer"] : []),
      ...(skills.includes("node") || skills.includes("python") || skills.includes("java") ? ["Backend Developer"] : []),
      ...(skills.includes("aws") || skills.includes("docker") || skills.includes("devops") ? ["DevOps Engineer"] : []),
      ...(skills.includes("data") || skills.includes("python") && skills.includes("sql") ? ["Data Analyst"] : []),
      ...(skills.length === 0 ? ["Entry Level Developer", "Junior Software Engineer", "Graduate Trainee"] : ["Full Stack Developer", "Software Engineer"])
    ].slice(0, 4),
    summary
  };
};

export const analyzeResume = async (req, res) => {
  try {
    let resumeText = "";

    // Check if file was uploaded
    if (req.file) {
      try {
        resumeText = await extractTextFromFile(req.file);
      } catch (extractError) {
        return res.status(400).json({ 
          message: extractError.message,
          fallback: true 
        });
      }
    } else if (req.body.resumeText && req.body.resumeText.trim()) {
      // Fallback to text input
      resumeText = req.body.resumeText;
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ 
        message: "Empty resume detected. Please provide more resume content (minimum 50 characters) or upload a valid file." 
      });
    }

    console.log("Analyzing resume, text length:", resumeText.length);
    console.log("Text preview:", resumeText.substring(0, 200));

    // Try AI analysis in order: OpenAI -> HuggingFace -> Basic
    let result = await analyzeWithOpenAI(resumeText);
    
    if (!result) {
      result = await analyzeWithHuggingFace(resumeText);
    }
    
    if (!result) {
      console.log("Using basic analysis fallback");
      result = generateBasicAnalysis(resumeText);
    }

    result = {
      score: result.score || 60,
      atsBreakdown: result.atsBreakdown || {
        formatting: Math.min(100, 50 + Math.floor(Math.random() * 30)),
        keywords: Math.min(100, 40 + Math.floor(Math.random() * 40)),
        experience: Math.min(100, 50 + Math.floor(Math.random() * 30)),
        education: Math.min(100, 50 + Math.floor(Math.random() * 30)),
        skills: Math.min(100, 40 + Math.floor(Math.random() * 40))
      },
      skills: Array.isArray(result.skills) ? result.skills : [],
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      missingKeywords: Array.isArray(result.missingKeywords) ? result.missingKeywords : [],
      bestRoles: Array.isArray(result.bestRoles) ? result.bestRoles : [],
      summary: result.summary || "Analysis complete"
    };

    console.log("Analysis result:", JSON.stringify(result, null, 2));

    res.json({ result });

  } catch (error) {
    console.error("AI Analysis Error:", error.message);
    res.status(500).json({ 
      message: "Server error during analysis. Please try again.",
      details: error.message 
    });
  }
};

// Skill Gap Analysis
const SKILL_KEYWORDS = [
  "javascript", "typescript", "python", "java", "c#", "c++", "ruby", "go", "rust", "php",
  "react", "angular", "vue", "svelte", "next.js", "nuxt", "node.js", "node", "express",
  "django", "flask", "spring", "spring boot", "asp.net", "rails", "laravel",
  "html", "css", "scss", "tailwind", "bootstrap", "sass",
  "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "cassandra", "dynamodb",
  "aws", "azure", "gcp", "cloud", "docker", "kubernetes", "terraform", "ansible", "jenkins",
  "ci/cd", "devops", "linux", "nginx", "apache",
  "git", "github", "gitlab", "bitbucket",
  "rest", "graphql", "grpc", "api",
  "redux", "mobx", "react query", "zustand",
  "jest", "cypress", "mocha", "chai", "playwright", "testing",
  "figma", "sketch", "adobe xd", "photoshop", "ui/ux",
  "machine learning", "deep learning", "ai", "data science", "tensorflow", "pytorch",
  "agile", "scrum", "jira", "confluence",
  "leadership", "communication", "project management", "teamwork",
  "docker", "kubernetes", "nginx", "webpack", "babel", "rollup", "vite",
];

const analyzeSkillGap = async (resumeText, jobSkills) => {
  const words = resumeText.toLowerCase();
  const resumeSkills = SKILL_KEYWORDS.filter(skill => words.includes(skill));

  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim());
  const matchedSkills = normalizedJobSkills.filter(s => resumeSkills.includes(s) || words.includes(s));
  const missingSkills = normalizedJobSkills.filter(s => !matchedSkills.includes(s));
  const matchPercentage = normalizedJobSkills.length > 0
    ? Math.round((matchedSkills.length / normalizedJobSkills.length) * 100)
    : 0;

  const suggestions = missingSkills.map(skill => {
    const resources = {
      "react": "https://react.dev",
      "angular": "https://angular.dev",
      "vue": "https://vuejs.org",
      "node.js": "https://nodejs.org",
      "python": "https://python.org",
      "typescript": "https://typescriptlang.org",
      "docker": "https://docker.com",
      "kubernetes": "https://kubernetes.io",
      "aws": "https://aws.amazon.com",
      "azure": "https://azure.com",
      "gcp": "https://cloud.google.com",
      "mongodb": "https://mongodb.com",
      "sql": "https://w3schools.com/sql",
      "git": "https://git-scm.com",
      "figma": "https://figma.com",
      "tailwind": "https://tailwindcss.com",
      "next.js": "https://nextjs.org",
      "graphql": "https://graphql.org",
      "jenkins": "https://jenkins.io",
      "terraform": "https://terraform.io",
    };
    const key = Object.keys(resources).find(k => skill.includes(k)) || null;
    return { skill, resource: key ? resources[key] : null };
  });

  return { matchedSkills, missingSkills: suggestions, matchPercentage, resumeSkillsFound: resumeSkills };
};

export const getSkillGap = async (req, res) => {
  try {
    const { resumeText, jobSkills } = req.body;

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(400).json({ message: "Please provide resume text (minimum 20 characters)" });
    }
    if (!jobSkills || !Array.isArray(jobSkills) || jobSkills.length === 0) {
      return res.status(400).json({ message: "Please provide job skills as a non-empty array" });
    }

    const result = await analyzeSkillGap(resumeText, jobSkills);
    res.json(result);
  } catch (error) {
    console.error("Skill Gap Error:", error.message);
    res.status(500).json({ message: "Server error during skill gap analysis" });
  }
};

// --- Question Bank for Mock Tests ---
const QUESTION_BANK = {
  javascript: [
    { q: "Which of the following is NOT a JavaScript data type?", options: ["String", "Boolean", "Character", "Number"], answer: 2 },
    { q: "What does `typeof null` return in JavaScript?", options: ["'null'", "'object'", "'undefined'", "'boolean'"], answer: 1 },
    { q: "Which method adds an element to the end of an array?", options: ["push()", "pop()", "shift()", "unshift()"], answer: 0 },
    { q: "What is the output of `2 + '2'` in JavaScript?", options: ["4", "'22'", "22", "Error"], answer: 1 },
    { q: "Which keyword is used to declare a constant in JavaScript?", options: ["var", "let", "const", "static"], answer: 2 },
    { q: "What does the `===` operator check?", options: ["Value only", "Type only", "Value and type", "Reference"], answer: 2 },
    { q: "Which built-in method sorts an array?", options: ["order()", "sort()", "arrange()", "organize()"], answer: 1 },
    { q: "What is a closure in JavaScript?", options: ["A loop", "A function with access to outer scope", "A data type", "An error handler"], answer: 1 },
  ],
  react: [
    { q: "What is used to pass data to a React component?", options: ["state", "props", "setState", "context"], answer: 1 },
    { q: "Which hook is used for side effects in React?", options: ["useState", "useEffect", "useContext", "useReducer"], answer: 1 },
    { q: "What does JSX stand for?", options: ["JavaScript XML", "Java Syntax Extension", "JavaScript Extension", "JSON XML"], answer: 0 },
    { q: "Which method is used to update state in class components?", options: ["setState()", "updateState()", "changeState()", "modifyState()"], answer: 0 },
    { q: "What is the virtual DOM?", options: ["A copy of the real DOM in memory", "A database", "A new HTML spec", "A CSS framework"], answer: 0 },
    { q: "Which hook manages local state in functional components?", options: ["useEffect", "useState", "useContext", "useRef"], answer: 1 },
  ],
  "node.js": [
    { q: "Which module is used to create a web server in Node.js?", options: ["http", "web", "server", "net"], answer: 0 },
    { q: "What is npm?", options: ["Node Package Manager", "Node Process Manager", "New Programming Module", "Network Protocol Manager"], answer: 0 },
    { q: "Which method reads a file asynchronously in Node.js?", options: ["readFile()", "readFileSync()", "read()", "open()"], answer: 0 },
    { q: "What does Express.js provide?", options: ["Database management", "Web framework for Node.js", "CSS preprocessor", "Testing framework"], answer: 1 },
    { q: "What is middleware in Express?", options: ["Database driver", "Functions that execute during request cycle", "Template engine", "Cache layer"], answer: 1 },
  ],
  python: [
    { q: "Which keyword defines a function in Python?", options: ["func", "define", "def", "function"], answer: 2 },
    { q: "What data type is `[1, 2, 3]` in Python?", options: ["Tuple", "List", "Set", "Dictionary"], answer: 1 },
    { q: "Which of the following is immutable in Python?", options: ["List", "Dictionary", "Tuple", "Set"], answer: 2 },
    { q: "What does `len()` function return?", options: ["Length of an object", "Last element", "Largest element", "None"], answer: 0 },
    { q: "How do you handle exceptions in Python?", options: ["try-except", "catch-throw", "try-catch", "handle-error"], answer: 0 },
  ],
  sql: [
    { q: "Which SQL statement is used to retrieve data?", options: ["GET", "FETCH", "SELECT", "RETRIEVE"], answer: 2 },
    { q: "What does JOIN do in SQL?", options: ["Combines rows from tables", "Deletes records", "Creates a view", "Updates data"], answer: 0 },
    { q: "Which clause filters groups in SQL?", options: ["WHERE", "HAVING", "FILTER", "GROUP"], answer: 1 },
    { q: "What is a primary key?", options: ["A unique identifier for a row", "A foreign reference", "An index", "A constraint type"], answer: 0 },
    { q: "Which SQL function finds the number of rows?", options: ["COUNT()", "SUM()", "TOTAL()", "ROWS()"], answer: 0 },
  ],
  aws: [
    { q: "Which AWS service is used for virtual servers?", options: ["S3", "EC2", "Lambda", "RDS"], answer: 1 },
    { q: "What does S3 store?", options: ["Virtual machines", "Objects/files", "Databases", "Containers"], answer: 1 },
    { q: "Which AWS service is serverless compute?", options: ["EC2", "ECS", "Lambda", "Elastic Beanstalk"], answer: 2 },
    { q: "What is IAM used for?", options: ["Identity and Access Management", "Instance Allocation Manager", "Infrastructure Automation Module", "Integrated Application Monitor"], answer: 0 },
    { q: "Which service is a managed database?", options: ["S3", "EC2", "RDS", "CloudFront"], answer: 2 },
  ],
  docker: [
    { q: "What is Docker used for?", options: ["Containerization", "Virtual machines", "Database management", "Web hosting"], answer: 0 },
    { q: "What is a Dockerfile?", options: ["A script to build images", "A config file for networks", "A log file", "A volume definition"], answer: 0 },
    { q: "Which command runs a container?", options: ["docker build", "docker run", "docker start", "docker exec"], answer: 1 },
    { q: "What is Docker Compose?", options: ["CI/CD tool", "Multi-container orchestration tool", "Monitoring tool", "Image registry"], answer: 1 },
    { q: "What does `docker ps` show?", options: ["All images", "Running containers", "All containers", "Network settings"], answer: 1 },
  ],
  general: [
    { q: "What is Git?", options: ["A programming language", "A version control system", "A database", "An operating system"], answer: 1 },
    { q: "What does API stand for?", options: ["Application Programming Interface", "Automated Program Integration", "Applied Protocol Interaction", "Advanced Programming Interface"], answer: 0 },
    { q: "What is CI/CD?", options: ["Continuous Integration/Continuous Deployment", "Code Integration/Code Deployment", "Computer Interface/Computer Design", "Central Integration/Central Development"], answer: 0 },
    { q: "What is Agile methodology?", options: ["A programming language", "An iterative development approach", "A database design pattern", "A testing framework"], answer: 1 },
    { q: "What is a microservice?", options: ["A small database", "An independent deployable service", "A lightweight framework", "A CSS utility"], answer: 1 },
  ],
};

const getQuestionsForJob = (title, skills, count = 6) => {
  const titleLower = title.toLowerCase();
  const allSkills = [...skills.map(s => s.toLowerCase()), titleLower];

  const relevantTopics = [];
  for (const [topic, questions] of Object.entries(QUESTION_BANK)) {
    if (allSkills.some(s => s.includes(topic) || topic.includes(s))) {
      relevantTopics.push(topic);
    }
  }

  if (relevantTopics.length === 0) {
    relevantTopics.push("general");
  }

  const pool = [];
  const used = new Set();
  for (const topic of relevantTopics) {
    for (const q of QUESTION_BANK[topic]) {
      const key = q.q.substring(0, 20);
      if (!used.has(key)) {
        pool.push(q);
        used.add(key);
      }
    }
  }

  const shuffled = pool.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map(q => ({
    question: q.q,
    options: q.options,
    answer: q.answer,
  }));
};

export const generateQuestions = async (req, res) => {
  try {
    const { title, skills, count = 6 } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Job title is required" });
    }
    const questions = getQuestionsForJob(title, skills || [], Math.min(count, 10));
    if (questions.length === 0) {
      return res.status(404).json({ message: "Could not generate questions for this job" });
    }
    res.json({ questions });
  } catch (error) {
    console.error("Question generation error:", error.message);
    res.status(500).json({ message: "Server error generating questions" });
  }
};

export { upload };