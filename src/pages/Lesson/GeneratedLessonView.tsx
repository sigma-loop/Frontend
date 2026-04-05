import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import {
  ArrowLeft,
  Sparkles,
  MessageCircle,
  X,
  ChevronDown,
  BookOpen,
  Code2,
} from "lucide-react";
import { aiService } from "../../services/aiService";
import type { GeneratedLesson, GeneratedChallenge } from "../../types/api";
import LessonContent from "./components/LessonContent";
import CodeWorkspace from "./components/CodeWorkspace";
import ChatWidget from "../../components/common/ChatWidget";
import Button from "../../components/ui/Button";
import PageMeta from "../../components/common/PageMeta";

type MobileTab = "lesson" | "code" | "chat";

const GeneratedLessonView = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeChallenge, setActiveChallenge] =
    useState<GeneratedChallenge | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [showChat, setShowChat] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("lesson");

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await aiService.getGeneratedLesson(lessonId);
        setLesson(data);
        if (data.challenges?.length > 0) {
          const ch = data.challenges[0];
          setActiveChallenge(ch);
          const langs = Object.keys(ch.starterCodes || {}).filter(
            (k) => ch.starterCodes[k]
          );
          if (langs.length > 0) setSelectedLanguage(langs[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load generated lesson");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0d1117] text-gray-500">
        Loading generated lesson...
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0d1117] text-red-500 gap-4">
        <p>{error || "Lesson not found"}</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  const coursePath = lesson.isGeneratedCourse
    ? `/generated-courses/${lesson.courseId}`
    : `/courses/${lesson.courseId}`;

  const availableLanguages = activeChallenge
    ? Object.keys(activeChallenge.starterCodes || {}).filter(
        (k) => activeChallenge.starterCodes[k]
      )
    : [];

  const initialCode = activeChallenge
    ? activeChallenge.starterCodes?.[selectedLanguage] || ""
    : "";

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-[#161b22] text-gray-900 dark:text-gray-100">
      <PageMeta title={`${lesson.title} (AI Generated)`} />

      {/* Header */}
      <header className="h-12 md:h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 md:px-4 bg-white dark:bg-[#161b22] shadow-sm flex-shrink-0 z-20">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link
            to={coursePath}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-gray-400 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-500" />
              <span className="text-[9px] md:text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                AI Generated
              </span>
            </div>
            <h1 className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
              {lesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Challenge selector if multiple */}
          {lesson.challenges && lesson.challenges.length > 1 && (
            <div className="relative hidden sm:block">
              <select
                value={activeChallenge?.id || ""}
                onChange={(e) => {
                  const ch = lesson.challenges.find(
                    (c) => c.id === e.target.value
                  );
                  if (ch) {
                    setActiveChallenge(ch);
                    const langs = Object.keys(ch.starterCodes || {}).filter(
                      (k) => ch.starterCodes[k]
                    );
                    if (langs.length > 0 && !langs.includes(selectedLanguage)) {
                      setSelectedLanguage(langs[0]);
                    }
                  }
                }}
                className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8"
              >
                {lesson.challenges.map((ch, i) => (
                  <option key={ch.id} value={ch.id}>
                    Challenge {i + 1}: {ch.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Desktop chat toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showChat
                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}
          >
            {showChat ? (
              <X className="w-4 h-4" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
            {showChat ? "Close" : "Ask AI"}
          </button>
        </div>
      </header>

      {/* ── Mobile Layout ── */}
      <div className="flex-1 min-h-0 flex flex-col md:hidden">
        {/* Mobile challenge selector */}
        {lesson.challenges && lesson.challenges.length > 1 && (
          <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d1117] sm:hidden">
            <select
              value={activeChallenge?.id || ""}
              onChange={(e) => {
                const ch = lesson.challenges.find(
                  (c) => c.id === e.target.value
                );
                if (ch) {
                  setActiveChallenge(ch);
                  const langs = Object.keys(ch.starterCodes || {}).filter(
                    (k) => ch.starterCodes[k]
                  );
                  if (langs.length > 0 && !langs.includes(selectedLanguage)) {
                    setSelectedLanguage(langs[0]);
                  }
                }
              }}
              className="w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300"
            >
              {lesson.challenges.map((ch, i) => (
                <option key={ch.id} value={ch.id}>
                  Challenge {i + 1}: {ch.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Mobile tab bar */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0d1117] flex-shrink-0">
          <button
            onClick={() => setMobileTab("lesson")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
              mobileTab === "lesson"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-[#161b22]"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Lesson
          </button>
          <button
            onClick={() => setMobileTab("code")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
              mobileTab === "code"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-[#161b22]"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code
          </button>
          <button
            onClick={() => setMobileTab("chat")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
              mobileTab === "chat"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-[#161b22]"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            AI Chat
          </button>
        </div>

        {/* Mobile tab content */}
        <div className="flex-1 min-h-0">
          {mobileTab === "lesson" ? (
            <LessonContent
              content={lesson.contentMarkdown || "# No content available"}
            />
          ) : mobileTab === "code" ? (
            activeChallenge ? (
              <CodeWorkspace
                key={`mobile-${activeChallenge.id}-${selectedLanguage}`}
                initialCode={initialCode}
                language={selectedLanguage}
                challengeId={activeChallenge.id}
                availableLanguages={availableLanguages}
                onLanguageChange={setSelectedLanguage}
                isGenerated={true}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <p>This lesson has no challenges yet.</p>
              </div>
            )
          ) : (
            <ChatWidget
              scope="LESSON"
              scopeId={lessonId}
              placeholder="Ask about this lesson..."
              welcomeTitle="AI Assistant"
              welcomeSubtitle={`Ask me about "${lesson.title}"`}
            />
          )}
        </div>
      </div>

      {/* ── Desktop Layout (resizable panels) ── */}
      <div className="flex-1 min-h-0 relative hidden md:block">
        <PanelGroup orientation="horizontal">
          {/* Left: Lesson content */}
          <Panel
            defaultSize={showChat ? 25 : 35}
            minSize={20}
            className="bg-white dark:bg-[#161b22]"
          >
            <LessonContent
              content={lesson.contentMarkdown || "# No content available"}
            />
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-100 dark:bg-gray-800 border-x border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-center cursor-col-resize z-10">
            <div className="h-8 w-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </PanelResizeHandle>

          {/* Middle: Code editor */}
          <Panel defaultSize={showChat ? 40 : 65} minSize={30}>
            {activeChallenge ? (
              <CodeWorkspace
                key={`${activeChallenge.id}-${selectedLanguage}`}
                initialCode={initialCode}
                language={selectedLanguage}
                challengeId={activeChallenge.id}
                availableLanguages={availableLanguages}
                onLanguageChange={setSelectedLanguage}
                isGenerated={true}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <p>This lesson has no challenges yet.</p>
              </div>
            )}
          </Panel>

          {/* Right: Chat (conditional) */}
          {showChat && (
            <>
              <PanelResizeHandle className="w-2 bg-gray-100 dark:bg-gray-800 border-x border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-center cursor-col-resize z-10">
                <div className="h-8 w-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </PanelResizeHandle>
              <Panel defaultSize={35} minSize={20}>
                <div className="h-full flex flex-col bg-white dark:bg-[#161b22] border-l border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Lesson AI Assistant
                    </span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ChatWidget
                      scope="LESSON"
                      scopeId={lessonId}
                      placeholder="Ask about this lesson..."
                      welcomeTitle="AI Assistant"
                      welcomeSubtitle={`Ask me about "${lesson.title}"`}
                    />
                  </div>
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>

        {/* Floating AI button (desktop only, when chat is closed) */}
        {!showChat && (
          <button
            onClick={() => setShowChat(true)}
            className="absolute bottom-6 right-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Ask AI
          </button>
        )}
      </div>
    </div>
  );
};

export default GeneratedLessonView;
