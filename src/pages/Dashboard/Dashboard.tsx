import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LearnNewThingButton from "../../components/ui/LearnNewThingButton";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import api from "../../services/api";
import type { JSendResponse, DashboardResponse, Course } from "../../types/api";
import { courseService } from "../../services/courseService";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response =
          await api.get<JSendResponse<DashboardResponse>>("/users/dashboard");
        if (response.data.success && response.data.data) {
          setData(response.data.data);
        }

        const myCourses = await courseService.getMyCourses();
        setCourses(myCourses);
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
      <MainLayout title={t("Dashboard")}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </MainLayout>
    );
  }

  const stats = data?.stats || user?.stats;

  const learnerName = data?.user.name || user?.profileData?.name || "";
  const [welcomeBefore, welcomeAfter] = t("Welcome back, {name}!").split(
    "{name}"
  );

  return (
    <MainLayout title={t("Dashboard")}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {welcomeBefore}
              <span className="text-gradient">{learnerName}</span>
              {welcomeAfter}
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {t("Ready to continue your learning journey?")}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <LearnNewThingButton />
            <Link to="/mentor">
              <Button variant="outline">{t("Talk to your Mentor")}</Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center space-x-4">
              <div className="icon-tile h-12 w-12">
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
                  {t("Current Streak")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {t("{count} Days", { count: stats?.streakDays || 0 })}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="icon-tile h-12 w-12">
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
                  {t("Total XP")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {t("{count} XP", { count: stats?.totalXp || 0 })}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-4">
              <div className="icon-tile h-12 w-12">
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
                  {t("Lessons Completed")}
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
              {t("Jump Back In")}
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
                <div className="icon-tile h-10 w-10 transition-colors">
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
              </Link>
            </Card>
          </div>
        ) : (
          <div className="mt-8">
            <Card className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("No courses in progress")}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t(
                  "Answer a few quick questions and we'll build a personalized course just for you."
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <LearnNewThingButton />
                <Link to="/mentor">
                  <Button variant="outline">{t("Talk to your Mentor")}</Button>
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* My Courses */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t("My Courses")}
          </h2>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors"
                >
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                      {t(course.title)}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t("{count} Lessons", {
                        count: course.meta.lessonCount,
                      })}{" "}
                      ·{" "}
                      {course.status === "READY"
                        ? t(course.difficulty.toLowerCase())
                        : t(course.status.toLowerCase())}
                    </div>
                  </div>

                  <Link to={`/courses/${course.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      disabled={course.status !== "READY"}
                    >
                      {course.status === "READY"
                        ? t("Continue Learning")
                        : t("Generating…")}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              <p className="mb-3">{t("You don't have any courses yet.")}</p>
              <LearnNewThingButton size="sm" />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
