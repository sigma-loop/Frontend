import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MathOutputPanel from "./MathOutputPanel";
import type { MathExecutionResult } from "../../../types/api";

const makeResult = (
  overrides: Partial<MathExecutionResult> = {}
): MathExecutionResult => ({
  submissionId: "s1",
  status: "PASSED",
  verdict: {
    correct: true,
    equivalentForm: false,
    rationale: "Both roots are correct.",
    confidence: 0.95,
  },
  ...overrides,
});

describe("MathOutputPanel", () => {
  it("shows the empty state before any run", () => {
    render(<MathOutputPanel result={null} />);
    expect(
      screen.getByText(/Write your LaTeX answer and click Run/)
    ).toBeInTheDocument();
  });

  it("renders a confident correct verdict as Correct", () => {
    render(<MathOutputPanel result={makeResult()} />);
    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument();
  });

  it("renders a confident incorrect verdict as Incorrect", () => {
    render(
      <MathOutputPanel
        result={makeResult({
          status: "FAILED",
          verdict: {
            correct: false,
            equivalentForm: false,
            rationale: "x = 1 is not a root.",
            confidence: 0.9,
          },
        })}
      />
    );
    expect(screen.getByText("Incorrect")).toBeInTheDocument();
  });

  it("surfaces low-confidence verdicts as Pending review, not correct/incorrect", () => {
    render(
      <MathOutputPanel
        result={makeResult({
          status: "PENDING_REVIEW",
          verdict: {
            correct: true,
            equivalentForm: true,
            rationale: "Unsure about equivalence.",
            confidence: 0.5,
          },
        })}
      />
    );
    expect(screen.getByText("Pending review")).toBeInTheDocument();
    expect(
      screen.getByText(/wasn't confident enough to auto-grade/)
    ).toBeInTheDocument();
  });

  it("flags equivalent-form answers", () => {
    render(
      <MathOutputPanel
        result={makeResult({
          verdict: {
            correct: true,
            equivalentForm: true,
            rationale: "Equivalent factored form.",
            confidence: 0.9,
          },
        })}
      />
    );
    expect(screen.getByText("Equivalent form")).toBeInTheDocument();
  });
});
