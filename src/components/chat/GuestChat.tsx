import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Send } from "lucide-react";
import {
  guestChatService,
  type GuestMessage,
} from "../../services/guestChatService";
import { ROUTES } from "../../constants/routes";
import { MessageContent } from "./MessageContent";
import { useLocale } from "../../contexts/LocaleContext";

// ──────────────────────────────────────────
// GuestChat — the public, unauthenticated landing-page mentor.
//
// Stateless on the server (POST /chat/guest) and tool-less: a guest can plan
// with the mentor, but the transcript lives only in the browser. A persistent
// CTA invites them to sign up; on signup the transcript is carried into a real
// thread (see guestChatService.importIfPending + Auth pages).
// ──────────────────────────────────────────

const SUGGESTIONS = [
  "Teach me Python from scratch",
  "Help me prep for a coding interview",
  "I want to understand calculus intuitively",
  "Build me a course on data structures",
];

const GuestChat: React.FC = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<GuestMessage[]>(() =>
    guestChatService.load()
  );
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Persist the transcript so it survives a refresh and the signup redirect.
  useEffect(() => {
    guestChatService.save(messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 200) + "px";
    }
  }, [inputValue]);

  const sendContent = useCallback(
    async (raw: string) => {
      const content = raw.trim();
      if (!content || isTyping) return;

      setInputValue("");
      if (inputRef.current) inputRef.current.style.height = "auto";

      // Snapshot the history BEFORE adding the new user turn.
      const history = messages;
      setMessages((prev) => [...prev, { role: "USER", content }]);
      setIsTyping(true);

      try {
        const reply = await guestChatService.send(history, content);
        setMessages((prev) => [
          ...prev,
          {
            role: "ASSISTANT",
            content:
              reply ||
              "Sorry — I had trouble responding. Could you try rephrasing?",
          },
        ]);
      } catch (err) {
        console.error("Guest chat failed:", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "ASSISTANT",
            content:
              "Something went wrong reaching the mentor. Please try again in a moment.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, isTyping]
  );

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    sendContent(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendContent(inputValue);
    }
  };

  const hasStarted = messages.length > 0;

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-[#161b22]">
      {/* Guest banner */}
      <div className="flex flex-shrink-0 items-center justify-center gap-2 border-b border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-500/10 px-4 py-2 text-center text-xs text-indigo-700 dark:text-indigo-300">
        <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
        <span>
          {t("You're chatting as a guest.")}{" "}
          <Link
            to={ROUTES.REGISTER}
            className="font-semibold underline underline-offset-2 hover:text-indigo-900 dark:hover:text-indigo-100"
          >
            {t("Sign up free")}
          </Link>{" "}
          {t("to save this and let the mentor build your course.")}
        </span>
      </div>

      {/* Messages */}
      <div className="chat-scrollbar flex-1 overflow-y-auto">
        {!hasStarted ? (
          <div className="flex h-full flex-col items-center justify-center px-4">
            <div className="icon-tile mb-5 h-14 w-14 rounded-xl">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              {t("What do you want to learn?")}
            </h2>
            <p className="mb-6 max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
              {t(
                "Tell me your goal and I'll help you shape a plan. When you're ready, sign up and I'll build the whole course for you."
              )}
            </p>
            <div className="flex max-w-xl flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendContent(s)}
                  className="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0d1117] px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-500/50 dark:hover:text-indigo-400"
                >
                  {t(s)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`py-4 ${
                  msg.role === "ASSISTANT"
                    ? "my-1 rounded-xl bg-gray-50/80 dark:bg-[#0d1117]/60"
                    : ""
                }`}
              >
                <div className="mx-auto flex max-w-2xl gap-3 px-4 sm:px-6">
                  <div className="flex-shrink-0 pt-0.5">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white ${
                        msg.role === "ASSISTANT"
                          ? "bg-indigo-600"
                          : "bg-gray-700 dark:bg-gray-600"
                      }`}
                    >
                      {msg.role === "ASSISTANT" ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        "U"
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {msg.role === "ASSISTANT" ? "SigmaLoop" : t("You")}
                    </div>
                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 prose-pre:my-0 prose-pre:bg-transparent prose-pre:p-0">
                      <MessageContent content={msg.content} />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="my-1 rounded-xl bg-gray-50/80 py-4 dark:bg-[#0d1117]/60">
                <div className="mx-auto flex max-w-2xl gap-3 px-4 sm:px-6">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 pt-2">
                    {[0, 0.15, 0.3].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
                        style={{ animationDelay: `${d}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Inline signup CTA after the conversation gets going */}
            {messages.length >= 2 && !isTyping && (
              <div className="mx-auto max-w-2xl px-4 sm:px-6 pt-2">
                <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/[0.03] px-5 py-4 sm:flex-row sm:justify-between">
                  <div className="text-center sm:text-start">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t("Like where this is going?")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t(
                        "Create a free account and I'll turn this plan into a real course — and save your chat."
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(ROUTES.REGISTER)}
                    className="group inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                  >
                    {t("Sign up & build it")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 shadow-sm transition-all focus-within:border-indigo-300  dark:border-gray-700 dark:bg-[#0d1117] dark:focus-within:border-indigo-500/40"
          >
            <textarea
              ref={inputRef}
              className="max-h-[200px] flex-1 resize-none border-none bg-transparent text-[15px] leading-relaxed text-gray-800 placeholder-gray-400 outline-none dark:text-gray-200 dark:placeholder-gray-500"
              placeholder={t("Tell the mentor what you want to learn…")}
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
                className={`flex-shrink-0 rounded-lg p-1.5 transition-all ${
                  !isTyping
                    ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                    : "cursor-not-allowed bg-gray-300 text-white dark:bg-gray-600"
                }`}
              >
                <Send className="h-5 w-5 rtl:rotate-180" />
              </button>
            )}
          </form>
          <p className="mt-2 text-center text-[11px] text-gray-400 dark:text-gray-500">
            {t("Guest preview · SigmaLoop AI can make mistakes.")}{" "}
            <Link
              to={ROUTES.LOGIN}
              className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {t("Already have an account?")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestChat;
