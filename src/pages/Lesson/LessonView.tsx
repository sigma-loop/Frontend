import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { lessonService } from "../../services/lessonService";
import { userService } from "../../services/userService";
import type { Lesson, Challenge } from "../../types/api";
import LessonContent from "./components/LessonContent";
import CodeWorkspace from "./components/CodeWorkspace";
import Button from "../../components/ui/Button";
import PageMeta from "../../components/common/PageMeta";

const LessonView = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");

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

  // Derive available languages and initial code from active challenge
  const availableLanguages = activeChallenge
    ? Object.keys(activeChallenge.starterCodes || {}).filter(
        (k) => !k.startsWith("_") && activeChallenge.starterCodes[k]
      )
    : [];

  const initialCode = activeChallenge
    ? activeChallenge.starterCodes?.[selectedLanguage] || ""
    : "";

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-[#161b22] text-gray-900 dark:text-gray-100">
      <PageMeta title={lesson.title} description={`Learn ${lesson.title} on SigmaLoop`} />
      {/* Navigation Header */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white dark:bg-[#161b22] shadow-sm flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-gray-400">
                <Home className="w-5 h-5"/>
            </Link>
            <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lesson {lesson.orderIndex}</span>
                <h1 className="text-sm font-bold text-gray-800 dark:text-gray-200">{lesson.title}</h1>
            </div>
        </div>

        <div className="flex items-center gap-2">
            {lesson.prevLessonId && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/lessons/${lesson.prevLessonId}`)}
                    className="text-gray-600 dark:text-gray-400"
                >
                    <ChevronLeft className="w-4 h-4 mr-1"/> Previous
                </Button>
            )}
             {lesson.nextLessonId && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/lessons/${lesson.nextLessonId}`)}
                >
                    Next <ChevronRight className="w-4 h-4 ml-1"/>
                </Button>
            )}
        </div>
      </header>

      {/* Main Workspace Resizable Layout */}
      <div className="flex-1 min-h-0 relative">
        <PanelGroup orientation="horizontal">
            {/* Left Panel: Content */}
            <Panel defaultSize={40} minSize={20} className="bg-white dark:bg-[#161b22]">
                <LessonContent
                    content={
                        (activeChallenge?.description)
                        ? activeChallenge.description
                        : (lesson.contentMarkdown || "# No content available")
                    }
                />
            </Panel>

            <PanelResizeHandle className="w-2 bg-gray-100 dark:bg-gray-800 border-x border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-center cursor-col-resize z-10">
                <div className="h-8 w-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </PanelResizeHandle>

            {/* Right Panel: Code Workspace */}
            <Panel defaultSize={60} minSize={30}>
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

        </PanelGroup>
      </div>
    </div>
  );
};

export default LessonView;
