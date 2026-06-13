/**
 * Static topic library shown as the FIRST step of the onboarding questionnaire.
 * The learner picks from these, then the backend generates adaptive follow-up
 * questions based on the selections. Topic/category ids are stable strings sent
 * to the backend (FollowUpRequest / QuestionnaireGoals).
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
      { id: "cpp", label: "C++" },
      { id: "java", label: "Java" },
      { id: "go", label: "Go" },
      { id: "rust", label: "Rust" },
    ],
  },
  {
    id: "cs-topics",
    label: "Programming Topics & DSA",
    blurb: "Data structures and algorithms",
    topics: [
      { id: "arrays-strings", label: "Arrays & Strings" },
      { id: "linked-lists", label: "Linked Lists" },
      { id: "stacks-queues", label: "Stacks & Queues" },
      { id: "trees-graphs", label: "Trees & Graphs" },
      { id: "hashing", label: "Hashing" },
      { id: "recursion", label: "Recursion & Backtracking" },
      { id: "sorting-searching", label: "Sorting & Searching" },
      { id: "dynamic-programming", label: "Dynamic Programming" },
      { id: "complexity", label: "Time & Space Complexity" },
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
      { id: "linear-algebra", label: "Linear Algebra" },
      { id: "probability-stats", label: "Probability & Statistics" },
      { id: "discrete-math", label: "Discrete Mathematics" },
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
      { id: "segment-trees", label: "Segment / Fenwick Trees" },
      { id: "string-algorithms", label: "String Algorithms" },
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
      { id: "math-puzzles", label: "Math Puzzles" },
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
