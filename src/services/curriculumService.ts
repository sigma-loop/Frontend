import api from "./api";
import type { JSendResponse, CurriculumJob } from "../types/api";

export interface CurriculumRequestPayload {
  prompt: string;
  difficulty?: string;
  threadId?: string;
}

export const curriculumService = {
  /**
   * Enqueue a curriculum-generation job. Returns immediately (202);
   * poll getJob() (via useCurriculumJob) until READY or FAILED.
   */
  request: async (
    payload: CurriculumRequestPayload
  ): Promise<CurriculumJob> => {
    const response = await api.post<JSendResponse<{ job: CurriculumJob }>>(
      "/curriculum/request",
      payload
    );
    if (!response.data.data) throw new Error("Failed to request curriculum");
    return response.data.data.job;
  },

  getJob: async (jobId: string): Promise<CurriculumJob> => {
    const response = await api.get<JSendResponse<{ job: CurriculumJob }>>(
      `/curriculum/jobs/${jobId}`
    );
    if (!response.data.data) throw new Error("Job not found");
    return response.data.data.job;
  },

  listJobs: async (): Promise<CurriculumJob[]> => {
    const response =
      await api.get<JSendResponse<{ jobs: CurriculumJob[] }>>(
        "/curriculum/jobs"
      );
    return response.data.data?.jobs || [];
  },
};
