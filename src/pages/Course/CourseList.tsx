import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import api from "../../services/api";
import type { JSendResponse, Course, GeneratedCourse } from "../../types/api";
import { aiService } from "../../services/aiService";
import { useAuth } from "../../contexts/AuthContext";

const CourseList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [generatedCourses, setGeneratedCourses] = useState<GeneratedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: "",
    search: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const params: any = {};
        if (filters.difficulty) params.difficulty = filters.difficulty;

        // Note: API doesn't specify search, effectively doing client-side filtering for search or assuming generic filter
        // API spec says: difficulty (optional), topic (optional)

        const response = await api.get<JSendResponse<Course[]>>("/courses", {
          params,
        });
        if (response.data.success && response.data.data) {
          setCourses(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [filters.difficulty]);

  // Load user's AI-generated courses
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchGenerated = async () => {
      try {
        const data = await aiService.getGeneratedCourses();
        setGeneratedCourses(data);
      } catch (err) {
        console.error("Failed to load generated courses:", err);
      }
    };
    fetchGenerated();
  }, [isAuthenticated]);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.tags.some((tag) =>
        tag.toLowerCase().includes(filters.search.toLowerCase())
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
    <MainLayout title="Explore Courses">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Explore Courses
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Master new skills with our expert-led courses.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4 w-full md:w-auto items-center">
            {isAuthenticated && (
              <Link to="/generate-course">
                <Button variant="secondary" size="sm">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </span>
                </Button>
              </Link>
            )}
            <select
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#161b22] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.difficulty}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, difficulty: e.target.value }))
              }
            >
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
        </div>

        <div className="w-full">
          <Input
            placeholder="Search courses by title or tag..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="max-w-md"
          />
        </div>

        {/* AI Generated Courses */}
        {generatedCourses.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                My AI Courses
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {generatedCourses.map((course) => (
                <Card
                  key={course.id}
                  className="flex flex-col h-full hover:border-amber-300 dark:hover:border-amber-700 transition-colors border-amber-100 dark:border-amber-900/30"
                >
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="warning">{course.difficulty}</Badge>
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI Generated
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {course.lessonCount || 0} Lessons
                    </span>
                    <Link to={`/generated-courses/${course.id}`}>
                      <Button size="sm" variant="primary">
                        View Course
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
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
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {course.meta.lessonCount} Lessons
                    </span>
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
                    {course.meta.durationHours}h duration
                  </span>
                  <Link to={`/courses/${course.id}`}>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200"
                    >
                      View Course
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No courses found matching your criteria.
            </p>
            <Button
              variant="ghost"
              className="mt-2 text-indigo-600 dark:text-indigo-400"
              onClick={() => setFilters({ difficulty: "", search: "" })}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CourseList;
