import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { chatService } from "../../services/chatService";
import { useCurriculumJob } from "../../hooks/useCurriculumJob";
import { buildRoute, ROUTES } from "../../constants/routes";
import { MessageContent } from "./MessageContent";
import { useLocale } from "../../contexts/LocaleContext";
import type {
  ChatThread,
  ChatMessage,
  ChatCodeContext,
  MentorAction,
} from "../../types/api";

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
  // Open this thread on mount (e.g. the thread carried over from a guest chat
  // after signup). Falls back to the most-recent-thread behavior when unset.
  initialThreadId?: string;
  // Fired after the mentor performs autonomous actions, so the host view can
  // refresh (e.g. CourseDetails re-fetches its syllabus).
  onMentorAction?: (actions: MentorAction[]) => void;
  // Supplies the learner's current editor code at send time (lesson chat), so
  // the hint model can see their actual attempt. Read fresh on every send.
  getCodeContext?: () => ChatCodeContext | null;
}

// ──────────────────────────────────────────
// ChatWidget
// ──────────────────────────────────────────

const NEW_CHAT_ID = "new";

// ──────────────────────────────────────────
// Mentor actions (autonomous tool results, shown under the assistant message)
// ──────────────────────────────────────────

const MentorActionRow: React.FC<{ action: MentorAction }> = ({ action }) => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const isJob =
    !!action.jobId &&
    (action.type === "CREATE_COURSE" ||
      action.type === "GENERATE_MORE_LESSONS");
  // One poller per async-job row (legal: each row is its own component).
  const { job, isGenerating } = useCurriculumJob(
    isJob ? (action.jobId ?? null) : null
  );

  // Resolve a destination course id from the action or the finished job.
  const courseId = action.courseId || job?.courseId || null;

  const linkClass =
    "flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0";

  let trailing: React.ReactNode = null;
  if (isJob) {
    if (isGenerating) {
      trailing = (
        <span className="flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400 flex-shrink-0">
          <Loader2 className="w-3 h-3 animate-spin" />
          {t("Generating…")}
        </span>
      );
    } else if (job?.status === "READY" && courseId) {
      trailing = (
        <button
          onClick={() =>
            navigate(buildRoute(ROUTES.COURSE_DETAILS, { courseId }))
          }
          className={linkClass}
        >
          {t("Open course")}
          <ArrowUpRight className="w-3 h-3" />
        </button>
      );
    } else if (job?.status === "FAILED") {
      trailing = (
        <span className="text-xs text-red-500 flex-shrink-0">
          {t("Failed")}
        </span>
      );
    }
  } else if (action.lessonId) {
    trailing = (
      <button
        onClick={() =>
          navigate(buildRoute(ROUTES.LESSON, { lessonId: action.lessonId! }))
        }
        className={linkClass}
      >
        {t("Open lesson")}
        <ArrowUpRight className="w-3 h-3" />
      </button>
    );
  } else if (courseId) {
    trailing = (
      <button
        onClick={() =>
          navigate(buildRoute(ROUTES.COURSE_DETAILS, { courseId }))
        }
        className={linkClass}
      >
        {t("Open")}
        <ArrowUpRight className="w-3 h-3" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161b22] px-3 py-2">
      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      <span className="flex-1 min-w-0 truncate text-xs text-gray-700 dark:text-gray-300">
        {action.summary}
      </span>
      {trailing}
    </div>
  );
};

const MentorActionsList: React.FC<{ actions: MentorAction[] }> = ({
  actions,
}) => (
  <div className="mt-3 space-y-1.5">
    {actions.map((a, i) => (
      <MentorActionRow
        key={`${a.type}-${a.jobId || a.lessonId || a.courseId || i}`}
        action={a}
      />
    ))}
  </div>
);

const ChatWidget: React.FC<ChatWidgetProps> = ({
  scope,
  scopeId,
  showSidebar = false,
  placeholder: placeholderProp,
  welcomeTitle: welcomeTitleProp,
  welcomeSubtitle,
  className = "",
  initialThreadId,
  onMentorAction,
  getCodeContext,
}) => {
  const { t } = useLocale();
  // Parents pass already-translated text for these; only the in-file fallbacks
  // need t() (avoid double-wrapping a translated prop).
  const placeholder = placeholderProp ?? t("Type a message...");
  const welcomeTitle = welcomeTitleProp ?? t("How can I help?");
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>(NEW_CHAT_ID);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Mentor actions keyed by the assistant message they belong to (session-only;
  // the durable record lives server-side in the MentorAction log).
  const [actionsByMessage, setActionsByMessage] = useState<
    Record<string, MentorAction[]>
  >({});
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // Polls the curriculum job enqueued from this chat until READY/FAILED.
  const { job: curriculumJob, isGenerating: isJobGenerating } =
    useCurriculumJob(activeJobId);

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
        // Open a specific thread (e.g. carried over from a guest chat), else in
        // non-sidebar mode auto-load the most recent thread if one exists.
        const openId =
          initialThreadId && data.some((th) => th.id === initialThreadId)
            ? initialThreadId
            : !showSidebar && data.length > 0
              ? data[0].id
              : null;
        if (openId) {
          setCurrentChatId(openId);
          const msgs = await chatService.getMessages(openId);
          setMessages(msgs);
        }
      } catch (err) {
        console.error("Failed to load threads:", err);
      } finally {
        setIsLoadingThreads(false);
      }
    };
    loadThreads();
  }, [scope, scopeId, showSidebar, initialThreadId]);

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

  const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
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

  // Clear the current conversation: delete the open thread server-side (wiping
  // its stored messages) and reset to a fresh, empty chat. Used by the embedded
  // (no-sidebar) lesson/course chat, which has no per-thread list to manage.
  const handleClearChat = async () => {
    if (isClearing || isTyping) return;
    const threadId = currentChatId;
    setIsClearing(true);
    try {
      if (threadId !== NEW_CHAT_ID) {
        await chatService.deleteThread(threadId);
        setThreads((prev) => prev.filter((t) => t.id !== threadId));
      }
      setCurrentChatId(NEW_CHAT_ID);
      setMessages([]);
      setActionsByMessage({});
      setInputValue("");
    } catch (err) {
      console.error("Failed to clear chat:", err);
    } finally {
      setIsClearing(false);
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

      // Attach the learner's current editor code (lesson chat) so the model can
      // see their attempt. Read fresh here so it reflects the latest edits.
      const codeContext = getCodeContext?.() ?? null;

      const {
        userMessage,
        assistantMessage,
        curriculumJob: newJob,
        actions,
      } = await chatService.sendMessage(threadId, messageContent, codeContext);

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticUserMsg.id),
        userMessage,
        assistantMessage,
      ]);

      // Attach any autonomous actions to this assistant message.
      if (actions && actions.length > 0) {
        setActionsByMessage((prev) => ({
          ...prev,
          [assistantMessage.id]: actions,
        }));
        onMentorAction?.(actions);
      }

      // The mentor decided to generate a curriculum — start polling the job.
      if (newJob) {
        setActiveJobId(newJob.id);
      }

      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId ? { ...t, updatedAt: new Date().toISOString() } : t
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

  const isNewEmptyChat = currentChatId === NEW_CHAT_ID && messages.length === 0;

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
          {t("New chat")}
        </button>
        {/* Close sidebar button — visible on desktop */}
        <button
          onClick={() => setSidebarOpen(false)}
          aria-label={t("Collapse sidebar")}
          className="hidden md:flex p-2 rounded-lg hover:bg-gray-200/70 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
        >
          <svg
            className="w-4 h-4 rtl:rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto chat-scrollbar px-2 pb-4">
        <div className="px-2 py-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {t("Recent")}
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
            {t("No conversations yet")}
          </p>
        ) : (
          <div className="space-y-0.5">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => selectThread(thread.id)}
                className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 group ${
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
              fixed inset-y-0 start-0 z-40 w-72 mt-16
              bg-gray-50 dark:bg-[#0d1117]
              border-e border-gray-200 dark:border-gray-800
              flex flex-col
              transition-transform duration-200 ease-in-out
              md:hidden
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"}
            `}
          >
            {sidebarContent}
          </aside>

          {/* Desktop static sidebar */}
          {sidebarOpen && (
            <aside className="hidden md:flex w-64 flex-shrink-0 flex-col bg-gray-50 dark:bg-[#0d1117] border-e border-gray-200 dark:border-gray-800">
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
                ? t("New chat")
                : threads.find((th) => th.id === currentChatId)?.title ||
                  t("Chat")}
            </span>
          </div>
        )}

        {/* Embedded (no-sidebar) header — Clear chat */}
        {!showSidebar && messages.length > 0 && (
          <div className="flex items-center justify-end px-4 py-2 border-b border-gray-100 dark:border-gray-800/50 flex-shrink-0">
            <button
              onClick={handleClearChat}
              disabled={isClearing || isTyping}
              title={t("Clear this conversation")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isClearing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              {t("Clear chat")}
            </button>
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
                <span className="text-sm">{t("Loading messages...")}</span>
              </div>
            </div>
          ) : isNewEmptyChat && !isLoadingThreads ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="icon-tile w-14 h-14 rounded-xl mb-5">
                <svg
                  className="w-7 h-7"
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
                      ? "bg-gray-50/80 dark:bg-[#0d1117]/60 rounded-xl my-1"
                      : ""
                  }`}
                >
                  <div className="max-w-2xl mx-auto px-4 sm:px-6 flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                          msg.role === "ASSISTANT"
                            ? "bg-indigo-600"
                            : "bg-gray-700 dark:bg-gray-600"
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
                        {msg.role === "ASSISTANT" ? "SigmaLoop" : t("You")}
                      </div>
                      <div className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 prose prose-sm prose-slate dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-pre:my-0">
                        <MessageContent content={msg.content} />
                      </div>
                      {msg.role === "ASSISTANT" &&
                      actionsByMessage[msg.id]?.length ? (
                        <MentorActionsList actions={actionsByMessage[msg.id]} />
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="py-4 bg-gray-50/80 dark:bg-[#0d1117]/60 rounded-xl my-1">
                  <div className="max-w-2xl mx-auto px-4 sm:px-6 flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
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

        {/* Curriculum generation status banner */}
        {activeJobId && (
          <div className="px-4 flex-shrink-0">
            <div className="max-w-2xl mx-auto">
              {isJobGenerating ? (
                <div className="flex items-center gap-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-3">
                  <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      {t("Generating your personalized course…")}
                    </p>
                    <p className="text-xs text-indigo-500/80 dark:text-indigo-400/80 truncate">
                      {t(
                        "You can keep chatting — we'll let you know when it's ready."
                      )}
                    </p>
                  </div>
                  <span className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin flex-shrink-0" />
                </div>
              ) : curriculumJob?.status === "READY" ? (
                <div className="flex items-center gap-3 rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 px-4 py-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="flex-1 text-sm font-medium text-green-700 dark:text-green-300">
                    {t("Your personalized course is ready!")}
                  </p>
                  <button
                    onClick={() =>
                      curriculumJob.courseId &&
                      navigate(
                        buildRoute(ROUTES.COURSE_DETAILS, {
                          courseId: curriculumJob.courseId,
                        })
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors flex-shrink-0"
                  >
                    {t("Open course")}
                  </button>
                  <button
                    onClick={() => setActiveJobId(null)}
                    aria-label={t("Dismiss")}
                    className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-500/20 text-green-600 dark:text-green-400 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="flex-1 text-sm text-red-700 dark:text-red-300">
                    {curriculumJob?.error
                      ? t("Course generation failed: {detail}", {
                          detail: curriculumJob.error,
                        })
                      : t("Course generation failed.")}{" "}
                    {t("Ask the mentor to try again.")}
                  </p>
                  <button
                    onClick={() => setActiveJobId(null)}
                    aria-label={t("Dismiss")}
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 py-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            <form
              onSubmit={handleSendMessage}
              className="relative flex items-end gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0d1117] px-4 py-2.5 shadow-sm focus-within:border-indigo-300 dark:focus-within:border-indigo-500/40 focus-within:shadow-md transition-all"
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
                  aria-label={t("Send message")}
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
              {t(
                "SigmaLoop AI can make mistakes. Verify important information."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
