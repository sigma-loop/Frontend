import api from "./api";
import type {
  JSendResponse,
  ChatThread,
  ChatMessage,
  SendMessageResponse,
} from "../types/api";

export const chatService = {
  listThreads: async (): Promise<ChatThread[]> => {
    const response =
      await api.get<JSendResponse<ChatThread[]>>("/chat/threads");
    return response.data.data || [];
  },

  createThread: async (title: string): Promise<ChatThread> => {
    const response = await api.post<JSendResponse<ChatThread>>(
      "/chat/threads",
      { title }
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
    content: string
  ): Promise<SendMessageResponse> => {
    const response = await api.post<JSendResponse<SendMessageResponse>>(
      `/chat/threads/${threadId}/messages`,
      { content }
    );
    if (!response.data.data) {
      throw new Error("Failed to send message");
    }
    return response.data.data;
  },

  deleteThread: async (threadId: string): Promise<void> => {
    await api.delete(`/chat/threads/${threadId}`);
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
