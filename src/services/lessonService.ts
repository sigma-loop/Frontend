import api from "./api";
import {
  type JSendResponse,
  type Lesson,
  type ExecutionResult,
  type SubmissionResult,
  type LessonTranslationResult,
} from "../types/api";

export interface CodeExecutionPayload {
  challengeId: string;
  code: string;
  language: string;
}

export const lessonService = {
  getLesson: async (lessonId: string): Promise<Lesson> => {
    const response = await api.get<JSendResponse<Lesson>>(
      `/lessons/${lessonId}`
    );
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

  // Materialize a lazily-generated ("generate on open") lesson. The request is
  // held open while the server generates the body + challenges, then resolves
  // with the READY lesson. If another request is already generating it, the
  // server returns the current GENERATING state instead (caller should poll).
  generateLesson: async (lessonId: string): Promise<Lesson> => {
    const response = await api.post<JSendResponse<Lesson>>(
      `/lessons/${lessonId}/generate`
    );
    if (!response.data.data) {
      throw new Error("Lesson generation failed");
    }
    return response.data.data;
  },

  // Delete an owned lesson and its challenges/submissions/progress.
  deleteLesson: async (lessonId: string): Promise<void> => {
    await api.delete(`/lessons/${lessonId}`);
  },

  // Translate a lesson's prose (title, body, challenge statements) into the
  // given language. Cached server-side per (lesson, language), so a re-request
  // is fast. Code, LaTeX, and answer keys are preserved.
  translateLesson: async (
    lessonId: string,
    language: string
  ): Promise<LessonTranslationResult> => {
    const response = await api.post<JSendResponse<LessonTranslationResult>>(
      `/lessons/${lessonId}/translate`,
      { language }
    );
    if (!response.data.data) {
      throw new Error("Lesson translation failed");
    }
    return response.data.data;
  },

  // ── PROGRAMMING challenges (Judge0) ──

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

  submitCode: async (
    payload: CodeExecutionPayload
  ): Promise<SubmissionResult> => {
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
