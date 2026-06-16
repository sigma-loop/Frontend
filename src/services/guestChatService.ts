import api from "./api";
import { chatService } from "./chatService";
import type { JSendResponse } from "../types/api";

/**
 * The public landing-page mentor. Unauthenticated, stateless on the server, and
 * tool-less — guests can plan with the mentor, but the transcript lives only in
 * the browser (localStorage). On signup, importIfPending() carries it into a
 * real thread so the now-authenticated mentor can actually build the plan.
 */

export interface GuestMessage {
  role: "USER" | "ASSISTANT";
  content: string;
}

const GUEST_KEY = "sigmaloop_guest_chat";
const MAX_STORED = 40;

function read(): GuestMessage[] {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const guestChatService = {
  // POST /chat/guest — returns the mentor's reply text.
  send: async (history: GuestMessage[], content: string): Promise<string> => {
    const response = await api.post<
      JSendResponse<{ assistantMessage: { role: string; content: string } }>
    >("/chat/guest", { messages: history, content });
    return response.data.data?.assistantMessage?.content || "";
  },

  load: (): GuestMessage[] => read(),

  save: (messages: GuestMessage[]): void => {
    try {
      localStorage.setItem(
        GUEST_KEY,
        JSON.stringify(messages.slice(-MAX_STORED))
      );
    } catch {
      /* localStorage unavailable — degrade gracefully */
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(GUEST_KEY);
    } catch {
      /* ignore */
    }
  },

  // True once the guest has actually said something worth carrying over.
  hasTranscript: (): boolean => read().some((m) => m.role === "USER"),

  // Call right after login()/register succeeds: if a guest transcript exists,
  // import it into a real thread and return its id (else null). Clears storage.
  importIfPending: async (): Promise<string | null> => {
    const messages = read();
    if (!messages.some((m) => m.role === "USER")) {
      guestChatService.clear();
      return null;
    }
    try {
      const thread = await chatService.importGuestThread(messages);
      guestChatService.clear();
      return thread.id;
    } catch (err) {
      console.error("Failed to import guest conversation:", err);
      return null;
    }
  },
};

export default guestChatService;
