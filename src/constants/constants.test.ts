import { describe, it, expect } from "vitest";
import {
  ROLES,
  CHALLENGE_KINDS,
  GENERATION_STATUSES,
  MATH_CONFIDENCE_THRESHOLD,
} from "./index";

describe("constants", () => {
  it("has exactly two roles: STUDENT and ADMIN", () => {
    expect(Object.values(ROLES)).toEqual(["STUDENT", "ADMIN"]);
  });

  it("has exactly two challenge kinds: PROGRAMMING and MATH", () => {
    expect(Object.values(CHALLENGE_KINDS)).toEqual(["PROGRAMMING", "MATH"]);
  });

  it("tracks the full generation lifecycle", () => {
    expect(Object.values(GENERATION_STATUSES)).toEqual([
      "PENDING",
      "GENERATING",
      "READY",
      "FAILED",
    ]);
  });

  it("matches the backend math confidence threshold", () => {
    expect(MATH_CONFIDENCE_THRESHOLD).toBe(0.7);
  });
});
