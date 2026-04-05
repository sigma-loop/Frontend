import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Sparkles, BookOpen, MessageCircle, X } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import ChatWidget from "../../components/common/ChatWidget";
import { aiService } from "../../services/aiService";
import type { GeneratedCourse } from "../../types/api";

const GeneratedCourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<GeneratedCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      setIsLoading(true);
      try {
        const data = await aiService.getGeneratedCourse(courseId);
        setCourse(data);
      } catch (error) {
        console.error("Failed to load generated course:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
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

  if (!course) {
    return (
      <MainLayout title="Course Not Found">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Generated course not found
          </h2>
          <Link to="/courses">
            <Button variant="ghost" className="mt-4">
              Back to courses
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={course.title}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-[#161b22] rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              AI Generated Course
            </span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge
                  variant={
                    course.difficulty === "BEGINNER" ? "success" : "warning"
                  }
                >
                  {course.difficulty}
                </Badge>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {course.lessons?.length || course.lessonCount || 0} Lessons
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
                {course.description}
              </p>
              {course.tags && course.tags.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Course Lessons
          </h2>
          <div className="space-y-4">
            {course.lessons?.map((lesson) => (
              <Card
                key={lesson.id}
                className="hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full text-indigo-600 dark:text-indigo-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {lesson.orderIndex}. {lesson.title}
                      </h3>
                      {lesson.challengeCount !== undefined &&
                        lesson.challengeCount > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {lesson.challengeCount} challenge
                            {lesson.challengeCount > 1 ? "s" : ""}
                          </p>
                        )}
                    </div>
                  </div>
                  <Link to={`/generated-lessons/${lesson.id}`}>
                    <Button variant="primary" size="sm">
                      View Lesson
                    </Button>
                  </Link>
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
              welcomeSubtitle={`I can help you navigate "${course.title}"`}
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

export default GeneratedCourseDetails;
