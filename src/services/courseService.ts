import api from "./api";
import type { JSendResponse, Course, SyllabusResponse } from "../types/api";

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
};
