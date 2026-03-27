import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { adminService, type CourseCreatePayload, type CourseUpdatePayload } from "../../../services/adminService";
import api from "../../../services/api";
import type { JSendResponse, Course } from "../../../types/api";

const CourseForm: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const isEdit = courseId && courseId !== "new";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "BEGINNER" as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
    tags: "",
    isPublished: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    setIsFetching(true);
    try {
      const response = await api.get<JSendResponse<Course>>(`/courses/${courseId}`);
      const course = response.data.data;
      if (course) {
        setFormData({
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
          tags: course.tags.join(", "),
          isPublished: course.isPublished || false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: CourseCreatePayload | CourseUpdatePayload = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        ...(isEdit && { isPublished: formData.isPublished }),
      };

      if (isEdit) {
        await adminService.updateCourse(courseId!, payload as CourseUpdatePayload);
      } else {
        await adminService.createCourse(payload as CourseCreatePayload);
      }

      navigate("/admin/courses");
    } catch (error) {
      console.error("Failed to save course:", error);
      alert("Failed to save course");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? "Edit Course" : "Create Course"}>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {isEdit ? "Edit Course" : "Create Course"}
        </h1>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-800/50 dark:text-gray-100"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Difficulty
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-800/50 dark:text-gray-100"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (comma separated)
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Python, Programming, Beginner"
              />
            </div>

            {isEdit && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Published
                </label>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/courses")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CourseForm;
