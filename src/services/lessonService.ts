import api from "./api";
import {
  type JSendResponse,
  type Lesson,
  type ExecutionResult,
  type SubmissionResult,
} from "../types/api";

export interface CodeExecutionPayload {
  challengeId?: string;
  code: string;
  language: string;
}

export interface SubmissionPayload {
  challengeId: string;
  code: string;
  language: string;
}

export const lessonService = {
  getLesson: async (lessonId: string): Promise<Lesson> => {
    const response = await api.get<JSendResponse<Lesson>>(`/lessons/${lessonId}`);
    if (!response.data.data) {
      throw new Error("Lesson not found");
    }
    return response.data.data;
  },

  getCourseLessons: async (courseId: string): Promise<Lesson[]> => {
    const response = await api.get<JSendResponse<Lesson[]>>(
      `/lessons/course/${courseId}`
    );
    return response.data.data || [];
  },

  runCode: async (payload: CodeExecutionPayload): Promise<ExecutionResult> => {
    const response = await api.post<JSendResponse<ExecutionResult>>(
      "/execution/run",
      payload
    );
    if (!response.data.data) {
        throw new Error("No execution result returned");
    }
    return response.data.data;
  },

  submitCode: async (payload: SubmissionPayload): Promise<SubmissionResult> => {
    const response = await api.post<JSendResponse<SubmissionResult>>(
      "/execution/submit",
      payload
    );
    if (!response.data.data) {
      throw new Error("No submission result returned");
    }
    return response.data.data;
  },
};
