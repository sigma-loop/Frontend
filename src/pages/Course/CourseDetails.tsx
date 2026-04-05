import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MessageCircle, X, Sparkles, Loader2, BookOpen } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ChatWidget from "../../components/common/ChatWidget";
import api from "../../services/api";
import type { JSendResponse, Course, SyllabusResponse, GeneratedLessonSummary } from "../../types/api";
import { userService } from "../../services/userService";
import { aiService } from "../../services/aiService";
import { useAuth } from "../../contexts/AuthContext";

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [syllabus, setSyllabus] = useState<SyllabusResponse | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [generatedLessons, setGeneratedLessons] = useState<GeneratedLessonSummary[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      setIsLoading(true);
      try {
        // Fetch basic details
        const detailsRes = await api.get<JSendResponse<Course>>(
          `/courses/${courseId}`
        );
        if (detailsRes.data.success && detailsRes.data.data) {
          setCourse(detailsRes.data.data);
        }

        // Fetch syllabus with progress
        const syllabusRes = await api.get<JSendResponse<SyllabusResponse>>(
          `/courses/${courseId}/syllabus`
        );
        if (syllabusRes.data.success && syllabusRes.data.data) {
          setSyllabus(syllabusRes.data.data);
        }

        // Check if enrolled
        if (user) {
            const enrollments = await userService.getEnrollments();
            const enrolled = enrollments.some(e => e.courseId === courseId);
            setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error("Failed to load course details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user]);

  // Load generated lessons when enrolled
  useEffect(() => {
    if (!courseId || !isEnrolled) return;
    const loadGenerated = async () => {
      try {
        const lessons = await aiService.getGeneratedLessons(courseId);
        setGeneratedLessons(lessons);
      } catch (err) {
        console.error("Failed to load generated lessons:", err);
      }
    };
    loadGenerated();
  }, [courseId, isEnrolled]);

  const handleGenerateLesson = async () => {
    if (!courseId || isGenerating) return;
    setIsGenerating(true);
    try {
      const prompt = generatePrompt.trim() || undefined;
      const lesson = await aiService.generateLesson(courseId, prompt);
      setGeneratedLessons((prev) => [
        ...prev,
        {
          id: lesson.id,
          title: lesson.title,
          orderIndex: lesson.orderIndex,
          generatedAt: lesson.generatedAt,
        },
      ]);
      setGeneratePrompt("");
    } catch (err) {
      console.error("Failed to generate lesson:", err);
      alert("Failed to generate lesson. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnroll = async () => {
      if (!courseId) return;
      setIsEnrolling(true);
      try {
          await userService.enrollInCourse(courseId);
          setIsEnrolled(true);

          // Refresh syllabus to unlock content
          try {
            const syllabusRes = await api.get<JSendResponse<SyllabusResponse>>(
              `/courses/${courseId}/syllabus`
            );
            if (syllabusRes.data.success && syllabusRes.data.data) {
              setSyllabus(syllabusRes.data.data);
            }
          } catch (err) {
            console.error("Failed to refresh syllabus:", err);
          }
      } catch (error) {
          console.error("Failed to enroll:", error);
          alert("Failed to enroll in course. Please try again.");
      } finally {
          setIsEnrolling(false);
      }
  };

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
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Course not found</h2>
          <Link to="/courses">
            <Button variant="ghost" className="mt-4">
              Back to courses
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
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">{course.description}</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              {isEnrolled ? (
                <>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Progress</div>
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
                </>
              ) : (
                  <Button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full md:w-auto"
                  >
                      {isEnrolling ? "Enrolling..." : "Enroll Now"}
                  </Button>
              )}
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
                className={`transition-all ${lesson.status !== "LOCKED" ? "hover:border-indigo-300 cursor-pointer" : "opacity-75 bg-gray-50 dark:bg-[#0d1117]"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(lesson.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {lesson.orderIndex}. {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {lesson.type.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <div>
                    {lesson.status !== "LOCKED" && isEnrolled ? (
                      <Link to={`/lessons/${lesson.id}`}>
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
                        {!isEnrolled ? "Enroll to Start" : "Locked"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Generated Lessons List */}
        {generatedLessons.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                AI-Generated Lessons
              </h2>
            </div>
            <div className="space-y-4">
              {generatedLessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className="hover:border-amber-300 dark:hover:border-amber-700 transition-all border-amber-100 dark:border-amber-900/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full text-amber-600 dark:text-amber-400">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          AI Generated
                        </p>
                      </div>
                    </div>
                    <Link to={`/generated-lessons/${lesson.id}`}>
                      <Button variant="primary" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Generate More Lessons Section */}
        {isEnrolled && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl p-8 border border-amber-200 dark:border-amber-800/30">
            <div className="text-center mb-5">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Generate a Lesson
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Tell us what you want to learn next and we'll create a personalized lesson with challenges.
              </p>
            </div>
            <div className="max-w-lg mx-auto space-y-3">
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                placeholder="e.g., I want to learn about error handling patterns, or teach me recursion with trees, or go deeper into async/await..."
                className="w-full h-24 px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-white dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all text-sm"
                disabled={isGenerating}
              />
              <div className="flex justify-center">
                <Button
                  onClick={handleGenerateLesson}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generate Lesson
                    </span>
                  )}
                </Button>
              </div>
              {isGenerating && (
                <p className="text-center text-xs text-gray-400 dark:text-gray-500">
                  This may take a moment. We're creating content tailored to your request.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Course Mentor Chat */}
      {isEnrolled && (
        <>
          {/* Chat drawer */}
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

          {/* Floating toggle button */}
          {!showChat && (
            <button
              onClick={() => setShowChat(true)}
              className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Course Mentor
            </button>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default CourseDetails;
