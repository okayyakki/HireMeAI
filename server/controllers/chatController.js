import axios from "axios";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here"
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const chatHistory = new Map();

const getChatHistory = (userId) => {
  if (!userId) return [];
  const history = chatHistory.get(userId) || [];
  return history.slice(-8);
};

const addToHistory = (userId, role, content) => {
  if (!userId) return;
  const history = chatHistory.get(userId) || [];
  history.push({ role, content });
  if (history.length > 20) history.splice(0, history.length - 20);
  chatHistory.set(userId, history);
};

export const chatWithAI = async (req, res) => {
  try {
    const { message, userId, resumeContext } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message is required" });
    }

    const history = getChatHistory(userId);

    let resumeBlock = "";
    if (resumeContext && resumeContext.summary) {
      resumeBlock = `
Here is the user's resume analysis context:
- Overall Score: ${resumeContext.score || "N/A"}/100
- Top Skills: ${(resumeContext.skills || []).join(", ") || "Not specified"}
- Strengths: ${(resumeContext.strengths || []).join(", ") || "Not specified"}
- Areas to Improve: ${(resumeContext.weaknesses || []).join(", ") || "Not specified"}
- Suggested Roles: ${(resumeContext.bestRoles || []).join(", ") || "Not specified"}
- Missing Keywords: ${(resumeContext.missingKeywords || []).join(", ") || "None detected"}

Use this context to give personalized career mentoring advice when relevant.
`;
    }

    const systemPrompt = `You are a warm, encouraging AI Career Mentor for Hire Me AI. Your job is to mentor job seekers like a wise, supportive friend who genuinely wants them to succeed.

Personality: Friendly, encouraging, specific, and human. Use emojis naturally (😊 🚀 💪 🎯 🌟). Talk like a mentor over coffee, not a robot answering FAQ.

Core mentoring skills:
1. **Skills Improvement** — Suggest specific skills to learn next based on their goals. Give a concrete action plan.
2. **Project Recommendations** — Recommend real projects they can build to showcase skills. Be specific.
3. **Learning Roadmaps** — Give step-by-step learning paths for any tech career goal.
4. **Interview Tips** — Practical, actionable interview advice including STAR method, negotiation, and prep strategies.
5. **Resume Guidance** — Give personalized feedback using their resume analysis context when available.

Behavior rules:
- Keep responses to 2-5 sentences unless they ask for detail.
- Always give SPECIFIC, actionable advice — never vague.
- Lead with empathy and encouragement.
- If they share a goal, help them break it down into steps.
- If they seem stuck or discouraged, be supportive and give a small next step.
- Reference their resume context naturally when available.
- Suggest follow-up resources or next questions they could ask.${resumeBlock ? `\n\n${resumeBlock}` : ""}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message }
    ];

    let aiResponse = "";

    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages,
          max_tokens: 300,
          temperature: 0.8,
        });
        aiResponse = response.choices[0]?.message?.content || "";
      } catch (e) {
        aiResponse = "";
      }
    }

    if (!aiResponse && process.env.HF_API_KEY && process.env.HF_API_KEY !== "hf_your_actual_api_key_here") {
      try {
        const contextStr = history.map(h => `${h.role}: ${h.content}`).join("\n");
        const fullPrompt = `${systemPrompt}\n\nPast conversation:\n${contextStr}\nUser: ${message}\nMentor:`;
        const response = await axios.post(
          "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
          { inputs: fullPrompt, parameters: { max_new_tokens: 250, temperature: 0.8, return_full_text: false } },
          { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` }, timeout: 10000 }
        );
        aiResponse = response.data[0]?.generated_text?.replace(/^(Mentor:|Coach:|AI:)/i, "").trim() || "";
      } catch (e) {
        aiResponse = "";
      }
    }

    if (!aiResponse) {
      aiResponse = generateMentorResponse(message, history, resumeContext);
    }

    if (userId) {
      addToHistory(userId, "user", message);
      addToHistory(userId, "assistant", aiResponse);
    }

    return res.json({
      response: aiResponse.trim(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Chat AI Error:", error.message);
    res.status(500).json({
      response: "Hey, I'm having a little trouble connecting right now. Mind trying again in a moment? 🤗"
    });
  }
};

function generateMentorResponse(message, history, resumeContext) {
  const msg = message.toLowerCase().trim();
  const prevAssistantMsgs = history.filter(h => h.role === "assistant").map(h => h.content.toLowerCase());
  const prevUserMsgs = history.filter(h => h.role === "user").map(h => h.content.toLowerCase());
  const isFollowUp = prevAssistantMsgs.length > 0;

  const hasResume = resumeContext && resumeContext.skills && resumeContext.skills.length > 0;
  const userSkills = hasResume ? resumeContext.skills : [];
  const userWeaknesses = hasResume ? (resumeContext.weaknesses || []) : [];
  const userScore = hasResume ? resumeContext.score : null;
  const userBestRoles = hasResume ? (resumeContext.bestRoles || []) : [];

  // === GREETINGS ===
  if (/^(how are you|how's it going|how are you doing|what's up|sup|how do you do|how's everything|you good|how ya doing|whats good|yo)[\s!\.?]*$/i.test(msg)) {
    return pick([
      `I'm doing awesome, thanks for asking! 😊 Just hanging out here, mentoring folks and helping them level up their careers. What's on your mind today?`,
      `Feeling great! ✨ I've been helping people with skills roadmaps, projects, and interview prep. How can I mentor you today?`,
      `All good in the hood! 🚀 Ready to help you crush your career goals. What are we working on today?`
    ]);
  }

  if (msg.match(/^(hi|hello|hey|hii|hiii|heyy|heyo|hey there|good morning|good afternoon|good evening)[\s!\.]*$/)) {
    return pick([
      `Hey there! 👋 I'm your AI Career Mentor. Whether you need help figuring out what to learn next, building projects, prepping for interviews, or polishing your resume — I've got your back. What would you like to work on?`,
      `Hi! 🙌 So glad you're here. Think of me as your personal career coach — I can suggest skills to learn, projects to build, create learning roadmaps, give interview tips, or help with your resume. What's your focus?`,
      `Hey hey! 🚀 Ready to level up your career? I can help you with skills, projects, roadmaps, interviews, and resume feedback. Just tell me what you're working toward!`
    ]);
  }

  // === RESUME ANALYSIS BASED GUIDANCE ===
  if (hasResume && (msg.includes("resume") || msg.includes("cv") || msg.includes("my resume") || msg.includes("my profile") || msg.includes("my analysis") || msg.includes("my score"))) {
    const specificWeaknesses = userWeaknesses.length > 0
      ? userWeaknesses.slice(0, 2).map(w => `• ${w}`).join("\n")
      : "Try adding more measurable achievements with specific numbers.";
    const bestRole = userBestRoles.length > 0 ? `Based on your profile, you'd be a great fit for roles like **${userBestRoles.slice(0, 3).join("**, **")}**.` : "";

    return pick([
      `Great question! I've looked at your resume analysis. Here's the quick scoop:\n\n📊 **Score:** ${userScore}/100\n💪 **Strengths:** ${(resumeContext.strengths || []).slice(0, 2).join(", ")}\n🎯 **Areas to improve:**\n${specificWeaknesses}\n\n${bestRole}\nWant me to dive deeper into any of these areas?`,
      `Let me break down your resume analysis for you:\n\n✅ **What's working:** ${(resumeContext.strengths || []).slice(0, 2).join(", ")}\n🔧 **What could be better:** ${specificWeaknesses}\n\n${bestRole}\nI can suggest specific projects to build, skills to learn, or help you rewrite sections. What sounds most useful? 🎯`
    ]);
  }

  // === SKILLS IMPROVEMENT ===
  if (msg.includes("skill") || msg.includes("improve") || msg.includes("learn next") || msg.includes("what should i learn") || msg.includes("upskill") || msg.includes("level up") || msg.includes("grow") || msg.includes("get better") || msg.includes("skill gap") || msg.includes("skill improvement")) {
    if (hasResume && userSkills.length > 0) {
      const skillsStr = userSkills.slice(0, 5).join(", ");
      const missingSkills = (resumeContext.missingKeywords || []).slice(0, 4);

      if (missingSkills.length > 0) {
        return pick([
          `Great question! Based on your resume analysis, you already have skills in **${skillsStr}** 💪\n\nTo level up, I'd suggest focusing on:\n${missingSkills.map(s => `• **${s}**`).join("\n")}\n\nThese are keywords ATS systems look for that your resume is missing. Learning any of these will boost both your skills AND your resume score. Want me to create a mini roadmap for one of them? 🎯`,
          `Here's what I'd recommend based on your profile:\n\nYou've got **${skillsStr}** down — nice! 🎉\n\nAreas to grow:\n${missingSkills.map(s => `• **${s}**`).join("\n")}\n\nPick one that excites you most and I'll give you a step-by-step plan with projects and resources! 🚀`
        ]);
      }
      return pick([
        `You've already got a solid foundation in **${skillsStr}**! 🎉 To keep growing, I'd suggest:\n\n1. Pick one area and go deep (build something complex with it)\n2. Learn the ecosystem around your stack (testing, deployment, monitoring)\n3. Contribute to open source — great way to learn and build portfolio\n\nWhat area are you most excited to dive deeper into? 🚀`,
        `Since you already know **${skillsStr}**, here's my advice:\n\nThe difference between knowing a skill and mastering it is **building real projects**. Pick something that scares you a little and build it. That's where real growth happens! 💪\n\nWhat kind of project sounds fun to you?`
      ]);
    }
    return pick([
      `Great question about leveling up! Here's my framework:\n\n1️⃣ **Pick a direction** — full-stack, AI/ML, cloud, mobile?\n2️⃣ **Learn by building** — a to-do list teaches syntax, but a real product teaches architecture\n3️⃣ **Go deep, then wide** — master one stack before branching out\n\nWhat role are you targeting? I can give you a super specific roadmap! 🗺️`,
      `The best way to improve your skills is to **build something real**. Tutorials teach you how to follow instructions — projects teach you how to solve problems.\n\nTell me what you want to build (or what role you want), and I'll suggest 3 specific skills to focus on first! 🎯`,
      `Skills improvement tip: focus on **T-shaped learning** — deep in one area, broad across others. For example, master React deeply, but know enough about backend, databases, and deployment to build full features.\n\nWhat's your primary focus area? I can help you build a learning plan! 📚`
    ]);
  }

  // === PROJECT RECOMMENDATIONS ===
  if (msg.includes("project") || msg.includes("build") || msg.includes("portfolio") || msg.includes("what to build") || msg.includes("showcase") || msg.includes("side project") || msg.includes("github project")) {
    if (msg.includes("frontend") || msg.includes("front-end") || msg.includes("react") || msg.includes("ui") || msg.includes("web")) {
      return pick([
        `Awesome, frontend projects! Here are 3 that will impress recruiters:\n\n1️⃣ **E-commerce dashboard** — products, cart, orders, auth. Shows you can handle complex state.\n2️⃣ **Real-time collaborative whiteboard** — WebSockets + canvas. Shows advanced skills.\n3️⃣ **Accessible component library** — Build + document your own UI components with Storybook. Shows you care about quality.\n\nWhich one sounds most fun? I can break it down into steps! 🚀`,
        `Frontend project ideas that stand out:\n\n🎯 **Job board aggregator** — pulls from multiple APIs, shows filters and search. Great for your own job search too!\n🎯 **Personal analytics dashboard** — visualize your habits or GitHub stats. Shows data viz skills.\n🎯 **Browser extension** — solves a real problem. Shows you can ship!\n\nWant detailed specs for any of these? 💪`
      ]);
    }
    if (msg.includes("backend") || msg.includes("api") || msg.includes("server") || msg.includes("database")) {
      return pick([
        `Backend project ideas that will level up your portfolio:\n\n1️⃣ **URL shortener with analytics** — redirects, click tracking, rate limiting. Covers so many concepts!\n2️⃣ **Real-time notification system** — WebSockets, message queues, worker processes.\n3️⃣ **Multi-tenant SaaS API** — auth per tenant, isolated data, usage metering. Very impressive.\n\nWant me to outline the tech stack and features for one of these? 🔧`
      ]);
    }
    if (msg.includes("full stack") || msg.includes("fullstack")) {
      return "Full-stack project ideas that showcase end-to-end skills:\n\n1. Task management app - drag-drop boards, real-time updates, team collaboration\n2. Social recipe sharing platform - CRUD, auth, image upload, search, ratings\n3. SaaS subscription manager - Stripe integration, user dashboard, analytics\n\nThese show you can handle the entire product - which is exactly what startups look for!";
    }
    if (hasResume && userSkills.length > 0) {
      const topSkill = userSkills[0];
      return pick([
        `Since you're skilled in **${userSkills.slice(0, 3).join(", ")}**, here are projects that would strengthen your portfolio:\n\n1️⃣ Build something that combines your existing skills in a new way\n2️⃣ Try a technology you haven't used yet (like adding a real-time feature or a new framework)\n3️⃣ Clone an app you love — then add your own twist\n\nWant a specific project idea tailored to your stack? 🎯`
      ]);
    }
    return pick([
      `Building projects is the BEST way to learn and get hired. Here's my advice:\n\nStart with a **problem you personally have**. It keeps you motivated and makes for a great story in interviews.\n\nWhat kind of stuff are you interested in building? Web apps, AI tools, mobile apps, developer tools? 🚀`,
      `Project ideas that always impress:\n\n• **CLI tool** that solves a real problem (shows you care about developer experience)\n• **Real-time dashboard** (shows you can handle data + state)\n• **API wrapper library** (shows you understand abstraction)\n\nWhat's your current tech stack? I can suggest something specific! 💡`,
      `Here's my project recommendation framework:\n\n1️⃣ **Solve a problem you have** — best motivation and best interview story\n2️⃣ **Use one new technology** — stretch yourself but don't overhaul everything\n3️⃣ **Ship it** — deployed, documented, and shared > perfect but local\n\nWhat problem would you love to solve? 🤔`
    ]);
  }

  // === LEARNING ROADMAP ===
  if (msg.includes("roadmap") || msg.includes("learning path") || msg.includes("how to become") || msg.includes("step by step") || msg.includes("plan to learn") || msg.includes("curriculum") || msg.includes("study plan") || msg.includes("path to")) {
    if (msg.includes("frontend") || msg.includes("front-end") || msg.includes("react") || msg.includes("web developer")) {
      return pick([
        `Here's your frontend learning roadmap 🗺️\n\n**Phase 1:** HTML → CSS (Flexbox/Grid) → JS Fundamentals → Git\n**Phase 2:** JS Deep Dive (async, closures, ES6+) → Build 2 vanilla JS projects\n**Phase 3:** React (hooks, state management, router) → Build a dashboard\n**Phase 4:** TypeScript → Next.js → Testing (Jest, RTL)\n**Phase 5:** Deployment (Vercel) → CI/CD → Building full features\n\nEach phase should take 2-4 weeks with consistent practice. Which phase are you on? 🎯`,
        `Frontend roadmap in 6 months:\n\n📘 **Month 1-2:** HTML, CSS, JS fundamentals — build a landing page + calculator app\n📘 **Month 3-4:** React, hooks, state management — build a task manager + weather app\n📘 **Month 5:** TypeScript, Next.js, testing — build a blog with SSR\n📘 **Month 6:** Portfolio, deployment, job applications — polish everything and start applying!\n\nWant me to break down any month into weekly goals? 🚀`
      ]);
    }
    if (msg.includes("backend") || msg.includes("back-end") || msg.includes("node") || msg.includes("server") || msg.includes("api developer")) {
      return pick([
        `Backend roadmap 🗺️\n\n**Phase 1:** Choose a language (JS/TS or Python) → Data Structures → Git\n**Phase 2:** HTTP, REST APIs → Express/FastAPI → Build a CRUD API\n**Phase 3:** Databases (PostgreSQL + MongoDB) → Auth (JWT, OAuth) → ORMs\n**Phase 4:** Docker → Caching (Redis) → WebSockets → Background jobs\n**Phase 5:** CI/CD (GitHub Actions) → Cloud (AWS/GCP basics) → Monitoring\n\nWhere are you on this path? I can give you specific resources for each phase! 🔧`
      ]);
    }
    if (msg.includes("ai") || msg.includes("machine learning") || msg.includes("ml") || msg.includes("data science") || msg.includes("artificial intelligence")) {
      return pick([
        `AI/ML roadmap 🗺️\n\n**Phase 1:** Python → NumPy/Pandas → Linear Algebra + Statistics\n**Phase 2:** Scikit-learn → ML fundamentals (regression, classification, clustering)\n**Phase 3:** PyTorch → Neural networks → CNNs for images\n**Phase 4:** NLP → Transformers → LLMs → RAG pipelines\n**Phase 5:** MLOps → Deployment → Monitoring\n\nPro tip: start building projects in Phase 2, don't wait until you've studied everything! 🤖`
      ]);
    }
    if (msg.includes("devops") || msg.includes("cloud") || msg.includes("sre") || msg.includes("infrastructure")) {
      return pick([
        `DevOps roadmap 🗺️\n\n**Phase 1:** Linux basics → Shell scripting → Git → Networking fundamentals\n**Phase 2:** Docker → Containerize an app → Docker Compose\n**Phase 3:** CI/CD (GitHub Actions) → Deploy to cloud → Infrastructure basics\n**Phase 4:** Kubernetes → Helm → Service mesh\n**Phase 5:** Monitoring (Prometheus/Grafana) → Terraform → Security\n\nThis path takes 6-12 months depending on your pace. Want resources for any phase? ☁️`
      ]);
    }
    if (hasResume && userBestRoles.length > 0) {
      return pick([
        `Great question! Based on your resume, you'd be a great fit for **${userBestRoles.slice(0, 3).join(", ")}** roles.\n\nHere's a tailored roadmap:\n\n1️⃣ **Strengthen your foundation** — focus on the areas where your resume score is lowest\n2️⃣ **Build 2-3 portfolio projects** — showcasing your best skills\n3️⃣ **Practice interviews** — both technical and behavioral\n\nWant me to create a detailed weekly plan for a specific role? 🎯`
      ]);
    }
    return pick([
      `I'd love to help you build a learning roadmap! First, tell me:\n\n1️⃣ What role are you targeting? (frontend, backend, AI/ML, DevOps, full-stack?)\n2️⃣ What's your current level? (beginner, some experience, career switcher?)\n3️⃣ How much time can you dedicate per week?\n\nWith those details I can create a personalized step-by-step plan! 🗺️`,
      `A good learning roadmap has 3 ingredients:\n\n1️⃣ **Clear goal** — specific role or skill target\n2️⃣ **Project-based milestones** — build something every 2 weeks\n3️⃣ **Consistent schedule** — even 30min/day beats 5 hours once a week\n\nTell me your goal and I'll map out exactly what to learn and in what order! 🚀`
    ]);
  }

  // === INTERVIEW TIPS ===
  if (msg.includes("interview") || msg.includes("behavioral") || msg.includes("technical interview") || msg.includes("coding interview") || msg.includes("mock interview") || msg.includes("phone screen") || msg.includes("round") || msg.includes("onsite") || msg.includes("whiteboard")) {
    if (msg.includes("star") || msg.includes("method") || msg.includes("tell me about yourself")) {
      return pick([
        `The STAR method is your best friend! ⭐\n\n**S**ituation — Set the context\n**T**ask — What needed to be done\n**A**ction — What YOU did (this is the most important part)\n**R**esult — Measurable impact with numbers\n\nExample: "Our API was failing under load (S). I owned reliability (T). Added caching + monitoring (A). Uptime went from 97% to 99.9% (R)."\n\nPrep 3-4 STAR stories covering different scenarios — leadership, failure, conflict, technical win. Want to practice one together? 🎤`,
        `For "Tell me about yourself" — have a crisp 60-second story:\n\n**Past** → Where you started and what you learned\n**Present** → What you're doing now and what you're great at\n**Future** → Why this role is the perfect next step\n\nKeep it relevant, confident, and conversational. Want to draft yours together? 🎯`
      ]);
    }
    if (msg.includes("question") || msg.includes("ask them") || msg.includes("ask the interviewer") || msg.includes("questions to ask")) {
      return pick([
        `Great questions to ask at the end of any interview:\n\n🎯 "What does success look like in the first 90 days?"\n🎯 "What's the biggest challenge the team is facing right now?"\n🎯 "How is impact measured for this role?"\n🎯 "What's the team's favorite thing about working here?"\n\nThese show you're thoughtful and genuinely interested — way better than asking about company holidays! 😄`
      ]);
    }
    if (msg.includes("prepare") || msg.includes("practice") || msg.includes("how do i prepare")) {
      return pick([
        `Here's my interview prep framework:\n\n1️⃣ **Research** — Company, products, culture, recent news\n2️⃣ **Stories** — 3-4 STAR stories covering key scenarios\n3️⃣ **Technical prep** — Review fundamentals relevant to the role\n4️⃣ **Questions** — Have 3-4 thoughtful questions ready\n5️⃣ **Logistics** — Test your setup, dress comfortably, be early\n\nWant to do a quick mock question to practice? I can throw one at you! 🎤`
      ]);
    }
    if (msg.includes("salary") || msg.includes("negotiate") || msg.includes("compensation") || msg.includes("offer")) {
      return pick([
        `Salary negotiation tips 💰\n\n1️⃣ **Research first** — levels.fyi, Glassdoor, Blind for your role + location\n2️⃣ **Never give the first number** — let them anchor\n3️⃣ **Consider total comp** — base + bonus + equity + benefits\n4️⃣ **Be professional** — "I'm excited about this role. Based on my research and experience, I was hoping for $X."\n\nRemember: negotiation is expected! Companies rarely give their best offer first. You've got this! 💪`
      ]);
    }
    if (msg.includes("reject") || msg.includes("didn't get") || msg.includes("failed") || msg.includes("no response") || msg.includes("ghosted")) {
      return pick([
        `I hear you, and that really sucks. 😔 First off — rejection is NOT a reflection of your worth. Some of the best engineers I know have been rejected from 10+ roles before finding the right one.\n\nHere's what helps:\n1️⃣ Feel your feelings, then refocus\n2️⃣ Ask for feedback if possible\n3️⃣ Keep applying — it's a numbers game\n4️⃣ Each interview makes you better at the next one\n\nWant to review what happened and practice for the next one? 💪`
      ]);
    }
    return pick([
      `Interview tips from your mentor 💡\n\n• **Be yourself** — authenticity beats rehearsed answers\n• **Structure your answers** — STAR method for behavioral questions\n• **Think out loud** — interviewers want to see your thought process\n• **Ask great questions** — shows genuine interest\n\nWhat type of interview are you preparing for? I can give tailored advice! 🎯`,
      `Here's my #1 interview tip: **Interviews are conversations, not interrogations.** They already know you have the skills (that's why you're there). Now they want to know if you'd be great to work with.\n\nBe prepared, be real, and remember — you're also evaluating if THEY'RE a good fit for YOU. What stage are you at in your interview process? 🚀`,
      `The best interview prep is **consistent practice over time**:\n\n📅 Daily: 1 LeetCode or coding challenge\n📅 Weekly: 1 behavioral question (record yourself!)\n📅 Monthly: 1 mock interview with a friend or peer\n\nWant me to give you a practice question right now? 🎤`
    ]);
  }

  // === CODING HELP ===
  if (msg.includes("write code") || msg.includes("code") || msg.includes("programming") || msg.includes("leetcode") || msg.includes("algorithm") || msg.includes("function") || msg.includes("snippet") || msg.includes("script") || msg.includes("python") || msg.includes("javascript") || msg.includes("react") || msg.includes("node")) {
    if (msg.includes("leetcode") || msg.includes("algorithm") || msg.includes("problem solving")) {
      return pick([
        `LeetCode strategy from a mentor 🎯\n\nFocus on **patterns, not problems**:\n• Two pointers → array problems\n• Sliding window → substring problems\n• BFS/DFS → graph and tree problems\n• Dynamic Programming → optimization problems\n\nSolve 1-2 per day consistently and review your past solutions weekly. Quality > quantity! Which pattern are you working on? 💻`,
        `LeetCode tip: don't just solve — **categorize**. After each problem, tag it with the pattern. After 30 problems, review by pattern. You'll start seeing the matrix! 🧠\n\nAlso: time-box yourself. 30 mins max before looking at the solution. Struggle is where the learning happens! 💪`
      ]);
    }
    if (msg.includes("debug") || msg.includes("error") || msg.includes("bug") || msg.includes("broken") || msg.includes("not working")) {
      return pick([
        `Debugging flow that works 🐛\n\n1️⃣ **Read the error message** — it almost always tells you exactly what's wrong\n2️⃣ **Isolate** — simplify to the smallest failing case\n3️⃣ **Check assumptions** — "I thought this function returns X" → verify it\n4️⃣ **Rubber duck** — explain the code out loud, you'll catch it yourself!\n\nWant to share the code you're debugging? I can take a look! 🔍`
      ]);
    }
    return pick([
      `I'm happy to help with code! What are you working on? Share the language, what you're trying to do, and any code or error messages — I'll help you figure it out! 💻`,
      `Coding questions are my jam! 🎸 Whether you're stuck on a bug, choosing a tech stack, or figuring out what to learn — just tell me what you need. Specific questions get specific answers! 🎯`
    ]);
  }

  // === CAREER GUIDANCE ===
  if (msg.includes("career") || msg.includes("promotion") || msg.includes("growth") || msg.includes("switch") || msg.includes("transition") || msg.includes("pivot") || msg.includes("change career") || msg.includes("new field") || msg.includes("break into")) {
    if (msg.includes("promot") || msg.includes("senior") || msg.includes("next level") || msg.includes("advance")) {
      return pick([
        `Want a promotion? Here's the secret: **start doing the next-level work before you're promoted.**\n\n1️⃣ Look at the job description for the level above yours\n2️⃣ Start taking on those responsibilities\n3️⃣ Document your wins with metrics\n4️⃣ Make your manager's job easier\n\nPromotions are 50% performance and 50% visibility. Make sure people know the impact you're making! 📈`
      ]);
    }
    if (msg.includes("switch") || msg.includes("change") || msg.includes("transition") || msg.includes("pivot") || msg.includes("break into") || msg.includes("new field") || msg.includes("bootcamp") || msg.includes("self-taught")) {
      return pick([
        `Career pivots are totally doable! Here's my framework 🔄\n\n1️⃣ **Audit your transferable skills** — you have more than you think\n2️⃣ **Build 2-3 targeted projects** — shows you can DO it, not just study it\n3️⃣ **Network intentionally** — find people who made the same switch\n4️⃣ **Start applying before you feel ready** — imposter syndrome is normal!\n\nWhat field are you moving into? I can give specific advice! 🚀`,
        `Breaking into tech is a journey, and I'm here to guide you 🌟\n\n**My advice:**\n• Focus on building, not just learning\n• Your first job might not be your dream job — and that's fine!\n• Every interview is practice for the next one\n• The tech community is surprisingly supportive — lean on it!\n\nWhere are you in your journey right now? Let's make a plan! 💪`
      ]);
    }
    if (msg.includes("burnout") || msg.includes("stress") || msg.includes("tired") || msg.includes("overwhelmed") || msg.includes("struggling") || msg.includes("hard time")) {
      return pick([
        `Hey, I hear you. Burnout is real and you're not alone. 💙\n\nA few things that help:\n• **Set boundaries** — your health comes first, always\n• **Take real breaks** — not just scrolling, but walks, hobbies, rest\n• **Talk to someone** — manager, mentor, friend, or therapist\n• **Remember why you started** — reconnect with what excites you\n\nBe kind to yourself. Want to chat about what's going on? 🤗`
      ]);
    }
    return pick([
      `Career growth is a journey, not a destination 🌱\n\nMy best advice: **be intentional.** Set 6-month goals, find mentors, build skills that excite you, and say yes to opportunities that scare you a little.\n\nWhat's on your mind regarding your career? I'm all ears! 🎯`,
      `Let's talk about your career! The best careers are built on three things:\n\n1️⃣ **Skills** — what you're great at\n2️⃣ **Network** — who knows what you're great at\n3️⃣ **Opportunities** — being ready when luck strikes\n\nWhich of these do you want to work on? 🤔`
    ]);
  }

  // === RESUME TIPS ===
  if (msg.includes("resume") || msg.includes("cv") || msg.includes("curriculum vitae")) {
    if (msg.includes("bullet") || msg.includes("format") || msg.includes("layout") || msg.includes("template")) {
      return pick([
        `Resume formatting tip: use the **CAR method** for every bullet 🔧\n\n❌ "Was responsible for the backend"\n✅ "Redesigned the payment API (C), cutting failure rates by 35% and saving 200 engineer-hours/month (A+R)"\n\nAlways start with a strong action verb and include a number! 📊`,
        `Keep your resume to **one page** if you have under 10 years experience. Two max for seniors. Recruiters spend ~6 seconds scanning — make every line count! ⏱️\n\nPro tip: If a bullet doesn't show impact, cut it.`
      ]);
    }
    if (msg.includes("keyword") || msg.includes("ats") || msg.includes("applicant tracking")) {
      return pick([
        `ATS tip: mirror the EXACT phrases from the job description. If they say "React.js" don't write "React". Use both full terms and abbreviations ("Machine Learning / ML"). Stick to standard section headers. 📋\n\nUpload your resume to the AI Analyzer for a full ATS score! 🎯`
      ]);
    }
    if (msg.includes("summary") || msg.includes("objective") || msg.includes("profile")) {
      return pick([
        `A strong professional summary is 2-3 lines:\n\n"Senior frontend engineer with 5+ years building high-traffic React applications. Led a team of 4 to redesign the checkout flow, increasing conversion by 23%. Passionate about performance, accessibility, and mentoring."\n\nWant help writing yours? Tell me about your background! 📝`
      ]);
    }
    return pick([
      `Your resume is your personal marketing document! 📄\n\n**3 things every resume needs:**\n1️⃣ A punchy summary that grabs attention\n2️⃣ Measurable bullets (always with numbers!)\n3️⃣ Role-specific keywords to pass ATS filters\n\nWant to dive deeper into any of these? Or upload to the AI Analyzer for a full breakdown! 🎯`,
      `Pro resume tip: **quantify everything!**\n\n❌ "Improved performance"\n✅ "Cut page load time by 40%"\n\n❌ "Led a team"\n✅ "Managed a team of 6 engineers"\n\nNumbers grab attention and prove impact. What section of your resume do you want to work on? 💪`
    ]);
  }

  // === ATS HELP ===
  if (msg.includes("ats") || msg.includes("applicant tracking") || msg.includes("beat the system") || msg.includes("resume scanner")) {
    return pick([
      `ATS (Applicant Tracking Systems) are the gatekeepers. Here's how to get through 🚧\n\n1️⃣ Use exact keywords from the job description\n2️⃣ No images, graphics, or weird formatting\n3️⃣ Standard headings: Experience, Education, Skills\n4️⃣ Save as .docx or standard PDF\n5️⃣ Include a Keywords section if you have space\n\nUpload your resume to our AI Analyzer for a personalized ATS score and keyword suggestions! 🎯`,
      `Beating ATS is about **matching, not tricking**. Copy key phrases from the JD into your resume naturally. Use both spelled-out and abbreviated terms. And always — always — customize for each application. One size does NOT fit all! ⚡`
    ]);
  }

  // === THANKS ===
  if (/thank|thanks|appreciate|thx|ty/i.test(msg)) {
    return pick([
      `You're so welcome! 😊 That's what I'm here for. Keep pushing forward — you've got this! If anything else comes up, I'm just a message away. 🚀`,
      `My pleasure! 🙌 I love seeing people level up their careers. Come back anytime you need advice, feedback, or just a pep talk. You're doing great! 💪`,
      `Anytime! 🎯 Remember: every expert was once a beginner. Keep building, keep learning, and don't hesitate to reach out whenever you need guidance. You've got a mentor in your corner! 🌟`
    ]);
  }

  // === HELP / CAPABILITIES ===
  if (msg.includes("help") || msg.includes("what can you") || msg.includes("capabilities") || msg.includes("what do you") || msg.includes("how can you help") || msg.includes("what can you do")) {
    return "I'm your AI Career Mentor! Here's how I can help 🚀\n\n📚 **Skills Improvement** — Tell me your goal and I'll suggest exactly what to learn next\n🛠️ **Project Ideas** — I'll recommend specific projects to build for your portfolio\n🗺️ **Learning Roadmaps** — Step-by-step plans for any tech career path\n🎤 **Interview Tips** — STAR method, negotiation, prep strategies tailored to you\n📄 **Resume Feedback** — Personalized advice based on your resume analysis\n\nJust tell me what you want to work on — I'm here for you! 😊";
  }

  // === RECRUITER: JOB DESCRIPTION GENERATION ===
  if (msg.includes("job description") || msg.includes("write a job description") || msg.includes("jd for") || msg.includes("job posting") || msg.includes("post a job") || msg.includes("create a job description")) {
    if (msg.includes("software") || msg.includes("engineer") || msg.includes("developer")) {
      return "For a software engineer JD, include: tech stack, team context, impact-driven responsibilities, and must-have vs nice-to-have skills. Keep it 300-500 words — top candidates spend ~30 seconds scanning. Want me to draft one for a specific role? 💻";
    }
    return pick([
      "A strong job description has 4 parts: 1) A compelling intro about your company and mission, 2) 4-6 key responsibilities, 3) must-have vs nice-to-have requirements, 4) what success looks like in the first 90 days. Keep it clear and inclusive! 📝",
      "Great JDs focus on impact, not laundry lists. Instead of '5+ years Python,' say 'Build and scale ML pipelines that process 10M+ requests daily.' Sell the role, not just the requirements. What role are you hiring for? 🎯"
    ]);
  }

  // === RECRUITER GENERAL ===
  if (msg.includes("recruiter") || msg.includes("hire") || msg.includes("hiring") || msg.includes("candidate") || msg.includes("talent")) {
    return pick([
      "As a recruiter, your biggest lever is **process**. Define clear role requirements, build a structured interview process, communicate quickly, and always follow up. Speed and respect are your competitive advantages. What's your biggest hiring challenge? ⚡",
      "Hiring tip: move fast but don't rush. Top candidates are off the market in 10-14 days. Have a streamlined process (max 3 rounds), give quick feedback, and make competitive offers. Speed and respect win talent! 🎯"
    ]);
  }

  // === FOLLOW-UP CONTEXT ===
  if (isFollowUp) {
    const lastTopic = prevAssistantMsgs.join(" ");
    if (lastTopic.includes("skill") || lastTopic.includes("learn") || lastTopic.includes("roadmap")) {
      return pick([
        "Want to go deeper on skills? Tell me a specific technology you're curious about and I'll give you the 3 most important things to learn first, a mini project to build, and free resources! 🎯",
        "Let's dive deeper! What specific skill or technology are you most excited to learn? I'll give you a focused 2-week plan to get started. 🚀"
      ]);
    }
    if (lastTopic.includes("project") || lastTopic.includes("build")) {
      return pick([
        "Want to flesh out a project idea? Tell me which one caught your eye, and I'll help you plan the features, tech stack, and architecture. We can break it down into week-by-week milestones! 🛠️",
        "Great choice on the project front! Which one are you leaning toward? I can help you set up the project structure, pick the right tools, and plan your first sprint. 💪"
      ]);
    }
    if (lastTopic.includes("interview") || lastTopic.includes("star") || lastTopic.includes("prep")) {
      return pick([
        "Ready to practice? Tell me what kind of role you're interviewing for — frontend, backend, AI/ML, PM, or design — and I'll give you a realistic mock question to practice with! 🎤",
        "Let's prep! If you want, tell me about a recent project or challenge you faced, and I'll help you turn it into a compelling STAR story for your next interview. ⭐"
      ]);
    }
    if (lastTopic.includes("resume") || lastTopic.includes("cv") || lastTopic.includes("ats")) {
      return pick([
        "I'd love to help more with your resume! Want to paste a section you're unsure about? I can suggest rewrites and improvements on the spot. 📝",
        "Let's make your resume shine! What specific section are you working on — summary, experience bullets, skills, or education? I can give you examples tailored to your field. 📄"
      ]);
    }
    if (lastTopic.includes("career") || lastTopic.includes("switch") || lastTopic.includes("pivot") || lastTopic.includes("change")) {
      return pick([
        "Changing careers is brave and exciting! What's motivating your switch? Understanding your 'why' helps me give better advice for the transition. 🔄",
        "Let's make a plan for your career pivot! Tell me: what's your background and what field are you targeting? We'll identify transferable skills and a timeline. 🚀"
      ]);
    }
    return pick([
      "I'd love to go deeper on that! What specific aspect interests you most? The more you share, the more tailored my advice can be. 🎯",
      "Great topic! Want me to elaborate on something specific? I can give examples, resources, or step-by-step guidance. Just let me know! 😊"
    ]);
  }

  // === FALLBACK ===
  return pick([
    "I'd love to help with that! I specialize in skills improvement, project ideas, learning roadmaps, interview tips, and resume feedback. What are you looking to work on? 🎯",
    "Great question! As your career mentor, I can help you figure out what to learn next, what projects to build, how to prepare for interviews, or how to improve your resume. What interests you most? 🚀",
    "I'm here to mentor you on your career journey! Whether it's skills, projects, interviews, or resumes — just point me in the right direction. What's on your mind? 😊",
    "Happy to help! I cover skills improvement 🎯, project recommendations 🛠️, learning roadmaps 🗺️, interview tips 🎤, and resume guidance 📄. What would be most valuable for you right now?"
  ]);
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
