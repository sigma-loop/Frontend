import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MessageCircle, X, Sparkles, AlertTriangle } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ChatWidget from "../../components/chat/ChatWidget";
import { courseService } from "../../services/courseService";
import { ROUTES, buildRoute } from "../../constants/routes";
import type { Course, SyllabusResponse } from "../../types/api";

/**
 * Read-only view of one of the user's generated courses.
 * Ownership is enforced server-side (non-owned courses 404).
 */
const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [syllabus, setSyllabus] = useState<SyllabusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      setIsLoading(true);
      try {
        const [details, syllabusData] = await Promise.all([
          courseService.getCourse(courseId),
          courseService.getSyllabus(courseId),
        ]);
        setCourse(details);
        setSyllabus(syllabusData);
      } catch (error) {
        console.error("Failed to load course details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  if (isLoading) {
    return (
      <MainLayout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </MainLayout>
    );
  }

  if (!course || !syllabus) {
    return (
      <MainLayout title="Course Not Found">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Course not found
          </h2>
          <Link to={ROUTES.MY_COURSES}>
            <Button variant="ghost" className="mt-4">
              Back to my courses
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
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
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
          <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-full text-indigo-600 dark:text-indigo-400">
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
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-400">
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
              This course is still being generated — lessons will appear as
              they're ready.
            </p>
          </div>
        ) : course.status === "FAILED" ? (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-300">
              Generation of this course failed. Ask your mentor to try again.
            </p>
          </div>
        ) : null}

        {/* Header */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Badge
                  variant={
                    course.difficulty === "BEGINNER" ? "success" : "warning"
                  }
                >
                  {course.difficulty}
                </Badge>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {course.meta.lessonCount} Lessons
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Generated for you
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                {course.description}
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Your Progress
              </div>
              <div className="flex items-center space-x-3">
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Course Syllabus
          </h2>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(lesson.status)}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {lesson.orderIndex}. {lesson.title}
                    </h3>
                  </div>
                  <div>
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
                          {lesson.status === "COMPLETED" ? "Review" : "Start"}
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        Locked
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Course Mentor Chat */}
      {showChat && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[400px] h-[500px] sm:h-[550px] sm:bottom-6 sm:right-6 bg-white dark:bg-[#161b22] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex items-center gap-2 text-white">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Course Mentor</span>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ChatWidget
              scope="COURSE"
              scopeId={courseId}
              placeholder="Ask about this course..."
              welcomeTitle="Course Mentor"
              welcomeSubtitle={`I can help you navigate "${course?.title}"`}
            />
          </div>
        </div>
      )}

      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          Course Mentor
        </button>
      )}
    </MainLayout>
  );
};

export default CourseDetails;
