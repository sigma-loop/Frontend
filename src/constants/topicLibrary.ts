/**
 * Static topic library shown as the FIRST step of the onboarding questionnaire.
 * The learner picks from these, then the backend generates adaptive follow-up
 * questions based on the selections. Topic/category ids are stable strings sent
 * to the backend (FollowUpRequest / QuestionnaireGoals).
 *
 * The backend joins the picked topic ids straight into the generation prompt,
 * so ids are kept descriptive (e.g. "object-oriented-programming") and must be
 * GLOBALLY UNIQUE across every category — toggling and label lookup are by id.
 *
 * Math and competitive lists are intentionally ordered simple → complex.
 */

export interface TopicLibraryItem {
  id: string;
  label: string;
}

export interface TopicCategory {
  id: string;
  label: string;
  blurb: string;
  topics: TopicLibraryItem[];
}

export const TOPIC_LIBRARY: TopicCategory[] = [
  {
    id: "languages",
    label: "Programming Languages",
    blurb: "Learn a language from the ground up",
    topics: [
      { id: "python", label: "Python" },
      { id: "javascript", label: "JavaScript" },
      { id: "typescript", label: "TypeScript" },
      { id: "c", label: "C" },
      { id: "cpp", label: "C++" },
      { id: "csharp", label: "C#" },
      { id: "java", label: "Java" },
      { id: "kotlin", label: "Kotlin" },
      { id: "go", label: "Go" },
      { id: "rust", label: "Rust" },
      { id: "swift", label: "Swift" },
      { id: "ruby", label: "Ruby" },
      { id: "php", label: "PHP" },
      { id: "sql", label: "SQL" },
      { id: "r", label: "R" },
      { id: "bash", label: "Bash & Shell Scripting" },
      { id: "scala", label: "Scala" },
      { id: "haskell", label: "Haskell" },
    ],
  },
  {
    id: "cs-topics",
    label: "Data Structures & Algorithms",
    blurb: "The core building blocks of problem solving",
    topics: [
      { id: "arrays-strings", label: "Arrays & Strings" },
      { id: "linked-lists", label: "Linked Lists" },
      { id: "stacks-queues", label: "Stacks & Queues" },
      { id: "hashing", label: "Hashing" },
      { id: "sets-maps", label: "Sets & Maps" },
      { id: "trees-graphs", label: "Trees & Graphs" },
      { id: "heaps-priority-queues", label: "Heaps & Priority Queues" },
      { id: "tries", label: "Tries" },
      { id: "recursion", label: "Recursion & Backtracking" },
      { id: "sorting-searching", label: "Sorting & Searching" },
      { id: "binary-search", label: "Binary Search" },
      { id: "two-pointers", label: "Two Pointers" },
      { id: "sliding-window", label: "Sliding Window" },
      { id: "bit-manipulation", label: "Bit Manipulation" },
      { id: "graph-traversal", label: "Graph Traversal (BFS / DFS)" },
      { id: "union-find", label: "Union-Find (DSU)" },
      { id: "greedy-algorithms", label: "Greedy Algorithms" },
      { id: "divide-and-conquer", label: "Divide & Conquer" },
      { id: "dynamic-programming", label: "Dynamic Programming" },
      { id: "intervals", label: "Intervals & Sweep Line" },
      { id: "complexity", label: "Time & Space Complexity" },
    ],
  },
  {
    id: "cs-fundamentals",
    label: "Computer Science Fundamentals",
    blurb: "How software and machines actually work",
    topics: [
      {
        id: "object-oriented-programming",
        label: "Object-Oriented Programming",
      },
      { id: "functional-programming", label: "Functional Programming" },
      { id: "design-patterns", label: "Design Patterns" },
      { id: "databases", label: "Databases & SQL" },
      { id: "operating-systems", label: "Operating Systems" },
      { id: "computer-networks", label: "Computer Networks" },
      { id: "computer-architecture", label: "Computer Architecture" },
      { id: "concurrency", label: "Concurrency & Parallelism" },
      { id: "memory-management", label: "Memory Management" },
      { id: "compilers", label: "Compilers & Interpreters" },
    ],
  },
  {
    id: "web-dev",
    label: "Web Development",
    blurb: "Build for the browser and the server",
    topics: [
      { id: "html-css", label: "HTML & CSS" },
      { id: "responsive-design", label: "Responsive Design" },
      { id: "frontend-fundamentals", label: "Frontend Fundamentals" },
      { id: "react", label: "React" },
      { id: "state-management", label: "State Management" },
      { id: "nodejs", label: "Node.js & Express" },
      { id: "rest-apis", label: "REST APIs" },
      { id: "graphql", label: "GraphQL" },
      { id: "web-authentication", label: "Authentication & Security" },
      { id: "web-testing", label: "Testing for the Web" },
    ],
  },
  {
    id: "data-ai",
    label: "Data Science & AI",
    blurb: "From data wrangling to machine learning",
    topics: [
      { id: "python-for-data-science", label: "Python for Data Science" },
      { id: "numpy-and-pandas", label: "NumPy & Pandas" },
      { id: "data-visualization", label: "Data Visualization" },
      { id: "statistics-for-ml", label: "Statistics for ML" },
      { id: "linear-algebra-for-ml", label: "Linear Algebra for ML" },
      { id: "machine-learning-basics", label: "Machine Learning Basics" },
      { id: "supervised-learning", label: "Supervised Learning" },
      { id: "neural-networks", label: "Neural Networks" },
      { id: "deep-learning", label: "Deep Learning" },
      {
        id: "natural-language-processing",
        label: "Natural Language Processing",
      },
    ],
  },
  {
    id: "system-design",
    label: "System Design & Engineering",
    blurb: "Design and ship software that scales",
    topics: [
      { id: "system-design-basics", label: "System Design Basics" },
      { id: "scalability", label: "Scalability" },
      { id: "caching", label: "Caching" },
      { id: "database-scaling", label: "Database Scaling" },
      { id: "message-queues", label: "Message Queues" },
      { id: "microservices", label: "Microservices" },
      { id: "api-design", label: "API Design" },
      { id: "git-version-control", label: "Git & Version Control" },
      { id: "testing-and-tdd", label: "Testing & TDD" },
      { id: "docker-and-containers", label: "Docker & Containers" },
    ],
  },
  {
    id: "math",
    label: "Mathematics",
    blurb: "From the basics up to advanced topics",
    topics: [
      { id: "arithmetic", label: "Arithmetic & Number Sense" },
      { id: "algebra", label: "Algebra" },
      { id: "geometry", label: "Geometry" },
      { id: "trigonometry", label: "Trigonometry" },
      { id: "precalculus", label: "Pre-Calculus" },
      { id: "calculus", label: "Calculus" },
      { id: "multivariable-calculus", label: "Multivariable Calculus" },
      { id: "differential-equations", label: "Differential Equations" },
      { id: "linear-algebra", label: "Linear Algebra" },
      { id: "vectors", label: "Vectors" },
      { id: "matrices", label: "Matrices & Determinants" },
      { id: "complex-numbers", label: "Complex Numbers" },
      { id: "sequences-and-series", label: "Sequences & Series" },
      { id: "probability-stats", label: "Probability & Statistics" },
      { id: "mathematical-statistics", label: "Mathematical Statistics" },
      { id: "discrete-math", label: "Discrete Mathematics" },
      { id: "set-theory", label: "Set Theory" },
      { id: "logic-and-proofs", label: "Logic & Proofs" },
      { id: "combinatorics", label: "Combinatorics" },
      { id: "modular-arithmetic", label: "Modular Arithmetic" },
      { id: "optimization", label: "Optimization" },
    ],
  },
  {
    id: "competitive",
    label: "Competitive Programming",
    blurb: "Contest-style problem solving",
    topics: [
      { id: "cp-foundations", label: "CP Foundations" },
      { id: "greedy", label: "Greedy" },
      { id: "graph-algorithms", label: "Graph Algorithms" },
      { id: "number-theory", label: "Number Theory" },
      { id: "math-for-cp", label: "Math for Competitive Programming" },
      { id: "segment-trees", label: "Segment / Fenwick Trees" },
      { id: "range-queries", label: "Range Queries" },
      { id: "string-algorithms", label: "String Algorithms" },
      { id: "bitmasking", label: "Bitmasking" },
      { id: "computational-geometry", label: "Computational Geometry" },
      { id: "game-theory", label: "Game Theory" },
      { id: "advanced-dp", label: "Advanced DP" },
    ],
  },
  {
    id: "problem-solving",
    label: "Problem Solving",
    blurb: "Sharpen reasoning and patterns",
    topics: [
      { id: "patterns", label: "Common Patterns" },
      { id: "interview-prep", label: "Interview Prep" },
      { id: "coding-drills", label: "Coding Drills" },
      { id: "algorithmic-thinking", label: "Algorithmic Thinking" },
      { id: "math-puzzles", label: "Math Puzzles" },
      { id: "olympiad-math", label: "Olympiad Mathematics" },
      { id: "brain-teasers", label: "Brain Teasers" },
      { id: "logic", label: "Logical Reasoning" },
    ],
  },
];

/** Look up a human label for a topic id (falls back to the id). */
export function topicLabel(topicId: string): string {
  for (const cat of TOPIC_LIBRARY) {
    const t = cat.topics.find((x) => x.id === topicId);
    if (t) return t.label;
  }
  return topicId;
}
