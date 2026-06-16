/**
 * GOD admin panel — frontend resource registry.
 *
 * Mirrors the backend ADMIN_RESOURCES registry. Describes, for every
 * collection, how to render its list (columns), what filters/search to expose,
 * and a starting template for creating a new record. The generic explorer
 * pages read from here, so adding a collection is one entry.
 */

export type AdminColumnKind =
  | "text"
  | "badge"
  | "date"
  | "rel"
  | "id"
  | "truncate"
  | "bool"
  | "ref";

export interface AdminColumn {
  key: string;
  label: string;
  kind?: AdminColumnKind;
  /** For kind "ref": which field of the populated object to display. */
  refField?: string;
}

export interface AdminFilterOption {
  value: string;
  label: string;
}

export interface AdminFilter {
  key: string;
  label: string;
  /** "select" (default) renders a dropdown; "number" renders a numeric input. */
  control?: "select" | "number";
  /** Required for a "select" control; ignored for "number". */
  options?: AdminFilterOption[];
  /** Placeholder for a "number" control. */
  placeholder?: string;
}

export interface AdminResourceMeta {
  key: string;
  label: string; // plural, sidebar + heading
  singular: string;
  icon: string; // lucide icon name, mapped in AdminLayout
  searchable: boolean;
  columns: AdminColumn[];
  filters: AdminFilter[];
  template: Record<string, unknown>;
}

const opt = (vals: string[]): AdminFilterOption[] =>
  vals.map((v) => ({ value: v, label: v }));

const GEN_STATUS = ["PENDING", "GENERATING", "READY", "FAILED"];
const LESSON_STATUS = ["STUB", "GENERATING", "READY"];
const SUB_STATUS = ["PENDING", "RUNNING", "PASSED", "FAILED", "PENDING_REVIEW"];
const DIFFICULTY = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const KIND = ["PROGRAMMING", "MATH", "MCQ"];
const ACTION_TYPE = [
  "CREATE_COURSE",
  "GENERATE_MORE_LESSONS",
  "CREATE_LESSON",
  "EDIT_LESSON",
  "UPDATE_COURSE",
  "OTHER",
];

export const ADMIN_RESOURCES: AdminResourceMeta[] = [
  {
    key: "users",
    label: "Users",
    singular: "user",
    icon: "Users",
    searchable: true,
    columns: [
      { key: "profileData", label: "Name", kind: "ref", refField: "name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role", kind: "badge" },
      { key: "stats", label: "XP", kind: "ref", refField: "totalXp" },
      { key: "createdAt", label: "Created", kind: "rel" },
    ],
    filters: [
      { key: "role", label: "role", options: opt(["STUDENT", "ADMIN"]) },
    ],
    template: {
      email: "new.user@example.com",
      password: "changeme123",
      role: "STUDENT",
      profileData: { name: "New User" },
    },
  },
  {
    key: "courses",
    label: "Courses",
    singular: "course",
    icon: "BookOpen",
    searchable: true,
    columns: [
      { key: "title", label: "Title" },
      { key: "userId", label: "Owner", kind: "ref", refField: "email" },
      { key: "status", label: "Status", kind: "badge" },
      { key: "difficulty", label: "Difficulty", kind: "badge" },
      { key: "createdAt", label: "Created", kind: "rel" },
    ],
    filters: [
      { key: "status", label: "status", options: opt(GEN_STATUS) },
      { key: "difficulty", label: "difficulty", options: opt(DIFFICULTY) },
    ],
    template: {
      userId: "",
      title: "New Course",
      description: "",
      difficulty: "BEGINNER",
      tags: [],
      status: "READY",
    },
  },
  {
    key: "lessons",
    label: "Lessons",
    singular: "lesson",
    icon: "GraduationCap",
    searchable: true,
    columns: [
      { key: "title", label: "Title" },
      { key: "orderIndex", label: "#" },
      { key: "courseId", label: "Course", kind: "ref", refField: "title" },
      { key: "status", label: "Status", kind: "badge" },
      { key: "createdAt", label: "Created", kind: "rel" },
    ],
    filters: [{ key: "status", label: "status", options: opt(LESSON_STATUS) }],
    template: {
      userId: "",
      courseId: "",
      title: "New Lesson",
      orderIndex: 0,
      contentMarkdown: "",
      status: "READY",
    },
  },
  {
    key: "challenges",
    label: "Challenges",
    singular: "challenge",
    icon: "Puzzle",
    searchable: true,
    columns: [
      { key: "title", label: "Title" },
      { key: "kind", label: "Kind", kind: "badge" },
      { key: "lessonId", label: "Lesson", kind: "ref", refField: "title" },
      { key: "createdAt", label: "Created", kind: "rel" },
    ],
    filters: [
      { key: "kind", label: "kind", options: opt(KIND) },
      {
        key: "hasTestcases",
        label: "test cases",
        options: [
          { value: "true", label: "Has test cases" },
          { value: "false", label: "No test cases" },
        ],
      },
      {
        key: "minTestcases",
        label: "min test cases",
        control: "number",
        placeholder: "min tests",
      },
    ],
    template: {
      userId: "",
      lessonId: "",
      kind: "MCQ",
      title: "New MCQ Challenge",
      prompt: "What is 2 + 2?",
      options: [
        { text: "4", isCorrect: true, explanation: "Correct." },
        { text: "5", isCorrect: false, explanation: "Incorrect." },
      ],
      allowMultiple: false,
      overallExplanation: "",
    },
  },
  {
    key: "submissions",
    label: "Submissions",
    singular: "submission",
    icon: "CheckSquare",
    searchable: false,
    columns: [
      { key: "kind", label: "Kind", kind: "badge" },
      { key: "status", label: "Status", kind: "badge" },
      { key: "userId", label: "User", kind: "ref", refField: "email" },
      {
        key: "challengeId",
        label: "Challenge",
        kind: "ref",
        refField: "title",
      },
      { key: "createdAt", label: "When", kind: "rel" },
    ],
    filters: [
      { key: "kind", label: "kind", options: opt(KIND) },
      { key: "status", label: "status", options: opt(SUB_STATUS) },
    ],
    template: {
      userId: "",
      challengeId: "",
      kind: "MCQ",
      status: "PASSED",
      selectedOptionIds: [],
    },
  },
  {
    key: "progress",
    label: "Lesson Progress",
    singular: "progress record",
    icon: "TrendingUp",
    searchable: false,
    columns: [
      { key: "userId", label: "User", kind: "ref", refField: "email" },
      { key: "lessonId", label: "Lesson", kind: "ref", refField: "title" },
      { key: "isCompleted", label: "Completed", kind: "bool" },
      { key: "completedAt", label: "Completed At", kind: "rel" },
    ],
    filters: [
      {
        key: "isCompleted",
        label: "state",
        options: [
          { value: "true", label: "Completed" },
          { value: "false", label: "In progress" },
        ],
      },
    ],
    template: { userId: "", lessonId: "", isCompleted: false },
  },
  {
    key: "jobs",
    label: "Curriculum Jobs",
    singular: "job",
    icon: "Sparkles",
    searchable: true,
    columns: [
      { key: "prompt", label: "Prompt", kind: "truncate" },
      { key: "type", label: "Type", kind: "badge" },
      { key: "status", label: "Status", kind: "badge" },
      { key: "userId", label: "User", kind: "ref", refField: "email" },
      { key: "createdAt", label: "Created", kind: "rel" },
    ],
    filters: [
      { key: "status", label: "status", options: opt(GEN_STATUS) },
      {
        key: "type",
        label: "type",
        options: opt(["NEW_COURSE", "EXTEND_COURSE"]),
      },
    ],
    template: { userId: "", type: "NEW_COURSE", prompt: "", status: "PENDING" },
  },
  {
    key: "threads",
    label: "Chat Threads",
    singular: "thread",
    icon: "MessagesSquare",
    searchable: true,
    columns: [
      { key: "title", label: "Title" },
      { key: "scope", label: "Scope", kind: "badge" },
      { key: "userId", label: "User", kind: "ref", refField: "email" },
      { key: "updatedAt", label: "Updated", kind: "rel" },
    ],
    filters: [
      {
        key: "scope",
        label: "scope",
        options: opt(["GENERAL", "COURSE", "LESSON"]),
      },
    ],
    template: { userId: "", title: "New Thread", scope: "GENERAL" },
  },
  {
    key: "messages",
    label: "Chat Messages",
    singular: "message",
    icon: "MessageSquare",
    searchable: true,
    columns: [
      { key: "role", label: "Role", kind: "badge" },
      { key: "content", label: "Content", kind: "truncate" },
      { key: "threadId", label: "Thread", kind: "id" },
      { key: "createdAt", label: "When", kind: "rel" },
    ],
    filters: [
      {
        key: "role",
        label: "role",
        options: opt(["USER", "ASSISTANT", "SYSTEM"]),
      },
    ],
    template: { threadId: "", role: "USER", content: "" },
  },
  {
    key: "actions",
    label: "Mentor Actions",
    singular: "action",
    icon: "Wand2",
    searchable: true,
    columns: [
      { key: "type", label: "Type", kind: "badge" },
      { key: "summary", label: "Summary", kind: "truncate" },
      { key: "userId", label: "User", kind: "ref", refField: "email" },
      { key: "createdAt", label: "When", kind: "rel" },
    ],
    filters: [{ key: "type", label: "type", options: opt(ACTION_TYPE) }],
    template: { userId: "", type: "OTHER", summary: "" },
  },
];

export const ADMIN_RESOURCE_MAP: Record<string, AdminResourceMeta> =
  Object.fromEntries(ADMIN_RESOURCES.map((r) => [r.key, r]));

/** Foreign-key fields the explorer recognises as scoping filters (drill-down). */
export const REF_FILTER_KEYS = [
  "userId",
  "courseId",
  "lessonId",
  "challengeId",
  "threadId",
];

/** Human labels for the scope chips that show an active drill-down filter. */
export const REF_FILTER_LABELS: Record<string, string> = {
  userId: "User",
  courseId: "Course",
  lessonId: "Lesson",
  challengeId: "Challenge",
  threadId: "Thread",
};
