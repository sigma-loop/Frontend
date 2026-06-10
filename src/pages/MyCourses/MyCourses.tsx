import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, MessageCircle, Clock, AlertTriangle } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import { courseService } from "../../services/courseService";
import { curriculumService } from "../../services/curriculumService";
import { ROUTES, buildRoute } from "../../constants/routes";
import type { Course, CurriculumJob } from "../../types/api";

const POLL_WHILE_GENERATING_MS = 5000;

/**
 * The current user's personalized courses. There is no public catalog —
 * every course here was generated for this user by the mentor.
 */
const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeJobs, setActiveJobs] = useState<CurriculumJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const fetchAll = async () => {
      try {
        const [courseData, jobs] = await Promise.all([
          courseService.getMyCourses(),
          curriculumService.listJobs(),
        ]);
        setCourses(courseData);
        const inFlight = jobs.filter(
          (j) => j.status === "PENDING" || j.status === "GENERATING"
        );
        setActiveJobs(inFlight);
        // Keep refreshing while something is generating
        if (inFlight.length === 0 && timer) {
          clearInterval(timer);
          timer = null;
        }
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
    timer = setInterval(fetchAll, POLL_WHILE_GENERATING_MS);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.tags.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      )
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return "success";
      case "INTERMEDIATE":
        return "warning";
      case "ADVANCED":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <MainLayout title="My Courses">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              My Courses
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Every course here was generated just for you by your mentor.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to={ROUTES.MENTOR}>
              <Button variant="primary" size="sm">
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Ask your mentor for a new course
                </span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-full">
          <Input
            placeholder="Search your courses by title or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Courses being generated right now */}
        {activeJobs.length > 0 && (
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-3 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-3"
              >
                <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                    Generating a course for you…
                  </p>
                  <p className="text-xs text-indigo-500/80 dark:text-indigo-400/80 truncate">
                    "{job.prompt}"
                  </p>
                </div>
                <span className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="flex flex-col h-full hover:border-indigo-300 transition-colors"
              >
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={getDifficultyColor(course.difficulty)}>
                      {course.difficulty}
                    </Badge>
                    {course.status === "READY" ? (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Generated
                      </span>
                    ) : course.status === "FAILED" ? (
                      <span className="text-xs text-red-500 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Generation failed
                      </span>
                    ) : (
                      <span className="text-xs text-indigo-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Generating…
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {course.meta.lessonCount} Lessons ·{" "}
                    {course.meta.durationHours}h
                  </span>
                  <Link
                    to={buildRoute(ROUTES.COURSE_DETAILS, {
                      courseId: course.id,
                    })}
                  >
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={course.status !== "READY"}
                      className="hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200"
                    >
                      View Course
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              No courses yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Tell your mentor what you want to learn and it will build a
              personalized course for you.
            </p>
            <Link to={ROUTES.MENTOR}>
              <Button variant="primary">
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Talk to your mentor
                </span>
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default MyCourses;
