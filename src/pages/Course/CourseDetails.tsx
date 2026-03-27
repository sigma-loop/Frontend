import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../components/layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import api from "../../services/api";
import type { JSendResponse, Course, SyllabusResponse } from "../../types/api";
import { userService } from "../../services/userService";
import { useAuth } from "../../contexts/AuthContext";

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [syllabus, setSyllabus] = useState<SyllabusResponse | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

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
      </div>
    </MainLayout>
  );
};

export default CourseDetails;
