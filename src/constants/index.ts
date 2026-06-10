/**
 * App-wide constants for the SigmaLoop Frontend.
 */

// API
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

// Auth
export const TOKEN_STORAGE_KEY = "token";

// Roles — STUDENT and ADMIN only; there is no INSTRUCTOR role.
export const ROLES = {
  STUDENT: "STUDENT",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// Challenge kinds
export const CHALLENGE_KINDS = {
  PROGRAMMING: "PROGRAMMING",
  MATH: "MATH",
} as const;

export type ChallengeKindConst =
  (typeof CHALLENGE_KINDS)[keyof typeof CHALLENGE_KINDS];

// Generation statuses (courses + curriculum jobs)
export const GENERATION_STATUSES = {
  PENDING: "PENDING",
  GENERATING: "GENERATING",
  READY: "READY",
  FAILED: "FAILED",
} as const;

// Math verdicts below this confidence show as "Pending review"
export const MATH_CONFIDENCE_THRESHOLD = 0.7;

// Difficulty levels
export const DIFFICULTIES = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
} as const;

export type Difficulty = (typeof DIFFICULTIES)[keyof typeof DIFFICULTIES];

// Supported programming languages
export const SUPPORTED_LANGUAGES = [
  "python",
  "cpp",
  "java",
  "javascript",
  "typescript",
  "go",
  "rust",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_DISPLAY_NAMES: Record<SupportedLanguage, string> = {
  python: "Python",
  cpp: "C++",
  java: "Java",
  javascript: "JavaScript",
  typescript: "TypeScript",
  go: "Go",
  rust: "Rust",
};

// Monaco Editor language IDs
export const LANGUAGE_MONACO_IDS: Record<SupportedLanguage, string> = {
  python: "python",
  cpp: "cpp",
  java: "java",
  javascript: "javascript",
  typescript: "typescript",
  go: "go",
  rust: "rust",
};

// Lesson statuses
export const LESSON_STATUSES = {
  LOCKED: "LOCKED",
  UNLOCKED: "UNLOCKED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

// Execution statuses
export const EXECUTION_STATUSES = {
  PASSED: "PASSED",
  FAILED: "FAILED",
  ERROR: "ERROR",
  PENDING_REVIEW: "PENDING_REVIEW",
} as const;
