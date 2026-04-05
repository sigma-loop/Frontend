import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { ChevronLeft, ChevronRight, Home, MessageCircle, X, BookOpen, Code2 } from "lucide-react";
import { lessonService } from "../../services/lessonService";
import { userService } from "../../services/userService";
import type { Lesson, Challenge } from "../../types/api";
import { SUPPORTED_LANGUAGES } from "../../constants";
import LessonContent from "./components/LessonContent";
import CodeWorkspace from "./components/CodeWorkspace";
import ChatWidget from "../../components/common/ChatWidget";
import Button from "../../components/ui/Button";
import PageMeta from "../../components/common/PageMeta";

type MobileTab = "lesson" | "code" | "chat";

const LessonView = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
  const [showChat, setShowChat] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("lesson");

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;

      setLoading(true);
      setError(null);
      try {
        const data = await lessonService.getLesson(lessonId);

        // Check enrollment if courseId is available on the lesson
        if (data.courseId) {
            const enrollments = await userService.getEnrollments();
            const isEnrolled = enrollments.some(e => e.courseId === data.courseId);

            if (!isEnrolled) {
                navigate(`/courses/${data.courseId}`);
                return;
            }
        }

        setLesson(data);

        // Default to first challenge if available
        if (data.challenges && data.challenges.length > 0) {
            const ch = data.challenges[0];
            setActiveChallenge(ch);
            const langs = Object.keys(ch.starterCodes || {}).filter(
              (k) => !k.startsWith("_") && ch.starterCodes[k]
            );
            if (langs.length > 0) setSelectedLanguage(langs[0]);
        } else {
            setActiveChallenge(null);
        }

      } catch (err) {
        console.error(err);
        setError("Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0d1117] text-gray-500 dark:text-gray-400">
        Loading lesson...
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0d1117] text-red-500 dark:text-red-400 gap-4">
        <p>{error || "Lesson not found"}</p>
        <Button onClick={() => navigate("/dashboard")} variant="outline">
            Back to Dashboard
        </Button>
      </div>
    );
  }

  // Derive available languages from active challenge's starter codes.
  const challengeLanguages = activeChallenge
    ? Object.keys(activeChallenge.starterCodes || {}).filter(
        (k) => !k.startsWith("_") && activeChallenge.starterCodes[k]
      )
    : [];
  const availableLanguages =
    challengeLanguages.length > 0 ? challengeLanguages : [...SUPPORTED_LANGUAGES];

  const initialCode = activeChallenge
    ? activeChallenge.starterCodes?.[selectedLanguage] || ""
    : "";

  const lessonContentMarkdown =
    (lesson.contentMarkdown || "# No content available")
    + (activeChallenge?.description
      ? "\n\n---\n\n" + activeChallenge.description
      : "");

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-[#161b22] text-gray-900 dark:text-gray-100">
      <PageMeta title={lesson.title} description={`Learn ${lesson.title} on SigmaLoop`} />

      {/* Navigation Header */}
      <header className="h-12 md:h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 md:px-4 bg-white dark:bg-[#161b22] shadow-sm flex-shrink-0 z-20">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Link to="/dashboard" className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-gray-400 flex-shrink-0">
                <Home className="w-4 h-4 md:w-5 md:h-5"/>
            </Link>
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] md:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lesson {lesson.orderIndex}</span>
                <h1 className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{lesson.title}</h1>
            </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            {lesson.prevLessonId && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/lessons/${lesson.prevLessonId}`)}
                    className="text-gray-600 dark:text-gray-400 px-2 md:px-3"
                >
                    <ChevronLeft className="w-4 h-4"/>
                    <span className="hidden sm:inline ml-1">Previous</span>
                </Button>
            )}
             {lesson.nextLessonId && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/lessons/${lesson.nextLessonId}`)}
                    className="px-2 md:px-3"
                >
                    <span className="hidden sm:inline mr-1">Next</span>
                    <ChevronRight className="w-4 h-4"/>
                </Button>
            )}
        </div>
      </header>

      {/* ── Mobile Layout ── */}
      <div className="flex-1 min-h-0 flex flex-col md:hidden">
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
            <LessonContent content={lessonContentMarkdown} />
          ) : mobileTab === "code" ? (
            <CodeWorkspace
              key={`mobile-${activeChallenge?.id}-${selectedLanguage}`}
              initialCode={initialCode}
              language={selectedLanguage}
              challengeId={activeChallenge?.id}
              challenge={activeChallenge || undefined}
              availableLanguages={availableLanguages}
              onLanguageChange={setSelectedLanguage}
            />
          ) : (
            <ChatWidget
              scope="LESSON"
              scopeId={lessonId}
              placeholder="Ask about this lesson..."
              welcomeTitle="Lesson Assistant"
              welcomeSubtitle={`Ask me anything about "${lesson.title}"`}
            />
          )}
        </div>
      </div>

      {/* ── Desktop Layout (resizable panels) ── */}
      <div className="flex-1 min-h-0 relative hidden md:block">
        <PanelGroup orientation="horizontal">
            {/* Left Panel: Content */}
            <Panel defaultSize={showChat ? 30 : 40} minSize={20} className="bg-white dark:bg-[#161b22]">
                <LessonContent content={lessonContentMarkdown} />
            </Panel>

            <PanelResizeHandle className="w-2 bg-gray-100 dark:bg-gray-800 border-x border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-center cursor-col-resize z-10">
                <div className="h-8 w-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </PanelResizeHandle>

            {/* Middle Panel: Code Workspace */}
            <Panel defaultSize={showChat ? 40 : 60} minSize={30}>
                <CodeWorkspace
                    key={`${activeChallenge?.id}-${selectedLanguage}`}
                    initialCode={initialCode}
                    language={selectedLanguage}
                    challengeId={activeChallenge?.id}
                    challenge={activeChallenge || undefined}
                    availableLanguages={availableLanguages}
                    onLanguageChange={setSelectedLanguage}
                />
            </Panel>

            {/* Right Panel: AI Chat (conditional) */}
            {showChat && (
              <>
                <PanelResizeHandle className="w-2 bg-gray-100 dark:bg-gray-800 border-x border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-center cursor-col-resize z-10">
                    <div className="h-8 w-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                </PanelResizeHandle>
                <Panel defaultSize={30} minSize={20}>
                  <div className="h-full flex flex-col bg-white dark:bg-[#161b22] border-l border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Lesson AI Assistant
                      </span>
                      <button
                        onClick={() => setShowChat(false)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 min-h-0">
                      <ChatWidget
                        scope="LESSON"
                        scopeId={lessonId}
                        placeholder="Ask about this lesson..."
                        welcomeTitle="Lesson Assistant"
                        welcomeSubtitle={`Ask me anything about "${lesson.title}"`}
                      />
                    </div>
                  </div>
                </Panel>
              </>
            )}

        </PanelGroup>

        {/* Floating AI button (desktop) */}
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

export default LessonView;
