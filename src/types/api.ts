export interface JSendResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  details?: unknown;
}

// How a course syllabus gates its lessons. PROGRESS unlocks each lesson only
// after the previous one is completed (default); VIEW_ALL unlocks them all.
export type LessonLockMode = "PROGRESS" | "VIEW_ALL";

export interface UserPreferences {
  notifications: {
    curriculumReady: boolean;
    weeklyProgress: boolean;
    productUpdates: boolean;
  };
  privacy: {
    marketingEmails: boolean;
    usageAnalytics: boolean;
  };
  // Chosen UI language + its layout direction. English/LTR is the default;
  // `direction` is derived server-side from the language.
  localization?: {
    language: string;
    direction: "ltr" | "rtl";
  };
  // Lesson-lock behavior across the learner's courses.
  learning?: {
    lessonLockMode: LessonLockMode;
  };
}

export interface User {
  id: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  profileData?: {
    name: string;
  };
  preferences?: UserPreferences;
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
  type?: "NEW_COURSE" | "EXTEND_COURSE";
  prompt: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null;
  targetCourseId?: string | null;
  status: GenerationStatus;
  courseId: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────
// Onboarding questionnaire (hybrid: static library + AI follow-ups)
// ──────────────────────────────────────────

export type QuestionnaireQuestionType = "single" | "multi" | "text";

export interface QuestionnaireQuestion {
  id: string;
  question: string;
  type: QuestionnaireQuestionType;
  options?: string[]; // present for single/multi
}

export interface FollowUpRequest {
  topics: string[];
  categories: string[];
}

export interface FollowUpResponse {
  questions: QuestionnaireQuestion[];
}

export interface QuestionnaireGoals {
  topics: string[];
  categories: string[];
  followups: { question: string; answer: string }[];
  freeText?: string;
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

// Generation lifecycle for a lazily-generated lesson. Missing = legacy READY.
export type LessonGenerationStatus = "STUB" | "GENERATING" | "READY";

export interface Lesson {
  id: string;
  title: string;
  orderIndex?: number;
  contentMarkdown?: string;
  courseId?: string;
  // Lazy "generate on open": STUB lessons are materialized on first open.
  status?: LessonGenerationStatus;
  summary?: string;
  challenges?: Challenge[];
  nextLessonId?: string | null;
  prevLessonId?: string | null;
}

// On-demand lesson translation (POST /lessons/:id/translate). Only the prose
// the student reads is translated; code, LaTeX, and answer keys are untouched
// and merged back from the original challenge on the client.
export interface LessonTranslationChallenge {
  challengeId: string;
  title?: string;
  description?: string; // PROGRAMMING
  problemLatex?: string; // MATH (prose translated, LaTeX preserved)
  prompt?: string; // MCQ stem
  options?: { id: string; text: string }[]; // MCQ option text
}

export interface LessonTranslationResult {
  lessonId: string;
  language: string;
  title: string;
  contentMarkdown: string;
  challenges: LessonTranslationChallenge[];
}

// ──────────────────────────────────────────
// Challenges — discriminated by kind
// ──────────────────────────────────────────

export type ChallengeKind = "PROGRAMMING" | "MATH" | "MCQ";

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
  // Whether the user has already passed this challenge (from GET /lessons/:id).
  passed?: boolean;
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

// MCQ — server-side graded. The correct answers/explanations are NEVER part
// of the challenge payload; they only arrive in the submit verdict.
export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQChallenge extends ChallengeBase {
  kind: "MCQ";
  prompt: string;
  options: MCQOption[];
  allowMultiple: boolean;
}

export type Challenge = ProgrammingChallenge | MathChallenge | MCQChallenge;

export interface MCQOptionExplanation {
  optionId: string;
  correct: boolean;
  explanation: string;
}

export interface MCQVerdict {
  correct: boolean;
  partial: boolean;
  correctOptionIds: string[];
  explanations: MCQOptionExplanation[];
  rationale: string;
}

export interface MCQSubmissionResult {
  submissionId: string;
  status: "PASSED" | "FAILED";
  verdict: MCQVerdict;
  lessonCompleted?: boolean;
}

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

// The learner's current editor code, sent alongside a lesson-chat message so
// the hint model can see their actual attempt. Not stored as part of the
// message — it's ephemeral context for the AI only.
export interface ChatCodeContext {
  code: string;
  language?: string;
  challengeTitle?: string;
}

// An autonomous action the mentor took on the learner's behalf during a turn
// (course/lesson creation or edit). Surfaced under the assistant message.
export type MentorActionType =
  | "CREATE_COURSE"
  | "GENERATE_MORE_LESSONS"
  | "CREATE_LESSON"
  | "EDIT_LESSON"
  | "UPDATE_COURSE"
  | "OTHER";

export interface MentorAction {
  type: MentorActionType;
  summary: string;
  courseId?: string | null;
  lessonId?: string | null;
  jobId?: string | null;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  curriculumJob: {
    id: string;
    status: GenerationStatus;
    prompt: string;
  } | null;
  // Mutations the mentor performed this turn (autonomous tools). Optional for
  // back-compat with older responses.
  actions?: MentorAction[];
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
  // The lock mode the lesson statuses below were computed with (echoes the
  // user's preference). In VIEW_ALL no lesson is ever "LOCKED".
  lessonLockMode?: LessonLockMode;
  lessons: {
    id: string;
    orderIndex: number;
    title: string;
    status: "LOCKED" | "UNLOCKED" | "IN_PROGRESS" | "COMPLETED";
    // STUB = not generated yet (will materialize when opened).
    generationStatus?: LessonGenerationStatus;
  }[];
}

// ──────────────────────────────────────────
// Admin — GOD panel (generic CRUD over every collection)
// ──────────────────────────────────────────

export type AdminRecord = Record<string, unknown>;

export interface AdminListPagination {
  page: number;
  perPage: number;
  total: number;
  pages: number;
}

export interface AdminListResult {
  resource: string;
  label?: string;
  items: AdminRecord[];
  pagination: AdminListPagination;
}

/** One step in a record's drill-up breadcrumb (root → immediate parent). */
export interface AdminAncestor {
  resource: string;
  id: string;
  label: string;
}

export interface AdminRecordResult {
  item: AdminRecord;
  ancestors: AdminAncestor[];
}

export interface AdminResourceCatalogEntry {
  key: string;
  label: string;
  count: number;
  searchFields: string[];
  filterFields: string[];
  sortFields: string[];
}

export type AppSettingType = "string" | "number" | "boolean" | "enum" | "csv";

export interface AppSetting {
  key: string;
  group: string;
  label: string;
  help?: string;
  type: AppSettingType;
  options?: string[];
  min?: number;
  max?: number;
  editable: boolean;
  sensitive: boolean;
  source: "db" | "env";
  value: string | number | boolean | string[] | null;
  configured?: boolean;
}

export interface AdminCountBucket {
  _id: string | null;
  count: number;
}

export interface AdminSeriesPoint {
  _id: string;
  count: number;
}

export interface AdminMetrics {
  totals: {
    users: number;
    courses: number;
    lessons: number;
    challenges: number;
    submissions: number;
    progress: number;
    jobs: number;
    threads: number;
    messages: number;
    actions: number;
  };
  breakdowns: {
    usersByRole: AdminCountBucket[];
    coursesByStatus: AdminCountBucket[];
    coursesByDifficulty: AdminCountBucket[];
    challengesByKind: AdminCountBucket[];
    submissionsByStatus: AdminCountBucket[];
    submissionsByKind: AdminCountBucket[];
    jobsByStatus: AdminCountBucket[];
    jobsByType: AdminCountBucket[];
    threadsByScope: AdminCountBucket[];
    actionsByType: AdminCountBucket[];
  };
  derived: {
    completedProgress: number;
    passedSubmissions: number;
    submissionPassRate: number;
    lessonCompletionRate: number;
    newUsers7: number;
    newCourses7: number;
  };
  series: {
    users: AdminSeriesPoint[];
    courses: AdminSeriesPoint[];
    submissions: AdminSeriesPoint[];
  };
}

export interface AdminOverviewChallenge {
  _id: string;
  title: string;
  kind: string;
}

export interface AdminOverviewLesson {
  _id: string;
  title: string;
  orderIndex?: number;
  status?: string;
  completed: boolean;
  challenges: AdminOverviewChallenge[];
}

export interface AdminOverviewCourse {
  _id: string;
  title: string;
  status?: string;
  difficulty?: string;
  createdAt?: string;
  lessons: AdminOverviewLesson[];
}

export interface AdminUserOverview {
  user: AdminRecord;
  counts: {
    courses: number;
    lessons: number;
    challenges: number;
    submissions: number;
    threads: number;
    jobs: number;
    actions: number;
    progress: number;
    completedLessons: number;
    messages: number;
  };
  courses: AdminOverviewCourse[];
  recentSubmissions: AdminRecord[];
  threads: AdminRecord[];
  actions: AdminRecord[];
  jobs: AdminRecord[];
}
