import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import type { JSendResponse, DashboardResponse, Enrollment } from "../../types/api";
import { userService } from "../../services/userService";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response =
          await api.get<JSendResponse<DashboardResponse>>("/users/dashboard");
        if (response.data.success && response.data.data) {
          setData(response.data.data);
        }

        const enrollmentsData = await userService.getEnrollments();
        setEnrollments(enrollmentsData);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </MainLayout>
    );
  }

  const stats = data?.stats || user?.stats;

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back,{" "}
              <span className="text-gradient">
                {data?.user.name || user?.profileData?.name}
              </span>
              !
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Ready to continue your learning journey?
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/courses">
              <Button>Explore Courses</Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-indigo-50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Current Streak
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.streakDays || 0} Days
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-violet-50 border-violet-100 dark:bg-violet-500/10 dark:border-violet-500/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-violet-100 dark:bg-violet-500/20 rounded-lg text-violet-600 dark:text-violet-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total XP
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.totalXp || 0} XP
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Lessons Completed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.lessonsCompleted || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Resume */}
        {data?.quickResume ? (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Jump Back In
            </h2>
            <Card className="hover:border-indigo-200 dark:hover:border-indigo-500/30 cursor-pointer group">
              <Link
                to={`/lessons/${data.quickResume.lessonId}`}
                className="flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                    {data.quickResume.courseTitle}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {data.quickResume.lessonTitle}
                  </h3>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-500/20 p-2 rounded-full group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/30 transition-colors">
                  <svg
                    className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
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
              </Link>
            </Card>
          </div>
        ) : (
          <div className="mt-8">
            <Card className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No courses in progress
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start your first course today to begin learning.
              </p>
              <Link to="/courses">
                <Button variant="primary">Browse Courses</Button>
              </Link>
            </Card>
          </div>
        )}

        {/* Enrolled Courses */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            My Courses
          </h2>
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <Card
                  key={enrollment.courseId}
                  className="hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors"
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                      {enrollment.title}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {enrollment.completedLessons} / {enrollment.totalLessons}{" "}
                      Lessons
                    </div>
                  </div>

                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full"
                      style={{
                        width: `${Math.round((enrollment.completedLessons / enrollment.totalLessons) * 100)}%`,
                      }}
                    />
                  </div>

                  <Link to={`/courses/${enrollment.courseId}`}>
                    <Button size="sm" variant="outline" className="w-full">
                      Continue Learning
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              You are not enrolled in any courses yet.
            </p>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
