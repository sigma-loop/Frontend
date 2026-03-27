import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import api from "../../../services/api";
import { adminService } from "../../../services/adminService";
import type { JSendResponse, Course } from "../../../types/api";

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<JSendResponse<Course[]>>("/courses");
      setCourses(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      await adminService.deleteCourse(courseId);
      fetchCourses();
    } catch (error) {
      console.error("Failed to delete course:", error);
      alert("Failed to delete course");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Courses">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Courses</h1>
          <Link to="/admin/courses/new">
            <Button>Create Course</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{course.title}</h3>
                    <Badge
                      variant={
                        course.difficulty === "BEGINNER" ? "success" : "warning"
                      }
                    >
                      {course.difficulty}
                    </Badge>
                    {course.isPublished && (
                      <Badge variant="success">Published</Badge>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{course.description}</p>
                  <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{course.meta.lessonCount} lessons</span>
                    <span>•</span>
                    <span>{course.meta.durationHours}h</span>
                    <span>•</span>
                    <span>{course.tags.join(", ")}</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link to={`/admin/courses/${course.id}/lessons`}>
                    <Button size="sm" variant="outline">
                      Lessons
                    </Button>
                  </Link>
                  <Link to={`/admin/courses/${course.id}/edit`}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(course.id)}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCourses;
