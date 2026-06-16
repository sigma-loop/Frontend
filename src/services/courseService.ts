import api from "./api";
import type {
  JSendResponse,
  Course,
  SyllabusResponse,
  CurriculumJob,
} from "../types/api";

/**
 * Read-only course access. Every course belongs to the current user —
 * the API never returns anyone else's content.
 */
export const courseService = {
  getMyCourses: async (status?: string): Promise<Course[]> => {
    const response = await api.get<JSendResponse<Course[]>>("/courses", {
      params: status ? { status } : undefined,
    });
    return response.data.data || [];
  },

  getCourse: async (courseId: string): Promise<Course> => {
    const response = await api.get<JSendResponse<Course>>(
      `/courses/${courseId}`
    );
    if (!response.data.data) throw new Error("Course not found");
    return response.data.data;
  },

  getSyllabus: async (courseId: string): Promise<SyllabusResponse> => {
    const response = await api.get<JSendResponse<SyllabusResponse>>(
      `/courses/${courseId}/syllabus`
    );
    if (!response.data.data) throw new Error("Course not found");
    return response.data.data;
  },

  // Enqueue an EXTEND_COURSE job; returns the job to poll via useCurriculumJob.
  generateMore: async (
    courseId: string,
    opts?: { focus?: string; lessonCount?: number }
  ): Promise<CurriculumJob> => {
    const response = await api.post<JSendResponse<{ job: CurriculumJob }>>(
      `/courses/${courseId}/generate-more`,
      opts ?? {}
    );
    if (!response.data.data) throw new Error("Failed to request more lessons");
    return response.data.data.job;
  },

  // Delete an owned course and everything under it (lessons, challenges, etc.).
  deleteCourse: async (courseId: string): Promise<void> => {
    await api.delete(`/courses/${courseId}`);
  },
};
