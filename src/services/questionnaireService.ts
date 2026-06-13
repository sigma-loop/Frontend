import api from "./api";
import type {
  JSendResponse,
  FollowUpRequest,
  FollowUpResponse,
  QuestionnaireGoals,
  CurriculumJob,
} from "../types/api";

/**
 * Onboarding questionnaire. getFollowUps() fetches AI-generated adaptive
 * questions from the learner's static topic-library picks; submit() kicks off
 * course generation (via the curriculum pipeline) and returns a job to poll.
 */
export const questionnaireService = {
  getFollowUps: async (payload: FollowUpRequest): Promise<FollowUpResponse> => {
    const res = await api.post<JSendResponse<FollowUpResponse>>(
      "/curriculum/questionnaire/next",
      payload
    );
    if (!res.data.data) throw new Error("Failed to load follow-up questions");
    return res.data.data;
  },

  submit: async (
    goals: QuestionnaireGoals,
    difficulty?: string
  ): Promise<CurriculumJob> => {
    const res = await api.post<JSendResponse<{ job: CurriculumJob }>>(
      "/curriculum/request",
      { goals, difficulty }
    );
    if (!res.data.data) throw new Error("Failed to start course generation");
    return res.data.data.job;
  },
};
