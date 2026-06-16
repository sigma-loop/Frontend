import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  AlertTriangle,
  Trash2,
  Lock,
  Eye,
  Plus,
  Dumbbell,
} from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { courseService } from "../../services/courseService";
import { lessonService } from "../../services/lessonService";
import { userService } from "../../services/userService";
import { useCurriculumJob } from "../../hooks/useCurriculumJob";
import { ROUTES, buildRoute } from "../../constants/routes";
import { useLocale } from "../../contexts/LocaleContext";
import { useConfirm } from "../../contexts/ConfirmContext";
import { useAuth } from "../../contexts/AuthContext";
import type { Course, SyllabusResponse, LessonLockMode } from "../../types/api";

/**
 * Read-only view of one of the user's generated courses.
 * Ownership is enforced server-side (non-owned courses 404).
 */
const CourseDetails: React.FC = () => {
  const { t } = useLocale();
  const confirm = useConfirm();
  const { refreshUser } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [syllabus, setSyllabus] = useState<SyllabusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null);

  // Lesson-lock mode (PROGRESS gates each lesson behind the previous; VIEW_ALL
  // unlocks them all). Persisted as a user preference; the course page is just
  // a convenient place to flip it.
  const [lockMode, setLockMode] = useState<LessonLockMode>("PROGRESS");
  const [switchingMode, setSwitchingMode] = useState(false);

  // "Generate more lessons" / "Generate practice challenges" — both enqueue a
  // curriculum job and poll it through the same hook. `pendingAction` only
  // drives which banner copy shows while a job is in flight.
  const [generateJobId, setGenerateJobId] = useState<string | null>(null);
  const [isRequestingMore, setIsRequestingMore] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "lessons" | "challenges" | null
  >(null);
  const { job: moreJob, isGenerating: moreGenerating } =
    useCurriculumJob(generateJobId);

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const [details, syllabusData] = await Promise.all([
        courseService.getCourse(courseId),
        courseService.getSyllabus(courseId),
      ]);
      setCourse(details);
      setSyllabus(syllabusData);
      setLockMode(syllabusData.lessonLockMode ?? "PROGRESS");
    } catch (error) {
      console.error("Failed to load course details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  // Flip the lesson-lock mode: persist the preference, then silently re-pull
  // the syllabus so the lesson statuses reflect it (no full-page reload).
  const handleChangeLockMode = async (mode: LessonLockMode) => {
    if (!courseId || mode === lockMode || switchingMode) return;
    const previous = lockMode;
    setLockMode(mode); // optimistic
    setSwitchingMode(true);
    try {
      await userService.updatePreferences({
        learning: { lessonLockMode: mode },
      });
      // Keep the auth context fresh so LessonView's "Next" gating agrees.
      await refreshUser();
      const syllabusData = await courseService.getSyllabus(courseId);
      setSyllabus(syllabusData);
      setLockMode(syllabusData.lessonLockMode ?? mode);
    } catch (error) {
      console.error("Failed to change lesson lock mode:", error);
      setLockMode(previous); // revert
    } finally {
      setSwitchingMode(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // When a generate-more / generate-challenges job finishes, refresh the syllabus.
  useEffect(() => {
    if (!moreJob) return;
    if (moreJob.status === "READY") {
      setGenerateJobId(null);
      setPendingAction(null);
      fetchCourseData();
    } else if (moreJob.status === "FAILED") {
      setGenerateJobId(null);
      setPendingAction(null);
    }
  }, [moreJob, fetchCourseData]);

  const isBusyGenerating = moreGenerating || isRequestingMore;

  const handleGenerateMore = async () => {
    if (!courseId || isBusyGenerating) return;
    setIsRequestingMore(true);
    setPendingAction("lessons");
    try {
      // Count is left to the backend default (admin-tunable, ≥5).
      const job = await courseService.generateMore(courseId);
      setGenerateJobId(job.id);
    } catch (error) {
      console.error("Failed to request more lessons:", error);
      setPendingAction(null);
    } finally {
      setIsRequestingMore(false);
    }
  };

  const handleGenerateChallenges = async () => {
    if (!courseId || isBusyGenerating) return;
    setIsRequestingMore(true);
    setPendingAction("challenges");
    try {
      const job = await courseService.generateChallenges(courseId);
      setGenerateJobId(job.id);
    } catch (error) {
      console.error("Failed to request practice challenges:", error);
      setPendingAction(null);
    } finally {
      setIsRequestingMore(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseId || !course) return;
    const ok = await confirm({
      title: t("Delete course"),
      message: t(
        "Delete “{title}” and all its lessons? This can’t be undone.",
        {
          title: course.title,
        }
      ),
      confirmLabel: t("Delete"),
      danger: true,
    });
    if (!ok) return;
    setIsDeleting(true);
    try {
      await courseService.deleteCourse(courseId);
      navigate(ROUTES.MY_COURSES);
    } catch (error) {
      console.error("Failed to delete course:", error);
      setIsDeleting(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    const ok = await confirm({
      title: t("Delete lesson"),
      message: t("Delete the lesson “{title}”? This can’t be undone.", {
        title: lessonTitle,
      }),
      confirmLabel: t("Delete"),
      danger: true,
    });
    if (!ok) return;
    setDeletingLessonId(lessonId);
    try {
      await lessonService.deleteLesson(lessonId);
      await fetchCourseData();
    } catch (error) {
      console.error("Failed to delete lesson:", error);
    } finally {
      setDeletingLessonId(null);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title={t("Loading...")}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </MainLayout>
    );
  }

  if (!course || !syllabus) {
    return (
      <MainLayout title={t("Course Not Found")}>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t("Course not found")}
          </h2>
          <Link to={ROUTES.MY_COURSES}>
            <Button variant="ghost" className="mt-4">
              {t("Back to my courses")}
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <div className="bg-green-50 dark:bg-green-500/10 p-2 rounded-lg text-green-600 dark:text-green-400">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "IN_PROGRESS":
      case "UNLOCKED":
        return (
          <div className="icon-tile h-9 w-9">
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-gray-400">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <MainLayout title={course.title}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Generation status banner */}
        {course.status === "GENERATING" || course.status === "PENDING" ? (
          <div className="flex items-center gap-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-3">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {t(
                "This course is still being generated — lessons will appear as they're ready."
              )}
            </p>
          </div>
        ) : course.status === "FAILED" ? (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-300">
              {t(
                "Generation of this course failed. Ask your mentor to try again."
              )}
            </p>
          </div>
        ) : null}

        {/* Header */}
        <div className="glass-panel rounded-xl p-5 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <div className="flex items-center gap-x-3 mb-2">
                <Badge
                  variant={
                    course.difficulty === "BEGINNER" ? "success" : "warning"
                  }
                >
                  {t(course.difficulty)}
                </Badge>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {t("{count} Lessons", { count: course.meta.lessonCount })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t(course.title)}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                {course.description ? t(course.description) : ""}
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-start md:text-end">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {t("Your Progress")}
              </div>
              <div className="flex items-center gap-x-3">
                <div className="w-32 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${syllabus.userProgress.percent}%` }}
                  />
                </div>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {syllabus.userProgress.percent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Syllabus */}
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t("Course Syllabus")}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteCourse}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? t("Deleting…") : t("Delete course")}
              </Button>
            </div>
          </div>

          {isBusyGenerating && (
            <div className="flex items-center gap-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-3 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
              <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                {pendingAction === "challenges"
                  ? t(
                      "Generating a practice challenge set — it'll appear here when ready."
                    )
                  : t(
                      "Generating more lessons — they'll appear here when ready."
                    )}
              </p>
            </div>
          )}

          {syllabus.lessons.length > 1 && (
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="eyebrow text-gray-500 dark:text-gray-400">
                {t("Lesson access")}
              </span>
              <div
                role="group"
                aria-label={t("Lesson access")}
                className="inline-flex items-center self-start rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-800 dark:bg-[#0d1117]"
              >
                {[
                  {
                    mode: "PROGRESS" as const,
                    label: t("Progress"),
                    hint: t(
                      "Unlock each lesson only after completing the one before it."
                    ),
                    icon: Lock,
                  },
                  {
                    mode: "VIEW_ALL" as const,
                    label: t("View all"),
                    hint: t("Unlock every lesson so you can jump around."),
                    icon: Eye,
                  },
                ].map(({ mode, label, hint, icon: Icon }) => {
                  const active = lockMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleChangeLockMode(mode)}
                      disabled={switchingMode}
                      aria-pressed={active}
                      title={hint}
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60 ${
                        active
                          ? "bg-white text-indigo-700 shadow-sm dark:bg-[#161b22] dark:text-indigo-400"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {syllabus.lessons.map((lesson) => (
              <Card
                key={lesson.id}
                className={`transition-all ${
                  lesson.status !== "LOCKED"
                    ? "hover:border-indigo-300 cursor-pointer"
                    : "opacity-75 bg-gray-50 dark:bg-[#0d1117]"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0">
                      {getStatusIcon(lesson.status)}
                    </span>
                    <h3 className="min-w-0 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {lesson.orderIndex}. {t(lesson.title)}
                    </h3>
                    {lesson.challengeOnly && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 whitespace-nowrap">
                        <Dumbbell className="w-3.5 h-3.5" />
                        {t("Practice")}
                      </span>
                    )}
                    {lesson.generationStatus === "STUB" &&
                      lesson.status !== "LOCKED" && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          <Sparkles className="w-3.5 h-3.5" />
                          {t("Generates on open")}
                        </span>
                      )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {lesson.status !== "LOCKED" ? (
                      <Link
                        to={buildRoute(ROUTES.LESSON, { lessonId: lesson.id })}
                      >
                        <Button
                          variant={
                            lesson.status === "COMPLETED"
                              ? "secondary"
                              : "primary"
                          }
                          size="sm"
                        >
                          {lesson.status === "COMPLETED"
                            ? t("Review")
                            : t("Start")}
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        {t("Locked")}
                      </Button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteLesson(lesson.id, lesson.title)
                      }
                      disabled={deletingLessonId === lesson.id}
                      title={t("Delete lesson")}
                      aria-label={t("Delete lesson")}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Keep-going actions — deliberately at the BOTTOM, centered and
              prominent, so finishing the list flows straight into "what next". */}
          {course.status === "READY" && (
            <div className="mt-12 flex flex-col items-center gap-5 border-t border-gray-200 pt-10 dark:border-gray-800">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {t("Keep going")}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t(
                    "Extend this course with new lessons, or drill what you've learned with a fresh set of practice challenges."
                  )}
                </p>
              </div>
              <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGenerateMore}
                  disabled={isBusyGenerating}
                  className="flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus className="h-5 w-5" />
                  {isBusyGenerating && pendingAction === "lessons"
                    ? t("Generating…")
                    : t("Generate more lessons")}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGenerateChallenges}
                  disabled={isBusyGenerating}
                  className="flex items-center justify-center gap-2"
                >
                  <Dumbbell className="h-5 w-5" />
                  {isBusyGenerating && pendingAction === "challenges"
                    ? t("Generating…")
                    : t("Generate practice challenges")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseDetails;
