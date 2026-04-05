import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark-dimmed.min.css";
import { chatService } from "../../services/chatService";
import type { ChatThread, ChatMessage } from "../../types/api";

// ──────────────────────────────────────────
// Props
// ──────────────────────────────────────────

export interface ChatWidgetProps {
  scope: "GENERAL" | "LESSON" | "COURSE";
  scopeId?: string;
  showSidebar?: boolean;
  placeholder?: string;
  welcomeTitle?: string;
  welcomeSubtitle?: string;
  className?: string;
}

// ──────────────────────────────────────────
// Markdown renderer (shared)
// ──────────────────────────────────────────

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [rehypeKatex, rehypeHighlight];

const MessageContent: React.FC<{ content: string }> = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={remarkPlugins}
    rehypePlugins={rehypePlugins}
    components={{
      pre({ children }) {
        return (
          <pre className="rounded-xl bg-[#22272e] text-sm overflow-x-auto p-4 my-3">
            {children}
          </pre>
        );
      },
      code({ className, children, ...props }) {
        const isInline = !className;
        if (isInline) {
          return (
            <code
              className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 text-[13px] font-mono"
              {...props}
            >
              {children}
            </code>
          );
        }
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
      a({ children, ...props }) {
        return (
          <a
            className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        );
      },
      table({ children }) {
        return (
          <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {children}
            </table>
          </div>
        );
      },
      th({ children }) {
        return (
          <th className="px-3 py-2 text-left font-semibold bg-gray-50 dark:bg-gray-800/80">
            {children}
          </th>
        );
      },
      td({ children }) {
        return (
          <td className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
            {children}
          </td>
        );
      },
    }}
  >
    {content}
  </ReactMarkdown>
);

// ──────────────────────────────────────────
// ChatWidget
// ──────────────────────────────────────────

const NEW_CHAT_ID = "new";

const ChatWidget: React.FC<ChatWidgetProps> = ({
  scope,
  scopeId,
  showSidebar = false,
  placeholder = "Type a message...",
  welcomeTitle = "How can I help?",
  welcomeSubtitle,
  className = "",
}) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>(NEW_CHAT_ID);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 200) + "px";
    }
  }, [inputValue]);

  // Load threads on mount
  useEffect(() => {
    const loadThreads = async () => {
      try {
        const data = await chatService.listThreads(scope, scopeId);
        setThreads(data);
        // For non-sidebar mode, auto-load the most recent thread if one exists
        if (!showSidebar && data.length > 0) {
          setCurrentChatId(data[0].id);
          const msgs = await chatService.getMessages(data[0].id);
          setMessages(msgs);
        }
      } catch (err) {
        console.error("Failed to load threads:", err);
      } finally {
        setIsLoadingThreads(false);
      }
    };
    loadThreads();
  }, [scope, scopeId, showSidebar]);

  // Load messages when switching threads (sidebar mode)
  const selectThread = useCallback(async (threadId: string) => {
    setCurrentChatId(threadId);
    if (threadId === NEW_CHAT_ID) {
      setMessages([]);
      return;
    }
    setIsLoadingMessages(true);
    try {
      const data = await chatService.getMessages(threadId);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const handleNewChat = () => {
    setCurrentChatId(NEW_CHAT_ID);
    setMessages([]);
    setInputValue("");
  };

  const handleDeleteThread = async (
    e: React.MouseEvent,
    threadId: string
  ) => {
    e.stopPropagation();
    try {
      await chatService.deleteThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (currentChatId === threadId) {
        handleNewChat();
      }
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const messageContent = inputValue.trim();
    setInputValue("");
    setIsTyping(true);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      let threadId = currentChatId;

      if (threadId === NEW_CHAT_ID) {
        const title =
          messageContent.slice(0, 30) +
          (messageContent.length > 30 ? "..." : "");
        const thread = await chatService.createThread(title, scope, scopeId);
        threadId = thread.id;
        setCurrentChatId(threadId);
        setThreads((prev) => [thread, ...prev]);
      }

      const optimisticUserMsg: ChatMessage = {
        id: "temp-" + Date.now(),
        role: "USER",
        content: messageContent,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUserMsg]);

      const { userMessage, assistantMessage } =
        await chatService.sendMessage(threadId, messageContent);

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUserMsg.id),
        userMessage,
        assistantMessage,
      ]);

      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, updatedAt: new Date().toISOString() }
            : t
        )
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("temp-")));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isNewEmptyChat =
    currentChatId === NEW_CHAT_ID && messages.length === 0;

  // ── Sidebar content (shared between mobile drawer & desktop static) ──
  const sidebarContent = (
    <>
      <div className="p-3 flex items-center gap-2">
        <button
          onClick={handleNewChat}
          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10 border border-gray-200 dark:border-gray-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New chat
        </button>
        {/* Close sidebar button — visible on desktop */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="hidden md:flex p-2 rounded-lg hover:bg-gray-200/70 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto chat-scrollbar px-2 pb-4">
        <div className="px-2 py-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Recent
        </div>
        {isLoadingThreads ? (
          <div className="space-y-1 px-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 rounded-lg bg-gray-200/50 dark:bg-gray-800/50 animate-pulse"
              />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <p className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
            No conversations yet
          </p>
        ) : (
          <div className="space-y-0.5">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => selectThread(thread.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 group ${
                  currentChatId === thread.id
                    ? "bg-gray-200/80 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
                }`}
              >
                <span className="truncate flex-1">{thread.title}</span>
                <svg
                  onClick={(e) => handleDeleteThread(e, thread.id)}
                  className="w-3.5 h-3.5 shrink-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className={`flex h-full w-full ${className}`}>
      {/* ── Sidebar ── */}
      {showSidebar && (
        <>
          {/* Mobile overlay backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Mobile drawer */}
          <aside
            className={`
              fixed inset-y-0 left-0 z-40 w-72 mt-16
              bg-gray-50 dark:bg-[#0d1117]
              border-r border-gray-200 dark:border-gray-800
              flex flex-col
              transition-transform duration-200 ease-in-out
              md:hidden
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            {sidebarContent}
          </aside>

          {/* Desktop static sidebar */}
          {sidebarOpen && (
            <aside
              className="hidden md:flex w-64 flex-shrink-0 flex-col bg-gray-50 dark:bg-[#0d1117] border-r border-gray-200 dark:border-gray-800"
            >
              {sidebarContent}
            </aside>
          )}
        </>
      )}

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#161b22]">
        {/* Top bar — sidebar toggle + chat title */}
        {showSidebar && (
          <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 dark:border-gray-800/50 flex-shrink-0">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {currentChatId === NEW_CHAT_ID
                ? "New chat"
                : threads.find((t) => t.id === currentChatId)?.title ||
                  "Chat"}
            </span>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto chat-scrollbar">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2 text-gray-400">
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span className="text-sm">Loading messages...</span>
              </div>
            </div>
          ) : isNewEmptyChat && !isLoadingThreads ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {welcomeTitle}
              </h2>
              {welcomeSubtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
                  {welcomeSubtitle}
                </p>
              )}
            </div>
          ) : (
            <div className="py-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`py-4 ${
                    msg.role === "ASSISTANT"
                      ? "bg-gray-50/80 dark:bg-[#0d1117]/60 rounded-2xl my-1"
                      : ""
                  }`}
                >
                  <div className="max-w-2xl mx-auto px-4 sm:px-6 flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                          msg.role === "ASSISTANT"
                            ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                            : "bg-gradient-to-br from-indigo-500 to-purple-600"
                        }`}
                      >
                        {msg.role === "ASSISTANT" ? (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        ) : (
                          "U"
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {msg.role === "ASSISTANT" ? "SigmaLoop" : "You"}
                      </div>
                      <div className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 prose prose-sm prose-slate dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-pre:my-0">
                        <MessageContent content={msg.content} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="py-4 bg-gray-50/80 dark:bg-[#0d1117]/60 rounded-2xl my-1">
                  <div className="max-w-2xl mx-auto px-4 sm:px-6 flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        SigmaLoop
                      </div>
                      <div className="flex items-center gap-1 pt-1">
                        <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                        <span
                          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.15s" }}
                        />
                        <span
                          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.3s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-4 py-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={handleSendMessage}
              className="relative flex items-end gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117] px-4 py-2.5 shadow-sm focus-within:border-indigo-300 dark:focus-within:border-indigo-500/40 focus-within:shadow-md transition-all"
            >
              <textarea
                ref={inputRef}
                className="flex-1 bg-transparent border-none resize-none text-[15px] text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none leading-relaxed max-h-[200px]"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              {inputValue.trim() && (
                <button
                  type="submit"
                  disabled={isTyping}
                  className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                    !isTyping
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                      : "bg-gray-300 dark:bg-gray-600 text-white cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </button>
              )}
            </form>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center mt-2">
              SigmaLoop AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
