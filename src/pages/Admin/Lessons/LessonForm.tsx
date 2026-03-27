// Lesson Form Component
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { adminService, type LessonCreatePayload, type LessonUpdatePayload } from "../../../services/adminService";
import { lessonService } from "../../../services/lessonService";

const LessonForm: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const isEdit = lessonId && lessonId !== "new";

  const [formData, setFormData] = useState({
    title: "",
    orderIndex: 1,
    contentMarkdown: "",
    type: "LESSON" as "LESSON" | "CHALLENGE" | "PROJECT" | "QUIZ",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    setIsFetching(true);
    try {
      const lesson = await lessonService.getLesson(lessonId!);
      setFormData({
        title: lesson.title,
        orderIndex: lesson.orderIndex || 1,
        contentMarkdown: lesson.contentMarkdown || "",
        type: lesson.type,
      });
    } catch (error) {
      console.error("Failed to fetch lesson:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit) {
        await adminService.updateLesson(lessonId!, formData as LessonUpdatePayload);
      } else {
        await adminService.createLesson({
          ...formData,
          courseId: courseId!,
        } as LessonCreatePayload);
      }

      navigate(`/admin/courses/${courseId}/lessons`);
    } catch (error) {
      console.error("Failed to save lesson:", error);
      alert("Failed to save lesson");
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
    <AdminLayout title={isEdit ? "Edit Lesson" : "Create Lesson"}>
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {isEdit ? "Edit Lesson" : "Create Lesson"}
        </h1>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                  Order Index
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.orderIndex}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, orderIndex: isNaN(val) ? 0 : val });
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-800/50 dark:text-gray-100"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="LESSON">Lesson</option>
                <option value="CHALLENGE">Challenge</option>
                <option value="PROJECT">Project</option>
                <option value="QUIZ">Quiz</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content (Markdown)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono text-sm dark:bg-gray-800/50 dark:text-gray-100"
                rows={20}
                value={formData.contentMarkdown}
                onChange={(e) => setFormData({ ...formData, contentMarkdown: e.target.value })}
                placeholder="# Lesson Title&#10;&#10;Write your markdown content here..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/admin/courses/${courseId}/lessons`)}
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

export default LessonForm;
