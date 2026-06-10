import api from "./api";
import type {
  JSendResponse,
  MathExecutionResult,
  MathRunStatus,
} from "../types/api";

export interface MathPayload {
  challengeId: string;
  latex: string;
}

/**
 * MATH challenge grading. The student's LaTeX goes to the LLM grader;
 * verdicts with confidence < 0.7 come back as status PENDING_REVIEW.
 */
export const mathService = {
  run: async (payload: MathPayload): Promise<MathExecutionResult> => {
    const response = await api.post<JSendResponse<MathExecutionResult>>(
      "/math/run",
      payload
    );
    if (!response.data.data) {
      throw new Error("No math evaluation result returned");
    }
    return response.data.data;
  },

  submit: async (payload: MathPayload): Promise<MathExecutionResult> => {
    const response = await api.post<JSendResponse<MathExecutionResult>>(
      "/math/submit",
      payload
    );
    if (!response.data.data) {
      throw new Error("No math submission result returned");
    }
    return response.data.data;
  },

  getRunStatus: async (challengeId: string): Promise<MathRunStatus> => {
    const response = await api.get<JSendResponse<MathRunStatus>>(
      `/math/status/${challengeId}`
    );
    if (!response.data.data) {
      throw new Error("No math run status returned");
    }
    return response.data.data;
  },
};
