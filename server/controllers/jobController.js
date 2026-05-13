import Job from "../models/Job.js";
import User from "../models/User.js";
import Application from "../models/Application.js";
import bcrypt from "bcryptjs";

const defaultJobs = [
  {
    title: "Senior Frontend Engineer",
    company: "Google",
    companyLogo: "🔴",
    description: "Build and maintain the next generation of Google's web applications. Work on products used by billions of users worldwide, focusing on performance, accessibility, and delightful user experiences.",
    location: "Mountain View, CA",
    salary: "180000-250000",
    type: "Full-time",
    experience: "5+ years",
    remote: false,
    skillsRequired: ["React", "TypeScript", "JavaScript", "CSS", "HTML", "Web Performance", "Accessibility"],
    requirements: ["5+ years of frontend development", "Strong CS fundamentals", "Experience with modern JS frameworks", "Track record of shipping high-quality products", "Excellent communication skills"]
  },
  {
    title: "Backend Engineer",
    company: "Meta",
    companyLogo: "🔵",
    description: "Design and build scalable backend services powering Meta's family of apps. Work on distributed systems handling billions of requests per day with extreme reliability requirements.",
    location: "Menlo Park, CA",
    salary: "200000-300000",
    type: "Full-time",
    experience: "4+ years",
    remote: false,
    skillsRequired: ["Python", "Java", "Go", "Distributed Systems", "SQL", "Kafka", "Redis"],
    requirements: ["4+ years backend experience", "Deep understanding of distributed systems", "Experience with high-throughput services", "BS/MS in Computer Science or equivalent"]
  },
  {
    title: "Full Stack Developer",
    company: "Stripe",
    companyLogo: "🟣",
    description: "Build tools that help millions of businesses start, run, and scale. You'll own features end-to-end across our stack and shape the future of internet commerce.",
    location: "Remote",
    salary: "170000-240000",
    type: "Full-time",
    experience: "3-6 years",
    remote: true,
    skillsRequired: ["React", "Node.js", "TypeScript", "PostgreSQL", "GraphQL", "AWS", "Docker"],
    requirements: ["3-6 years full-stack experience", "Strong JavaScript/TypeScript skills", "Experience with cloud infrastructure", "Product-minded engineering approach"]
  },
  {
    title: "AI/ML Engineer",
    company: "OpenAI",
    companyLogo: "🤖",
    description: "Work on cutting-edge AI models and systems. Contribute to the development of safe and beneficial artificial general intelligence. Research, implement, and deploy large-scale ML systems.",
    location: "San Francisco, CA",
    salary: "250000-400000",
    type: "Full-time",
    experience: "5+ years",
    remote: false,
    skillsRequired: ["Python", "PyTorch", "TensorFlow", "LLMs", "NLP", "CUDA", "Deep Learning", "Kubernetes"],
    requirements: ["PhD or MS in ML/AI or equivalent", "Published research at top-tier conferences", "Experience training large-scale models", "Strong software engineering skills"]
  },
  {
    title: "DevOps Engineer",
    company: "Amazon Web Services",
    companyLogo: "🟠",
    description: "Design and maintain the infrastructure that powers AWS. Build automation, monitoring, and tooling for one of the world's largest cloud platforms serving millions of customers.",
    location: "Seattle, WA",
    salary: "160000-230000",
    type: "Full-time",
    experience: "4-7 years",
    remote: false,
    skillsRequired: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux", "Python", "Prometheus"],
    requirements: ["4+ years DevOps/SRE experience", "Deep AWS knowledge", "Infrastructure as Code experience", "On-call rotation participation"]
  },
  {
    title: "Data Scientist",
    company: "Netflix",
    companyLogo: "🔴",
    description: "Drive data-informed decisions across Netflix's business. Analyze user behavior, build recommendation models, and run experiments to optimize the streaming experience for 200M+ members.",
    location: "Los Gatos, CA",
    salary: "190000-280000",
    type: "Full-time",
    experience: "3-5 years",
    remote: false,
    skillsRequired: ["Python", "SQL", "Machine Learning", "A/B Testing", "Statistics", "Spark", "TensorFlow"],
    requirements: ["MS/PhD in quantitative field", "3+ years data science experience", "Strong experimental design skills", "Excellent data storytelling abilities"]
  },
  {
    title: "Product Designer",
    company: "Apple",
    companyLogo: "🍎",
    description: "Design elegant, intuitive interfaces for Apple's ecosystem of products. Combine deep user empathy with technical understanding to create world-class design experiences.",
    location: "Cupertino, CA",
    salary: "170000-250000",
    type: "Full-time",
    experience: "5+ years",
    remote: false,
    skillsRequired: ["Figma", "SwiftUI", "Design Systems", "User Research", "Prototyping", "Motion Design", "Typography"],
    requirements: ["5+ years product design experience", "Strong portfolio showing shipped products", "Proficiency in design tools", "Understanding of iOS/macOS design patterns"]
  },
  {
    title: "iOS Developer",
    company: "Uber",
    companyLogo: "🖤",
    description: "Build the iOS experience that moves millions of people and things every day. Work on real-time maps, payments, rider/driver experiences, and more.",
    location: "San Francisco, CA",
    salary: "160000-230000",
    type: "Full-time",
    experience: "3-5 years",
    remote: true,
    skillsRequired: ["Swift", "SwiftUI", "UIKit", "Core Data", "Combine", "Xcode", "REST APIs", "Maps SDK"],
    requirements: ["3+ years iOS development", "Published apps on App Store", "Strong Swift knowledge", "Experience with real-time systems"]
  },
  {
    title: "Android Developer",
    company: "Spotify",
    companyLogo: "🟢",
    description: "Create the world's best audio experience on Android. Build features that help millions discover, enjoy, and share music and podcasts every day.",
    location: "Remote",
    salary: "150000-220000",
    type: "Full-time",
    experience: "3-5 years",
    remote: true,
    skillsRequired: ["Kotlin", "Android SDK", "Jetpack Compose", "MVVM", "Coroutines", "Room DB", "Dagger"],
    requirements: ["3+ years Android development", "Kotlin expertise", "Published apps on Play Store", "Performance optimization experience"]
  },
  {
    title: "Machine Learning Engineer",
    company: "Tesla",
    companyLogo: "⚡",
    description: "Develop ML models for Tesla's autonomous driving and energy products. Work on real-world AI systems that run in production vehicles and power grids.",
    location: "Palo Alto, CA",
    salary: "200000-320000",
    type: "Full-time",
    experience: "4+ years",
    remote: false,
    skillsRequired: ["Python", "PyTorch", "Computer Vision", "C++", "CUDA", "ROS", "Sensor Fusion", "Reinforcement Learning"],
    requirements: ["MS/PhD in CS/ML/Robotics", "4+ years ML experience", "Production ML system experience", "Published research preferred"]
  },
  {
    title: "Security Engineer",
    company: "Cloudflare",
    companyLogo: "🛡️",
    description: "Protect and secure one of the world's largest networks. Build security tools, perform threat analysis, and design systems that defend against sophisticated attacks.",
    location: "Remote",
    salary: "170000-250000",
    type: "Full-time",
    experience: "4+ years",
    remote: true,
    skillsRequired: ["Network Security", "Go", "Python", "Cryptography", "Penetration Testing", "WAF", "DDoS Mitigation"],
    requirements: ["4+ years security experience", "Deep understanding of network protocols", "Experience with security tooling", "Security certifications (CISSP, OSCP) preferred"]
  },
  {
    title: "Data Engineer",
    company: "Airbnb",
    companyLogo: "🔴",
    description: "Build and maintain the data infrastructure that powers Airbnb's marketplace. Design pipelines processing petabytes of data and enable data-driven decisions across the company.",
    location: "San Francisco, CA",
    salary: "165000-235000",
    type: "Full-time",
    experience: "3-6 years",
    remote: true,
    skillsRequired: ["Python", "SQL", "Spark", "Airflow", "Kafka", "Snowflake", "dbt", "AWS"],
    requirements: ["3+ years data engineering", "Strong SQL and Python skills", "Big data pipeline experience", "Data modeling expertise"]
  },
  {
    title: "Engineering Manager",
    company: "Microsoft",
    companyLogo: "🪟",
    description: "Lead a team of engineers building Azure cloud services. Drive technical strategy, mentor engineers, and deliver reliable cloud infrastructure for enterprise customers worldwide.",
    location: "Redmond, WA",
    salary: "220000-350000",
    type: "Full-time",
    experience: "8+ years",
    remote: false,
    skillsRequired: ["Team Leadership", "Cloud Architecture", "Azure", "Agile", "System Design", "Performance Management", "C#"],
    requirements: ["8+ years engineering experience", "3+ years management experience", "Cloud platform expertise", "Proven track record of delivering complex systems"]
  },
  {
    title: "QA Engineer",
    company: "Adobe",
    companyLogo: "🔺",
    description: "Ensure the quality and reliability of Adobe's creative tools. Build automated test frameworks, perform manual testing, and champion quality throughout the development lifecycle.",
    location: "San Jose, CA",
    salary: "130000-190000",
    type: "Full-time",
    experience: "2-5 years",
    remote: false,
    skillsRequired: ["Selenium", "Cypress", "JavaScript", "Python", "API Testing", "CI/CD", "Test Automation", "JIRA"],
    requirements: ["2+ years QA experience", "Strong automation skills", "Experience with CI/CD pipelines", "ISTQB certification preferred"]
  },
  {
    title: "Site Reliability Engineer",
    company: "Datadog",
    companyLogo: "🐕",
    description: "Keep Datadog's monitoring platform running at peak performance. Build automation, respond to incidents, and design systems that never go down for one of the fastest-growing SaaS companies.",
    location: "New York, NY",
    salary: "180000-260000",
    type: "Full-time",
    experience: "4-7 years",
    remote: true,
    skillsRequired: ["Go", "Kubernetes", "Terraform", "Prometheus", "Grafana", "Linux", "Distributed Systems", "Incident Response"],
    requirements: ["4+ years SRE/DevOps experience", "Strong programming skills (Go/Python)", "Kubernetes production experience", "Incident management experience"]
  }
];

const getFilteredJobs = async (req) => {
  const { search, type, experience, remote, minSalary, maxSalary, location } = req.query;
  let query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { skillsRequired: { $regex: search, $options: "i" } }
    ];
  }

  if (type) {
    query.type = type;
  }

  if (experience) {
    query.experience = experience;
  }

  if (remote === "true") {
    query.remote = true;
  } else if (remote === "false") {
    query.remote = false;
  }

  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  let jobs = await Job.find(query).populate("postedBy", "name email").sort({ postedDate: -1 });

  if (!search && !type && !experience && !remote && !location) {
    const hasNewFields = jobs.length > 0 && jobs.some(j => j.companyLogo && j.remote !== undefined);

    if (jobs.length === 0 || !hasNewFields) {
      let systemUser = await User.findOne({ email: "system@hiremeai.com" });
      if (!systemUser) {
        systemUser = await User.create({
          name: "Hire Me AI",
          email: "system@hiremeai.com",
          password: await bcrypt.hash(Math.random().toString(36), 10),
          role: "recruiter",
        });
      }

      if (!hasNewFields && jobs.length > 0) {
        await Job.deleteMany({});
      }

      const jobsWithPoster = defaultJobs.map(job => ({
        ...job,
        postedBy: systemUser._id,
      }));

      if (jobsWithPoster.length > 0) {
        await Job.insertMany(jobsWithPoster);
      }
      jobs = await Job.find(query).populate("postedBy", "name email").sort({ postedDate: -1 });
    }
  }

  if (minSalary || maxSalary) {
    jobs = jobs.filter(job => {
      const [low, high] = job.salary.split("-").map(Number);
      if (minSalary && maxSalary) {
        return low >= Number(minSalary) && (high || low) <= Number(maxSalary);
      }
      if (minSalary) return low >= Number(minSalary);
      if (maxSalary) return (high || low) <= Number(maxSalary);
      return true;
    });
  }

  return jobs;
};

export const createJob = async (req, res) => {
  try {
    const { title, company, description, skillsRequired, requirements, location, salary, type, experience, remote, workplaceType, benefits, companyLogo } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({ message: "Title, company, and description are required" });
    }

    const jobData = {
      title, company, companyLogo: companyLogo || "🏢", description,
      skillsRequired: skillsRequired || [],
      requirements: requirements || [],
      benefits: benefits || [],
      location: location || "Remote",
      salary: salary || "Not specified",
      type: type || "Full-time",
      experience: experience || "Not specified",
      remote: workplaceType === "remote" ? true : workplaceType === "onsite" ? false : true,
      workplaceType: workplaceType || "remote",
      postedBy: req.user._id,
    };

    const job = await Job.create(jobData);

    res.status(201).json({ message: "Job created successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    const jobs = await getFilteredJobs(req);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this job" });
    }

    const { title, company, description, skillsRequired, requirements, location, salary, type, experience, remote, workplaceType, benefits, companyLogo } = req.body;
    job.title = title || job.title;
    job.company = company || job.company;
    job.companyLogo = companyLogo || job.companyLogo;
    job.description = description || job.description;
    job.location = location || job.location;
    job.salary = salary || job.salary;
    job.type = type || job.type;
    job.experience = experience || job.experience;
    if (workplaceType !== undefined) {
      job.workplaceType = workplaceType;
      job.remote = workplaceType === "remote" ? true : workplaceType === "onsite" ? false : true;
    } else if (remote !== undefined) {
      job.remote = remote;
    }
    if (skillsRequired) job.skillsRequired = skillsRequired;
    if (requirements) job.requirements = requirements;
    if (benefits) job.benefits = benefits;

    await job.save();
    res.json({ message: "Job updated successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    job.status = job.status === "active" ? "closed" : "active";
    await job.save();
    const apps = await Application.countDocuments({ job: job._id });
    res.json({ message: `Job ${job.status}`, job: { ...job.toObject(), applicantsCount: apps } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
