export interface JSendResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  details?: unknown;
}

export interface User {
  id: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  profileData?: {
    name: string;
  };
  stats?: {
    streakDays: number;
    totalXp: number;
    lessonsCompleted: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ──────────────────────────────────────────
// Curriculum pipeline
// ──────────────────────────────────────────

export type GenerationStatus = "PENDING" | "GENERATING" | "READY" | "FAILED";

export interface CurriculumJob {
  id: string;
  prompt: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null;
  status: GenerationStatus;
  courseId: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────
// Courses & Lessons — per-user, AI-generated
// ──────────────────────────────────────────

export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  tags: string[];
  status: GenerationStatus;
  createdAt: string;
  meta: {
    lessonCount: number;
    durationHours: number;
  };
}

export interface Lesson {
  id: string;
  title: string;
  orderIndex?: number;
  contentMarkdown?: string;
  courseId?: string;
  challenges?: Challenge[];
  nextLessonId?: string | null;
  prevLessonId?: string | null;
}

// ──────────────────────────────────────────
// Challenges — discriminated by kind
// ──────────────────────────────────────────

export type ChallengeKind = "PROGRAMMING" | "MATH";

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

interface ChallengeBase {
  id: string;
  lessonId?: string;
  title: string;
  kind: ChallengeKind;
}

export interface ProgrammingChallenge extends ChallengeBase {
  kind: "PROGRAMMING";
  description: string;
  starterCodes: Record<string, string>;
  testCases?: TestCase[];
}

export interface MathChallenge extends ChallengeBase {
  kind: "MATH";
  problemLatex: string;
  mathRunLimit: number;
}

export type Challenge = ProgrammingChallenge | MathChallenge;

// ──────────────────────────────────────────
// Execution (PROGRAMMING / Judge0)
// ──────────────────────────────────────────

export interface TestResult {
  index: number;
  passed: boolean;
  status: string;
  isHidden?: boolean;
  input: string | null;
  expectedOutput: string | null;
  actualOutput: string | null;
  stderr: string | null;
  time: string | null;
  memory: number | null;
}

export interface ExecutionResult {
  status: "PASSED" | "FAILED" | "ERROR";
  stdout?: string;
  stderr?: string;
  testResults?: TestResult[];
  metrics: {
    runtime: string;
    memoryUsed?: string;
    passed?: number;
    total?: number;
  };
}

export interface SubmissionResult extends ExecutionResult {
  submissionId: string;
  lessonCompleted?: boolean;
}

// ──────────────────────────────────────────
// Math grading (LLM verdict)
// ──────────────────────────────────────────

export interface MathVerdict {
  correct: boolean;
  equivalentForm: boolean;
  rationale: string;
  confidence: number;
}

export type MathSubmissionStatus = "PASSED" | "FAILED" | "PENDING_REVIEW";

export interface MathExecutionResult {
  submissionId: string;
  verdict: MathVerdict;
  status: MathSubmissionStatus;
  remainingRuns?: number;
  lessonCompleted?: boolean;
}

export interface MathRunStatus {
  limit: number;
  used: number;
  remaining: number;
}

// ──────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────

export interface DashboardResponse {
  user: {
    name: string;
    avatar: string | null;
  };
  stats: {
    streakDays: number;
    totalXp: number;
    lessonsCompleted: number;
  };
  quickResume: {
    courseId: string;
    courseTitle: string;
    lessonId: string;
    lessonTitle: string;
  } | null;
}

// ──────────────────────────────────────────
// Chat
// ──────────────────────────────────────────

export interface ChatThread {
  id: string;
  title: string;
  scope?: "GENERAL" | "LESSON" | "COURSE";
  scopeId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  curriculumJob: {
    id: string;
    status: GenerationStatus;
    prompt: string;
  } | null;
}

// ──────────────────────────────────────────
// Syllabus
// ──────────────────────────────────────────

export interface SyllabusResponse {
  course: {
    id: string;
    title: string;
    description: string;
    status: GenerationStatus;
  };
  userProgress: {
    percent: number;
  };
  lessons: {
    id: string;
    orderIndex: number;
    title: string;
    status: "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "COMPLETED";
  }[];
}
