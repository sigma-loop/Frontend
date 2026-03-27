/**
 * App-wide constants for the SigmaLoop Frontend.
 */

// API
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

// Auth
export const TOKEN_STORAGE_KEY = "token";

// Roles
export const ROLES = {
  STUDENT: "STUDENT",
  INSTRUCTOR: "INSTRUCTOR",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const CONTENT_MANAGER_ROLES: UserRole[] = [
  ROLES.ADMIN,
  ROLES.INSTRUCTOR,
];

// Difficulty levels
export const DIFFICULTIES = {
  BEGINNER: "BEGINNER",
  INTERMEDIATE: "INTERMEDIATE",
  ADVANCED: "ADVANCED",
} as const;

export type Difficulty =
  (typeof DIFFICULTIES)[keyof typeof DIFFICULTIES];

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

// Lesson types
export const LESSON_TYPES = {
  LESSON: "LESSON",
  CHALLENGE: "CHALLENGE",
} as const;

// Lesson statuses
export const LESSON_STATUSES = {
  LOCKED: "LOCKED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

// Execution statuses
export const EXECUTION_STATUSES = {
  PASS: "PASS",
  FAIL: "FAIL",
  ERROR: "ERROR",
  PASSED: "PASSED",
  FAILED: "FAILED",
} as const;
