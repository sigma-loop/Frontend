import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { adminService } from "../../../services/adminService";
import api from "../../../services/api";
import type { JSendResponse, Challenge } from "../../../types/api";

const AdminChallenges: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const location = useLocation();
  const [lesson, setLesson] = useState<any | null>(null); // Using any temporarily to avoid strict type mismatch if API differs slightly, or imported Lesson
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Derive courseId from state (if navigated from list) or lesson details (if API provides it)
  const courseId = location.state?.courseId || lesson?.courseId;
  const backLink = courseId ? `/admin/courses/${courseId}/lessons` : "/admin/courses";

  useEffect(() => {
    if (lessonId) {
      fetchLessonsAndChallenges();
    }
  }, [lessonId]);

  const fetchLessonsAndChallenges = async () => {
    setIsLoading(true);
    try {
      // Fetch lesson to get challenges
      const response = await api.get<JSendResponse<any>>(
        `/lessons/${lessonId}`
      );
      const lessonData = response.data.data;
      setLesson(lessonData);
      setChallenges(lessonData?.challenges || []);
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (challengeId: string) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await adminService.deleteChallenge(challengeId);
      fetchLessonsAndChallenges();
    } catch (error) {
      console.error("Failed to delete challenge:", error);
      alert("Failed to delete challenge");
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
    <AdminLayout title={`Challenges - ${lesson?.title || 'Lesson'}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Link
              to={backLink}
              className="text-indigo-600 dark:text-indigo-400 hover:underline mb-2 inline-block"
            >
              {courseId ? "← Back to Lessons" : "← Back to Courses"}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Challenges for "{lesson?.title || 'Lesson'}"
            </h1>
          </div>
          <Link to={`/admin/lessons/${lessonId}/challenges/new`}>
            <Button>Create Challenge</Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {challenges.length === 0 ? (
            <Card>
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No challenges yet. Create one to get started.</p>
            </Card>
          ) : (
            challenges.map((challenge) => (
              <Card key={challenge.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{challenge.title}</h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Languages: {Object.keys(challenge.starterCodes).join(", ")}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Test Cases: {challenge.testCases?.length || 0}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link to={`/admin/lessons/${lessonId}/challenges/${challenge.id}/edit`}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(challenge.id)}
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminChallenges;
