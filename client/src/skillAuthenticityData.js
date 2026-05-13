const roleSkillMappings = {
  "Frontend": ["React", "TypeScript", "JavaScript", "HTML/CSS", "Next.js", "Vue.js", "Webpack", "Jest", "Cypress", "GraphQL"],
  "Backend": ["Node.js", "Python", "Java", "SQL", "MongoDB", "Redis", "Docker", "PostgreSQL", "Express", "GraphQL"],
  "AI/ML": ["Python", "TensorFlow", "PyTorch", "LLMs", "RAG", "NLP", "Computer Vision", "Scikit-learn", "Kubernetes", "MLOps"],
  "DevOps": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins", "Linux", "Ansible", "Prometheus", "Helm"],
  "Design": ["Figma", "UI/UX", "Design Systems", "Prototyping", "User Research", "Photoshop", "Illustrator", "After Effects", "Webflow", "Miro"],
  "General": ["JavaScript", "Python", "Git", "REST APIs", "SQL", "Agile", "Communication", "Problem Solving", "Teamwork", "Leadership"]
};

export function generateSkillAuthenticityData(role = "Frontend", skills = ["React", "TypeScript", "Node.js"]) {
  const allRoleSkills = roleSkillMappings[role] || roleSkillMappings.General;

  const usedSkills = skills.length > 0 ? skills : allRoleSkills.slice(0, 5);

  const skillScores = usedSkills.map((skill, i) => {
    const baseScore = 50 + Math.floor(Math.random() * 45);
    const flags = [];
    if (Math.random() > 0.7) flags.push("claimed_not_tested");
    if (Math.random() > 0.85) flags.push("inflated");
    if (baseScore < 40) flags.push("weak");
    if (baseScore > 85) flags.push("verified");

    return {
      name: skill,
      authenticityScore: baseScore + (flags.includes("inflated") ? -20 : 0) + (flags.includes("verified") ? 10 : 0),
      resumeClaimed: true,
      testVerified: flags.includes("verified") ? true : (Math.random() > 0.4 ? true : false),
      codingVerified: flags.includes("verified") ? true : (Math.random() > 0.6 ? true : false),
      timeConsistency: 40 + Math.floor(Math.random() * 55),
      flags,
      label: flags.includes("verified") ? "Verified" : flags.includes("weak") ? "Needs Improvement" : flags.includes("inflated") ? "Suspicious" : "Plausible"
    };
  });

  const insights = [
    ...(skillScores.some(s => s.flags.includes("verified"))
      ? [`Strong ${skillScores.find(s => s.flags.includes("verified"))?.name || ""} fundamentals demonstrated.`]
      : []),
    ...(skillScores.some(s => s.flags.includes("inflated"))
      ? [`Claimed ${skillScores.find(s => s.flags.includes("inflated"))?.name || ""} expertise does not match assessment.`]
      : []),
    ...(skillScores.some(s => s.flags.includes("weak"))
      ? [`Low confidence in ${skillScores.find(s => s.flags.includes("weak"))?.name || ""} — further assessment recommended.`]
      : []),
    `High logical reasoning consistency detected.`,
    `Candidate shows ${skillScores.filter(s => s.authenticityScore > 70).length}/${skillScores.length} verified technical skills.`,
  ];

  const overallScore = Math.round(skillScores.reduce((s, sk) => s + sk.authenticityScore, 0) / skillScores.length);
  const trustMeter = overallScore >= 75 ? "High" : overallScore >= 50 ? "Medium" : "Low";
  const hiringConfidence = overallScore >= 80 ? "Strong Hire" : overallScore >= 65 ? "Likely Hire" : overallScore >= 45 ? "Consider" : "Weak Match";

  return {
    id: `candidate_${Date.now()}`,
    role,
    skillScores,
    overallScore: Math.min(100, overallScore),
    trustMeter,
    hiringConfidence,
    hiringConfidenceScore: Math.min(100, overallScore + Math.floor(Math.random() * 10) - 5),
    insights,
    topVerifiedSkill: skillScores.filter(s => s.flags.includes("verified") || s.authenticityScore > 80).sort((a, b) => b.authenticityScore - a.authenticityScore)[0]?.name || skillScores.sort((a, b) => b.authenticityScore - a.authenticityScore)[0].name,
    weakestClaim: skillScores.filter(s => s.flags.includes("inflated") || s.authenticityScore < 50).sort((a, b) => a.authenticityScore - b.authenticityScore)[0]?.name || null,
    suspiciousFlags: skillScores.filter(s => s.flags.includes("inflated")).map(s => s.name),
    verifiedBadges: skillScores.filter(s => s.flags.includes("verified") || s.authenticityScore > 80).map(s => s.name),
    improvementRoadmap: skillScores.filter(s => s.authenticityScore < 60).map(s => ({
      skill: s.name,
      currentScore: s.authenticityScore,
      targetScore: Math.min(100, s.authenticityScore + 30),
      suggestions: [
        `Complete advanced ${s.name} certification`,
        `Build 2+ production projects using ${s.name}`,
        `Contribute to open source ${s.name} projects`,
        `Practice ${s.name} coding challenges daily`
      ]
    })),
    responseTimeAvg: 12 + Math.floor(Math.random() * 20),
    accuracyPattern: 60 + Math.floor(Math.random() * 35),
    consistencyScore: 50 + Math.floor(Math.random() * 45),
    completionRate: 75 + Math.floor(Math.random() * 25),
    flaggedForReview: skillScores.some(s => s.flags.includes("inflated")),
    resumeAssessmentGap: skillScores.filter(s => !s.testVerified || s.flags.includes("inflated")).length,
    generatedAt: new Date().toISOString()
  };
}

export const sampleCandidates = [
  {
    id: "c1",
    name: "Sarah Chen",
    role: "Frontend",
    skills: ["React", "TypeScript", "Next.js", "CSS", "GraphQL"],
    avatar: "SC",
    data: {
      overallScore: 92,
      trustMeter: "High",
      hiringConfidence: "Strong Hire",
      hiringConfidenceScore: 94,
      skillScores: [
        { name: "React", authenticityScore: 95, resumeClaimed: true, testVerified: true, codingVerified: true, timeConsistency: 92, flags: ["verified"], label: "Verified" },
        { name: "TypeScript", authenticityScore: 88, resumeClaimed: true, testVerified: true, codingVerified: true, timeConsistency: 85, flags: ["verified"], label: "Verified" },
        { name: "Next.js", authenticityScore: 82, resumeClaimed: true, testVerified: true, codingVerified: false, timeConsistency: 78, flags: [], label: "Plausible" },
        { name: "CSS", authenticityScore: 96, resumeClaimed: true, testVerified: true, codingVerified: true, timeConsistency: 94, flags: ["verified"], label: "Verified" },
        { name: "GraphQL", authenticityScore: 74, resumeClaimed: true, testVerified: false, codingVerified: false, timeConsistency: 68, flags: ["claimed_not_tested"], label: "Plausible" },
      ],
      insights: [
        "Strong React fundamentals demonstrated across all assessments.",
        "CSS expertise is exceptional — top 5% of candidates.",
        "GraphQL claimed but not verified — recommend technical interview.",
        "High consistency in response patterns — no anomalies detected.",
        "Candidate shows 4/5 verified technical skills."
      ],
      topVerifiedSkill: "React",
      weakestClaim: null,
      suspiciousFlags: [],
      verifiedBadges: ["React", "TypeScript", "CSS"],
      improvementRoadmap: [
        {
          skill: "GraphQL",
          currentScore: 74,
          targetScore: 92,
          suggestions: [
            "Complete Apollo GraphQL certification",
            "Build a full-stack GraphQL application",
            "Contribute to GraphQL open source tools"
          ]
        }
      ],
      responseTimeAvg: 14,
      accuracyPattern: 93,
      consistencyScore: 90,
      completionRate: 100,
      flaggedForReview: false,
      resumeAssessmentGap: 1
    }
  },
  {
    id: "c2",
    name: "Marcus Johnson",
    role: "Backend",
    skills: ["Node.js", "Python", "MongoDB", "Docker", "PostgreSQL"],
    avatar: "MJ",
    data: {
      overallScore: 67,
      trustMeter: "Medium",
      hiringConfidence: "Consider",
      hiringConfidenceScore: 62,
      skillScores: [
        { name: "Node.js", authenticityScore: 72, resumeClaimed: true, testVerified: true, codingVerified: false, timeConsistency: 65, flags: [], label: "Plausible" },
        { name: "Python", authenticityScore: 85, resumeClaimed: true, testVerified: true, codingVerified: true, timeConsistency: 82, flags: ["verified"], label: "Verified" },
        { name: "MongoDB", authenticityScore: 55, resumeClaimed: true, testVerified: false, codingVerified: false, timeConsistency: 40, flags: ["claimed_not_tested", "weak"], label: "Needs Improvement" },
        { name: "Docker", authenticityScore: 45, resumeClaimed: true, testVerified: false, codingVerified: false, timeConsistency: 35, flags: ["inflated", "weak"], label: "Suspicious" },
        { name: "PostgreSQL", authenticityScore: 78, resumeClaimed: true, testVerified: true, codingVerified: false, timeConsistency: 72, flags: [], label: "Plausible" },
      ],
      insights: [
        "Python proficiency is well-supported by test results.",
        "Claimed Docker expertise does not match coding assessment.",
        "MongoDB flagged for further review — inconsistent responses.",
        "Response patterns suggest possible answer rushing in Docker section.",
        "3/5 skills require additional verification."
      ],
      topVerifiedSkill: "Python",
      weakestClaim: "Docker",
      suspiciousFlags: ["Docker"],
      verifiedBadges: ["Python"],
      improvementRoadmap: [
        { skill: "MongoDB", currentScore: 55, targetScore: 80, suggestions: ["Complete MongoDB University courses", "Build a MongoDB-backed application", "Practice aggregation pipelines"] },
        { skill: "Docker", currentScore: 45, targetScore: 78, suggestions: ["Complete Docker Deep Dive course", "Containerize 3 different applications", "Learn Docker Compose and Swarm"] }
      ],
      responseTimeAvg: 32,
      accuracyPattern: 65,
      consistencyScore: 55,
      completionRate: 90,
      flaggedForReview: true,
      resumeAssessmentGap: 3
    }
  },
  {
    id: "c3",
    name: "Emily Rodriguez",
    role: "AI/ML",
    skills: ["Python", "TensorFlow", "PyTorch", "LLMs", "Computer Vision"],
    avatar: "ER",
    data: {
      overallScore: 88,
      trustMeter: "High",
      hiringConfidence: "Strong Hire",
      hiringConfidenceScore: 91,
      skillScores: [
        { name: "Python", authenticityScore: 94, resumeClaimed: true, testVerified: true, codingVerified: true, timeConsistency: 90, flags: ["verified"], label: "Verified" },
        { name: "TensorFlow", authenticityScore: 91, resumeClaimed: true, testVerified: true, codingVerified: true, timeConsistency: 88, flags: ["verified"], label: "Verified" },
        { name: "PyTorch", authenticityScore: 87, resumeClaimed: true, testVerified: true, codingVerified: true, timeConsistency: 85, flags: ["verified"], label: "Verified" },
        { name: "LLMs", authenticityScore: 79, resumeClaimed: true, testVerified: true, codingVerified: false, timeConsistency: 75, flags: [], label: "Plausible" },
        { name: "Computer Vision", authenticityScore: 84, resumeClaimed: true, testVerified: true, codingVerified: true, timeConsistency: 82, flags: ["verified"], label: "Verified" },
      ],
      insights: [
        "Strong AI/ML fundamentals — top candidate profile.",
        "TensorFlow and PyTorch proficiency verified across multiple dimensions.",
        "LLMs knowledge confirmed but limited hands-on coding verified.",
        "No suspicious patterns detected in assessment behavior.",
        "Excellent response time consistency across all sections."
      ],
      topVerifiedSkill: "Python",
      weakestClaim: null,
      suspiciousFlags: [],
      verifiedBadges: ["Python", "TensorFlow", "PyTorch", "Computer Vision"],
      improvementRoadmap: [
        { skill: "LLMs", currentScore: 79, targetScore: 92, suggestions: ["Build an LLM-powered application", "Study RAG architectures", "Experiment with fine-tuning open source models"] }
      ],
      responseTimeAvg: 18,
      accuracyPattern: 95,
      consistencyScore: 91,
      completionRate: 98,
      flaggedForReview: false,
      resumeAssessmentGap: 0
    }
  },
  {
    id: "c4",
    name: "Alex Kim",
    role: "DevOps",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins"],
    avatar: "AK",
    data: {
      overallScore: 58,
      trustMeter: "Low",
      hiringConfidence: "Weak Match",
      hiringConfidenceScore: 52,
      skillScores: [
        { name: "AWS", authenticityScore: 92, resumeClaimed: true, testVerified: true, codingVerified: true, timeConsistency: 90, flags: ["verified"], label: "Verified" },
        { name: "Docker", authenticityScore: 70, resumeClaimed: true, testVerified: true, codingVerified: false, timeConsistency: 62, flags: [], label: "Plausible" },
        { name: "Kubernetes", authenticityScore: 38, resumeClaimed: true, testVerified: false, codingVerified: false, timeConsistency: 25, flags: ["inflated", "weak"], label: "Suspicious" },
        { name: "Terraform", authenticityScore: 35, resumeClaimed: true, testVerified: false, codingVerified: false, timeConsistency: 20, flags: ["inflated", "weak"], label: "Suspicious" },
        { name: "Jenkins", authenticityScore: 55, resumeClaimed: true, testVerified: false, codingVerified: false, timeConsistency: 45, flags: ["claimed_not_tested", "weak"], label: "Needs Improvement" },
      ],
      insights: [
        "AWS expertise is genuine and well-verified.",
        "Kubernetes and Terraform claims are significantly inflated.",
        "Extremely fast response times suggest random answering on K8s/Terraform.",
        "Two major resume-assessment gaps detected.",
        "Recommended: technical phone screen before proceeding."
      ],
      topVerifiedSkill: "AWS",
      weakestClaim: "Kubernetes",
      suspiciousFlags: ["Kubernetes", "Terraform"],
      verifiedBadges: ["AWS"],
      improvementRoadmap: [
        { skill: "Kubernetes", currentScore: 38, targetScore: 75, suggestions: ["Complete CKA certification path", "Deploy applications on EKS/AKS", "Practice Kubernetes troubleshooting"] },
        { skill: "Terraform", currentScore: 35, targetScore: 72, suggestions: ["Complete Terraform Associate certification", "Build infrastructure as code projects", "Learn Terraform modules and workspaces"] },
        { skill: "Jenkins", currentScore: 55, targetScore: 78, suggestions: ["Set up CI/CD pipelines with Jenkins", "Learn Jenkins pipeline as code", "Integrate Jenkins with Kubernetes"] }
      ],
      responseTimeAvg: 8,
      accuracyPattern: 42,
      consistencyScore: 38,
      completionRate: 85,
      flaggedForReview: true,
      resumeAssessmentGap: 4
    }
  },
  {
    id: "c5",
    name: "Priya Sharma",
    role: "Design",
    skills: ["Figma", "UI/UX", "Design Systems", "Prototyping", "User Research"],
    avatar: "PS",
    data: {
      overallScore: 85,
      trustMeter: "High",
      hiringConfidence: "Strong Hire",
      hiringConfidenceScore: 88,
      skillScores: [
        { name: "Figma", authenticityScore: 96, resumeClaimed: true, testVerified: true, codingVerified: true, timeConsistency: 95, flags: ["verified"], label: "Verified" },
        { name: "UI/UX", authenticityScore: 90, resumeClaimed: true, testVerified: true, codingVerified: true, timeConsistency: 88, flags: ["verified"], label: "Verified" },
        { name: "Design Systems", authenticityScore: 85, resumeClaimed: true, testVerified: true, codingVerified: false, timeConsistency: 82, flags: [], label: "Plausible" },
        { name: "Prototyping", authenticityScore: 88, resumeClaimed: true, testVerified: true, codingVerified: true, timeConsistency: 86, flags: ["verified"], label: "Verified" },
        { name: "User Research", authenticityScore: 72, resumeClaimed: true, testVerified: false, codingVerified: false, timeConsistency: 68, flags: ["claimed_not_tested"], label: "Plausible" },
      ],
      insights: [
        "Figma mastery confirmed — exceptional design portfolio alignment.",
        "UI/UX principles well understood and applied correctly.",
        "User Research methodology knowledge is theoretical — no practical verification.",
        "Design systems expertise shows strong structural thinking.",
        "4/5 skills verified with high confidence."
      ],
      topVerifiedSkill: "Figma",
      weakestClaim: null,
      suspiciousFlags: [],
      verifiedBadges: ["Figma", "UI/UX", "Prototyping"],
      improvementRoadmap: [
        { skill: "User Research", currentScore: 72, targetScore: 88, suggestions: ["Conduct 3+ user research studies", "Learn qualitative analysis methods", "Create research portfolio case studies"] }
      ],
      responseTimeAvg: 16,
      accuracyPattern: 91,
      consistencyScore: 87,
      completionRate: 96,
      flaggedForReview: false,
      resumeAssessmentGap: 1
    }
  }
];

export const roleColorMap = {
  "Frontend": { primary: "#6366f1", secondary: "#818cf8", glow: "rgba(99,102,241,0.3)" },
  "Backend": { primary: "#10b981", secondary: "#34d399", glow: "rgba(16,185,129,0.3)" },
  "AI/ML": { primary: "#8b5cf6", secondary: "#a78bfa", glow: "rgba(139,92,246,0.3)" },
  "DevOps": { primary: "#f59e0b", secondary: "#fbbf24", glow: "rgba(245,158,11,0.3)" },
  "Design": { primary: "#ec4899", secondary: "#f472b6", glow: "rgba(236,72,153,0.3)" },
  "General": { primary: "#3b82f6", secondary: "#60a5fa", glow: "rgba(59,130,246,0.3)" }
};
