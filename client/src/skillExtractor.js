const SKILL_DATABASE = {
  programmingLanguages: [
    "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "C", "Ruby", "Go", "Rust",
    "PHP", "Swift", "Kotlin", "Scala", "R", "Perl", "Haskell", "Lua", "Dart", "Elixir",
    "Clojure", "Groovy", "Shell", "Bash", "PowerShell", "HTML", "CSS", "Sass", "SCSS",
    "Less", "SOLIDITY", "MATLAB", "Julia", "COBOL", "Fortran", "Assembly", "Verilog", "VHDL"
  ],
  frameworks: [
    "React", "Next.js", "Nuxt", "Vue.js", "Vue", "Angular", "Svelte",
    "Node.js", "Express.js", "Express", "Django", "Flask", "Spring Boot", "Spring",
    "ASP.NET", "Ruby on Rails", "Rails", "Laravel", "Symfony", "CakePHP",
    "jQuery", "Bootstrap", "Tailwind CSS", "Tailwind", "Material UI", "MUI", "Chakra UI",
    "Redux", "MobX", "Zustand", "React Query", "TanStack Query",
    "Jest", "Cypress", "Mocha", "Chai", "Playwright", "Vitest",
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy",
    ".NET Core", ".NET", "Electron", "React Native", "Flutter", "Xamarin",
    "Three.js", "D3.js", "Chart.js", "GSAP", "Framer Motion",
    "Webpack", "Vite", "Babel", "Rollup", "ESLint", "Prettier",
    "GraphQL", "Apollo", "REST API", "REST", "gRPC",
    "OpenCV", "NLTK", "Hugging Face", "HuggingFace", "LangChain", "OpenAI"
  ],
  databases: [
    "MongoDB", "PostgreSQL", "Postgres", "MySQL", "SQLite", "MariaDB", "Oracle", "SQL Server",
    "Redis", "Elasticsearch", "Cassandra", "DynamoDB", "CouchDB", "Firebase", "Firestore",
    "Supabase", "Neo4j", "InfluxDB", "Memcached", "RabbitMQ", "Kafka",
    "Prisma", "TypeORM", "Sequelize", "Mongoose", "Drizzle", "Knex",
    "Snowflake", "BigQuery", "Redshift", "Databricks", "Airflow"
  ],
  tools: [
    "Git", "GitHub", "GitLab", "Bitbucket", "Docker", "Kubernetes", "K8s", "Terraform",
    "Ansible", "Jenkins", "GitHub Actions", "CircleCI", "Travis CI",
    "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud Platform", "Google Cloud",
    "Cloud", "Heroku", "Vercel", "Netlify", "DigitalOcean", "Linode",
    "Linux", "Ubuntu", "Nginx", "Apache", "Figma", "Sketch", "Adobe XD",
    "Jira", "Confluence", "Slack", "Notion", "Trello", "Asana", "ClickUp",
    "Postman", "Swagger", "OpenAPI",
    "CI/CD", "DevOps", "Agile", "Scrum", "Kanban", "Microservices",
    "Photoshop", "Illustrator", "Canva", "InVision", "Zeplin",
    "Prometheus", "Grafana", "Datadog", "New Relic", "Sentry",
    "NPM", "Yarn", "pnpm", "Homebrew", "Chocolatey",
    "Wireshark", "Burp Suite", "Metasploit", "Nmap",
    "Unity", "Unreal Engine", "Blender", "Maya"
  ]
};

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9.#+\- ]/g, "").trim();

const containsSkill = (text, skill) => {
  const normalizedText = normalize(text);
  const normalizedSkill = normalize(skill);
  const patterns = [
    normalizedSkill,
    normalizedSkill.replace(/\./g, ""),
  ];
  return patterns.some((p) => {
    const regex = new RegExp(`(?:^|[\\s,;/()\\[\\]{}])${p.replace(/[.+]/g, "\\$&")}(?:$|[\\s,;/()\\[\\]{}!?.])`, "i");
    return regex.test(normalizedText);
  });
};

export function extractSkills(resumeText) {
  if (!resumeText || typeof resumeText !== "string") {
    return { programmingLanguages: [], frameworks: [], databases: [], tools: [] };
  }

  const detected = {
    programmingLanguages: new Set(),
    frameworks: new Set(),
    databases: new Set(),
    tools: new Set(),
  };

  for (const [category, skills] of Object.entries(SKILL_DATABASE)) {
    for (const skill of skills) {
      if (containsSkill(resumeText, skill)) {
        detected[category].add(skill);
      }
    }
  }

  return {
    programmingLanguages: [...detected.programmingLanguages],
    frameworks: [...detected.frameworks],
    databases: [...detected.databases],
    tools: [...detected.tools],
  };
}

export function extractSkillsFromAnalysis(skillsList, resumeText) {
  const extracted = extractSkills(resumeText);
  const combined = {
    programmingLanguages: new Set([...extracted.programmingLanguages]),
    frameworks: new Set([...extracted.frameworks]),
    databases: new Set([...extracted.databases]),
    tools: new Set([...extracted.tools]),
  };

  if (Array.isArray(skillsList)) {
    for (const skill of skillsList) {
      const s = skill.trim();
      if (!s) continue;
      let found = false;
      for (const [, skills] of Object.entries(SKILL_DATABASE)) {
        if (skills.some((known) => known.toLowerCase() === s.toLowerCase())) {
          found = true;
          break;
        }
      }
      if (!found) {
        combined.tools.add(s);
      }
    }
  }

  return {
    programmingLanguages: [...combined.programmingLanguages],
    frameworks: [...combined.frameworks],
    databases: [...combined.databases],
    tools: [...combined.tools],
  };
}
