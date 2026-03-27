/**
 * Route path constants for the SigmaLoop Frontend.
 * Use these instead of hardcoding strings in components and navigation.
 */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  COURSES: "/courses",
  COURSE_DETAILS: "/courses/:courseId",
  LESSON: "/lessons/:lessonId",
  CURRICULUM: "/curriculum",
  MENTOR: "/mentor",

  // Admin
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_COURSES: "/admin/courses",
  ADMIN_COURSE_NEW: "/admin/courses/new",
  ADMIN_COURSE_EDIT: "/admin/courses/:courseId/edit",
  ADMIN_LESSONS: "/admin/lessons",
  ADMIN_LESSON_NEW: "/admin/lessons/new",
  ADMIN_LESSON_EDIT: "/admin/lessons/:lessonId/edit",
  ADMIN_CHALLENGES: "/admin/challenges",
  ADMIN_CHALLENGE_NEW: "/admin/challenges/new",
  ADMIN_CHALLENGE_EDIT: "/admin/challenges/:challengeId/edit",
  ADMIN_USERS: "/admin/users",
} as const;

/**
 * Build a route path by replacing :param placeholders with actual values.
 *
 * @example
 * buildRoute(ROUTES.COURSE_DETAILS, { courseId: '123' })
 * // → "/courses/123"
 */
export function buildRoute(
  template: string,
  params: Record<string, string>
): string {
  let path = template;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`:${key}`, encodeURIComponent(value));
  }
  return path;
}
