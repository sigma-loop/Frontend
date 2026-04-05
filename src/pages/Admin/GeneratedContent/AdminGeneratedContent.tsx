import React, { useEffect, useState } from "react";
import { Sparkles, ChevronRight, BookOpen, User, ArrowLeft } from "lucide-react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { adminService } from "../../../services/adminService";

interface GeneratedContentUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  generatedCourseCount: number;
  generatedLessonCount: number;
}

interface UserGeneratedContent {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
  generatedCourses: Array<{
    id: string;
    title: string;
    description: string;
    difficulty: string;
    lessonCount: number;
    generatedAt: string;
  }>;
  generatedLessonsPerCourse: Array<{
    courseId: string;
    courseTitle: string;
    lessons: Array<{
      id: string;
      title: string;
      orderIndex: number;
      generatedAt: string;
    }>;
  }>;
}

const AdminGeneratedContent: React.FC = () => {
  const [users, setUsers] = useState<GeneratedContentUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserGeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  useEffect(() => {
    const fetchOverview = async () => {
      setIsLoading(true);
      try {
        const data = await adminService.getGeneratedContentOverview();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load generated content overview:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const handleSelectUser = async (userId: string) => {
    setIsLoadingUser(true);
    try {
      const data = await adminService.getUserGeneratedContent(userId);
      setSelectedUser(data);
    } catch (err) {
      console.error("Failed to load user generated content:", err);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  // ── Detail view for a selected user ──
  if (selectedUser) {
    return (
      <AdminLayout title="User Generated Content">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedUser.user.name || selectedUser.user.email}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedUser.user.email} &middot;{" "}
                <Badge variant="default">{selectedUser.user.role}</Badge>
              </p>
            </div>
          </div>

          {isLoadingUser ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* Generated Courses */}
              {selectedUser.generatedCourses.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    AI-Generated Courses ({selectedUser.generatedCourses.length})
                  </h2>
                  <div className="space-y-3">
                    {selectedUser.generatedCourses.map((course) => (
                      <Card key={course.id} className="border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {course.title}
                              </h3>
                              <Badge variant="warning">{course.difficulty}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {course.description}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {course.lessonCount} lessons &middot; Generated{" "}
                              {new Date(course.generatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Lessons per Course */}
              {selectedUser.generatedLessonsPerCourse.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    Generated Lessons (for existing courses)
                  </h2>
                  <div className="space-y-4">
                    {selectedUser.generatedLessonsPerCourse.map((group) => (
                      <Card key={group.courseId}>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          Course: {group.courseTitle}
                        </h3>
                        <div className="space-y-2">
                          {group.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-[#0d1117] rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-gray-400 w-6">
                                  #{lesson.orderIndex}
                                </span>
                                <span className="text-sm text-gray-800 dark:text-gray-200">
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(lesson.generatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {selectedUser.generatedCourses.length === 0 &&
                selectedUser.generatedLessonsPerCourse.length === 0 && (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    This user has no generated content yet.
                  </div>
                )}
            </>
          )}
        </div>
      </AdminLayout>
    );
  }

  // ── Overview: list of users with generated content ──
  return (
    <AdminLayout title="Generated Content">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            User Generated Content
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View AI-generated courses and lessons created by users.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No users have generated content yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                onClick={() => handleSelectUser(u.id)}
                className="glass-card rounded-2xl overflow-hidden p-6 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-full text-indigo-600 dark:text-indigo-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {u.name || u.email}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {u.generatedCourseCount > 0 && (
                        <div className="text-sm text-amber-600 dark:text-amber-400">
                          {u.generatedCourseCount} course{u.generatedCourseCount > 1 ? "s" : ""}
                        </div>
                      )}
                      {u.generatedLessonCount > 0 && (
                        <div className="text-sm text-indigo-600 dark:text-indigo-400">
                          {u.generatedLessonCount} lesson{u.generatedLessonCount > 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminGeneratedContent;
