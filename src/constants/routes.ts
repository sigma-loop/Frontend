/**
 * Route path constants for the SigmaLoop Frontend.
 * Use these instead of hardcoding strings in components and navigation.
 */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  ONBOARDING: "/onboarding",
  MENTOR: "/mentor",
  MY_COURSES: "/my-courses",
  COURSE_DETAILS: "/courses/:courseId",
  LESSON: "/lessons/:lessonId",

  // Admin
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_JOBS: "/admin/jobs",
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
