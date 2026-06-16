import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  MessageCircle,
  X,
  BookOpen,
  Code2,
  Calculator,
  ListChecks,
  CheckCircle2,
  Sparkles,
  Languages,
  Loader2,
} from "lucide-react";
import { lessonService } from "../../services/lessonService";
import type {
  Lesson,
  MentorAction,
  ChatCodeContext,
  LessonTranslationResult,
} from "../../types/api";
import { CHALLENGE_KINDS, SUPPORTED_LANGUAGES } from "../../constants";
import { useLocale } from "../../contexts/LocaleContext";
import { useAuth } from "../../contexts/AuthContext";
import { DEFAULT_LOCALE, getLocaleNativeName } from "../../constants/locales";
import LessonContent from "./components/LessonContent";
import ChallengeWorkspace from "./components/ChallengeWorkspace";
import ChallengeTabs from "./components/ChallengeTabs";
import ChatWidget from "../../components/chat/ChatWidget";
import Button from "../../components/ui/Button";
import PageMeta from "../../components/common/PageMeta";

type MobileTab = "lesson" | "code" | "chat";

const LessonView = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python");
  const [showChat, setShowChat] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("lesson");

  // Lesson-lock mode (user preference). In PROGRESS the "Next" control only
  // appears once this lesson is complete (the next lesson is then unlocked);
  // in VIEW_ALL it's always available.
  const { user } = useAuth();
  const lockMode = user?.preferences?.learning?.lessonLockMode ?? "PROGRESS";

  // On-demand lesson translation into the learner's chosen UI language.
  const { language, t } = useLocale();
  const [translation, setTranslation] =
    useState<LessonTranslationResult | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translating, setTranslating] = useState(false);

  // A translation is specific to one lesson + language. When either changes,
  // drop the current one, then auto-restore a cached translation if the server
  // already has one — so a lesson the learner previously translated reopens in
  // their language instead of reverting to English. This is a pure read (no AI);
  // first-time translation still happens on the Translate button.
  useEffect(() => {
    setTranslation(null);
    setShowTranslation(false);
    if (!lessonId || language === DEFAULT_LOCALE) return;
    let cancelled = false;
    lessonService
      .getLessonTranslation(lessonId, language)
      .then((res) => {
        if (cancelled || !res) return;
        setTranslation(res);
        setShowTranslation(true);
      })
      .catch(() => {
        /* no cached translation — keep showing the original */
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId, language]);

  const handleTranslate = useCallback(async () => {
    if (!lessonId || language === DEFAULT_LOCALE) return;
    if (showTranslation) {
      setShowTranslation(false); // toggle back to the English original
      return;
    }
    if (translation && translation.language === language) {
      setShowTranslation(true); // already fetched — just reveal it
      return;
    }
    setTranslating(true);
    try {
      const res = await lessonService.translateLesson(lessonId, language);
      setTranslation(res);
      setShowTranslation(true);
    } catch (err) {
      console.error("Lesson translation failed:", err);
    } finally {
      setTranslating(false);
    }
  }, [lessonId, language, showTranslation, translation]);

  // Guards against double-triggering materialization (React strict mode runs
  // effects twice in dev; we want a single POST /generate per lesson).
  const materializingRef = useRef<string | null>(null);

  const seedCompleted = useCallback((data: Lesson) => {
    const chs = data.challenges ?? [];
    setActiveIndex(0);
    // Seed completion from the per-challenge `passed` flags.
    setCompleted(new Set(chs.filter((c) => c.passed).map((c) => c.id)));
  }, []);

  // A lesson another request is already building — poll until it flips READY.
  const pollUntilReady = useCallback(async (id: string): Promise<Lesson> => {
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const d = await lessonService.getLesson(id);
      if (d.status !== "GENERATING") return d;
    }
    throw new Error("Lesson generation timed out");
  }, []);

  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;

    setLoading(true);
    setError(null);
    try {
      let data = await lessonService.getLesson(lessonId);

      // Lazy "generate on open": a STUB needs materializing; a GENERATING
      // lesson is being built by another request — poll until it's ready.
      if (data.status === "STUB" || data.status === "GENERATING") {
        setLesson(data); // show the header/title while we generate
        setLoading(false);
        if (materializingRef.current === lessonId) return;
        materializingRef.current = lessonId;
        setGenerating(true);
        try {
          if (data.status === "STUB") {
            const res = await lessonService.generateLesson(lessonId);
            data =
              res.status === "GENERATING"
                ? await pollUntilReady(lessonId)
                : res;
          } else {
            data = await pollUntilReady(lessonId);
          }
        } finally {
          setGenerating(false);
          materializingRef.current = null;
        }
      }

      setLesson(data);
      seedCompleted(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load lesson");
    } finally {
      setLoading(false);
    }
  }, [lessonId, pollUntilReady, seedCompleted]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  // Silent refresh (no loading flash, keeps the active challenge) — used when
  // the mentor edits this lesson from the chat panel.
  const refreshLesson = useCallback(async () => {
    if (!lessonId) return;
    try {
      const data = await lessonService.getLesson(lessonId);
      setLesson(data);
      setCompleted((prev) => {
        const next = new Set(prev);
        (data.challenges ?? []).forEach((c) => {
          if (c.passed) next.add(c.id);
        });
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  }, [lessonId]);

  const handleMentorAction = useCallback(
    (actions: MentorAction[]) => {
      if (
        actions.some(
          (a) =>
            a.type === "EDIT_LESSON" && (!a.lessonId || a.lessonId === lessonId)
        )
      ) {
        refreshLesson();
      }
    },
    [lessonId, refreshLesson]
  );

  // Hand the lesson chat the learner's CURRENT editor code for the active
  // PROGRAMMING challenge, so the hint model can see their attempt. Read fresh
  // from the same localStorage key ProgrammingWorkspace writes to (falling back
  // to the starter code when they haven't typed yet). Returns null for MATH/MCQ.
  const getCodeContext = useCallback((): ChatCodeContext | null => {
    const ch = lesson?.challenges?.[activeIndex];
    if (!ch || ch.kind !== CHALLENGE_KINDS.PROGRAMMING) return null;
    const saved = localStorage.getItem(
      `sigmaloop_code_${ch.id}_${selectedLanguage}`
    );
    const code =
      saved !== null ? saved : (ch.starterCodes?.[selectedLanguage] ?? "");
    if (!code.trim()) return null;
    return { code, language: selectedLanguage, challengeTitle: ch.title };
  }, [lesson, activeIndex, selectedLanguage]);

  // Keep the selected language valid for the active PROGRAMMING challenge.
  useEffect(() => {
    const ch = lesson?.challenges?.[activeIndex];
    if (ch?.kind === CHALLENGE_KINDS.PROGRAMMING) {
      const langs = Object.keys(ch.starterCodes || {}).filter(
        (k) => !k.startsWith("_") && ch.starterCodes[k]
      );
      if (langs.length > 0 && !langs.includes(selectedLanguage)) {
        setSelectedLanguage(langs[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, activeIndex]);

  const handleChallengeCompleted = (challengeId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(challengeId);
      return next;
    });
  };

  // The lesson as shown: the English original, or — when a translation is
  // loaded and toggled on — the same lesson with its prose swapped for the
  // translated text. Code, LaTeX, option ids, and `passed` are preserved.
  const view = useMemo<Lesson | null>(() => {
    if (!lesson) return lesson;
    if (!showTranslation || !translation || translation.language !== language) {
      return lesson;
    }
    const tcById = new Map(
      translation.challenges.map((c) => [c.challengeId, c])
    );
    return {
      ...lesson,
      title: translation.title || lesson.title,
      contentMarkdown: translation.contentMarkdown ?? lesson.contentMarkdown,
      challenges: (lesson.challenges ?? []).map((ch) => {
        const tc = tcById.get(ch.id);
        if (!tc) return ch;
        if (ch.kind === CHALLENGE_KINDS.PROGRAMMING) {
          return {
            ...ch,
            title: tc.title || ch.title,
            description: tc.description ?? ch.description,
          };
        }
        if (ch.kind === CHALLENGE_KINDS.MATH) {
          return {
            ...ch,
            title: tc.title || ch.title,
            problemLatex: tc.problemLatex ?? ch.problemLatex,
          };
        }
        const txt = new Map((tc.options ?? []).map((o) => [o.id, o.text]));
        return {
          ...ch,
          title: tc.title || ch.title,
          prompt: tc.prompt ?? ch.prompt,
          options: ch.options.map((o) => ({
            ...o,
            text: txt.get(o.id) ?? o.text,
          })),
        };
      }),
    };
  }, [lesson, translation, showTranslation, language]);

  if (generating) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0d1117] gap-4 px-6 text-center">
        <Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {lesson?.title
            ? t("Generating “{title}”…", { title: lesson.title })
            : t("Generating this lesson…")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          {t(
            "Your tutor is writing this lesson and its challenges just for you — this usually takes 15–40 seconds."
          )}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0d1117] text-gray-500 dark:text-gray-400">
        {t("Loading lesson...")}
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0d1117] text-red-500 dark:text-red-400 gap-4">
        <p>{error || t("Lesson not found")}</p>
        <div className="flex gap-3">
          <Button onClick={() => fetchLesson()} variant="primary">
            {t("Try again")}
          </Button>
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            {t("Back to Dashboard")}
          </Button>
        </div>
      </div>
    );
  }

  const v: Lesson = view ?? lesson;
  const challenges = v.challenges ?? [];
  const activeChallenge = challenges[activeIndex] ?? null;
  const lessonComplete =
    challenges.length > 0 && challenges.every((c) => completed.has(c.id));

  // In PROGRESS mode the next lesson is unlocked only once this one is complete
  // (matching the syllabus gating); in VIEW_ALL it's always reachable.
  const canGoNext =
    !!v.nextLessonId && (lockMode === "VIEW_ALL" || lessonComplete);

  // Derive available languages from the active challenge's starter codes.
  const challengeLanguages =
    activeChallenge?.kind === CHALLENGE_KINDS.PROGRAMMING
      ? Object.keys(activeChallenge.starterCodes || {}).filter(
          (k) => !k.startsWith("_") && activeChallenge.starterCodes[k]
        )
      : [];
  const availableLanguages =
    challengeLanguages.length > 0
      ? challengeLanguages
      : [...SUPPORTED_LANGUAGES];

  // The problem statement is appended below the lesson content for PROGRAMMING
  // (markdown) and MATH (LaTeX). MCQ renders its own prompt + options in the
  // workspace, so nothing is appended for it.
  const challengeStatement =
    activeChallenge?.kind === CHALLENGE_KINDS.MATH
      ? activeChallenge.problemLatex
      : activeChallenge?.kind === CHALLENGE_KINDS.PROGRAMMING
        ? activeChallenge.description
        : undefined;
  const lessonBody = v.contentMarkdown || "";
  // Prefix the appended problem statement with a clear "Challenge" header so it
  // reads as a distinct task rather than a stray block at the bottom of the lesson.
  const challengeHeading = activeChallenge?.title
    ? `## 🎯 ${t("Challenge")}: ${activeChallenge.title}`
    : `## 🎯 ${t("Challenge")}`;
  const challengeSection = challengeStatement
    ? `${challengeHeading}\n\n${challengeStatement}`
    : undefined;
  const lessonContentMarkdown = challengeSection
    ? lessonBody
      ? lessonBody + "\n\n---\n\n" + challengeSection
      : challengeSection
    : lessonBody;

  // Workspace label/icon for the mobile tab.
  const workspaceLabel =
    activeChallenge?.kind === CHALLENGE_KINDS.MATH
      ? t("Math")
      : activeChallenge?.kind === CHALLENGE_KINDS.MCQ
        ? t("Quiz")
        : t("Code");
  const WorkspaceIcon =
    activeChallenge?.kind === CHALLENGE_KINDS.MATH
      ? Calculator
      : activeChallenge?.kind === CHALLENGE_KINDS.MCQ
        ? ListChecks
        : Code2;

  return (
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-[#161b22] text-gray-900 dark:text-gray-100">
      <PageMeta
        title={v.title}
        description={t("Learn {title} on SigmaLoop", { title: v.title })}
      />

      {/* Navigation Header */}
      <header className="h-12 md:h-14 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 md:px-4 bg-white dark:bg-[#161b22] shadow-sm flex-shrink-0 z-20">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link
            to="/dashboard"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-gray-400 flex-shrink-0"
          >
            <Home className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
          <div className="flex flex-col min-w-0">
            <span className="eyebrow text-[10px] md:text-xs">
              {t("Lesson {n}", { n: v.orderIndex ?? 0 })}
            </span>
            <h1 className="text-xs md:text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
              {v.title}
            </h1>
          </div>
          {lessonComplete && (
            <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              {t("Complete")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {language !== DEFAULT_LOCALE && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTranslate}
              disabled={translating}
              title={
                showTranslation
                  ? t("Show the original lesson")
                  : t("Translate this lesson to {language}", {
                      language: getLocaleNativeName(language),
                    })
              }
              className="text-indigo-600 dark:text-indigo-400 px-2 md:px-3"
            >
              {translating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Languages className="w-4 h-4" />
              )}
              <span className="hidden sm:inline ms-1">
                {translating
                  ? t("Translating…")
                  : showTranslation
                    ? t("Original")
                    : t("Translate")}
              </span>
            </Button>
          )}
          {v.prevLessonId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/lessons/${v.prevLessonId}`)}
              className="text-gray-600 dark:text-gray-400 px-2 md:px-3"
            >
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              <span className="hidden sm:inline ms-1">{t("Previous")}</span>
            </Button>
          )}
          {canGoNext && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/lessons/${v.nextLessonId}`)}
              className="px-2 md:px-3"
            >
              <span className="hidden sm:inline me-1">{t("Next")}</span>
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
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
            {t("Lesson")}
          </button>
          <button
            onClick={() => setMobileTab("code")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
              mobileTab === "code"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-[#161b22]"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <WorkspaceIcon className="w-3.5 h-3.5" />
            {workspaceLabel}
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
            {t("AI Chat")}
          </button>
        </div>

        {/* Mobile tab content */}
        <div className="flex-1 min-h-0">
          {mobileTab === "lesson" ? (
            <LessonContent content={lessonContentMarkdown} />
          ) : mobileTab === "code" ? (
            <div className="flex flex-col h-full">
              {challenges.length > 1 && (
                <ChallengeTabs
                  challenges={challenges}
                  activeIndex={activeIndex}
                  completed={completed}
                  onSelect={setActiveIndex}
                />
              )}
              <div className="flex-1 min-h-0">
                {activeChallenge ? (
                  <ChallengeWorkspace
                    key={`mobile-${activeChallenge.id}-${selectedLanguage}`}
                    challenge={activeChallenge}
                    selectedLanguage={selectedLanguage}
                    availableLanguages={availableLanguages}
                    onLanguageChange={setSelectedLanguage}
                    onChallengeCompleted={() =>
                      handleChallengeCompleted(activeChallenge.id)
                    }
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    {t("No challenge available")}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ChatWidget
              scope="LESSON"
              scopeId={lessonId}
              placeholder={t("Ask about this lesson...")}
              welcomeTitle={t("Lesson Assistant")}
              welcomeSubtitle={t('Ask me anything about "{title}"', {
                title: v.title,
              })}
              onMentorAction={handleMentorAction}
              getCodeContext={getCodeContext}
            />
          )}
        </div>
      </div>

      {/* ── Desktop Layout (resizable panels) ── */}
      <div className="flex-1 min-h-0 relative hidden md:block">
        <PanelGroup orientation="horizontal">
          {/* Left Panel: Content */}
          <Panel
            defaultSize={showChat ? 30 : 40}
            minSize={20}
            className="bg-white dark:bg-[#161b22]"
          >
            <LessonContent content={lessonContentMarkdown} />
          </Panel>

          <PanelResizeHandle className="w-2 bg-gray-100 dark:bg-gray-800 border-x border-gray-200 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors flex items-center justify-center cursor-col-resize z-10">
            <div className="h-8 w-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </PanelResizeHandle>

          {/* Middle Panel: Challenge Workspace */}
          <Panel defaultSize={showChat ? 40 : 60} minSize={30}>
            <div className="flex flex-col h-full">
              {challenges.length > 1 && (
                <ChallengeTabs
                  challenges={challenges}
                  activeIndex={activeIndex}
                  completed={completed}
                  onSelect={setActiveIndex}
                />
              )}
              <div className="flex-1 min-h-0">
                {activeChallenge ? (
                  <ChallengeWorkspace
                    key={`${activeChallenge.id}-${selectedLanguage}`}
                    challenge={activeChallenge}
                    selectedLanguage={selectedLanguage}
                    availableLanguages={availableLanguages}
                    onLanguageChange={setSelectedLanguage}
                    onChallengeCompleted={() =>
                      handleChallengeCompleted(activeChallenge.id)
                    }
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                    {t("No challenge available for this lesson")}
                  </div>
                )}
              </div>
            </div>
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
                      {t("Lesson AI Assistant")}
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
                      placeholder={t("Ask about this lesson...")}
                      welcomeTitle={t("Lesson Assistant")}
                      welcomeSubtitle={t('Ask me anything about "{title}"', {
                        title: v.title,
                      })}
                      onMentorAction={handleMentorAction}
                      getCodeContext={getCodeContext}
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
            className="absolute bottom-6 end-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {t("Ask AI")}
          </button>
        )}
      </div>
    </div>
  );
};

export default LessonView;
