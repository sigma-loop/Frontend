import React, { useEffect, useState } from "react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import StatCard from "../components/StatCard";
import { adminService } from "../../../services/adminService";
import type {
  AdminMetrics,
  AdminCountBucket,
  AdminSeriesPoint,
} from "../../../types/api";
import { useLocale } from "../../../contexts/LocaleContext";
import { formatNumber } from "../../../utils/formatters";
import {
  Users,
  BookOpen,
  GraduationCap,
  Puzzle,
  CheckSquare,
  TrendingUp,
  Sparkles,
  MessagesSquare,
  MessageSquare,
  Wand2,
} from "lucide-react";

const Breakdown: React.FC<{ title: string; buckets: AdminCountBucket[] }> = ({
  title,
  buckets,
}) => {
  const { t } = useLocale();
  const total = buckets.reduce((s, b) => s + b.count, 0) || 1;
  return (
    <Card title={title}>
      {buckets.length === 0 ? (
        <p className="text-sm text-gray-400">{t("No data")}</p>
      ) : (
        <div className="space-y-3">
          {buckets.map((b) => (
            <div key={String(b._id)}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">
                  {b._id ?? "—"}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {formatNumber(b.count)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 dark:bg-indigo-400"
                  style={{ width: `${(b.count / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const Sparkbars: React.FC<{ title: string; points: AdminSeriesPoint[] }> = ({
  title,
  points,
}) => {
  const { t } = useLocale();
  const max = Math.max(1, ...points.map((p) => p.count));
  return (
    <Card title={title}>
      {points.length === 0 ? (
        <p className="text-sm text-gray-400">
          {t("No activity in the last 30 days")}
        </p>
      ) : (
        <div className="flex items-end gap-1 h-32">
          {points.map((p) => (
            <div
              key={p._id}
              className="flex-1 flex items-end"
              title={`${p._id}: ${p.count}`}
            >
              <div
                className="w-full rounded-t bg-indigo-500 dark:bg-indigo-400 min-h-[2px]"
                style={{ height: `${(p.count / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const TOTALS: {
  key: keyof AdminMetrics["totals"];
  label: string;
  icon: React.ReactNode;
}[] = [
  { key: "users", label: "Users", icon: <Users className="w-5 h-5" /> },
  { key: "courses", label: "Courses", icon: <BookOpen className="w-5 h-5" /> },
  {
    key: "lessons",
    label: "Lessons",
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    key: "challenges",
    label: "Challenges",
    icon: <Puzzle className="w-5 h-5" />,
  },
  {
    key: "submissions",
    label: "Submissions",
    icon: <CheckSquare className="w-5 h-5" />,
  },
  {
    key: "progress",
    label: "Progress",
    icon: <TrendingUp className="w-5 h-5" />,
  },
  { key: "jobs", label: "Jobs", icon: <Sparkles className="w-5 h-5" /> },
  {
    key: "threads",
    label: "Threads",
    icon: <MessagesSquare className="w-5 h-5" />,
  },
  {
    key: "messages",
    label: "Messages",
    icon: <MessageSquare className="w-5 h-5" />,
  },
  {
    key: "actions",
    label: "Mentor Actions",
    icon: <Wand2 className="w-5 h-5" />,
  },
];

const CommandCenter: React.FC = () => {
  const { t } = useLocale();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const m = await adminService.getMetrics();
        if (active) setMetrics(m ?? null);
      } catch (e) {
        console.error("Failed to load metrics:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <AdminLayout title={t("Command Center")}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400" />
        </div>
      </AdminLayout>
    );
  }

  if (!metrics) {
    return (
      <AdminLayout title={t("Command Center")}>
        <Card>
          <p className="text-gray-500 dark:text-gray-400">
            {t("Could not load metrics.")}
          </p>
        </Card>
      </AdminLayout>
    );
  }

  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <AdminLayout title={t("Command Center")}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("Command Center")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t(
              "Every collection, every record — the whole platform at a glance."
            )}
          </p>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {TOTALS.map((item) => (
            <StatCard
              key={item.key}
              label={t(item.label)}
              value={formatNumber(metrics.totals[item.key])}
              icon={item.icon}
              to={`/admin/data/${item.key}`}
            />
          ))}
        </div>

        {/* Derived rates */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t("Submission pass rate")}
            value={pct(metrics.derived.submissionPassRate)}
            sub={t("{n} passed", {
              n: formatNumber(metrics.derived.passedSubmissions),
            })}
          />
          <StatCard
            label={t("Lesson completion rate")}
            value={pct(metrics.derived.lessonCompletionRate)}
            sub={t("{n} lessons completed", {
              n: formatNumber(metrics.derived.completedProgress),
            })}
          />
          <StatCard
            label={t("New users · 7d")}
            value={formatNumber(metrics.derived.newUsers7)}
          />
          <StatCard
            label={t("New courses · 7d")}
            value={formatNumber(metrics.derived.newCourses7)}
          />
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Sparkbars
            title={t("New users (30d)")}
            points={metrics.series.users}
          />
          <Sparkbars
            title={t("New courses (30d)")}
            points={metrics.series.courses}
          />
          <Sparkbars
            title={t("Submissions (30d)")}
            points={metrics.series.submissions}
          />
        </div>

        {/* Breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Breakdown
            title={t("Users by role")}
            buckets={metrics.breakdowns.usersByRole}
          />
          <Breakdown
            title={t("Courses by status")}
            buckets={metrics.breakdowns.coursesByStatus}
          />
          <Breakdown
            title={t("Courses by difficulty")}
            buckets={metrics.breakdowns.coursesByDifficulty}
          />
          <Breakdown
            title={t("Challenges by kind")}
            buckets={metrics.breakdowns.challengesByKind}
          />
          <Breakdown
            title={t("Submissions by status")}
            buckets={metrics.breakdowns.submissionsByStatus}
          />
          <Breakdown
            title={t("Submissions by kind")}
            buckets={metrics.breakdowns.submissionsByKind}
          />
          <Breakdown
            title={t("Jobs by status")}
            buckets={metrics.breakdowns.jobsByStatus}
          />
          <Breakdown
            title={t("Jobs by type")}
            buckets={metrics.breakdowns.jobsByType}
          />
          <Breakdown
            title={t("Threads by scope")}
            buckets={metrics.breakdowns.threadsByScope}
          />
          <Breakdown
            title={t("Mentor actions by type")}
            buckets={metrics.breakdowns.actionsByType}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default CommandCenter;
