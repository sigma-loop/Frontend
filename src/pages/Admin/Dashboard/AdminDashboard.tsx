import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { Users, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { adminService, type AdminJob } from "../../../services/adminService";
import { useLocale } from "../../../contexts/LocaleContext";
import { formatRelativeTime } from "../../../utils/formatters";

/**
 * ADMIN overview: user count + curriculum pipeline health.
 * There is no content management — all courses are AI-generated per user.
 */
const AdminDashboard: React.FC = () => {
  const { t } = useLocale();
  const [userCount, setUserCount] = useState(0);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [{ pagination }, jobsData] = await Promise.all([
          adminService.getUsers(1, 1),
          adminService.getJobs(),
        ]);
        setUserCount(pagination.total || 0);
        setJobs(jobsData);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const readyJobs = jobs.filter((j) => j.status === "READY").length;
  const failedJobs = jobs.filter((j) => j.status === "FAILED").length;

  const statCards = [
    {
      label: t("Total Users"),
      value: userCount,
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      link: "/admin/users",
    },
    {
      label: t("Courses Generated"),
      value: readyJobs,
      icon: CheckCircle2,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-500/10",
      link: "/admin/jobs",
    },
    {
      label: t("Failed Generations"),
      value: failedJobs,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10",
      link: "/admin/jobs",
    },
  ];

  const statusVariant = (status: string) => {
    switch (status) {
      case "READY":
        return "success" as const;
      case "FAILED":
        return "error" as const;
      case "GENERATING":
        return "warning" as const;
      default:
        return "default" as const;
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
    <AdminLayout title={t("Overview")}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("Admin Overview")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("Welcome to the SigmaLoop administration panel.")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <Link key={stat.label} to={stat.link}>
              <Card className="hover:border-gray-300 dark:hover:border-gray-700 transition-colors cursor-pointer">
                <div className="flex items-center gap-x-4">
                  <div
                    className={`inline-flex items-center justify-center h-11 w-11 rounded-lg ${stat.bg} ${stat.color}`}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent curriculum jobs */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              {t("Recent Curriculum Jobs")}
            </h2>
            <Link
              to="/admin/jobs"
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
            >
              {t("View all")}
            </Link>
          </div>

          {jobs.length === 0 ? (
            <Card>
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                {t("No curriculum jobs yet.")}
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobs.slice(0, 8).map((job) => (
                <Card key={job.id}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {job.prompt}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {job.user?.email || t("Unknown user")} ·{" "}
                        {formatRelativeTime(job.createdAt)}
                      </p>
                    </div>
                    <Badge variant={statusVariant(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
