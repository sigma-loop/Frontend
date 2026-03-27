import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { lessonService } from "../../../services/lessonService";
import { adminService } from "../../../services/adminService";
import type { Lesson } from "../../../types/api";

const AdminLessons: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchLessons();
    }
  }, [courseId]);

  const fetchLessons = async () => {
    setIsLoading(true);
    try {
      const data = await lessonService.getCourseLessons(courseId!);
      setLessons(data);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      await adminService.deleteLesson(lessonId);
      fetchLessons();
    } catch (error) {
      console.error("Failed to delete lesson:", error);
      alert("Failed to delete lesson");
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
    <AdminLayout title="Lessons">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Link to="/admin/courses" className="text-indigo-600 dark:text-indigo-400 hover:underline mb-2 inline-block">
              ← Back to Courses
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Lessons</h1>
          </div>
          <Link to={`/admin/courses/${courseId}/lessons/new`}>
            <Button>Create Lesson</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{lesson.orderIndex}</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{lesson.title}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">({lesson.type})</span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/admin/lessons/${lesson.id}/challenges`}
                    state={{ courseId }}
                  >
                    <Button size="sm" variant="outline">
                      Challenges
                    </Button>
                  </Link>
                  <Link to={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(lesson.id)}
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

export default AdminLessons;
