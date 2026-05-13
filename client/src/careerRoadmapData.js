const ROADMAP_COLORS = [
  { primary: "#6366f1", secondary: "#818cf8", glow: "rgba(99,102,241,0.3)" },
  { primary: "#10b981", secondary: "#34d399", glow: "rgba(16,185,129,0.3)" },
  { primary: "#f59e0b", secondary: "#fbbf24", glow: "rgba(245,158,11,0.3)" },
  { primary: "#8b5cf6", secondary: "#a78bfa", glow: "rgba(139,92,246,0.3)" },
  { primary: "#ec4899", secondary: "#f472b6", glow: "rgba(236,72,153,0.3)" },
  { primary: "#3b82f6", secondary: "#60a5fa", glow: "rgba(59,130,246,0.3)" },
  { primary: "#14b8a6", secondary: "#5eead4", glow: "rgba(20,184,166,0.3)" },
  { primary: "#f97316", secondary: "#fb923c", glow: "rgba(249,115,22,0.3)" },
  { primary: "#e11d48", secondary: "#fb7185", glow: "rgba(225,29,72,0.3)" },
  { primary: "#06b6d4", secondary: "#67e8f9", glow: "rgba(6,182,212,0.3)" },
];

let colorIndex = 0;
function nextColor() {
  const c = ROADMAP_COLORS[colorIndex % ROADMAP_COLORS.length];
  colorIndex++;
  return c;
}

export const TRENDING_CAREERS = [
  "Full Stack Developer", "Data Scientist", "AI/ML Engineer", "DevOps Engineer",
  "Cybersecurity Analyst", "Cloud Engineer", "Blockchain Developer", "Product Manager",
];

export const FASTEST_GROWING_SKILLS = [
  "Generative AI", "LLM Fine-tuning", "Kubernetes", "Rust", "Web3",
  "RAG Systems", "Edge Computing", "Cybersecurity", "TensorFlow", "GraphQL",
];

export const CAREER_MAP = {
  "frontend developer": {
    label: "Frontend Developer",
    icon: "\uD83C\uDF10",
    difficulty: "Medium",
    demand: "Very High",
    salaryRange: "$80k - $160k",
    growthPath: "Junior → Mid → Senior → Lead → Architect",
    prerequisites: ["Basic computer literacy", "Familiarity with web concepts"],
    estimatedTimeline: "6-12 months",
    hiringReadiness: 85,
    phases: genPhases([
      { t: "Web Foundations", st: "Core building blocks", sk: ["HTML5 Semantics", "CSS3 & Flexbox/Grid", "Responsive Design", "JavaScript Fundamentals", "DOM Manipulation", "Git Basics"], te: ["HTML5", "CSS3", "JavaScript", "Git"], pr: ["Personal portfolio site", "Responsive landing page clone", "Interactive To-Do app"], co: ["FreeCodeCamp Responsive Web Design", "The Odin Project Foundations", "JavaScript.info Tutorial"], yo: ["Traversy Media", "Kevin Powell"], ce: ["Microsoft Certified: HTML/CSS"] },
      { t: "JavaScript Deep Dive", st: "Modern JS mastery", sk: ["ES6+ (Arrow, Destructuring, Spread)", "Async/Await & Promises", "Closures & Scope", "Array Methods", "Error Handling", "Module Systems"], te: ["Node.js", "npm", "Webpack", "Vite"], pr: ["Weather app with API", "Typing speed test game", "E-commerce product filter"], co: ["JavaScript: The Hard Parts", "You Don't Know JS", "JavaScript 30 by Wes Bos"], yo: ["The Net Ninja", "Web Dev Simplified"], ce: ["Google: Technical JavaScript"] },
      { t: "React Ecosystem", st: "Build modern UIs", sk: ["React Fundamentals", "Hooks (useState, useEffect, custom)", "State Management", "React Router", "Component Patterns", "Tailwind CSS"], te: ["React", "TypeScript", "Tailwind", "Vite"], pr: ["Task management dashboard", "Movie discovery app", "Real-time chat app"], co: ["Epic React (Kent C. Dodds)", "React Docs", "Scrimba Learn React"], yo: ["Ben Awad", "Jack Herrington"], ce: ["Meta Frontend Developer Certificate"] },
      { t: "Advanced Frontend", st: "Production-ready skills", sk: ["Testing (Jest, RTL)", "Performance Optimization", "Accessibility (a11y)", "CI/CD Frontend", "Monorepo Management", "Design Systems"], te: ["Next.js", "Jest", "Storybook", "Figma"], pr: ["Component library with Storybook", "SSR blog with Next.js", "Accessible form builder"], co: ["Epic Web (Kent C. Dodds)", "Testing JavaScript", "Frontend Masters Path"], yo: ["Theo - t3.gg", "Fireship"], ce: ["AWS Certified Frontend"] },
      { t: "Full Stack Integration", st: "Bridge front & back end", sk: ["REST API Integration", "GraphQL Basics", "Auth (JWT, OAuth)", "Deployment (Vercel/Netlify)", "WebSockets", "Database Fundamentals"], te: ["Node.js", "GraphQL", "MongoDB", "Docker"], pr: ["Full-stack social clone", "Real-time collab tool", "SaaS dashboard"], co: ["Full Stack Open (Helsinki)", "Modern GraphQL Bootcamp", "AWS Certified Developer"], yo: ["Hussein Nasser", "Web Dev Simplified"], ce: ["AWS Certified Developer Associate"] },
    ]),
  },
  "ai engineer": {
    label: "AI Engineer",
    icon: "\uD83E\uDD16",
    difficulty: "Hard",
    demand: "Very High",
    salaryRange: "$120k - $220k",
    growthPath: "Junior ML → ML Engineer → Senior AI → AI Architect → AI Research Lead",
    prerequisites: ["Strong mathematics background", "Programming fundamentals", "Basic statistics"],
    estimatedTimeline: "12-24 months",
    hiringReadiness: 88,
    phases: genPhases([
      { t: "Programming & Math", st: "Foundations for AI", sk: ["Python Fundamentals", "NumPy & Pandas", "Linear Algebra", "Probability & Statistics", "Calculus Basics", "Git"], te: ["Python", "NumPy", "Pandas", "Jupyter"], pr: ["Real-world data analysis", "Statistics calculator", "Matrix library"], co: ["Python for Everybody", "Khan Academy Linear Algebra", "StatQuest YouTube"], yo: ["StatQuest", "3Blue1Brown"], ce: ["Google Data Analytics Certificate"] },
      { t: "ML Fundamentals", st: "Core machine learning", sk: ["Supervised Learning", "Unsupervised Learning", "Feature Engineering", "Model Evaluation", "Cross-validation", "Data Visualization"], te: ["scikit-learn", "Matplotlib", "Seaborn", "XGBoost"], pr: ["House price prediction", "Customer segmentation", "Spam classifier"], co: ["Andrew Ng ML Specialization", "Kaggle Learn ML", "Hands-On ML (Géron)"], yo: ["Sentdex", "Ken Jee"], ce: ["TensorFlow Developer Certificate"] },
      { t: "Deep Learning", st: "Neural networks mastery", sk: ["Neural Network Architecture", "CNNs for CV", "RNNs/LSTMs", "Transfer Learning", "Regularization", "TensorBoard"], te: ["TensorFlow", "PyTorch", "Keras", "OpenCV"], pr: ["Image classifier CNN", "Sentiment analysis", "Gesture recognition"], co: ["Deep Learning Specialization", "FastAI Practical DL", "PyTorch Course"], yo: ["Aladdin Persson", "Nicholas Renotte"], ce: ["DeepLearning.AI TensorFlow Developer"] },
      { t: "NLP & LLMs", st: "Language AI frontier", sk: ["Tokenization & Embeddings", "Transformer Architecture", "BERT", "LLM Fine-tuning (LoRA)", "RAG Systems", "Prompt Engineering"], te: ["Hugging Face", "LangChain", "OpenAI API", "Weaviate"], pr: ["RAG chatbot", "Document Q&A system", "Text-to-SQL app"], co: ["Hugging Face NLP Course", "Stanford CS224n", "LangChain Bootcamp"], yo: ["Sam Witteveen", "James Briggs"], ce: ["Hugging Face NLP Certificate"] },
      { t: "MLOps & Production", st: "Ship AI to production", sk: ["Model Serving (FastAPI)", "Docker & K8s", "CI/CD for ML", "Monitoring & Drift", "A/B Testing", "Cloud ML (SageMaker)"], te: ["Docker", "FastAPI", "AWS", "MLflow"], pr: ["End-to-end ML pipeline", "Model monitoring dashboard", "Serverless inference API"], co: ["MLOps Specialization", "Full Stack Deep Learning", "Made With ML"], yo: ["TechWorld with Nana", "AI Engineering"], ce: ["AWS Certified ML Specialty"] },
    ]),
  },
  "backend developer": {
    label: "Backend Developer",
    icon: "\uD83D\uDCC2\uFE0F",
    difficulty: "Medium",
    demand: "High",
    salaryRange: "$85k - $170k",
    growthPath: "Junior → Mid → Senior → Lead → Architect",
    prerequisites: ["Basic programming knowledge", "Understanding of web concepts"],
    estimatedTimeline: "6-12 months",
    hiringReadiness: 82,
    phases: genPhases([
      { t: "Language Foundations", st: "Pick your stack", sk: ["Python or JavaScript/TS", "OOP Principles", "Data Structures & Algorithms", "Error Handling", "Shell & Terminal", "Git"], te: ["Python", "Node.js", "TypeScript", "Git"], pr: ["CLI task manager", "File organizer script", "Basic HTTP server"], co: ["The Odin Project NodeJS", "Python Crash Course", "Harvard CS50"], yo: ["Corey Schafer", "The Net Ninja"], ce: ["PCEP Python Certificate"] },
      { t: "Backend Basics", st: "Servers & APIs", sk: ["HTTP Protocol", "REST Principles", "Express.js / FastAPI", "Middleware Architecture", "Input Validation", "API Documentation"], te: ["Express", "FastAPI", "Postman", "Swagger"], pr: ["RESTful blog API", "URL shortener", "Weather API proxy"], co: ["FreeCodeCamp Backend APIs", "FastAPI Tutorial", "REST API Design"], yo: ["Web Dev Simplified", "TechWithTim"], ce: ["Meta Backend Developer Certificate"] },
      { t: "Database & Auth", st: "Store & secure data", sk: ["PostgreSQL", "MongoDB/Redis", "ORM (Prisma, Mongoose)", "Authentication (JWT)", "Authorization (RBAC)", "Database Design"], te: ["PostgreSQL", "MongoDB", "Redis", "Prisma"], pr: ["E-commerce backend", "Leaderboard with Redis", "Multi-tenant SaaS API"], co: ["PostgreSQL Bootcamp", "MongoDB University M001", "Auth0 Blog"], yo: ["Hussein Nasser", "Coding Garden"], ce: ["MongoDB Developer Certificate"] },
      { t: "Advanced Backend", st: "Scale & optimize", sk: ["Message Queues (RabbitMQ)", "Caching Strategies", "WebSockets", "Microservices", "Rate Limiting", "API Gateway"], te: ["Docker", "Nginx", "Socket.io", "GraphQL"], pr: ["Real-time notifications", "Rate-limited gateway", "Microservices platform"], co: ["System Design Primer", "Microservices with Node", "Grokking System Design"], yo: ["Hussein Nasser", "ByteByteGo"], ce: ["AWS Certified Developer"] },
      { t: "DevOps & Cloud", st: "Deploy & maintain", sk: ["CI/CD (GitHub Actions)", "Container Orchestration", "Cloud (AWS/GCP/Azure)", "Infrastructure as Code", "Monitoring", "Logging"], te: ["AWS", "Docker", "Kubernetes", "GitHub Actions"], pr: ["IaC deployment", "K8s microservices", "Auto CI/CD pipeline"], co: ["AWS Certified SA", "Docker & K8s (KodeKloud)", "DevOps Bootcamp"], yo: ["TechWorld with Nana", "Fireship"], ce: ["AWS Certified Solutions Architect"] },
    ]),
  },
  "data scientist": {
    label: "Data Scientist",
    icon: "\uD83D\uDCCA",
    difficulty: "Hard",
    demand: "Very High",
    salaryRange: "$110k - $200k",
    growthPath: "Junior → Data Scientist → Senior → Lead → Principal",
    prerequisites: ["Strong statistics background", "Programming (Python)", "Mathematics"],
    estimatedTimeline: "12-18 months",
    hiringReadiness: 80,
    phases: genPhases([
      { t: "Math & Statistics", st: "Quantitative foundations", sk: ["Probability Theory", "Statistical Inference", "Linear Algebra", "Calculus", "Bayesian Statistics", "Experimental Design"], te: ["Python", "Jupyter", "R", "LaTeX"], pr: ["Statistical analysis report", "A/B testing simulation", "Monte Carlo simulator"], co: ["Statistics with Python (Coursera)", "Khan Academy Statistics", "Harvard Stats 110"], yo: ["StatQuest", "3Blue1Brown"], ce: ["IBM Data Science Certificate"] },
      { t: "Data Wrangling", st: "Clean & prepare data", sk: ["Data Cleaning", "SQL for Data", "ETL Pipelines", "Web Scraping", "Data Validation", "Feature Engineering"], te: ["Pandas", "SQL", "BeautifulSoup", "dbt"], pr: ["Data cleaning pipeline", "Automated ETL job", "API data ingestion system"], co: ["Data Wrangling with Python", "SQL for Data Analysis", "Data Engineering Bootcamp"], yo: ["Data School", "Sentdex"], ce: ["Google Data Analytics Certificate"] },
      { t: "ML & Modeling", st: "Build predictive models", sk: ["Regression Models", "Classification", "Clustering", "Time Series", "Ensemble Methods", "Model Tuning"], te: ["scikit-learn", "XGBoost", "Statsmodels", "Optuna"], pr: ["Sales forecasting model", "Customer churn predictor", "Recommendation system"], co: ["Andrew Ng ML", "Kaggle Courses", "Applied Data Science with Python"], yo: ["Ken Jee", "Data Professor"], ce: ["TensorFlow Developer Certificate"] },
      { t: "Data Visualization", st: "Tell stories with data", sk: ["Matplotlib/Seaborn", "Interactive Viz", "Dashboard Design", "Storytelling", "Report Generation", "BI Tools"], te: ["Tableau", "Power BI", "Plotly", "Dash"], pr: ["Interactive dashboard", "Executive report suite", "Real-time data viz"], co: ["Tableau Training", "Power BI Data Analysis", "Data Visualization Course"], yo: ["Andy Kriebel", "SQLBI"], ce: ["Tableau Desktop Specialist"] },
      { t: "MLOps & Deployment", st: "Ship data products", sk: ["Model Deployment", "Docker for Data Science", "API Development", "Model Monitoring", "A/B Testing", "Cloud ML"], te: ["FastAPI", "Docker", "AWS SageMaker", "MLflow"], pr: ["Deployed ML API", "Model monitoring system", "Auto-retraining pipeline"], co: ["MLOps Specialization", "Data Engineering Zoomcamp", "Deploying ML Models"], yo: ["AI Engineering", "TechWorld with Nana"], ce: ["AWS Certified ML Specialty"] },
    ]),
  },
  "cybersecurity": {
    label: "Cybersecurity Analyst",
    icon: "\uD83D\uDD12",
    difficulty: "Hard",
    demand: "Very High",
    salaryRange: "$90k - $180k",
    growthPath: "Junior Analyst → Analyst → Senior → Lead → CISO",
    prerequisites: ["Networking basics", "Operating systems knowledge", "Scripting fundamentals"],
    estimatedTimeline: "12-18 months",
    hiringReadiness: 75,
    phases: genPhases([
      { t: "Networking & OS", st: "Core infrastructure", sk: ["TCP/IP Stack", "Network Protocols", "Linux Administration", "Windows Security", "Virtualization", "Firewall Concepts"], te: ["Linux", "Wireshark", "VirtualBox", "pfSense"], pr: ["Network topology mapper", "IDS setup with Snort", "Hardened Linux server"], co: ["CompTIA Network+", "Linux Fundamentals (Linux Journey)", "Microsoft Learn Windows"], yo: ["NetworkChuck", "Professor Messer"], ce: ["CompTIA Network+"] },
      { t: "Security Fundamentals", st: "Core security concepts", sk: ["Cryptography Basics", "Authentication Methods", "Access Control", "Security Policies", "Risk Assessment", "Compliance (GDPR/HIPAA)"], te: ["OpenSSL", "KeePass", "Nmap", "Burp Suite"], pr: ["Security audit report", "PKI implementation", "Compliance checklist tool"], co: ["CompTIA Security+", "ISC2 CISSP (intro)", "SANS Cyber Aces"], yo: ["Professor Messer", "John Hammond"], ce: ["CompTIA Security+"] },
      { t: "Threat Detection", st: "Find the bad guys", sk: ["Vulnerability Assessment", "Penetration Testing", "Malware Analysis", "Log Analysis (SIEM)", "Incident Response", "Threat Intelligence"], te: ["Metasploit", "Splunk", "Wireshark", "ELK Stack"], pr: ["Vulnerability scanner", "SIEM dashboard", "Incident playbook"], co: ["Practical Ethical Hacking (TCM)", "Splunk Fundamentals", "TryHackMe Paths"], yo: ["John Hammond", "IppSec"], ce: ["CEH (Certified Ethical Hacker)"] },
      { t: "Advanced Security", st: "Specialized skills", sk: ["Web Application Security", "Cloud Security (CSPM)", "Active Directory", "Red Team Ops", "Purple Teaming", "Security Automation"], te: ["AWS Security Hub", "BloodHound", "Cobalt Strike", "Terraform"], pr: ["Security automation with SOAR", "Cloud security posture tool", "Phishing simulation platform"], co: ["OSCP (Offensive Security)", "AWS Security Specialty", "Red Team Ops"], yo: ["IppSec", "The Cyber Mentor"], ce: ["OSCP", "AWS Security Specialty"] },
      { t: "Governance & Leadership", st: "Lead security strategy", sk: ["Security Architecture", "CISO Strategy", "Board Communication", "Budget Planning", "Team Management", "Vendor Risk"], te: ["GRC Tools", "Risk Register", "Audit Frameworks", "Board Reporting"], pr: ["Security program roadmap", "Executive dashboard", "RFP security evaluation"], co: ["CISSP Certification", "CISM Certification", "SANS Management"], yo: ["Gerald Auger", "Cyber Security Headlines"], ce: ["CISSP", "CISM"] },
    ]),
  },
  "devops engineer": {
    label: "DevOps Engineer",
    icon: "\u26A1",
    difficulty: "Hard",
    demand: "Very High",
    salaryRange: "$100k - $195k",
    growthPath: "Jr DevOps → DevOps → Sr DevOps → Platform Eng → Cloud Architect",
    prerequisites: ["Linux basics", "Scripting (Python/Bash)", "Networking fundamentals"],
    estimatedTimeline: "8-16 months",
    hiringReadiness: 80,
    phases: genPhases([
      { t: "Linux & Scripting", st: "Foundation layer", sk: ["Linux Administration", "Bash Scripting", "Python Automation", "Text Processing (sed/awk)", "Package Management", "System Monitoring"], te: ["Ubuntu/CentOS", "Bash", "Python", "htop/netstat"], pr: ["Automated backup script", "System monitoring tool", "Provisioning script"], co: ["Linux Journey", "Bash Scripting Course", "Python for DevOps"], yo: ["NetworkChuck", "Learn Linux TV"], ce: ["Linux Professional Institute LPIC-1"] },
      { t: "Version Control & CI", st: "Automate everything", sk: ["Git Advanced", "GitHub/GitLab Flow", "CI/CD Pipelines", "Build Tools", "Artifact Management", "Semantic Versioning"], te: ["Git", "GitHub Actions", "Jenkins", "GitLab CI"], pr: ["CI pipeline with tests", "Multi-branch deployment", "Release automation"], co: ["GitHub Actions Docs", "Jenkins CI/CD Course", "Git Deep Dive"], yo: ["TechWorld with Nana", "DevOps Directive"], ce: ["GitHub Actions Certificate"] },
      { t: "Containerization & K8s", st: "Modern orchestration", sk: ["Docker Deep Dive", "Docker Compose", "Kubernetes Basics", "Pod & Deployment Mgmt", "Helm Charts", "Service Mesh (Istio)"], te: ["Docker", "Kubernetes", "Helm", "Istio"], pr: ["Microservices with Docker", "K8s cluster setup", "Helm chart repository"], co: ["Docker Mastery (KodeKloud)", "CKA Certification Course", "K8s the Hard Way"], yo: ["TechWorld with Nana", "That DevOps Guy"], ce: ["CKA (Certified K8s Admin)"] },
      { t: "Cloud & IaC", st: "Infrastructure as code", sk: ["AWS/GCP Basics", "Terraform Deep", "CloudFormation", "Configuration Mgmt", "Secrets Management", "Cloud Networking"], te: ["AWS", "Terraform", "Ansible", "Vault"], pr: ["Full IaC deployment", "Multi-cloud setup", "Secrets rotation system"], co: ["Terraform Associate Course", "AWS Certified SA", "Ansible for DevOps"], yo: ["That DevOps Guy", "FreeCodeCamp AWS"], ce: ["AWS Solutions Architect", "Terraform Associate"] },
      { t: "Observability & SRE", st: "Run reliable systems", sk: ["Monitoring (Prometheus)", "Logging (ELK/Loki)", "Tracing (Jaeger)", "SLI/SLO/SLA", "Incident Management", "Chaos Engineering"], te: ["Prometheus", "Grafana", "ELK Stack", "Jaeger"], pr: ["Full observability stack", "SLO dashboard", "Chaos experiment tool"], co: ["SRE Course (KodeKloud)", "Prometheus Monitoring", "Grafana Dashboards"], yo: ["TechWorld with Nana", "Linux Academy"], ce: ["Prometheus Certified"] },
    ]),
  },
  "ui ux designer": {
    label: "UI/UX Designer",
    icon: "\uD83C\uDFA8",
    difficulty: "Medium",
    demand: "High",
    salaryRange: "$75k - $150k",
    growthPath: "Junior → Mid → Senior → Lead → Design Director",
    prerequisites: ["Creativity & visual sense", "Basic design tools", "User empathy"],
    estimatedTimeline: "6-12 months",
    hiringReadiness: 78,
    phases: genPhases([
      { t: "Design Fundamentals", st: "Visual foundations", sk: ["Color Theory", "Typography", "Layout & Composition", "Visual Hierarchy", "Iconography", "Grid Systems"], te: ["Figma", "Adobe Illustrator", "Pen & Paper", "Miro"], pr: ["Mood board collection", "Icon set design", "Typography poster"], co: ["Google UX Design Certificate", "Figma 101", "Color Theory Course"], yo: ["Flux Academy", "Satori Graphics"], ce: ["Google UX Design Certificate"] },
      { t: "User Research", st: "Know your users", sk: ["User Interviews", "Survey Design", "Persona Creation", "Journey Mapping", "Usability Testing", "Data Synthesis"], te: ["Miro", "Notion", "Maze", "Hotjar"], pr: ["User research study", "Persona set for an app", "Usability test report"], co: ["User Research Methods (Interaction Design)", "UX Research Course (Coursera)", "Nielsen Norman Group"], yo: ["AJ&Smart", "NNgroup"], ce: ["UX Research Certificate (NN/g)"] },
      { t: "Interaction Design", st: "Craft experiences", sk: ["Wireframing", "Prototyping", "Micro-interactions", "Motion Design", "Responsive Design", "Accessibility (a11y)"], te: ["Figma (advanced)", "Principle", "After Effects", "Protopie"], pr: ["Full app prototype", "Animation library", "Accessible component system"], co: ["Interaction Design Specialization", "Figma Prototyping", "Motion Design for UI"], yo: ["Hello, I'm Alex", "Meng To"], ce: ["Figma Certified"] },
      { t: "Design Systems", st: "Scale design", sk: ["Component Architecture", "Design Tokens", "Documentation", "DesignOps", "Handoff Process", "Version Control for Design"], te: ["Figma (variants)", "Storybook", "Zeroheight", "Abstract"], pr: ["Complete design system", "Component playground", "Handoff automation"], co: ["Design Systems Course (Design+Code)", "Figma Design Systems", "Storybook Tutorial"], yo: ["Design Systems 101", "Figma YouTube"], ce: ["Figma Advanced Certificate"] },
      { t: "UX Strategy", st: "Lead with design", sk: ["Product Strategy", "Design Thinking", "Metrics & Analytics", "A/B Testing", "Stakeholder Management", "Design Leadership"], te: ["Amplitude", "Optimizely", "Notion", "Slack"], pr: ["Product strategy document", "A/B test experiment", "Design maturity assessment"], co: ["UX Strategy Course (Coursera)", "Design Leadership (IDEO U)", "Product Design (Springboard)"], yo: ["AJ&Smart", "Design Better Podcast"], ce: ["Product Design Certificate (Springboard)"] },
    ]),
  },
  "blockchain developer": {
    label: "Blockchain Developer",
    icon: "\uD83D\uDD17",
    difficulty: "Hard",
    demand: "Growing",
    salaryRange: "$100k - $200k",
    growthPath: "Junior → Developer → Senior → Lead → CTO",
    prerequisites: ["Solid programming", "Understanding of cryptography", "Basic economics"],
    estimatedTimeline: "12-18 months",
    hiringReadiness: 70,
    phases: genPhases([
      { t: "Foundations", st: "Blockchain basics", sk: ["Cryptography (Hashing, Signatures)", "Blockchain Architecture", "Consensus Mechanisms (PoW/PoS)", "Smart Contracts", "Wallets & Addresses", "Gas & Fees"], te: ["MetaMask", "Remix IDE", "Etherscan", "Ganache"], pr: ["Simple blockchain in Python", "Blockchain explorer", "Wallet generator"], co: ["Blockchain Specialization (Coursera)", "MIT Blockchain Course", "Cryptography Course"], yo: ["DappUniversity", "Patrick Collins"], ce: ["Blockchain Developer Certificate (ConsenSys)"] },
      { t: "Smart Contracts", st: "EVM & Solidity", sk: ["Solidity Language", "ERC Standards (20, 721, 1155)", "Testing with Hardhat", "EVM Architecture", "Event Logging", "Security Best Practices"], te: ["Solidity", "Hardhat", "Ethers.js", "OpenZeppelin"], pr: ["NFT collection", "Token swap contract", "Crowdfunding DApp"], co: ["Cryptozombies", "Solidity Course (Patrick Collins)", "Ethereum Dev Course"], yo: ["Patrick Collins", "DappUniversity"], ce: ["ConsenSys Blockchain Developer"] },
      { t: "DApp Development", st: "Full-stack Web3", sk: ["Web3.js/Ethers.js", "Wallet Connect", "IPFS & Filecoin", "The Graph (Subgraphs)", "Frontend Integration", "Gas Optimization"], te: ["Ethers.js", "IPFS", "The Graph", "RainbowKit"], pr: ["Full-stack DApp", "Decentralized marketplace", "DAO dashboard"], co: ["Buildspace.so", "Alchemy University", "Scaffold-ETH"], yo: ["Patrick Collins", "EatTheBlocks"], ce: ["Alchemy Ethereum Developer"] },
      { t: "Advanced Blockchain", st: "Scale & specialize", sk: ["Layer 2 (Optimism, Arbitrum)", "Cross-chain Bridges", "ZK-Proofs Basics", "DeFi Protocols", "Chainlink Oracles", "MEV & Bots"], te: ["Hardhat (advanced)", "Chainlink", "The Graph", "DefiLlama"], pr: ["DeFi lending protocol", "Cross-chain bridge", "Flash loan bot"], co: ["DeFi Course (Finematics)", "ZK Proofs Course", "Chainlink Tutorials"], yo: ["Finematics", "Chanson"], ce: ["Chainlink Certified"] },
      { t: "Production & Security", st: "Ship secure code", sk: ["Audit Fundamentals", "Formal Verification", "Gas Optimization", "Upgradeable Contracts", "Multisig & Timelock", "$\\lambda$ Protocols"], te: ["Slither", "Echidna", "Tenderly", "Safe"], pr: ["Security audit report", "Upgradeable system", "Emergency stop mechanism"], co: ["Secureum", "Ethernaut CTF", "Audit Course (RareSkills)"], yo: ["Secureum", "0xSanson"], ce: ["Trail of Bits Certified"] },
    ]),
  },
  "game developer": {
    label: "Game Developer",
    icon: "\uD83C\uDFAE",
    difficulty: "Hard",
    demand: "Moderate",
    salaryRange: "$60k - $140k",
    growthPath: "Junior → Developer → Senior → Lead → Technical Director",
    prerequisites: ["Programming basics", "Creativity", "Math (vectors, matrices)"],
    estimatedTimeline: "12-24 months",
    hiringReadiness: 72,
    phases: genPhases([
      { t: "Programming & Math", st: "Game dev foundations", sk: ["C# or C++ Fundamentals", "OOP for Games", "Vector Math", "Physics for Games", "Data Structures", "Memory Management"], te: ["C#", "C++", "Unity", ".NET"], pr: ["Console text adventure", "2D physics sandbox", "Simple game engine"], co: ["Unity Learn Pathways", "Harvard CS50 Gamedev", "C++ for Games (Game Institute)"], yo: ["Brackeys", "Game Maker's Toolkit"], ce: ["Unity Certified User"] },
      { t: "Unity Engine", st: "Master the engine", sk: ["Unity Editor Deep", "GameObjects & Components", "Animation System", "Physics & Collision", "UI System (uGUI)", "Scriptable Objects"], te: ["Unity", "C#", "Shader Graph", "Timeline"], pr: ["2D platformer game", "3D first-person shooter", "Racing game prototype"], co: ["Complete Unity Course (Udemy)", "Unity Game Dev (Coursera)", "Unity Documentation"], yo: ["Brackeys", "Code Monkey"], ce: ["Unity Certified Developer"] },
      { t: "Graphics & Rendering", st: "Make it beautiful", sk: ["Shader Programming", "Lighting & Shadows", "Post-processing", "VFX (Particles)", "Optimization (LOD)", "URP/HDRP"], te: ["Shader Graph", "HLSL", "Blender", "Photoshop"], pr: ["Custom shader pack", "Procedural terrain gen", "VFX demo reel"], co: ["Shader Graph Course", "GPU Gems Series", "Learn OpenGL"], yo: ["Freya Holmér", "Ben Cloward"], ce: ["Unity VFX Certificate"] },
      { t: "Multiplayer & Networking", st: "Connect players", sk: ["Networking Architecture", "Authority & Ownership", "RPC & Commands", "Matchmaking", "Lag Compensation", "Dedicated Servers"], te: ["Photon", "Netcode for GameObjects", "Steamworks", "PlayFab"], pr: ["Multiplayer FPS prototype", "Co-op adventure game", "Online leaderboard system"], co: ["Unity Multiplayer Course", "Netcode Docs", "Game Networking (Gaffer on Games)"], yo: ["Tom Weiland", "Dapper Dino"], ce: ["Unity Multiplayer Certificate"] },
      { t: "Shipping & Polish", st: "Release a game", sk: ["Game Design Docs", "Level Design", "Audio Integration", "Localization", "Store Submission", "Live Operations"], te: ["Steamworks", "FMOD", "Steam", "Unity Analytics"], pr: ["Complete game release", "Demo trailer", "Steam store page"], co: ["Game Production Course", "Steam Developer Docs", "Game Marketing Guide"], yo: ["Game Dev Unlocked", "Thomas Brush"], ce: ["Steam Developer Certificate"] },
    ]),
  },
  "machine learning engineer": {
    label: "Machine Learning Engineer",
    icon: "\uD83E\uDDE0",
    difficulty: "Hard",
    demand: "Very High",
    salaryRange: "$120k - $220k",
    growthPath: "Jr ML → ML Engineer → Sr ML → ML Architect → AI Director",
    prerequisites: ["Python proficiency", "Statistics & calculus", "Data structures"],
    estimatedTimeline: "12-20 months",
    hiringReadiness: 85,
    phases: genPhases([
      { t: "Python & Data Science", st: "ML foundations", sk: ["Python (advanced)", "NumPy/Pandas", "SQL", "Data Visualization", "Statistical Analysis", "Experimental Design"], te: ["Python", "Pandas", "Jupyter", "Git"], pr: ["Data analysis pipeline", "Statistical modeling", "Visualization dashboard"], co: ["Python for Data Science (Datacamp)", "Intro to Stats with Python", "SQL for Data Science"], yo: ["Data School", "StatQuest"], ce: ["IBM Data Science Certificate"] },
      { t: "Classic ML", st: "Core algorithms", sk: ["Regression Models", "Classification (SVM, Trees)", "Ensemble Methods", "Clustering", "Dimensionality Reduction", "Model Evaluation"], te: ["scikit-learn", "XGBoost", "LightGBM", "Optuna"], pr: ["Fraud detection model", "Customer segmentation", "Recommendation engine"], co: ["Andrew Ng ML Specialization", "ML Mastery (Jason Brownlee)", "Kaggle Competitions"], yo: ["Kaggle Grandmasters", "Ken Jee"], ce: ["TensorFlow Developer Certificate"] },
      { t: "Deep Learning", st: "Neural networks", sk: ["Neural Network Architecture", "CNNs", "RNNs/Transformers", "Transfer Learning", "GANs Basics", "Autoencoders"], te: ["TensorFlow", "PyTorch", "Keras", "Weights & Biases"], pr: ["Image classifier", "Neural translation model", "Anomaly detection system"], co: ["Deep Learning Specialization", "FastAI", "PyTorch Zero to GANs"], yo: ["Aladdin Persson", "Nicholas Renotte"], ce: ["DeepLearning.AI TF Developer"] },
      { t: "Production ML", st: "Ship models", sk: ["Model Serving", "Feature Stores", "Data Pipelines", "ML Pipelines (Kubeflow)", "Model Versioning", "Monitoring & Retraining"], te: ["Docker", "Kubernetes", "MLflow", "AWS SageMaker"], pr: ["End-to-end ML system", "Feature store implementation", "Auto-retraining pipeline"], co: ["MLOps Specialization", "Full Stack Deep Learning", "Kubeflow Tutorial"], yo: ["AI Engineering", "TechWorld with Nana"], ce: ["AWS Certified ML Specialty"] },
      { t: "Advanced AI", st: "Cutting edge", sk: ["LLMs & GenAI", "RAG Systems", "RLHF", "Fine-tuning (LoRA/QLoRA)", "Model Compression", "Edge ML"], te: ["LangChain", "Hugging Face", "Weaviate", "ONNX"], pr: ["RAG Q&A system", "Fine-tuned LLM app", "Edge deployment demo"], co: ["Hugging Face NLP Course", "LangChain Bootcamp", "Stanford CS224N"], yo: ["Sam Witteveen", "James Briggs"], ce: ["Hugging Face ML Engineer"] },
    ]),
  },
  "android developer": {
    label: "Android Developer",
    icon: "\uD83D\uDCF1",
    difficulty: "Medium",
    demand: "High",
    salaryRange: "$80k - $160k",
    growthPath: "Junior → Developer → Senior → Lead → Architect",
    prerequisites: ["Java or Kotlin basics", "OOP concepts", "Familiarity with mobile"],
    estimatedTimeline: "6-12 months",
    hiringReadiness: 80,
    phases: genPhases([
      { t: "Kotlin & Android Basics", st: "Build your first app", sk: ["Kotlin Fundamentals", "Android Studio Setup", "Activity & Fragment Lifecycle", "Layouts (XML/Jetpack Compose)", "Resources & Assets", "Debugging"], te: ["Kotlin", "Android Studio", "Gradle", "ADB"], pr: ["Calculator app", "Note-taking app", "Unit converter app"], co: ["Android Basics in Kotlin (Google)", "Kotlin Bootcamp (Udacity)", "Android Developer Docs"], yo: ["Philipp Lackner", "Coding in Flow"], ce: ["Google Associate Android Developer"] },
      { t: "UI Development", st: "Beautiful interfaces", sk: ["Jetpack Compose", "Material Design 3", "Custom Views", "Animations & Transitions", "ConstraintLayout", "Theming"], te: ["Jetpack Compose", "Material3", "Lottie", "Coil"], pr: ["Weather app with animations", "Social media UI clone", "Music player UI"], co: ["Jetpack Compose Course", "Material Design Guidelines", "Android UI Masterclass"], yo: ["Philipp Lackner", "Stevdza-San"], ce: ["Google UI Developer Certificate"] },
      { t: "Data & Networking", st: "Connect your app", sk: ["Retrofit & OkHttp", "Room Database", "DataStore", "REST API Integration", "JSON Parsing", "Offline-first Architecture"], te: ["Retrofit", "Room", "Hilt", "Firebase"], pr: ["News reader app", "E-commerce app", "Social feed app"], co: ["Android Data Course (Coursera)", "Firebase for Android", "REST API with Kotlin"], yo: ["Philipp Lackner", "Coding in Flow"], ce: ["Firebase Developer Certificate"] },
      { t: "Architecture & Testing", st: "Production-ready", sk: ["MVVM/MVI Architecture", "Clean Architecture", "Dependency Injection (Hilt)", "Unit Testing (JUnit)", "UI Testing (Compose Test)", "Coroutines & Flow"], te: ["Hilt", "JUnit", "Mockk", "Turbine"], pr: ["Clean architecture app", "Tested codebase", "Modular Android app"], co: ["Android Architecture Course", "Testing Android Apps", "Kotlin Coroutines Deep"], yo: ["Android Developers", "Kotlin Dev YouTube"], ce: ["Google Associate Android Developer"] },
      { t: "Publishing & Growth", st: "Ship & scale", sk: ["Google Play Console", "App Signing & ProGuard", "App Bundle (AAB)", "Performance (Profiler)", "Crashlytics & Analytics", "App Store Optimization"], te: ["Play Console", "Firebase", "ProGuard", "Billing Library"], pr: ["Published app on Play Store", "A/B test experiment", "Analytics Dashboard"], co: ["Google Play Academy", "Android Performance Course", "App Marketing Guide"], yo: ["Android Developers", "Coding in Flow"], ce: ["Google Play Developer Certificate"] },
    ]),
  },
  "cloud engineer": {
    label: "Cloud Engineer",
    icon: "\u2601\uFE0F",
    difficulty: "Hard",
    demand: "Very High",
    salaryRange: "$100k - $190k",
    growthPath: "Jr Cloud → Engineer → Senior → Lead → Cloud Architect",
    prerequisites: ["Linux basics", "Networking concepts", "Scripting"],
    estimatedTimeline: "8-14 months",
    hiringReadiness: 78,
    phases: genPhases([
      { t: "Cloud Fundamentals", st: "Core concepts", sk: ["Cloud Computing Models", "AWS/GCP/Azure Overview", "Virtual Private Cloud", "EC2/Compute Services", "Identity & Access Mgmt", "Billing & Cost Mgmt"], te: ["AWS Console", "AWS CLI", "Terraform", "CloudShell"], pr: ["Multi-tier VPC setup", "Cost optimization report", "IAM policy framework"], co: ["AWS Cloud Practitioner", "GCP Cloud Digital Leader", "Microsoft Azure Fundamentals"], yo: ["TechWorld with Nana", "FreeCodeCamp AWS"], ce: ["AWS Certified Cloud Practitioner"] },
      { t: "Compute & Storage", st: "Build cloud infra", sk: ["Compute (EC2, Lambda)", "Object Storage (S3)", "Block Storage (EBS)", "CDN (CloudFront)", "DNS (Route53)", "Load Balancing"], te: ["AWS (core)", "Terraform", "Docker", "Nginx"], pr: ["Serverless API backend", "Scalable web app infra", "Multi-region CDN setup"], co: ["AWS Certified SA Associate", "Terraform Getting Started", "Docker for Cloud"], yo: ["TechWorld with Nana", "That DevOps Guy"], ce: ["AWS Certified SA Associate"] },
      { t: "Containers & Orchestration", st: "Modern deployment", sk: ["Docker Deep", "ECS/Fargate", "EKS (Kubernetes)", "Service Auto-scaling", "Service Mesh", "Helm"], te: ["Docker", "Kubernetes", "AWS ECS/EKS", "Helm"], pr: ["Containerized microservices", "K8s production cluster", "Service mesh setup"], co: ["Docker/K8s (KodeKloud)", "CKA Certification", "Amazon EKS Workshop"], yo: ["TechWorld with Nana", "That DevOps Guy"], ce: ["CKA", "AWS Certified DevOps Engineer"] },
      { t: "Networking & Security", st: "Secure cloud", sk: ["Advanced VPC Design", "Security Groups & NACLs", "VPN & Direct Connect", "WAF & Shield", "Secrets Manager", "CloudTrail & GuardDuty"], te: ["AWS WAF", "Terraform", "Vault", "Splunk"], pr: ["Secure multi-account setup", "Incident response automation", "Compliance monitoring"], co: ["AWS Security Specialty", "Cloud Security Course (SANS)", "Terraform Security"], yo: ["Cloud Security Podcast", "TechWorld with Nana"], ce: ["AWS Security Specialty"] },
      { t: "DevOps & Reliability", st: "Production excellence", sk: ["CI/CD Pipelines", "Infrastructure as Code", "Monitoring (CloudWatch)", "Chaos Engineering", "Disaster Recovery", "Well-Architected Framework"], te: ["GitHub Actions", "Terraform", "Prometheus", "Grafana"], pr: ["Full CI/CD pipeline", "DR plan & simulation", "Well-Architected review"], co: ["AWS DevOps Engineer Pro", "SRE Course (Coursera)", "Chaos Engineering Book"], yo: ["TechWorld with Nana", "DevOps Directive"], ce: ["AWS DevOps Engineer Professional"] },
    ]),
  },
  "ethical hacking": {
    label: "Ethical Hacker",
    icon: "\uD83D\uDD75\uFE0F",
    difficulty: "Hard",
    demand: "Very High",
    salaryRange: "$95k - $185k",
    growthPath: "Jr Pentester → Pentester → Senior → Lead → Principal",
    prerequisites: ["Networking knowledge", "Linux proficiency", "Programming basics"],
    estimatedTimeline: "14-24 months",
    hiringReadiness: 72,
    phases: genPhases([
      { t: "Networking & Linux", st: "Core foundation", sk: ["TCP/IP & OSI Model", "Routing & Switching", "Linux Administration", "Bash Scripting", "Virtualization", "Protocol Analysis"], te: ["Kali Linux", "Wireshark", "VirtualBox", "Nmap"], pr: ["Network scanning tool", "Packet analyzer script", "Hardened Kali workstation"], co: ["Practical Networking (TCM)", "Linux Privilege Escalation", "Wireshark Course"], yo: ["NetworkChuck", "IppSec"], ce: ["CompTIA Network+"] },
      { t: "Ethical Hacking Basics", st: "Core security skills", sk: ["Footprinting & Recon", "Vulnerability Scanning", "Enumeration Techniques", "Exploitation Basics", "Password Cracking", "Social Engineering"], te: ["Nmap", "Metasploit", "Burp Suite", "John the Ripper"], pr: ["Recon automation tool", "Vulnerability report", "CTF challenge solving"], co: ["Practical Ethical Hacking (TCM)", "HackTheBox Academy", "TryHackMe Pre-Path"], yo: ["The Cyber Mentor", "John Hammond"], ce: ["CEH (Certified Ethical Hacker)"] },
      { t: "Web App Pentesting", st: "Hack the web", sk: ["OWASP Top 10", "SQL Injection", "XSS & CSRF", "SSRF & LFI/RFI", "Authentication Bypass", "API Security"], te: ["Burp Suite Pro", "SQLMap", "FFUF", "Nuclei"], pr: ["Automated scanner", "Exploit PoC collection", "WAF bypass toolkit"], co: ["Web Application Hacking (TCM)", "PortSwigger Web Security", "PentesterLab"], yo: ["The Cyber Mentor", "Rana Khalil"], ce: ["OSCP (Offensive Security)"] },
      { t: "Advanced Exploitation", st: "Deep technical skills", sk: ["Binary Exploitation (Buffer Overflow)", "Active Directory Attacks", "Privilege Escalation", "Pivoting & Lateral", "C2 Frameworks", "AV Evasion"], te: ["BloodHound", "Cobalt Strike", "Impacket", "MSFVenom"], pr: ["AD lab exploitation", "C2 infrastructure setup", "Custom payload generator"], co: ["AD Attack Course (TCM)", "OSCP Prep Course", "Red Team Ops (Zero-Point)"], yo: ["IppSec", "HackTheBox Writeups"], ce: ["OSCP", "CRTP (AD Certification)"] },
      { t: "Red Team & Leadership", st: "Lead operations", sk: ["Red Team Operations", "Purple Teaming", "Report Writing", "Client Communication", "Team Management", "Advanced Persistence"], te: ["Cobalt Strike", "Sliver", "Mythic", "Covenant"], pr: ["Full red team engagement", "Detection engineering ruleset", "RTO playbook"], co: ["Red Team Ops (Zero-Point)", "SANS 560", "Advanced Red Team"], yo: ["Red Team Podcast", "SANS Offensive Ops"], ce: ["OSED", "OSEP"] },
    ]),
  },
  "full stack developer": {
    label: "Full Stack Developer",
    icon: "\uD83C\uDFE0",
    difficulty: "Medium",
    demand: "Very High",
    salaryRange: "$85k - $170k",
    growthPath: "Jr Full Stack → Developer → Senior → Lead → CTO",
    prerequisites: ["HTML/CSS basics", "Programming fundamentals", "Database concepts"],
    estimatedTimeline: "8-16 months",
    hiringReadiness: 84,
    phases: genPhases([
      { t: "Web Foundations", st: "Frontend core", sk: ["HTML5", "CSS3 (Flexbox/Grid)", "JavaScript ES6", "Responsive Design", "DOM Manipulation", "Git"], te: ["HTML5", "CSS3", "JavaScript", "Git"], pr: ["Responsive portfolio", "Landing page clone", "Interactive quiz app"], co: ["FreeCodeCamp", "The Odin Project", "CS50 Web"], yo: ["Traversy Media", "Web Dev Simplified"], ce: ["Meta Frontend Developer"] },
      { t: "Frontend Framework", st: "Modern UI dev", sk: ["React/Vue/Angular", "Component Architecture", "Routing", "State Management", "HTTP Client", "Form Management"], te: ["React", "Next.js", "TypeScript", "Tailwind"], pr: ["Task management SPA", "Dashboard with charts", "E-commerce frontend"], co: ["React (Frontend Masters)", "Next.js Docs", "TypeScript Course"], yo: ["Ben Awad", "Jack Herrington"], ce: ["Meta Frontend Developer Certificate"] },
      { t: "Backend & API", st: "Server-side dev", sk: ["Node.js/Express", "REST API Design", "Authentication (JWT)", "Database (SQL/NoSQL)", "Input Validation", "API Security"], te: ["Node.js", "Express", "PostgreSQL", "Prisma"], pr: ["Blog API", "File upload service", "Auth system"], co: ["Node.js Course (The Odin Project)", "Full Stack Open", "Backend Course (Udemy)"], yo: ["Web Dev Simplified", "Hussein Nasser"], ce: ["MongoDB Developer Certificate"] },
      { t: "DevOps & Deploy", st: "Ship & scale", sk: ["Docker", "CI/CD Pipelines", "Cloud Deployment", "Domain & SSL", "Monitoring", "Performance Optimization"], te: ["Docker", "GitHub Actions", "Vercel", "AWS"], pr: ["Full-stack app on AWS", "CI/CD pipeline", "Monitoring dashboard"], co: ["DevOps Course (KodeKloud)", "Docker Mastery", "AWS Practitioner"], yo: ["TechWorld with Nana", "Fireship"], ce: ["AWS Certified Developer"] },
      { t: "System Design & Growth", st: "Architecture scale", sk: ["System Design Basics", "Caching (Redis)", "Message Queues", "Microservices", "Testing (E2E)", "Code Review"], te: ["Redis", "Docker Compose", "Cypress", "Storybook"], pr: ["Scalable chat system", "Microservices refactor", "E2E test suite"], co: ["System Design Interview", "Microservices Course", "Testing JavaScript"], yo: ["ByteByteGo", "System Design Interview"], ce: ["Google Cloud Developer"] },
    ]),
  },
};

function genPhases(data) {
  return data.map((p, i) => ({
    phase: i + 1,
    title: p.t,
    subtitle: p.st,
    skills: p.sk,
    technologies: p.te.map(n => ({ name: n })),
    projects: p.pr,
    courses: p.co,
    youtube: p.yo || [],
    certifications: p.ce || [],
    resources: [
      ...p.co.slice(0, 2).map(c => ({ title: c, type: "course" })),
      ...p.yo.slice(0, 2).map(c => ({ title: c, type: "youtube" })),
      ...p.ce.slice(0, 2).map(c => ({ title: c, type: "certification" })),
    ],
    estimatedWeeks: 4 + Math.floor(Math.random() * 8),
    difficulty: i < 1 ? "Beginner" : i < 3 ? "Intermediate" : "Advanced",
  }));
}

function generateFallbackRoadmap(query) {
  const cap = query.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const isHard = query.toLowerCase().includes("engineer") || query.toLowerCase().includes("scientist") || query.toLowerCase().includes("architect");
  const phases = [];
  const techs = [
    ["Basics", "Fundamentals", [`${cap} Core Concepts`, `Industry Terminology`, `Tooling Setup`, `Version Control`, `Documentation`], ["Git", "VS Code", "Terminal"]],
    ["Intermediate", "Build skills", [`${cap} Core Practices`, `Project Architecture`, `Testing Fundamentals`, `Integration Patterns`, `Performance Basics`], ["Docker", "CI/CD", "Cloud Platform"]],
    ["Advanced", "Master the craft", [`Advanced ${cap} Patterns`, `System Design`, `Security Best Practices`, `Optimization`, `Team Collaboration`], ["Kubernetes", "Monitoring", "Infrastructure as Code"]],
    ["Expert", "Lead & innovate", [`${cap} Architecture`, `Mentoring & Leadership`, `Cross-team Collaboration`, `Industry Standards`, `Innovation`], ["Cloud Native", "Service Mesh", "Platform Engineering"]],
  ];

  techs.forEach((t, i) => {
    phases.push({
      phase: i + 1,
      title: t[0],
      subtitle: t[1],
      skills: t[2],
      technologies: t[3].map(n => ({ name: n })),
      projects: [`Simple ${cap} project`, `Intermediate ${cap} application`, `Complex ${cap} system`],
      courses: [`${cap} Fundamentals Course`, `Advanced ${cap} Training`, `${cap} Masterclass`],
      youtube: [`${cap} Tutorial Channel`, `${cap} Conference Talks`],
      certifications: [`${cap} Foundation Certificate`, `Professional ${cap} Certification`],
      resources: [
        { title: `${cap} Fundamentals Course`, type: "course" },
        { title: `${cap} Conference Talks`, type: "youtube" },
        { title: `Professional ${cap} Certification`, type: "certification" },
      ],
      estimatedWeeks: 4 + Math.floor(Math.random() * 6),
      difficulty: i < 1 ? "Beginner" : i < 2 ? "Intermediate" : i < 3 ? "Advanced" : "Expert",
    });
  });

  const ci = nextColor();
  return {
    label: cap,
    icon: "\uD83D\uDE80",
    difficulty: isHard ? "Hard" : "Medium",
    demand: "Growing",
    salaryRange: "$70k - $150k",
    growthPath: `Junior → Mid → Senior → Lead → Director`,
    prerequisites: ["Programming basics", "Problem-solving skills", "Willingness to learn"],
    estimatedTimeline: "8-16 months",
    hiringReadiness: 70 + Math.floor(Math.random() * 15),
    color: ci.primary,
    phases,
    isGenerated: true,
  };
}

export function findCareer(query) {
  if (!query || !query.trim()) return null;
  const q = query.trim().toLowerCase();

  if (CAREER_MAP[q]) {
    const c = CAREER_MAP[q];
    const ci = nextColor();
    return { ...c, icon: c.icon || "\uD83D\uDE80", color: ci.primary, secondary: ci.secondary, isGenerated: false };
  }

  for (const [key, val] of Object.entries(CAREER_MAP)) {
    const labels = [key, val.label.toLowerCase(), ...val.label.split(" ")];
    if (labels.some(l => q.includes(l) || l.includes(q))) {
      const ci = nextColor();
      return { ...val, icon: val.icon || "\uD83D\uDE80", color: ci.primary, secondary: ci.secondary, isGenerated: false };
    }
  }

  return generateFallbackRoadmap(query);
}

export function getAllCareerSuggestions(query) {
  const q = query.toLowerCase();
  const all = [];
  const seen = new Set();
  for (const [, val] of Object.entries(CAREER_MAP)) {
    if (!seen.has(val.label) && (val.label.toLowerCase().includes(q) || val.label.split(" ").some(w => w.length > 2 && q.includes(w.slice(0, 3).toLowerCase())))) {
      seen.add(val.label);
      all.push(val.label);
    }
  }
  return all.slice(0, 8);
}

export function getTrendingCareers() {
  return TRENDING_CAREERS.map(name => {
    const entry = Object.values(CAREER_MAP).find(c => c.label === name);
    return entry || { label: name, difficulty: "Medium", demand: "High", growthPath: "Growing career path", salaryRange: "$80k - $160k" };
  });
}
