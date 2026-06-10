import { describe, it, expect } from "vitest";
import { ROUTES, buildRoute } from "./routes";

describe("routes", () => {
  it("builds parameterized routes", () => {
    expect(buildRoute(ROUTES.COURSE_DETAILS, { courseId: "abc123" })).toBe(
      "/courses/abc123"
    );
    expect(buildRoute(ROUTES.LESSON, { lessonId: "l1" })).toBe("/lessons/l1");
  });

  it("URL-encodes parameter values", () => {
    expect(buildRoute(ROUTES.COURSE_DETAILS, { courseId: "a/b" })).toBe(
      "/courses/a%2Fb"
    );
  });

  it("has no instructor or manual-authoring routes", () => {
    const allRoutes = Object.values(ROUTES).join(" ");
    expect(allRoutes).not.toContain("instructor");
    expect(allRoutes).not.toContain("generate-course");
    expect(allRoutes).not.toContain("admin/courses");
  });
});
