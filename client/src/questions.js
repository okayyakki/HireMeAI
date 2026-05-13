const aptitudePool = [
  { id: "apt1", question: "If a shirt costs $80 and is discounted by 25%, what is the sale price?", options: ["$55", "$60", "$65", "$50"], answer: 1, skill: "Aptitude", difficulty: "Easy", type: "aptitude" },
  { id: "apt2", question: "A train travels 300 km in 5 hours. What is its speed in km/h?", options: ["50", "60", "70", "45"], answer: 1, skill: "Aptitude", difficulty: "Easy", type: "aptitude" },
  { id: "apt3", question: "If 8 workers can build a wall in 10 days, how many days will 4 workers take?", options: ["15", "20", "18", "12"], answer: 1, skill: "Aptitude", difficulty: "Medium", type: "aptitude" },
  { id: "apt4", question: "What is 15% of 200?", options: ["25", "30", "35", "20"], answer: 1, skill: "Aptitude", difficulty: "Easy", type: "aptitude" },
  { id: "apt5", question: "A shopkeeper buys an item for $50 and sells it for $65. What is the profit percentage?", options: ["25%", "30%", "20%", "15%"], answer: 1, skill: "Aptitude", difficulty: "Easy", type: "aptitude" },
  { id: "apt6", question: "If a die is rolled, what is the probability of getting an even number?", options: ["1/3", "1/2", "2/3", "1/6"], answer: 1, skill: "Aptitude", difficulty: "Medium", type: "aptitude" },
  { id: "apt7", question: "A car travels at 60 km/h for 2 hours and then at 40 km/h for 3 hours. What is the average speed?", options: ["48 km/h", "50 km/h", "52 km/h", "45 km/h"], answer: 0, skill: "Aptitude", difficulty: "Medium", type: "aptitude" },
  { id: "apt8", question: "If a:b = 2:3 and b:c = 4:5, find a:b:c.", options: ["8:12:15", "2:3:5", "2:4:5", "4:6:8"], answer: 0, skill: "Aptitude", difficulty: "Hard", type: "aptitude" },
  { id: "apt9", question: "A man spends 60% of his income. If his income increases by 20% and his spending increases by 10%, what is the percentage change in savings?", options: ["30% increase", "35% increase", "40% increase", "25% increase"], answer: 1, skill: "Aptitude", difficulty: "Hard", type: "aptitude" },
  { id: "apt10", question: "What is the compound interest on $1000 at 10% per annum for 2 years?", options: ["$200", "$210", "$190", "$220"], answer: 1, skill: "Aptitude", difficulty: "Medium", type: "aptitude" },
  { id: "apt11", question: "If 15 men can complete a work in 12 days, how many men are needed to complete the same work in 9 days?", options: ["18", "20", "22", "16"], answer: 1, skill: "Aptitude", difficulty: "Medium", type: "aptitude" },
  { id: "apt12", question: "The sum of two numbers is 45 and their difference is 15. What is the larger number?", options: ["25", "30", "35", "40"], answer: 1, skill: "Aptitude", difficulty: "Easy", type: "aptitude" },
  { id: "apt13", question: "A bag contains 4 red balls and 6 blue balls. What is the probability of picking a red ball?", options: ["0.3", "0.4", "0.5", "0.6"], answer: 1, skill: "Aptitude", difficulty: "Easy", type: "aptitude" },
  { id: "apt14", question: "If a product costing $200 is sold at a 20% loss, what is the selling price?", options: ["$150", "$160", "$175", "$140"], answer: 1, skill: "Aptitude", difficulty: "Easy", type: "aptitude" },
  { id: "apt15", question: "A pipe can fill a tank in 6 hours. How much of the tank is filled in 2 hours?", options: ["1/2", "1/3", "1/4", "1/6"], answer: 1, skill: "Aptitude", difficulty: "Easy", type: "aptitude" },
  { id: "apt16", question: "What is 0.125 as a fraction?", options: ["1/4", "1/8", "1/6", "1/5"], answer: 1, skill: "Aptitude", difficulty: "Easy", type: "aptitude" },
  { id: "apt17", question: "If x + 2y = 10 and 2x - y = 5, what is x?", options: ["2", "4", "6", "8"], answer: 1, skill: "Aptitude", difficulty: "Medium", type: "aptitude" },
  { id: "apt18", question: "A merchant sells two articles at $100 each—one at a 10% profit, the other at a 10% loss. What is the net profit/loss?", options: ["1% profit", "1% loss", "No profit no loss", "0.5% loss"], answer: 2, skill: "Aptitude", difficulty: "Hard", type: "aptitude" },
];

const logicalPool = [
  { id: "log1", question: "Find the next number: 2, 6, 18, 54, ?", options: ["108", "162", "144", "172"], answer: 1, skill: "Logical", difficulty: "Easy", type: "logical" },
  { id: "log2", question: "If 'APPLE' is coded as 'BQQMF', how is 'ORANGE' coded?", options: ["PSBOHF", "PSBMFG", "PTBOHF", "QSCOGJ"], answer: 0, skill: "Logical", difficulty: "Medium", type: "logical" },
  { id: "log3", question: "Find the odd one out: 3, 5, 7, 9, 11", options: ["3", "5", "7", "9"], answer: 3, skill: "Logical", difficulty: "Easy", type: "logical" },
  { id: "log4", question: "All cats are mammals. All mammals are animals. Therefore:", options: ["All animals are cats", "All cats are animals", "Some animals are not mammals", "All mammals are cats"], answer: 1, skill: "Logical", difficulty: "Easy", type: "logical" },
  { id: "log5", question: "What comes next: A, C, F, J, ?", options: ["L", "M", "N", "O"], answer: 3, skill: "Logical", difficulty: "Medium", type: "logical" },
  { id: "log6", question: "If 'MORNING' is written as 'NPSOJPH', how is 'EVENING' written?", options: ["FWFOHPH", "FWFNJOH", "FWFOJPH", "FWDNJPH"], answer: 2, skill: "Logical", difficulty: "Medium", type: "logical" },
  { id: "log7", question: "Find the missing number: 5, 10, 20, 40, ?", options: ["60", "80", "50", "100"], answer: 1, skill: "Logical", difficulty: "Easy", type: "logical" },
  { id: "log8", question: "In a row, Ram is 7th from the left and 8th from the right. How many people are in the row?", options: ["14", "15", "13", "16"], answer: 0, skill: "Logical", difficulty: "Medium", type: "logical" },
  { id: "log9", question: "If A > B and B > C, which is true?", options: ["A < C", "A > C", "A = C", "Cannot be determined"], answer: 1, skill: "Logical", difficulty: "Easy", type: "logical" },
  { id: "log10", question: "Find the next: Z, X, V, T, ?", options: ["R", "S", "Q", "P"], answer: 0, skill: "Logical", difficulty: "Medium", type: "logical" },
  { id: "log11", question: "If all roses are flowers and some flowers fade quickly, which is true?", options: ["All roses fade quickly", "Some roses may fade quickly", "No roses fade quickly", "All flowers are roses"], answer: 1, skill: "Logical", difficulty: "Hard", type: "logical" },
  { id: "log12", question: "A clock shows 3:15. What is the angle between the hour and minute hands?", options: ["0°", "7.5°", "15°", "30°"], answer: 1, skill: "Logical", difficulty: "Hard", type: "logical" },
  { id: "log13", question: "Find the missing: 1, 4, 9, 16, ?", options: ["20", "24", "25", "36"], answer: 2, skill: "Logical", difficulty: "Easy", type: "logical" },
  { id: "log14", question: "If 'HELLO' is coded as 'IFMMP', what is 'WORLD'?", options: ["XPQKD", "XPSME", "XPQLE", "XPSLD"], answer: 1, skill: "Logical", difficulty: "Easy", type: "logical" },
  { id: "log15", question: "Five friends A, B, C, D, E are sitting in a circle. A is between E and D. C is to the left of B. Who is to the right of E?", options: ["A", "B", "C", "D"], answer: 0, skill: "Logical", difficulty: "Hard", type: "logical" },
  { id: "log16", question: "Find the next: 3, 8, 15, 24, ?", options: ["32", "35", "36", "33"], answer: 1, skill: "Logical", difficulty: "Medium", type: "logical" },
  { id: "log17", question: "If 'PALE' is related to 'LEAP', then 'FISH' is related to?", options: ["SHIF", "HISF", "HSIF", "SFIH"], answer: 2, skill: "Logical", difficulty: "Medium", type: "logical" },
  { id: "log18", question: "A man said, 'This girl is the daughter of the wife of my father's only son.' How is the girl related to the man?", options: ["Sister", "Daughter", "Cousin", "Niece"], answer: 1, skill: "Logical", difficulty: "Hard", type: "logical" },
];

function addDifficulty(mcqs, baseDifficulty = "Medium") {
  return mcqs.map((q, i) => ({ ...q, difficulty: q.difficulty || (i < 5 ? "Easy" : i < 10 ? "Medium" : "Hard"), type: "technical" }));
}

const techFrontend = addDifficulty([
  { id: "fe-t1", question: "Which React hook is used to handle side effects like data fetching?", options: ["useState", "useEffect", "useContext", "useReducer"], answer: 1, skill: "React" },
  { id: "fe-t2", question: "What does CSS Flexbox's `justify-content: center` do?", options: ["Centers vertically", "Centers horizontally on main axis", "Centers container", "Adds equal spacing"], answer: 1, skill: "CSS" },
  { id: "fe-t3", question: "What is the difference between `==` and `===` in JS?", options: ["No difference", "=== compares value and type", "== compares value and type", "Both compare references"], answer: 1, skill: "JavaScript" },
  { id: "fe-t4", question: "What is the virtual DOM?", options: ["The real browser DOM", "A lightweight JS DOM representation", "A database cache", "A CSS framework"], answer: 1, skill: "React" },
  { id: "fe-t5", question: "Which TypeScript feature catches type errors at compile time?", options: ["Interfaces", "Classes", "Functions", "Modules"], answer: 0, skill: "TypeScript" },
  { id: "fe-t6", question: "What does `npm install --save-dev` do?", options: ["Installs as regular dependency", "Installs as dev dependency", "Installs globally", "Updates packages"], answer: 1, skill: "Tooling" },
  { id: "fe-t7", question: "What is the purpose of the `key` prop in React lists?", options: ["Adds unique styling", "Helps React identify changed items", "Stores data", "Creates CSS selectors"], answer: 1, skill: "React" },
  { id: "fe-t8", question: "Which HTTP method is used to update a resource?", options: ["GET", "POST", "PUT", "DELETE"], answer: 2, skill: "API" },
  { id: "fe-t9", question: "What is a closure in JavaScript?", options: ["A locked variable", "A function with access to its outer scope", "A class method", "A type of loop"], answer: 1, skill: "JavaScript" },
  { id: "fe-t10", question: "Which CSS property creates a grid layout?", options: ["display: flex", "display: grid", "display: block", "display: inline"], answer: 1, skill: "CSS" },
  { id: "fe-t11", question: "What does `async/await` do?", options: ["Makes code run faster", "Handles async operations", "Creates classes", "Manages state"], answer: 1, skill: "JavaScript" },
  { id: "fe-t12", question: "What is the default Vite dev server port?", options: ["3000", "5000", "8080", "5173"], answer: 3, skill: "Tooling" },
  { id: "fe-t13", question: "In React, what does `useState` return?", options: ["A single value", "An array with value and setter", "An object", "A promise"], answer: 1, skill: "React" },
  { id: "fe-t14", question: "Which CSS property changes text color?", options: ["font-color", "color", "text-color", "foreground"], answer: 1, skill: "CSS" },
  { id: "fe-t15", question: "What is the purpose of `Array.map()` in JS?", options: ["Filters array", "Transforms each element", "Reduces array", "Sorts array"], answer: 1, skill: "JavaScript" },
  { id: "fe-t16", question: "Which HTML tag is used for JavaScript?", options: ["<script>", "<js>", "<code>", "<javascript>"], answer: 0, skill: "HTML" },
  { id: "fe-t17", question: "What is React's StrictMode?", options: ["A production mode", "A dev tool for finding bugs", "A CSS framework", "A state manager"], answer: 1, skill: "React" },
  { id: "fe-t18", question: "Which CSS unit is relative to the viewport width?", options: ["em", "rem", "vh", "vw"], answer: 3, skill: "CSS" },
  { id: "fe-t19", question: "What does the spread operator (...) do in JS?", options: ["Creates a loop", "Spreads array/object elements", "Creates a function", "Declares a variable"], answer: 1, skill: "JavaScript" },
  { id: "fe-t20", question: "Which method adds an event listener in JS?", options: ["addEventListener", "attachEvent", "listenEvent", "onEvent"], answer: 0, skill: "JavaScript" },
]);

const techBackend = addDifficulty([
  { id: "be-t1", question: "Which Node.js framework is most common for REST APIs?", options: ["React", "Express", "Angular", "Vue"], answer: 1, skill: "Node.js" },
  { id: "be-t2", question: "What does REST stand for?", options: ["Representational State Transfer", "Remote Server Transfer", "Request State Transfer", "Representational Server Transaction"], answer: 0, skill: "API" },
  { id: "be-t3", question: "Which HTTP status code means 'Created'?", options: ["200", "201", "204", "301"], answer: 1, skill: "API" },
  { id: "be-t4", question: "What type of database is MongoDB?", options: ["SQL", "NoSQL", "Graph", "Key-Value"], answer: 1, skill: "Databases" },
  { id: "be-t5", question: "What does JWT stand for?", options: ["JavaScript Web Token", "JSON Web Token", "Java Web Tool", "JSON Wrap Tool"], answer: 1, skill: "Security" },
  { id: "be-t6", question: "Which method adds middleware in Express?", options: ["app.use()", "app.add()", "app.middleware()", "app.run()"], answer: 0, skill: "Node.js" },
  { id: "be-t7", question: "What is the purpose of an ORM?", options: ["Maps DB tables to code objects", "Optimizes queries", "Renders views", "Manages sessions"], answer: 0, skill: "Databases" },
  { id: "be-t8", question: "Which tool is used for password hashing?", options: ["MD5", "bcrypt", "Base64", "SHA-1"], answer: 1, skill: "Security" },
  { id: "be-t9", question: "What is a microservice?", options: ["A small team", "An independently deployable service", "A DB type", "A UI component"], answer: 1, skill: "Architecture" },
  { id: "be-t10", question: "Which DB uses SQL for querying?", options: ["MongoDB", "PostgreSQL", "Redis", "Firebase"], answer: 1, skill: "Databases" },
  { id: "be-t11", question: "What is the default Express port?", options: ["8080", "3000", "5000", "8000"], answer: 1, skill: "Node.js" },
  { id: "be-t12", question: "What does `npm` stand for?", options: ["Node Package Manager", "New Programming Module", "Node Project Manager", "Network Package Module"], answer: 0, skill: "Tooling" },
  { id: "be-t13", question: "What is an API endpoint?", options: ["A DB table", "A URL where API is accessed", "A server type", "A programming language"], answer: 1, skill: "API" },
  { id: "be-t14", question: "Difference between PUT and PATCH?", options: ["PUT replaces, PATCH partially updates", "PATCH replaces, PUT partially updates", "Both identical", "PUT is for create"], answer: 0, skill: "API" },
  { id: "be-t15", question: "What is a database transaction?", options: ["A single query", "A group of operations as a unit", "A backup", "A table join"], answer: 1, skill: "Databases" },
  { id: "be-t16", question: "Which protocol does REST typically use?", options: ["FTP", "HTTP", "TCP", "UDP"], answer: 1, skill: "API" },
  { id: "be-t17", question: "What is CORS?", options: ["A DB type", "A security mechanism for cross-origin requests", "A CSS framework", "A JS library"], answer: 1, skill: "Security" },
  { id: "be-t18", question: "Which status code is 'Not Found'?", options: ["400", "401", "403", "404"], answer: 3, skill: "API" },
  { id: "be-t19", question: "What is an index in a database?", options: ["A table list", "A structure to speed up queries", "A data type", "A view"], answer: 1, skill: "Databases" },
  { id: "be-t20", question: "What does `git clone` do?", options: ["Creates a new repo", "Copies a remote repo locally", "Merges branches", "Stages changes"], answer: 1, skill: "Git" },
]);

const techAiMl = addDifficulty([
  { id: "ai-t1", question: "What is TensorFlow primarily used for?", options: ["Web dev", "Machine learning", "Mobile apps", "Game dev"], answer: 1, skill: "ML" },
  { id: "ai-t2", question: "What does LLM stand for?", options: ["Large Language Model", "Low Level Module", "Logic Learning Machine", "Linear Language Model"], answer: 0, skill: "AI" },
  { id: "ai-t3", question: "Which Python library is for numerical computations?", options: ["Pandas", "NumPy", "Matplotlib", "Scikit-learn"], answer: 1, skill: "Python" },
  { id: "ai-t4", question: "What is supervised learning?", options: ["Learning without labels", "Learning with labeled data", "Learning by rewards", "Learning without data"], answer: 1, skill: "ML" },
  { id: "ai-t5", question: "What does PCA stand for?", options: ["Principal Component Analysis", "Primary Component Algorithm", "Predictive Code Analysis", "Process Control Automation"], answer: 0, skill: "ML" },
  { id: "ai-t6", question: "Best library for neural networks?", options: ["Flask", "PyTorch", "Django", "FastAPI"], answer: 1, skill: "Deep Learning" },
  { id: "ai-t7", question: "Role of an activation function?", options: ["Stores data", "Introduces non-linearity", "Reduces overfitting", "Normalizes data"], answer: 1, skill: "Deep Learning" },
  { id: "ai-t8", question: "What is overfitting?", options: ["Model good on training, poor on new data", "Poor on training data", "Cannot learn", "Too simple"], answer: 0, skill: "ML" },
  { id: "ai-t9", question: "What is transfer learning?", options: ["Moving models between servers", "Using pre-trained model on new task", "Converting formats", "Sharing datasets"], answer: 1, skill: "Deep Learning" },
  { id: "ai-t10", question: "Metric for classification accuracy?", options: ["MSE", "Accuracy", "R-squared", "MAE"], answer: 1, skill: "ML" },
  { id: "ai-t11", question: "What is NLP used for?", options: ["Image recognition", "Processing human language", "DB management", "Network security"], answer: 1, skill: "AI" },
  { id: "ai-t12", question: "Purpose of train/test split?", options: ["Speed training", "Evaluate on unseen data", "Reduce memory", "Visualize data"], answer: 1, skill: "ML" },
  { id: "ai-t13", question: "What is gradient descent?", options: ["A neural network type", "An optimization algorithm", "A dataset", "A loss function"], answer: 1, skill: "ML" },
  { id: "ai-t14", question: "Which is a reinforcement learning algorithm?", options: ["Linear Regression", "Q-Learning", "K-Means", "PCA"], answer: 1, skill: "ML" },
  { id: "ai-t15", question: "What is a confusion matrix?", options: ["A matrix of random numbers", "A table showing correct/incorrect predictions", "A type of neural network", "A data structure"], answer: 1, skill: "ML" },
  { id: "ai-t16", question: "Which library is for data visualization in Python?", options: ["NumPy", "Matplotlib", "Scikit-learn", "Pandas"], answer: 1, skill: "Python" },
  { id: "ai-t17", question: "What is a hyperparameter?", options: ["A model parameter learned from data", "A configuration set before training", "A type of data", "A feature"], answer: 1, skill: "ML" },
  { id: "ai-t18", question: "What does CNN stand for?", options: ["Convolutional Neural Network", "Complex Neural Network", "Connected Network", "Central Network"], answer: 0, skill: "Deep Learning" },
  { id: "ai-t19", question: "What is the purpose of dropout?", options: ["Speed training", "Prevent overfitting", "Add more layers", "Reduce data size"], answer: 1, skill: "Deep Learning" },
  { id: "ai-t20", question: "Which loss function is used for binary classification?", options: ["MSE", "Binary Cross-Entropy", "MAE", "Huber Loss"], answer: 1, skill: "ML" },
]);

const techDevOps = addDifficulty([
  { id: "do-t1", question: "What is Docker primarily used for?", options: ["Version control", "Containerization", "DB management", "Monitoring"], answer: 1, skill: "Containers" },
  { id: "do-t2", question: "Which tool is for container orchestration?", options: ["Docker Compose", "Kubernetes", "Git", "Jenkins"], answer: 1, skill: "Orchestration" },
  { id: "do-t3", question: "What does CI/CD stand for?", options: ["Code Integration / Deployment", "Continuous Integration / Deployment", "Code Inspection / Design", "Continuous Improvement / Delivery"], answer: 1, skill: "CI/CD" },
  { id: "do-t4", question: "AWS service for virtual servers?", options: ["S3", "EC2", "RDS", "Lambda"], answer: 1, skill: "Cloud" },
  { id: "do-t5", question: "What is Infrastructure as Code?", options: ["Auto-deploy code", "Managing infra through code", "Writing docs", "Code review"], answer: 1, skill: "IaC" },
  { id: "do-t6", question: "Monitoring tool for containers?", options: ["Git", "Prometheus", "Nginx", "Redis"], answer: 1, skill: "Monitoring" },
  { id: "do-t7", question: "What is a Dockerfile?", options: ["Dependency list", "Script to build a Docker image", "Config for Docker Hub", "A log file"], answer: 1, skill: "Containers" },
  { id: "do-t8", question: "What does `git push` do?", options: ["Downloads remote changes", "Uploads local commits to remote", "Creates branch", "Merges branches"], answer: 1, skill: "Git" },
  { id: "do-t9", question: "What is a load balancer?", options: ["Balances disk space", "Distributes traffic across servers", "DB optimizer", "Caching system"], answer: 1, skill: "Networking" },
  { id: "do-t10", question: "AWS service for serverless functions?", options: ["EC2", "Lambda", "S3", "CloudFront"], answer: 1, skill: "Cloud" },
  { id: "do-t11", question: "What is Terraform used for?", options: ["Container mgmt", "Provisioning infrastructure", "Code compilation", "Testing"], answer: 1, skill: "IaC" },
  { id: "do-t12", question: "Purpose of a reverse proxy?", options: ["Blocks traffic", "Routes client requests to backends", "Speeds up DBs", "Manages containers"], answer: 1, skill: "Networking" },
  { id: "do-t13", question: "What is `kubectl` used for?", options: ["Building Docker images", "Managing Kubernetes clusters", "Configuring CI/CD", "Monitoring logs"], answer: 1, skill: "Orchestration" },
  { id: "do-t14", question: "What is a pod in Kubernetes?", options: ["Storage unit", "Smallest deployable unit", "Network policy", "Monitoring tool"], answer: 1, skill: "Orchestration" },
  { id: "do-t15", question: "What is a Docker image?", options: ["A running container", "A read-only template for containers", "A config file", "A volume"], answer: 1, skill: "Containers" },
  { id: "do-t16", question: "Which cloud model provides virtual machines?", options: ["SaaS", "PaaS", "IaaS", "FaaS"], answer: 2, skill: "Cloud" },
  { id: "do-t17", question: "What is a GitHub Action?", options: ["A git command", "An automated CI/CD workflow", "A code editor", "A testing tool"], answer: 1, skill: "CI/CD" },
  { id: "do-t18", question: "What is a Helm chart in Kubernetes?", options: ["A Dockerfile alternative", "A Kubernetes package manager", "A monitoring dashboard", "A network config"], answer: 1, skill: "Orchestration" },
  { id: "do-t19", question: "Which port does HTTP use?", options: ["80", "443", "22", "3306"], answer: 0, skill: "Networking" },
  { id: "do-t20", question: "What is the purpose of `docker-compose`?", options: ["Build single containers", "Define and run multi-container apps", "Monitor containers", "Push images"], answer: 1, skill: "Containers" },
]);

const techDesign = addDifficulty([
  { id: "ds-t1", question: "Most common UI design tool?", options: ["Photoshop", "Figma", "VS Code", "Excel"], answer: 1, skill: "Design Tools" },
  { id: "ds-t2", question: "What does UX stand for?", options: ["User Experience", "User Expert", "Universal X", "Unique Experience"], answer: 0, skill: "UX" },
  { id: "ds-t3", question: "What is a design system?", options: ["A DB type", "Collection of reusable components", "A programming language", "A testing framework"], answer: 1, skill: "Design Systems" },
  { id: "ds-t4", question: "Purpose of wireframing?", options: ["Write code", "Plan layout and structure", "Add colors", "Test performance"], answer: 1, skill: "UX" },
  { id: "ds-t5", question: "Color model for digital design?", options: ["CMYK", "RGB", "HSL", "All"], answer: 3, skill: "Visual Design" },
  { id: "ds-t6", question: "What is responsive design?", options: ["Responds to clicks", "Adapts to screen size", "Has animations", "Mobile only"], answer: 1, skill: "UI" },
  { id: "ds-t7", question: "What is a prototype?", options: ["Final product", "Interactive mockup", "Design file", "Code repo"], answer: 1, skill: "UX" },
  { id: "ds-t8", question: "Principle ensuring text readability?", options: ["Contrast", "Alignment", "Proximity", "Repetition"], answer: 0, skill: "Visual Design" },
  { id: "ds-t9", question: "Golden ratio is used for?", options: ["Color selection", "Balanced proportions", "Font sizing", "Animation timing"], answer: 1, skill: "Visual Design" },
  { id: "ds-t10", question: "What does UI stand for?", options: ["User Integration", "User Interface", "Universal Input", "Unique Identifier"], answer: 1, skill: "UI" },
  { id: "ds-t11", question: "Purpose of user research?", options: ["Test code", "Understand user needs", "Design logos", "Write docs"], answer: 1, skill: "UX" },
  { id: "ds-t12", question: "Accessibility in design means?", options: ["Design for experts", "Design for users with disabilities", "Mobile design", "Performance"], answer: 1, skill: "UI" },
  { id: "ds-t13", question: "What is a style guide?", options: ["A code linter", "Document defining design standards", "User manual", "Testing plan"], answer: 1, skill: "Design Systems" },
  { id: "ds-t14", question: "What does 'F-pattern' refer to?", options: ["Coding pattern", "How users scan content", "Color scheme", "Font style"], answer: 1, skill: "UX" },
  { id: "ds-t15", question: "What is a heuristic evaluation?", options: ["Code test", "Usability inspection method", "Color test", "Performance test"], answer: 1, skill: "UX" },
  { id: "ds-t16", question: "What is the purpose of a mood board?", options: ["Write code", "Collect visual inspiration", "Test usability", "Define typography"], answer: 1, skill: "Visual Design" },
  { id: "ds-t17", question: "What is an information architecture?", options: ["DB structure", "Organizing content for usability", "Code architecture", "Network design"], answer: 1, skill: "UX" },
  { id: "ds-t18", question: "Which principle creates visual hierarchy?", options: ["Contrast", "Balance", "Scale", "All of the above"], answer: 3, skill: "Visual Design" },
  { id: "ds-t19", question: "What is a design sprint?", options: ["A fast coding session", "A 5-day design process", "A testing method", "A design tool"], answer: 1, skill: "UX" },
  { id: "ds-t20", question: "What does WCAG stand for?", options: ["Web Content Accessibility Guidelines", "Web Color Accessibility Guide", "Wireframe Content Accessibility Grid", "Web Component Access Guide"], answer: 0, skill: "UI" },
]);

const techMap = {
  Frontend: techFrontend,
  Backend: techBackend,
  "AI/ML": techAiMl,
  DevOps: techDevOps,
  Design: techDesign,
};

const codingChallenges = {
  Frontend: [
    { id: "fe-c1", title: "Reverse a String", difficulty: "Easy", skill: "JavaScript", description: "Write a function that reverses a given string without using the built-in `.reverse()` method.", starterCode: "function reverseString(str) {\n  // Your code here\n}", testCases: [{ input: "hello", expected: "olleh" }, { input: "world", expected: "dlrow" }], solutionHint: "Use a loop or `split/reduce` approach.", keywords: ["reverse", "for", "while", "reduce", "split"] },
    { id: "fe-c2", title: "React Counter Component", difficulty: "Medium", skill: "React", description: "Write a React component that renders a counter with increment and decrement buttons using the useState hook.", starterCode: "function Counter() {\n  // Your code here\n  return (\n    <div>\n      {/* Counter UI */}\n    </div>\n  );\n}", testCases: [{ input: "Render counter", expected: "Should display count and two buttons" }], solutionHint: "Use `useState(0)`, return count value with + and - buttons.", keywords: ["useState", "increment", "decrement", "onClick", "setCount"] },
    { id: "fe-c3", title: "Find the Two Sum", difficulty: "Medium", skill: "JavaScript", description: "Given an array of integers nums and a target integer, return indices of the two numbers that add up to the target.", starterCode: "function twoSum(nums, target) {\n  // Your code here\n}", testCases: [{ input: "nums = [2,7,11,15], target = 9", expected: "[0, 1]" }], solutionHint: "Use a hash map for O(n) solution.", keywords: ["map", "hash", "for", "target", "indices"] },
    { id: "fe-c4", title: "Fetch API Data", difficulty: "Medium", skill: "API", description: "Write an async function that fetches user data from an API endpoint and returns the JSON response. Include error handling.", starterCode: "async function fetchUserData(userId) {\n  // Your code here\n}", testCases: [{ input: "userId = 1", expected: "Should return user data object" }], solutionHint: "Use `fetch()` with try/catch, parse response with `.json()`.", keywords: ["fetch", "await", "async", "try", "catch", ".json"] },
  ],
  Backend: [
    { id: "be-c1", title: "Build a Simple Express Route", difficulty: "Easy", skill: "Node.js", description: "Write Express.js code to create a GET endpoint `/api/users` that returns a JSON array.", starterCode: "const express = require('express');\nconst app = express();\n\n// Your code here\n\napp.listen(3000);", testCases: [{ input: "GET /api/users", expected: "Returns JSON array" }], solutionHint: "Use `app.get()` and `res.json()`.", keywords: ["app.get", "res.json", "app.use", "express"] },
    { id: "be-c2", title: "Connect to MongoDB", difficulty: "Medium", skill: "Databases", description: "Write a function that connects to MongoDB, inserts a document, and returns the inserted document's ID.", starterCode: "const { MongoClient } = require('mongodb');\n\nasync function insertUser(userData) {\n  // Your code here\n}", testCases: [{ input: "{ name: 'Alice', email: 'alice@test.com' }", expected: "Returns inserted ID" }], solutionHint: "Use `MongoClient.connect()`, `db.collection().insertOne()`.", keywords: ["MongoClient", "connect", "insertOne", "await", "db"] },
    { id: "be-c3", title: "JWT Auth Middleware", difficulty: "Medium", skill: "Security", description: "Write Express middleware that verifies a JWT token from the Authorization header.", starterCode: "function authMiddleware(req, res, next) {\n  // Your code here\n}", testCases: [{ input: "Valid token request", expected: "Calls next() with req.user" }], solutionHint: "Get header, verify with `jwt.verify()`, set `req.user`.", keywords: ["jwt.verify", "authorization", "req.headers", "split", "next"] },
    { id: "be-c4", title: "SQL Join Query", difficulty: "Medium", skill: "Databases", description: "Write a SQL query that joins `users` and `orders` tables to return each user's total order count.", starterCode: "-- Write your SQL query here\nSELECT ", testCases: [{ input: "users(id,name), orders(id,user_id,amount)", expected: "User name + order count" }], solutionHint: "Use `LEFT JOIN`, `GROUP BY`, `COUNT()`.", keywords: ["JOIN", "GROUP BY", "COUNT", "LEFT JOIN"] },
  ],
  "AI/ML": [
    { id: "ai-c1", title: "Simple Classifier", difficulty: "Easy", skill: "ML", description: "Write Python code using scikit-learn to train a classifier on iris data and print accuracy.", starterCode: "from sklearn import datasets, model_selection, neighbors\n\n# Your code here", testCases: [{ input: "Iris dataset", expected: "Accuracy score" }], solutionHint: "Load iris, split, create KNeighborsClassifier, fit, score.", keywords: ["train_test_split", "KNeighborsClassifier", "fit", "score"] },
    { id: "ai-c2", title: "Data Cleaning Function", difficulty: "Medium", skill: "Python", description: "Write a function that fills missing numeric values with column mean and removes duplicates.", starterCode: "import pandas as pd\n\ndef clean_data(df):\n  # Your code here\n  return df", testCases: [{ input: "DataFrame with missing values", expected: "Cleaned DataFrame" }], solutionHint: "Use `fillna()`, `mean()`, `drop_duplicates()`.", keywords: ["fillna", "mean", "drop_duplicates", "inplace"] },
    { id: "ai-c3", title: "Simple PyTorch NN", difficulty: "Hard", skill: "Deep Learning", description: "Write a PyTorch model for a feedforward neural network with one hidden layer (128 neurons) and ReLU.", starterCode: "import torch.nn as nn\n\nclass SimpleNN(nn.Module):\n  def __init__(self, input_size, num_classes):\n    super().__init__()\n    # Your code here\n  def forward(self, x):\n    # Your code here", testCases: [{ input: "input_size=784, num_classes=10", expected: "Forward pass returns tensor" }], solutionHint: "Use `nn.Linear`, `nn.ReLU`.", keywords: ["nn.Linear", "ReLU", "forward", "self.fc"] },
    { id: "ai-c4", title: "Tokenize Text", difficulty: "Medium", skill: "NLP", description: "Write a function that tokenizes a sentence, lowercases, removes punctuation, and returns words.", starterCode: "import re\n\ndef tokenize(text):\n  # Your code here", testCases: [{ input: "'Hello, World!'", expected: "['hello', 'world']" }], solutionHint: "Use `re.findall` or split + punctuation removal.", keywords: ["re.findall", "lower", "split", "re.sub"] },
  ],
  DevOps: [
    { id: "do-c1", title: "Write a Dockerfile", difficulty: "Easy", skill: "Containers", description: "Write a Dockerfile using Node.js 18 that copies files, installs deps, exposes port 3000.", starterCode: "FROM node:18-alpine\n", testCases: [{ input: "Build context", expected: "Docker image" }], solutionHint: "Use `WORKDIR`, `COPY`, `RUN npm install`, `EXPOSE`, `CMD`.", keywords: ["WORKDIR", "COPY", "RUN npm", "EXPOSE", "CMD"] },
    { id: "do-c2", title: "K8s Deployment YAML", difficulty: "Medium", skill: "Orchestration", description: "Write a K8s Deployment YAML with 3 replicas of nginx with resource limits.", starterCode: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nginx-deployment\nspec:\n  # Your code here", testCases: [{ input: "Apply YAML", expected: "3 nginx pods" }], solutionHint: "Set `replicas: 3`, template with nginx image.", keywords: ["replicas", "containers", "image", "resources"] },
    { id: "do-c3", title: "Terraform AWS EC2", difficulty: "Medium", skill: "IaC", description: "Write Terraform config to create an AWS EC2 instance with a name tag.", starterCode: 'provider "aws" {\n  region = "us-east-1"\n}\n\n# Your code here', testCases: [{ input: "Terraform apply", expected: "EC2 instance" }], solutionHint: "Use `resource \"aws_instance\"` with `ami`, `instance_type`, `tags`.", keywords: ["aws_instance", "ami", "instance_type", "tags"] },
    { id: "do-c4", title: "CI/CD Pipeline YAML", difficulty: "Medium", skill: "CI/CD", description: "Write a GitHub Actions workflow that runs tests on push to main.", starterCode: "name: CI\non:\n  push:\n    branches: [main]\njobs:\n  test:\n    # Your code here", testCases: [{ input: "Push to main", expected: "Tests run" }], solutionHint: "Use `runs-on: ubuntu-latest`, steps with checkout + npm test.", keywords: ["runs-on", "steps", "actions/checkout", "npm test"] },
  ],
  Design: [
    { id: "ds-c1", title: "Design Color Palette CSS", difficulty: "Easy", skill: "Visual Design", description: "Write CSS custom properties defining a design system color palette.", starterCode: ":root {\n  /* Your color palette */\n}", testCases: [{ input: "Color CSS", expected: "Custom properties" }], solutionHint: "Use `--color-primary`, `--color-secondary` with hex values.", keywords: ["--color", "primary", "secondary", "background"] },
    { id: "ds-c2", title: "Responsive Grid CSS", difficulty: "Medium", skill: "UI", description: "Write CSS for a responsive card grid: 4 cols desktop, 2 tablet, 1 mobile.", starterCode: ".card-grid {\n  /* Your grid */\n}\n\n/* Media queries */", testCases: [{ input: "Grid HTML", expected: "Responsive grid" }], solutionHint: "Use `display: grid`, `grid-template-columns`, `@media`.", keywords: ["grid", "grid-template-columns", "@media", "repeat"] },
    { id: "ds-c3", title: "Design Token JSON", difficulty: "Medium", skill: "Design Systems", description: "Write JSON for spacing and typography design tokens.", starterCode: "{\n  \"spacing\": {},\n  \"typography\": {}\n}", testCases: [{ input: "JSON tokens", expected: "Complete token set" }], solutionHint: "Use `spacing.sm: 8px`, `typography.h1: 32px`.", keywords: ["spacing", "typography", "fontSize", "px"] },
    { id: "ds-c4", title: "CSS Fade-In Animation", difficulty: "Medium", skill: "UI", description: "Write a CSS keyframe animation that fades in and slides up, lasting 0.5s ease-out.", starterCode: "@keyframes fadeInUp {\n  /* Your animation */\n}\n.fade-element {\n  /* Apply animation */\n}", testCases: [{ input: "Element with class", expected: "Fades in + slides up" }], solutionHint: "Use `opacity` and `transform: translateY()`.", keywords: ["opacity", "transform", "translateY", "animation", "ease-out"] },
  ],
};

function detectCategories(job) {
  const title = (job.title || "").toLowerCase();
  const skills = (job.skillsRequired || []).map(s => s.toLowerCase());
  const allText = title + " " + skills.join(" ");
  const keywordMap = [
    { keywords: ["frontend", "react", "angular", "vue", "javascript", "typescript", "css", "html", "ui"], category: "Frontend" },
    { keywords: ["backend", "node", "express", "api", "rest", "graphql", "sql", "mongodb", "postgres", "database", "server"], category: "Backend" },
    { keywords: ["ai", "ml", "machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "llm", "data science", "python", "neural"], category: "AI/ML" },
    { keywords: ["devops", "docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "jenkins", "terraform", "infrastructure"], category: "DevOps" },
    { keywords: ["design", "figma", "ui/ux", "user experience", "user interface", "product design", "wireframe", "prototype", "ux"], category: "Design" },
  ];
  const matched = [];
  for (const m of keywordMap) {
    if (m.keywords.some(kw => allText.includes(kw))) matched.push(m.category);
  }
  return matched.length > 0 ? matched : ["General"];
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

export function getQuestionsForJob(job) {
  const categories = detectCategories(job);

  const techQuestions = [];
  for (const cat of categories) {
    const pool = techMap[cat];
    if (pool) techQuestions.push(...pickRandom(pool, 10));
  }
  if (techQuestions.length < 15) {
    const allTech = Object.values(techMap).flat();
    techQuestions.push(...pickRandom(allTech, 15 - techQuestions.length));
  }
  const technical = techQuestions.sort(() => Math.random() - 0.5).slice(0, 18).map((q, i) => ({ ...q, id: `t${i + 1}` }));

  const aptitude = pickRandom(aptitudePool, 5).map((q, i) => ({ ...q, id: `a${i + 1}` }));
  const logical = pickRandom(logicalPool, 5).map((q, i) => ({ ...q, id: `l${i + 1}` }));

  let coding = [];
  for (const cat of categories) {
    const pool = codingChallenges[cat];
    if (pool) coding = [...pool].sort(() => Math.random() - 0.5).slice(0, 2);
  }
  if (coding.length === 0) {
    const allCoding = Object.values(codingChallenges).flat();
    coding = [...allCoding].sort(() => Math.random() - 0.5).slice(0, 1);
  }
  coding = coding.map((c, i) => ({ ...c, id: `c${i + 1}` }));

  return { technical, aptitude, logical, coding };
}

export function calculateLevel(mcqScore, mcqTotal, codingResults) {
  const mcqPerc = (mcqScore / mcqTotal) * 100;
  const codingScore = codingResults.filter(Boolean).length;
  const codingTotal = codingResults.length;
  const codingPerc = codingTotal > 0 ? (codingScore / codingTotal) * 100 : 0;
  const combined = mcqPerc * 0.75 + codingPerc * 0.25;
  if (combined >= 70) return { label: "Job Ready", color: "#10b981", emoji: "🚀" };
  if (combined >= 40) return { label: "Intermediate", color: "#f59e0b", emoji: "📈" };
  return { label: "Beginner", color: "#ef4444", emoji: "🌱" };
}

export function evaluateCodingAnswer(question, code) {
  if (!code || code.trim().length < 10) return false;
  const lower = code.toLowerCase();
  const matches = (question.keywords || []).filter(kw => lower.includes(kw.toLowerCase()));
  return matches.length / (question.keywords?.length || 1) >= 0.35;
}
