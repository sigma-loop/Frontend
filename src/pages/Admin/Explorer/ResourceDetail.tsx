import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import JsonBlock from "../components/JsonBlock";
import RecordEditorModal from "../components/RecordEditorModal";
import { refId } from "../components/cells";
import { adminService } from "../../../services/adminService";
import type { AdminAncestor, AdminRecord } from "../../../types/api";
import { ADMIN_RESOURCE_MAP } from "../../../constants/adminResources";
import { useLocale } from "../../../contexts/LocaleContext";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

/**
 * Drill-down: child collections reachable from a record, rendered as scoped
 * "All X" list buttons. `param` is the query key the child list filters on —
 * either a direct field or a backend-resolved ancestor (e.g. course →
 * challenges via courseId, which the API resolves through the lessons).
 */
const DRILL_DOWNS: Record<
  string,
  { label: string; resource: string; param: string }[]
> = {
  users: [
    { label: "courses", resource: "courses", param: "userId" },
    { label: "lessons", resource: "lessons", param: "userId" },
    { label: "challenges", resource: "challenges", param: "userId" },
    { label: "submissions", resource: "submissions", param: "userId" },
    { label: "progress", resource: "progress", param: "userId" },
    { label: "chats", resource: "threads", param: "userId" },
    { label: "jobs", resource: "jobs", param: "userId" },
    { label: "mentor actions", resource: "actions", param: "userId" },
  ],
  courses: [
    { label: "lessons", resource: "lessons", param: "courseId" },
    { label: "challenges", resource: "challenges", param: "courseId" },
    { label: "submissions", resource: "submissions", param: "courseId" },
    { label: "progress", resource: "progress", param: "courseId" },
  ],
  lessons: [
    { label: "challenges", resource: "challenges", param: "lessonId" },
    { label: "submissions", resource: "submissions", param: "lessonId" },
    { label: "progress", resource: "progress", param: "lessonId" },
  ],
  challenges: [
    { label: "submissions", resource: "submissions", param: "challengeId" },
  ],
  threads: [{ label: "messages", resource: "messages", param: "threadId" }],
};

/**
 * Secondary parent pointers not on the primary drill-up chain (which the
 * breadcrumb already covers) — e.g. a curriculum job or mentor action → the
 * course/lesson it touched. Rendered as "Open X" only when the field is set.
 */
const SECONDARY_LINKS: Record<
  string,
  { label: string; resource: string; field: string }[]
> = {
  jobs: [{ label: "Open course", resource: "courses", field: "courseId" }],
  actions: [
    { label: "Open course", resource: "courses", field: "courseId" },
    { label: "Open lesson", resource: "lessons", field: "lessonId" },
  ],
};

const FieldValue: React.FC<{ value: unknown }> = ({ value }) => {
  const { t } = useLocale();
  if (value === null || value === undefined)
    return <span className="text-gray-400">null</span>;
  if (typeof value === "boolean")
    return (
      <Badge variant={value ? "success" : "warning"}>{String(value)}</Badge>
    );
  if (typeof value === "object")
    return (
      <div className="mt-1">
        <JsonBlock value={value} label={t("nested object")} defaultCollapsed />
      </div>
    );
  const s = String(value);
  if (s.length > 120 || s.includes("\n"))
    return (
      <pre className="mt-1 p-3 rounded-lg bg-gray-50 dark:bg-[#0d1117] text-xs overflow-auto max-h-72 whitespace-pre-wrap text-gray-800 dark:text-gray-200">
        {s}
      </pre>
    );
  return (
    <span className="text-gray-800 dark:text-gray-200 break-all">{s}</span>
  );
};

const ResourceDetail: React.FC = () => {
  const { t } = useLocale();
  const { resource = "", id = "" } = useParams();
  const meta = ADMIN_RESOURCE_MAP[resource];
  const navigate = useNavigate();

  const [record, setRecord] = useState<AdminRecord | null>(null);
  const [ancestors, setAncestors] = useState<AdminAncestor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getRecord(resource, id);
      setRecord(result?.item ?? null);
      setAncestors(result?.ancestors ?? []);
    } catch (e) {
      console.error("Failed to load record:", e);
      setRecord(null);
      setAncestors([]);
    } finally {
      setLoading(false);
    }
  }, [resource, id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const handleSave = async (value: Record<string, unknown>) => {
    const updated = await adminService.updateRecord(resource, id, value);
    setRecord(updated ?? null);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        t(
          "Delete this {singular}? This cascades to any child records and cannot be undone.",
          { singular: meta?.singular ?? t("record") }
        )
      )
    )
      return;
    try {
      await adminService.deleteRecord(resource, id);
      navigate(`/admin/data/${resource}`);
    } catch (e) {
      alert((e as Error).message || t("Delete failed"));
    }
  };

  // Action links: 360° dashboards, drill-down into descendants ("All X"), and
  // secondary parent jumps. Up-navigation to ancestors is the breadcrumb above.
  const links: { label: string; to: string }[] = [];
  if (record) {
    const r = record as Record<string, unknown>;
    if (resource === "users")
      links.push({ label: t("360° overview"), to: `/admin/overview/${id}` });
    else if (r.userId)
      links.push({
        label: t("Owner 360°"),
        to: `/admin/overview/${refId(r.userId)}`,
      });
    for (const d of DRILL_DOWNS[resource] ?? [])
      links.push({
        label: t("All {label}", { label: d.label }),
        to: `/admin/data/${d.resource}?${d.param}=${id}`,
      });
    for (const s of SECONDARY_LINKS[resource] ?? [])
      if (r[s.field])
        links.push({
          label: t(s.label),
          to: `/admin/data/${s.resource}/${refId(r[s.field])}`,
        });
  }

  return (
    <AdminLayout title={meta ? meta.singular : t("Record")}>
      <div className="space-y-6">
        <button
          onClick={() => navigate(`/admin/data/${resource}`)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          {t("Back to {label}", { label: meta?.label ?? resource })}
        </button>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400" />
          </div>
        ) : !record ? (
          <Card>
            <p className="text-gray-500 dark:text-gray-400">
              {t("Record not found.")}
            </p>
          </Card>
        ) : (
          <>
            {ancestors.length > 0 && (
              <nav
                aria-label="Ancestry"
                className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-gray-500 dark:text-gray-400"
              >
                {ancestors.map((a) => (
                  <span
                    key={`${a.resource}-${a.id}`}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Link
                      to={`/admin/data/${a.resource}/${a.id}`}
                      title={
                        ADMIN_RESOURCE_MAP[a.resource]?.singular ?? a.resource
                      }
                      className="truncate max-w-[220px] hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {a.label ||
                        ADMIN_RESOURCE_MAP[a.resource]?.singular ||
                        a.resource}
                    </Link>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                  </span>
                ))}
                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {meta?.singular ?? resource}
                </span>
              </nav>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                  {meta?.singular ?? resource}
                </h1>
                <code className="text-xs text-gray-500 dark:text-gray-400 break-all">
                  {id}
                </code>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Pencil className="w-4 h-4 me-2" />
                  {t("Edit")}
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 me-2" />
                  {t("Delete")}
                </Button>
              </div>
            </div>

            {links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {links.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    className="px-3 py-1.5 rounded-lg text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20"
                  >
                    {l.label} →
                  </Link>
                ))}
              </div>
            )}

            <Card title={t("Fields")}>
              <dl className="divide-y divide-gray-200 dark:divide-gray-800">
                {Object.entries(record).map(([key, value]) => (
                  <div
                    key={key}
                    className="py-3 grid grid-cols-1 sm:grid-cols-4 gap-2"
                  >
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 break-all">
                      {key}
                    </dt>
                    <dd className="sm:col-span-3 text-sm">
                      <FieldValue value={value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            <JsonBlock value={record} label={t("Raw document")} />
          </>
        )}
      </div>

      {editing && record && (
        <RecordEditorModal
          title={t("Edit {singular}", {
            singular: meta?.singular ?? t("record"),
          })}
          hint={t(
            "Edit any field as JSON. Server-side validation applies. For users, add a plaintext `password` field to reset the password."
          )}
          initialValue={record as Record<string, unknown>}
          onClose={() => setEditing(false)}
          onSave={handleSave}
        />
      )}
    </AdminLayout>
  );
};

export default ResourceDetail;
