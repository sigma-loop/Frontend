import api from "./api";
import type {
  JSendResponse,
  GeneratedCourse,
  GeneratedLesson,
  GeneratedLessonSummary,
} from "../types/api";

export const aiService = {
  // ── Generated Lessons (for existing courses) ──

  generateLesson: async (courseId: string, prompt?: string): Promise<GeneratedLesson> => {
    const response = await api.post<JSendResponse<GeneratedLesson>>(
      `/ai/courses/${courseId}/generate-lesson`,
      { ...(prompt && { prompt }) }
    );
    if (!response.data.data) throw new Error("Failed to generate lesson");
    return response.data.data;
  },

  getGeneratedLessons: async (
    courseId: string
  ): Promise<GeneratedLessonSummary[]> => {
    const response = await api.get<JSendResponse<GeneratedLessonSummary[]>>(
      `/ai/courses/${courseId}/generated-lessons`
    );
    return response.data.data || [];
  },

  getGeneratedLesson: async (lessonId: string): Promise<GeneratedLesson> => {
    const response = await api.get<JSendResponse<GeneratedLesson>>(
      `/ai/generated-lessons/${lessonId}`
    );
    if (!response.data.data) throw new Error("Generated lesson not found");
    return response.data.data;
  },

  // ── Generated Courses ──

  generateCourse: async (
    prompt: string,
    difficulty?: string
  ): Promise<GeneratedCourse> => {
    const response = await api.post<JSendResponse<GeneratedCourse>>(
      "/ai/generate-course",
      { prompt, ...(difficulty && { difficulty }) }
    );
    if (!response.data.data) throw new Error("Failed to generate course");
    return response.data.data;
  },

  getGeneratedCourses: async (): Promise<GeneratedCourse[]> => {
    const response = await api.get<JSendResponse<GeneratedCourse[]>>(
      "/ai/generated-courses"
    );
    return response.data.data || [];
  },

  getGeneratedCourse: async (courseId: string): Promise<GeneratedCourse> => {
    const response = await api.get<JSendResponse<GeneratedCourse>>(
      `/ai/generated-courses/${courseId}`
    );
    if (!response.data.data) throw new Error("Generated course not found");
    return response.data.data;
  },
};
