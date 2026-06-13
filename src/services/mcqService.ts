import api from "./api";
import type { JSendResponse, MCQSubmissionResult } from "../types/api";

export interface MCQSubmitPayload {
  challengeId: string;
  selectedOptionIds: string[];
}

/**
 * MCQ challenge grading. Graded deterministically on the server — the correct
 * options and explanations come back only in this submit response.
 */
export const mcqService = {
  submit: async (payload: MCQSubmitPayload): Promise<MCQSubmissionResult> => {
    const response = await api.post<JSendResponse<MCQSubmissionResult>>(
      "/mcq/submit",
      payload
    );
    if (!response.data.data) {
      throw new Error("No MCQ submission result returned");
    }
    return response.data.data;
  },
};
