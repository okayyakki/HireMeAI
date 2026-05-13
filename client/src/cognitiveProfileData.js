export const cognitiveDimensions = [
  { id: "analytical", label: "Analytical Thinking", icon: "🧠", description: "Ability to break down complex problems and reason logically" },
  { id: "creativity", label: "Creativity", icon: "💡", description: "Generating novel solutions and thinking outside the box" },
  { id: "detail", label: "Attention to Detail", icon: "🔍", description: "Precision and thoroughness in problem-solving" },
  { id: "communication", label: "Communication", icon: "💬", description: "Clarity and effectiveness of expressing ideas" },
  { id: "adaptability", label: "Adaptability", icon: "🔄", description: "Flexibility in handling new or changing situations" },
  { id: "technicalConfidence", label: "Technical Confidence", icon: "⚡", description: "Assurance in applying technical knowledge" },
  { id: "learningAbility", label: "Learning Ability", icon: "📚", description: "Speed and effectiveness of acquiring new skills" },
];

export function generateCognitiveProfile(role = "Frontend", difficulty = "medium") {
  const baseScores = {
    Frontend: { analytical: 78, creativity: 88, detail: 82, communication: 75, adaptability: 80, technicalConfidence: 76, learningAbility: 84 },
    Backend: { analytical: 88, creativity: 65, detail: 92, communication: 62, adaptability: 70, technicalConfidence: 85, learningAbility: 78 },
    "AI/ML": { analytical: 92, creativity: 80, detail: 85, communication: 68, adaptability: 82, technicalConfidence: 88, learningAbility: 90 },
    DevOps: { analytical: 82, creativity: 60, detail: 90, communication: 60, adaptability: 85, technicalConfidence: 90, learningAbility: 76 },
    Design: { analytical: 65, creativity: 95, detail: 88, communication: 82, adaptability: 78, technicalConfidence: 60, learningAbility: 80 },
  };

  const variance = difficulty === "hard" ? 12 : difficulty === "easy" ? 8 : 10;
  const base = baseScores[role] || baseScores.Frontend;
  const scores = {};
  const details = {};

  for (const dim of cognitiveDimensions) {
    const raw = (base[dim.id] || 75) + Math.floor((Math.random() - 0.45) * variance * 2);
    const final = Math.min(98, Math.max(22, raw));
    scores[dim.id] = final;

    const level = final >= 85 ? "excellent" : final >= 70 ? "strong" : final >= 55 ? "moderate" : "needs_improvement";
    const strengths = {
      excellent: `Exceptional ${dim.label.toLowerCase()} — top-tier cognitive performance.`,
      strong: `Strong ${dim.label.toLowerCase()} demonstrated consistently.`,
      moderate: `Moderate ${dim.label.toLowerCase()} — room for growth.`,
      needs_improvement: `${dim.label} needs development — consider targeted practice.`,
    };
    const improvements = {
      excellent: [],
      strong: [`Continue challenging ${dim.label.toLowerCase()} with advanced problems.`],
      moderate: [`Practice ${dim.label.toLowerCase()} exercises regularly.`, `Take structured ${dim.label.toLowerCase()} courses.`],
      needs_improvement: [`Focus on building ${dim.label.toLowerCase()} foundations.`, `Use ${dim.label.toLowerCase()} training tools daily.`],
    };

    details[dim.id] = { level, strength: strengths[level], improvements: improvements[level] };
  }

  const thinkingStyle = scores.analytical > 80 && scores.creativity > 70
    ? "Analytical-Creative Hybrid"
    : scores.analytical > 80
    ? "Systematic Analyst"
    : scores.creativity > 80
    ? "Creative Innovator"
    : scores.detail > 85
    ? "Precision-Oriented"
    : scores.adaptability > 80
    ? "Adaptive Explorer"
    : "Balanced Thinker";

  const stylisticDescriptors = [];

  if (scores.analytical > 80) stylisticDescriptors.push("logical reasoning strength");
  if (scores.creativity > 80) stylisticDescriptors.push("creative problem-solving");
  if (scores.detail > 85) stylisticDescriptors.push("meticulous attention to detail");
  if (scores.communication > 75) stylisticDescriptors.push("clear communication patterns");
  if (scores.adaptability > 80) stylisticDescriptors.push("high adaptability");
  if (scores.technicalConfidence > 80) stylisticDescriptors.push("strong technical confidence");
  if (scores.learningAbility > 85) stylisticDescriptors.push("rapid learning ability");

  const strengths = cognitiveDimensions.filter(d => scores[d.id] >= 75).map(d => d.label);
  const improvements = cognitiveDimensions.filter(d => scores[d.id] < 60).map(d => d.label);

  const overallCognitive = Math.round(cognitiveDimensions.reduce((s, d) => s + scores[d.id], 0) / cognitiveDimensions.length);

  const behaviorMetrics = {
    decisionMakingSpeed: 40 + Math.floor(Math.random() * 55),
    problemSolvingAccuracy: 50 + Math.floor(Math.random() * 45),
    communicationClarity: 45 + Math.floor(Math.random() * 50),
    confidencePatterns: 40 + Math.floor(Math.random() * 55),
    consistencyOfAnswers: 50 + Math.floor(Math.random() * 45),
    focusConsistency: 40 + Math.floor(Math.random() * 55),
    burnoutRisk: Math.floor(Math.random() * 60),
    stressPerformance: scores.adaptability > 75 ? "Thrives under pressure" : "Moderate stress tolerance",
  };

  const cognitiveScores = {};
  for (const dim of cognitiveDimensions) {
    cognitiveScores[dim.id] = {
      score: scores[dim.id],
      level: details[dim.id].level,
      percentile: Math.min(99, Math.max(10, scores[dim.id] + Math.floor(Math.random() * 8) - 4)),
    };
  }

  const insights = [
    ...(scores.analytical > 80 ? [`Candidate performs exceptionally well under logical challenges.`] : []),
    ...(scores.creativity > 80 ? [`Strong creative thinking detected with novel problem-solving approaches.`] : []),
    ...(scores.learningAbility > 85 ? [`High learning ability and adaptability potential identified.`] : []),
    ...(scores.communication > 75 ? [`Clear communication patterns with well-structured responses.`] : []),
    ...(scores.detail > 85 ? [`Exceptional attention to detail in technical assessments.`] : []),
    ...(scores.technicalConfidence > 80 ? [`Strong technical confidence — approaches problems with assurance.`] : []),
    `Decision-making speed is ${behaviorMetrics.decisionMakingSpeed >= 65 ? "above average" : behaviorMetrics.decisionMakingSpeed >= 40 ? "average" : "below average"}.`,
    `Problem-solving accuracy is ${behaviorMetrics.problemSolvingAccuracy >= 70 ? "highly consistent" : behaviorMetrics.problemSolvingAccuracy >= 50 ? "consistent" : "variable"}.`,
    `Answer consistency pattern suggests ${behaviorMetrics.consistencyOfAnswers >= 70 ? "strong domain knowledge" : "moderate familiarity"} in technical areas.`,
  ];

  const recommendation = overallCognitive >= 85
    ? { label: "Highly Recommended", reason: "Exceptional cognitive profile across all dimensions.", icon: "🏆", color: "#10b981" }
    : overallCognitive >= 75
    ? { label: "Excellent Problem Solver", reason: "Strong analytical and adaptive capabilities.", icon: "🧩", color: "#6366f1" }
    : overallCognitive >= 65
    ? { label: "Technically Strong", reason: "Solid technical foundation with room for creative growth.", icon: "⚡", color: "#f59e0b" }
    : overallCognitive >= 50
    ? { label: "Fast Learner", reason: "Demonstrates learning potential with growing analytical skills.", icon: "📈", color: "#8b5cf6" }
    : { label: "Needs Skill Improvement", reason: "Foundational cognitive skills need development.", icon: "📚", color: "#ef4444" };

  const careerRecommendations = [];
  if (scores.analytical > 80 && scores.detail > 80) careerRecommendations.push("Backend Engineering", "Data Science", "Systems Architecture");
  else if (scores.creativity > 80 && scores.adaptability > 75) careerRecommendations.push("Product Design", "Frontend Engineering", "Creative Technology");
  else if (scores.communication > 75 && scores.learningAbility > 80) careerRecommendations.push("Technical Product Management", "Developer Relations", "Solutions Engineering");
  else careerRecommendations.push("Full-Stack Development", "DevOps Engineering", "Quality Assurance");

  const iqScore = Math.round(85 + (overallCognitive / 100) * 40 + Math.floor(Math.random() * 10) - 5);
  const interviewReadiness = Math.min(100, Math.max(20, overallCognitive + Math.floor(Math.random() * 10) - 5));

  return {
    id: `cog_${Date.now()}`,
    role,
    overallCognitive,
    iqScore: Math.min(140, iqScore),
    interviewReadiness,
    thinkingStyle,
    stylisticDescriptors,
    strengths,
    improvements,
    cognitiveScores,
    behaviorMetrics,
    insights,
    recommendation,
    careerRecommendations,
    details,
    generatedAt: new Date().toISOString(),
    profile: scores,
  };
}

export const sampleCognitiveCandidates = [
  {
    id: "cc1",
    name: "Sarah Chen",
    role: "Frontend",
    avatar: "SC",
    profile: {
      overallCognitive: 91,
      iqScore: 128,
      interviewReadiness: 94,
      thinkingStyle: "Analytical-Creative Hybrid",
      stylisticDescriptors: ["logical reasoning strength", "creative problem-solving", "clear communication patterns", "rapid learning ability"],
      strengths: ["Analytical Thinking", "Creativity", "Attention to Detail", "Learning Ability", "Adaptability"],
      improvements: [],
      cognitiveScores: {
        analytical: { score: 92, level: "excellent", percentile: 96 },
        creativity: { score: 88, level: "excellent", percentile: 91 },
        detail: { score: 85, level: "excellent", percentile: 90 },
        communication: { score: 78, level: "strong", percentile: 82 },
        adaptability: { score: 82, level: "strong", percentile: 85 },
        technicalConfidence: { score: 80, level: "strong", percentile: 84 },
        learningAbility: { score: 90, level: "excellent", percentile: 94 },
      },
      behaviorMetrics: {
        decisionMakingSpeed: 85,
        problemSolvingAccuracy: 92,
        communicationClarity: 80,
        confidencePatterns: 88,
        consistencyOfAnswers: 90,
        focusConsistency: 86,
        burnoutRisk: 18,
        stressPerformance: "Thrives under pressure",
      },
      insights: [
        "Candidate performs exceptionally well under logical challenges.",
        "Strong creative thinking detected with novel problem-solving approaches.",
        "High learning ability and adaptability potential identified.",
        "Clear communication patterns with well-structured responses.",
        "Exceptional attention to detail in technical assessments.",
        "Decision-making speed is above average.",
        "Problem-solving accuracy is highly consistent.",
        "Answer consistency pattern suggests strong domain knowledge.",
      ],
      recommendation: { label: "Highly Recommended", reason: "Exceptional cognitive profile across all dimensions.", icon: "🏆", color: "#10b981" },
      careerRecommendations: ["Backend Engineering", "Data Science", "Systems Architecture", "Technical Product Management"],
      details: {
        analytical: { level: "excellent", strength: "Exceptional analytical thinking — top-tier cognitive performance.", improvements: [] },
        creativity: { level: "excellent", strength: "Exceptional creativity — top-tier cognitive performance.", improvements: [] },
        detail: { level: "excellent", strength: "Exceptional attention to detail — top-tier cognitive performance.", improvements: [] },
        communication: { level: "strong", strength: "Strong communication demonstrated consistently.", improvements: ["Continue challenging communication with advanced scenarios."] },
        adaptability: { level: "strong", strength: "Strong adaptability demonstrated consistently.", improvements: [] },
        technicalConfidence: { level: "strong", strength: "Strong technical confidence demonstrated consistently.", improvements: [] },
        learningAbility: { level: "excellent", strength: "Exceptional learning ability — top-tier cognitive performance.", improvements: [] },
      },
    },
  },
  {
    id: "cc2",
    name: "Marcus Johnson",
    role: "Backend",
    avatar: "MJ",
    profile: {
      overallCognitive: 72,
      iqScore: 112,
      interviewReadiness: 68,
      thinkingStyle: "Systematic Analyst",
      stylisticDescriptors: ["logical reasoning strength", "meticulous attention to detail"],
      strengths: ["Analytical Thinking", "Attention to Detail", "Technical Confidence"],
      improvements: ["Creativity", "Communication", "Adaptability"],
      cognitiveScores: {
        analytical: { score: 88, level: "excellent", percentile: 92 },
        creativity: { score: 48, level: "moderate", percentile: 52 },
        detail: { score: 90, level: "excellent", percentile: 94 },
        communication: { score: 55, level: "moderate", percentile: 60 },
        adaptability: { score: 58, level: "moderate", percentile: 62 },
        technicalConfidence: { score: 82, level: "strong", percentile: 86 },
        learningAbility: { score: 68, level: "moderate", percentile: 72 },
      },
      behaviorMetrics: {
        decisionMakingSpeed: 72,
        problemSolvingAccuracy: 85,
        communicationClarity: 52,
        confidencePatterns: 78,
        consistencyOfAnswers: 82,
        focusConsistency: 76,
        burnoutRisk: 32,
        stressPerformance: "Moderate stress tolerance",
      },
      insights: [
        "Candidate performs exceptionally well under logical challenges.",
        "Exceptional attention to detail in technical assessments.",
        "Strong technical confidence — approaches problems with assurance.",
        "Decision-making speed is average.",
        "Problem-solving accuracy is highly consistent.",
        "Creativity and communication are areas for development.",
      ],
      recommendation: { label: "Technically Strong", reason: "Solid technical foundation with room for creative growth.", icon: "⚡", color: "#f59e0b" },
      careerRecommendations: ["Backend Engineering", "Quality Assurance", "Systems Architecture"],
      details: {
        analytical: { level: "excellent", strength: "Exceptional analytical thinking — top-tier cognitive performance.", improvements: [] },
        creativity: { level: "moderate", strength: "Moderate creativity — room for growth.", improvements: ["Practice creativity exercises regularly.", "Take structured creativity courses."] },
        detail: { level: "excellent", strength: "Exceptional attention to detail — top-tier cognitive performance.", improvements: [] },
        communication: { level: "moderate", strength: "Moderate communication — room for growth.", improvements: ["Practice communication exercises regularly.", "Take structured communication courses."] },
        adaptability: { level: "moderate", strength: "Moderate adaptability — room for growth.", improvements: ["Practice adaptability exercises regularly.", "Take structured adaptability courses."] },
        technicalConfidence: { level: "strong", strength: "Strong technical confidence demonstrated consistently.", improvements: [] },
        learningAbility: { level: "moderate", strength: "Moderate learning ability — room for growth.", improvements: ["Practice learning ability exercises regularly."] },
      },
    },
  },
  {
    id: "cc3",
    name: "Emily Rodriguez",
    role: "AI/ML",
    avatar: "ER",
    profile: {
      overallCognitive: 88,
      iqScore: 132,
      interviewReadiness: 90,
      thinkingStyle: "Analytical-Creative Hybrid",
      stylisticDescriptors: ["logical reasoning strength", "creative problem-solving", "high adaptability", "rapid learning ability"],
      strengths: ["Analytical Thinking", "Creativity", "Learning Ability", "Technical Confidence", "Adaptability"],
      improvements: ["Communication"],
      cognitiveScores: {
        analytical: { score: 94, level: "excellent", percentile: 98 },
        creativity: { score: 82, level: "strong", percentile: 86 },
        detail: { score: 78, level: "strong", percentile: 82 },
        communication: { score: 62, level: "moderate", percentile: 66 },
        adaptability: { score: 85, level: "excellent", percentile: 90 },
        technicalConfidence: { score: 90, level: "excellent", percentile: 94 },
        learningAbility: { score: 92, level: "excellent", percentile: 96 },
      },
      behaviorMetrics: {
        decisionMakingSpeed: 82,
        problemSolvingAccuracy: 94,
        communicationClarity: 60,
        confidencePatterns: 90,
        consistencyOfAnswers: 88,
        focusConsistency: 84,
        burnoutRisk: 15,
        stressPerformance: "Thrives under pressure",
      },
      insights: [
        "Candidate performs exceptionally well under logical challenges.",
        "Strong creative thinking detected with novel problem-solving approaches.",
        "High learning ability and adaptability potential identified.",
        "Strong technical confidence — approaches problems with assurance.",
        "Decision-making speed is above average.",
        "Problem-solving accuracy is highly consistent.",
        "Communication clarity is an area for development.",
      ],
      recommendation: { label: "Highly Recommended", reason: "Exceptional cognitive profile across all dimensions.", icon: "🏆", color: "#10b981" },
      careerRecommendations: ["AI/ML Engineering", "Data Science", "Research Science", "Technical Product Management"],
      details: {
        analytical: { level: "excellent", strength: "Exceptional analytical thinking — top-tier cognitive performance.", improvements: [] },
        creativity: { level: "strong", strength: "Strong creativity demonstrated consistently.", improvements: [] },
        detail: { level: "strong", strength: "Strong attention to detail demonstrated consistently.", improvements: [] },
        communication: { level: "moderate", strength: "Moderate communication — room for growth.", improvements: ["Practice communication exercises regularly.", "Take structured communication courses."] },
        adaptability: { level: "excellent", strength: "Exceptional adaptability — top-tier cognitive performance.", improvements: [] },
        technicalConfidence: { level: "excellent", strength: "Exceptional technical confidence — top-tier cognitive performance.", improvements: [] },
        learningAbility: { level: "excellent", strength: "Exceptional learning ability — top-tier cognitive performance.", improvements: [] },
      },
    },
  },
  {
    id: "cc4",
    name: "Alex Kim",
    role: "DevOps",
    avatar: "AK",
    profile: {
      overallCognitive: 65,
      iqScore: 105,
      interviewReadiness: 58,
      thinkingStyle: "Precision-Oriented",
      stylisticDescriptors: ["meticulous attention to detail", "strong technical confidence"],
      strengths: ["Attention to Detail", "Technical Confidence"],
      improvements: ["Creativity", "Communication", "Adaptability", "Learning Ability"],
      cognitiveScores: {
        analytical: { score: 65, level: "moderate", percentile: 70 },
        creativity: { score: 38, level: "needs_improvement", percentile: 42 },
        detail: { score: 92, level: "excellent", percentile: 96 },
        communication: { score: 42, level: "needs_improvement", percentile: 48 },
        adaptability: { score: 55, level: "moderate", percentile: 60 },
        technicalConfidence: { score: 85, level: "excellent", percentile: 90 },
        learningAbility: { score: 52, level: "moderate", percentile: 56 },
      },
      behaviorMetrics: {
        decisionMakingSpeed: 45,
        problemSolvingAccuracy: 60,
        communicationClarity: 38,
        confidencePatterns: 72,
        consistencyOfAnswers: 55,
        focusConsistency: 48,
        burnoutRisk: 48,
        stressPerformance: "Moderate stress tolerance",
      },
      insights: [
        "Exceptional attention to detail in technical assessments.",
        "Strong technical confidence — approaches problems with assurance.",
        "Decision-making speed is below average.",
        "Problem-solving accuracy is variable.",
        "Creativity and communication are areas needing development.",
        "Focus consistency suggests potential burnout risk.",
      ],
      recommendation: { label: "Needs Skill Improvement", reason: "Foundational cognitive skills need development.", icon: "📚", color: "#ef4444" },
      careerRecommendations: ["DevOps Engineering", "Quality Assurance", "Systems Administration"],
      details: {
        analytical: { level: "moderate", strength: "Moderate analytical thinking — room for growth.", improvements: ["Practice analytical thinking exercises regularly.", "Take structured analytical thinking courses."] },
        creativity: { level: "needs_improvement", strength: "Creativity needs development — consider targeted practice.", improvements: ["Focus on building creativity foundations.", "Use creativity training tools daily."] },
        detail: { level: "excellent", strength: "Exceptional attention to detail — top-tier cognitive performance.", improvements: [] },
        communication: { level: "needs_improvement", strength: "Communication needs development — consider targeted practice.", improvements: ["Focus on building communication foundations.", "Use communication training tools daily."] },
        adaptability: { level: "moderate", strength: "Moderate adaptability — room for growth.", improvements: ["Practice adaptability exercises regularly.", "Take structured adaptability courses."] },
        technicalConfidence: { level: "excellent", strength: "Exceptional technical confidence — top-tier cognitive performance.", improvements: [] },
        learningAbility: { level: "moderate", strength: "Moderate learning ability — room for growth.", improvements: ["Practice learning ability exercises regularly."] },
      },
    },
  },
  {
    id: "cc5",
    name: "Priya Sharma",
    role: "Design",
    avatar: "PS",
    profile: {
      overallCognitive: 82,
      iqScore: 118,
      interviewReadiness: 85,
      thinkingStyle: "Creative Innovator",
      stylisticDescriptors: ["creative problem-solving", "clear communication patterns", "meticulous attention to detail", "high adaptability"],
      strengths: ["Creativity", "Attention to Detail", "Communication", "Adaptability", "Learning Ability"],
      improvements: ["Analytical Thinking"],
      cognitiveScores: {
        analytical: { score: 55, level: "moderate", percentile: 60 },
        creativity: { score: 95, level: "excellent", percentile: 98 },
        detail: { score: 88, level: "excellent", percentile: 92 },
        communication: { score: 85, level: "excellent", percentile: 90 },
        adaptability: { score: 80, level: "strong", percentile: 84 },
        technicalConfidence: { score: 62, level: "moderate", percentile: 66 },
        learningAbility: { score: 82, level: "strong", percentile: 86 },
      },
      behaviorMetrics: {
        decisionMakingSpeed: 70,
        problemSolvingAccuracy: 78,
        communicationClarity: 88,
        confidencePatterns: 75,
        consistencyOfAnswers: 80,
        focusConsistency: 78,
        burnoutRisk: 22,
        stressPerformance: "Thrives under pressure",
      },
      insights: [
        "Strong creative thinking detected with novel problem-solving approaches.",
        "Exceptional attention to detail in technical assessments.",
        "Clear communication patterns with well-structured responses.",
        "High learning ability and adaptability potential identified.",
        "Decision-making speed is average.",
        "Problem-solving accuracy is consistent.",
        "Analytical thinking is an area for development.",
      ],
      recommendation: { label: "Excellent Problem Solver", reason: "Strong analytical and adaptive capabilities.", icon: "🧩", color: "#6366f1" },
      careerRecommendations: ["Product Design", "Creative Technology", "Frontend Engineering", "UX Research"],
      details: {
        analytical: { level: "moderate", strength: "Moderate analytical thinking — room for growth.", improvements: ["Practice analytical thinking exercises regularly.", "Take structured analytical thinking courses."] },
        creativity: { level: "excellent", strength: "Exceptional creativity — top-tier cognitive performance.", improvements: [] },
        detail: { level: "excellent", strength: "Exceptional attention to detail — top-tier cognitive performance.", improvements: [] },
        communication: { level: "excellent", strength: "Exceptional communication — top-tier cognitive performance.", improvements: [] },
        adaptability: { level: "strong", strength: "Strong adaptability demonstrated consistently.", improvements: [] },
        technicalConfidence: { level: "moderate", strength: "Moderate technical confidence — room for growth.", improvements: ["Practice technical confidence exercises regularly.", "Take structured technical confidence courses."] },
        learningAbility: { level: "strong", strength: "Strong learning ability demonstrated consistently.", improvements: [] },
      },
    },
  },
];

export const roleColorMap = {
  Frontend: { primary: "#6366f1", secondary: "#818cf8", glow: "rgba(99,102,241,0.3)", bg: "rgba(99,102,241,0.06)" },
  Backend: { primary: "#10b981", secondary: "#34d399", glow: "rgba(16,185,129,0.3)", bg: "rgba(16,185,129,0.06)" },
  "AI/ML": { primary: "#8b5cf6", secondary: "#a78bfa", glow: "rgba(139,92,246,0.3)", bg: "rgba(139,92,246,0.06)" },
  DevOps: { primary: "#f59e0b", secondary: "#fbbf24", glow: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.06)" },
  Design: { primary: "#ec4899", secondary: "#f472b6", glow: "rgba(236,72,153,0.3)", bg: "rgba(236,72,153,0.06)" },
  General: { primary: "#3b82f6", secondary: "#60a5fa", glow: "rgba(59,130,246,0.3)", bg: "rgba(59,130,246,0.06)" },
};
