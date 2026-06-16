import React, { useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { adminService, type AdminJob } from "../../../services/adminService";
import { useLocale } from "../../../contexts/LocaleContext";
import { formatRelativeTime } from "../../../utils/formatters";

const STATUS_FILTERS = ["", "PENDING", "GENERATING", "READY", "FAILED"];

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

/**
 * ADMIN: inspect curriculum-generation jobs across all users.
 */
const AdminJobs: React.FC = () => {
  const { t } = useLocale();
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadJobs = async (status: string) => {
    setIsLoading(true);
    try {
      const data = await adminService.getJobs(status || undefined);
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(statusFilter);
  }, [statusFilter]);

  return (
    <AdminLayout title={t("Curriculum Jobs")}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              {t("Curriculum Jobs")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t("Generation pipeline across all users.")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s || t("All statuses")}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadJobs(statusFilter)}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            {t("No curriculum jobs found.")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              <thead className="bg-gray-50 dark:bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 text-start font-semibold text-gray-600 dark:text-gray-400">
                    {t("User")}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold text-gray-600 dark:text-gray-400">
                    {t("Prompt")}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold text-gray-600 dark:text-gray-400">
                    {t("Status")}
                  </th>
                  <th className="px-4 py-3 text-start font-semibold text-gray-600 dark:text-gray-400">
                    {t("Requested")}
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-start font-semibold text-gray-600 dark:text-gray-400">
                    {t("Error")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#161b22] divide-y divide-gray-200 dark:divide-gray-800">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {job.user?.email || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                      {job.prompt}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(job.status)}>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatRelativeTime(job.createdAt)}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-red-500 max-w-xs truncate">
                      {job.error || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminJobs;
