import api from "./api";
import type { JSendResponse } from "../types/api";

// Course Management
export interface CourseCreatePayload {
  title: string;
  description: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  tags: string[];
}

export interface CourseUpdatePayload extends Partial<CourseCreatePayload> {
  isPublished?: boolean;
}

// Lesson Management
export interface LessonCreatePayload {
  courseId: string;
  title: string;
  orderIndex: number;
  contentMarkdown: string;
  type: "LESSON" | "CHALLENGE" | "PROJECT" | "QUIZ";
}

export interface LessonUpdatePayload extends Partial<Omit<LessonCreatePayload, "courseId">> {}

// Challenge Management
export interface ChallengeCreatePayload {
  lessonId: string;
  title: string;
  description?: string;
  starterCodes: Record<string, string>;
  solutionCodes?: Record<string, string>;
  injectedCodes?: Record<string, string>;
  testCases: Array<{
    input: any;
    expectedOutput: any;
    isHidden: boolean;
  }>;
}

export interface ChallengeUpdatePayload extends Partial<Omit<ChallengeCreatePayload, "lessonId">> {}

export const adminService = {
  // ============ Courses ============
  createCourse: async (payload: CourseCreatePayload): Promise<{ courseId: string }> => {
    const response = await api.post<JSendResponse<{ courseId: string }>>(
      "/courses",
      payload
    );
    if (!response.data.data) {
      throw new Error("No course ID returned");
    }
    return response.data.data;
  },

  updateCourse: async (courseId: string, payload: CourseUpdatePayload): Promise<{ courseId: string }> => {
    const response = await api.put<JSendResponse<{ courseId: string }>>(
      `/courses/${courseId}`,
      payload
    );
    if (!response.data.data) {
      throw new Error("No course ID returned");
    }
    return response.data.data;
  },

  deleteCourse: async (courseId: string): Promise<{ message: string }> => {
    const response = await api.delete<JSendResponse<{ message: string }>>(
      `/courses/${courseId}`
    );
    if (!response.data.data) {
      throw new Error("No response data");
    }
    return response.data.data;
  },

  // ============ Lessons ============
  createLesson: async (payload: LessonCreatePayload): Promise<{ lessonId: string }> => {
    const response = await api.post<JSendResponse<{ lessonId: string }>>(
      "/lessons",
      payload
    );
    if (!response.data.data) {
      throw new Error("No lesson ID returned");
    }
    return response.data.data;
  },

  updateLesson: async (lessonId: string, payload: LessonUpdatePayload): Promise<{ lessonId: string }> => {
    const response = await api.put<JSendResponse<{ lessonId: string }>>(
      `/lessons/${lessonId}`,
      payload
    );
    if (!response.data.data) {
      throw new Error("No lesson ID returned");
    }
    return response.data.data;
  },

  deleteLesson: async (lessonId: string): Promise<{ message: string }> => {
    const response = await api.delete<JSendResponse<{ message: string }>>(
      `/lessons/${lessonId}`
    );
    if (!response.data.data) {
      throw new Error("No response data");
    }
    return response.data.data;
  },

  // ============ Challenges ============
  createChallenge: async (payload: ChallengeCreatePayload): Promise<{ challengeId: string }> => {
    const response = await api.post<JSendResponse<{ challengeId: string }>>(
      "/challenges",
      payload
    );
    if (!response.data.data) {
      throw new Error("No challenge ID returned");
    }
    return response.data.data;
  },

  updateChallenge: async (challengeId: string, payload: ChallengeUpdatePayload): Promise<{ challengeId: string }> => {
    const response = await api.put<JSendResponse<{ challengeId: string }>>(
      `/challenges/${challengeId}`,
      payload
    );
    if (!response.data.data) {
      throw new Error("No challenge ID returned");
    }
    return response.data.data;
  },

  deleteChallenge: async (challengeId: string): Promise<{ message: string }> => {
    const response = await api.delete<JSendResponse<{ message: string }>>(
      `/challenges/${challengeId}`
    );
    if (!response.data.data) {
      throw new Error("No response data");
    }
    return response.data.data;
  },
  // ============ Users ============
  getUsers: async (page = 1, limit = 10): Promise<{ users: any[], pagination: any }> => {
    const response = await api.get<JSendResponse<{ users: any[], pagination: any }>>("/users", {
      params: { page, limit }
    });
    return response.data.data || { users: [], pagination: {} };
  },

  createUser: async (payload: any): Promise<void> => {
    await api.post("/users", payload);
  },

  updateUser: async (userId: string, payload: any): Promise<void> => {
    await api.put(`/users/${userId}`, payload);
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};
