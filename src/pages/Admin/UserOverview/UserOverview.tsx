import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import StatCard from "../components/StatCard";
import { badgeVariant, refValue } from "../components/cells";
import { adminService } from "../../../services/adminService";
import type { AdminUserOverview } from "../../../types/api";
import { formatNumber, formatRelativeTime } from "../../../utils/formatters";
import { ArrowLeft, CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";

const str = (v: unknown): string => (v == null ? "" : String(v));

const UserOverview: React.FC = () => {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminUserOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      setData((await adminService.getUserOverview(userId)) ?? null);
    } catch (e) {
      console.error("Failed to load overview:", e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Delete this user and ALL their data (courses, lessons, challenges, submissions, chats, jobs)? This cannot be undone."
      )
    )
      return;
    try {
      await adminService.deleteRecord("users", userId);
      navigate("/admin/data/users");
    } catch (e) {
      alert((e as Error).message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <AdminLayout title="User 360°">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400" />
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout title="User 360°">
        <Card>
          <p className="text-gray-500 dark:text-gray-400">User not found.</p>
        </Card>
      </AdminLayout>
    );
  }

  const user = data.user as Record<string, unknown>;
  const profile = (user.profileData as Record<string, unknown> | null) ?? {};
  const stats = (user.stats as Record<string, unknown> | null) ?? {};
  const name = str(profile.name) || "Unknown user";
  const role = str(user.role) || "STUDENT";

  const counts: {
    label: string;
    key: keyof AdminUserOverview["counts"];
    to?: string;
  }[] = [
    {
      label: "Courses",
      key: "courses",
      to: `/admin/data/courses?userId=${userId}`,
    },
    {
      label: "Lessons",
      key: "lessons",
      to: `/admin/data/lessons?userId=${userId}`,
    },
    {
      label: "Challenges",
      key: "challenges",
      to: `/admin/data/challenges?userId=${userId}`,
    },
    {
      label: "Submissions",
      key: "submissions",
      to: `/admin/data/submissions?userId=${userId}`,
    },
    {
      label: "Completed lessons",
      key: "completedLessons",
      to: `/admin/data/progress?userId=${userId}&isCompleted=true`,
    },
    {
      label: "Threads",
      key: "threads",
      to: `/admin/data/threads?userId=${userId}`,
    },
    { label: "Messages", key: "messages" },
    { label: "Jobs", key: "jobs", to: `/admin/data/jobs?userId=${userId}` },
    {
      label: "Mentor actions",
      key: "actions",
      to: `/admin/data/actions?userId=${userId}`,
    },
  ];

  return (
    <AdminLayout title="User 360°">
      <div className="space-y-8">
        <button
          onClick={() => navigate("/admin/data/users")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </button>

        {/* Header */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {name}
                </h1>
                <Badge variant={badgeVariant(role)}>{role}</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {str(user.email)}
              </p>
              <p className="text-xs text-gray-400 mt-1 break-all">{userId}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                <span>XP: {str(stats.totalXp) || 0}</span>
                <span>Streak: {str(stats.streakDays) || 0} days</span>
                <span>Lessons done: {str(stats.lessonsCompleted) || 0}</span>
                {!!user.createdAt && (
                  <span>Joined {formatRelativeTime(str(user.createdAt))}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/data/users/${userId}`)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>

        {/* Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {counts.map((c) => (
            <StatCard
              key={c.key}
              label={c.label}
              value={formatNumber(data.counts[c.key])}
              to={c.to}
            />
          ))}
        </div>

        {/* Course tree */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Courses, lessons & challenges
          </h2>
          {data.courses.length === 0 ? (
            <Card>
              <p className="text-gray-500 dark:text-gray-400">
                No courses generated for this user yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {data.courses.map((course) => (
                <Card key={course._id}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Link
                      to={`/admin/data/courses/${course._id}`}
                      className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {course.title}
                    </Link>
                    <div className="flex items-center gap-2">
                      {course.difficulty && (
                        <Badge variant={badgeVariant(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                      )}
                      {course.status && (
                        <Badge variant={badgeVariant(course.status)}>
                          {course.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {course.lessons.length === 0 ? (
                    <p className="text-sm text-gray-400 mt-3">No lessons.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {course.lessons.map((lesson) => (
                        <li
                          key={lesson._id}
                          className="flex items-start gap-2 border-t border-gray-200 dark:border-gray-800 pt-2"
                        >
                          {lesson.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/admin/data/lessons/${lesson._id}`}
                              className="text-sm text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                              {str(lesson.orderIndex) !== "" && (
                                <span className="text-gray-400 mr-1">
                                  {String(lesson.orderIndex)}.
                                </span>
                              )}
                              {lesson.title}
                            </Link>
                            {lesson.challenges.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {lesson.challenges.map((ch) => (
                                  <Link
                                    key={ch._id}
                                    to={`/admin/data/challenges/${ch._id}`}
                                    title={ch.title}
                                  >
                                    <Badge variant={badgeVariant(ch.kind)}>
                                      {ch.kind}
                                    </Badge>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                          {lesson.status && lesson.status !== "READY" && (
                            <Badge variant={badgeVariant(lesson.status)}>
                              {lesson.status}
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent submissions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            Recent submissions
          </h2>
          <Card className="!p-0">
            {data.recentSubmissions.length === 0 ? (
              <p className="text-gray-400 p-6">No submissions.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-white/[0.02]">
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                      <th className="px-4 py-3 font-medium">Kind</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Challenge</th>
                      <th className="px-4 py-3 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {data.recentSubmissions.map((s) => {
                      const sub = s as Record<string, unknown>;
                      return (
                        <tr
                          key={str(sub._id)}
                          onClick={() =>
                            navigate(`/admin/data/submissions/${str(sub._id)}`)
                          }
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                        >
                          <td className="px-4 py-3">
                            <Badge variant={badgeVariant(str(sub.kind))}>
                              {str(sub.kind)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={badgeVariant(str(sub.status))}>
                              {str(sub.status)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                            {refValue(sub.challengeId, "title")}
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                            {sub.createdAt
                              ? formatRelativeTime(str(sub.createdAt))
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Threads + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Chat threads">
            {data.threads.length === 0 ? (
              <p className="text-gray-400">No chat threads.</p>
            ) : (
              <ul className="space-y-2">
                {data.threads.map((t) => {
                  const thread = t as Record<string, unknown>;
                  return (
                    <li key={str(thread._id)}>
                      <Link
                        to={`/admin/data/messages?threadId=${str(thread._id)}`}
                        className="flex items-center justify-between gap-2 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                          {str(thread.title) || "Untitled"}
                        </span>
                        <Badge variant={badgeVariant(str(thread.scope))}>
                          {str(thread.scope)}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title="Mentor actions">
            {data.actions.length === 0 ? (
              <p className="text-gray-400">No mentor actions.</p>
            ) : (
              <ul className="space-y-3">
                {data.actions.map((a) => {
                  const action = a as Record<string, unknown>;
                  return (
                    <li key={str(action._id)} className="flex gap-3">
                      <Badge variant="info">{str(action.type)}</Badge>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {str(action.summary)}
                        </p>
                        {!!action.createdAt && (
                          <p className="text-xs text-gray-400">
                            {formatRelativeTime(str(action.createdAt))}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        {/* Jobs */}
        <Card title="Curriculum jobs">
          {data.jobs.length === 0 ? (
            <p className="text-gray-400">No curriculum jobs.</p>
          ) : (
            <ul className="space-y-2">
              {data.jobs.map((j) => {
                const job = j as Record<string, unknown>;
                return (
                  <li
                    key={str(job._id)}
                    className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-2 last:border-0"
                  >
                    <Link
                      to={`/admin/data/jobs/${str(job._id)}`}
                      className="text-sm text-gray-700 dark:text-gray-300 truncate hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {str(job.prompt) || str(job.type)}
                    </Link>
                    <Badge variant={badgeVariant(str(job.status))}>
                      {str(job.status)}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserOverview;
