import api from "./api";
import type {
  JSendResponse,
  ChatThread,
  ChatMessage,
  ChatCodeContext,
  SendMessageResponse,
} from "../types/api";

export const chatService = {
  listThreads: async (
    scope?: string,
    scopeId?: string
  ): Promise<ChatThread[]> => {
    const params = new URLSearchParams();
    if (scope) params.set("scope", scope);
    if (scopeId) params.set("scopeId", scopeId);
    const query = params.toString();
    const response = await api.get<JSendResponse<ChatThread[]>>(
      `/chat/threads${query ? `?${query}` : ""}`
    );
    return response.data.data || [];
  },

  createThread: async (
    title: string,
    scope?: string,
    scopeId?: string
  ): Promise<ChatThread> => {
    const response = await api.post<JSendResponse<ChatThread>>(
      "/chat/threads",
      {
        title,
        ...(scope && { scope }),
        ...(scopeId && { scopeId }),
      }
    );
    if (!response.data.data) {
      throw new Error("Failed to create thread");
    }
    return response.data.data;
  },

  getMessages: async (threadId: string): Promise<ChatMessage[]> => {
    const response = await api.get<JSendResponse<ChatMessage[]>>(
      `/chat/threads/${threadId}/messages`
    );
    return response.data.data || [];
  },

  sendMessage: async (
    threadId: string,
    content: string,
    codeContext?: ChatCodeContext | null
  ): Promise<SendMessageResponse> => {
    const code = codeContext?.code?.trim() ? codeContext : null;
    const response = await api.post<JSendResponse<SendMessageResponse>>(
      `/chat/threads/${threadId}/messages`,
      {
        content,
        ...(code && {
          code: code.code,
          ...(code.language && { language: code.language }),
          ...(code.challengeTitle && { challengeTitle: code.challengeTitle }),
        }),
      }
    );
    if (!response.data.data) {
      throw new Error("Failed to send message");
    }
    return response.data.data;
  },

  deleteThread: async (threadId: string): Promise<void> => {
    await api.delete(`/chat/threads/${threadId}`);
  },

  // Seed a real thread from a guest transcript after the visitor signs up.
  // POST /chat/threads/import — bulk-inserts the messages without re-running AI.
  importGuestThread: async (
    messages: { role: "USER" | "ASSISTANT"; content: string }[]
  ): Promise<ChatThread> => {
    const response = await api.post<JSendResponse<ChatThread>>(
      "/chat/threads/import",
      { messages }
    );
    if (!response.data.data) {
      throw new Error("Failed to import conversation");
    }
    return response.data.data;
  },

  updateThread: async (
    threadId: string,
    title: string
  ): Promise<ChatThread> => {
    const response = await api.patch<JSendResponse<ChatThread>>(
      `/chat/threads/${threadId}`,
      { title }
    );
    if (!response.data.data) {
      throw new Error("Failed to update thread");
    }
    return response.data.data;
  },
};
