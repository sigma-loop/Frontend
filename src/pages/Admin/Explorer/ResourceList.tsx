import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import RecordEditorModal from "../components/RecordEditorModal";
import { renderCell, shortId } from "../components/cells";
import { adminService } from "../../../services/adminService";
import type { AdminListResult } from "../../../types/api";
import {
  ADMIN_RESOURCE_MAP,
  REF_FILTER_KEYS,
  REF_FILTER_LABELS,
} from "../../../constants/adminResources";
import { formatNumber } from "../../../utils/formatters";
import { Plus, X } from "lucide-react";

const selectClass =
  "px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-[#0d1117] dark:text-gray-100";

const ResourceList: React.FC = () => {
  const { resource = "" } = useParams();
  const meta = ADMIN_RESOURCE_MAP[resource];
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<AdminListResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "");

  const page = parseInt(searchParams.get("page") || "1", 10) || 1;

  const fetchData = useCallback(async () => {
    if (!meta) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      searchParams.forEach((v, k) => {
        if (v) params[k] = v;
      });
      if (!params.page) params.page = "1";
      const result = await adminService.listResource(resource, params);
      setData(result);
    } catch (e) {
      console.error("Failed to list", resource, e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [resource, meta, searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset the search box when switching collections.
  useEffect(() => {
    setSearchText(searchParams.get("q") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", searchText.trim());
  };

  if (!meta) {
    return (
      <AdminLayout title="Explorer">
        <Card>
          <p className="text-gray-500 dark:text-gray-400">
            Unknown resource "{resource}".
          </p>
        </Card>
      </AdminLayout>
    );
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Delete this ${meta.singular}? This cascades to any child records and cannot be undone.`
      )
    )
      return;
    try {
      await adminService.deleteRecord(resource, id);
      fetchData();
    } catch (err) {
      alert((err as Error).message || "Delete failed");
    }
  };

  const handleCreate = async (value: Record<string, unknown>) => {
    const item = await adminService.createRecord(resource, value);
    setCreating(false);
    const id = (item as Record<string, unknown> | undefined)?._id;
    if (id) navigate(`/admin/data/${resource}/${String(id)}`);
    else fetchData();
  };

  const total = data?.pagination.total ?? 0;
  const pages = data?.pagination.pages ?? 1;
  const items = data?.items ?? [];

  // Active drill-down (foreign-key) filters, shown as removable chips.
  const refChips = REF_FILTER_KEYS.filter((k) => searchParams.get(k)).map(
    (k) => ({ key: k, value: searchParams.get(k) as string })
  );

  return (
    <AdminLayout title={meta.label}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {meta.label}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {formatNumber(total)} record{total === 1 ? "" : "s"} · full read /
              edit / delete
            </p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New {meta.singular}
          </Button>
        </div>

        {/* Toolbar */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {meta.searchable && (
              <form onSubmit={submitSearch} className="flex gap-2 flex-1">
                <Input
                  placeholder={`Search ${meta.label.toLowerCase()}…`}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full"
                />
                <Button type="submit" variant="outline">
                  Search
                </Button>
              </form>
            )}
            <div className="flex flex-wrap gap-2">
              {meta.filters.map((f) =>
                f.control === "number" ? (
                  <input
                    key={f.key}
                    type="number"
                    min={0}
                    placeholder={f.placeholder ?? f.label}
                    value={searchParams.get(f.key) ?? ""}
                    onChange={(e) => updateParam(f.key, e.target.value)}
                    className={`${selectClass} w-32`}
                    aria-label={f.label}
                  />
                ) : (
                  <select
                    key={f.key}
                    value={searchParams.get(f.key) ?? ""}
                    onChange={(e) => updateParam(f.key, e.target.value)}
                    className={selectClass}
                    aria-label={f.label}
                  >
                    <option value="">All {f.label}</option>
                    {(f.options ?? []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                )
              )}
            </div>
          </div>

          {refChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {refChips.map((c) => (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                >
                  {REF_FILTER_LABELS[c.key] ?? c.key}: {shortId(c.value)}
                  <button
                    onClick={() => updateParam(c.key, "")}
                    aria-label={`Clear ${REF_FILTER_LABELS[c.key] ?? c.key} filter`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Table */}
        {loading && !data ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400" />
          </div>
        ) : (
          <Card className="!p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-white/[0.02]">
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    {meta.columns.map((c) => (
                      <th key={c.key} className="px-4 py-3 font-medium">
                        {c.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {items.map((item) => {
                    const id = String(
                      (item as Record<string, unknown>)._id ?? ""
                    );
                    return (
                      <tr
                        key={id}
                        onClick={() =>
                          navigate(`/admin/data/${resource}/${id}`)
                        }
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                      >
                        {meta.columns.map((c) => (
                          <td key={c.key} className="px-4 py-3 align-top">
                            {renderCell(item as Record<string, unknown>, c)}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/data/${resource}/${id}`);
                            }}
                            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                          >
                            Open
                          </button>
                          <button
                            onClick={(e) => handleDelete(id, e)}
                            className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {items.length === 0 && (
              <p className="text-center text-gray-400 py-10">
                No records found.
              </p>
            )}
          </Card>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateParam("page", String(page - 1))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => updateParam("page", String(page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {creating && (
        <RecordEditorModal
          title={`New ${meta.singular}`}
          hint="Edit the JSON, then save. Server-side validation applies. For users, include a plaintext `password` field."
          initialValue={meta.template}
          onClose={() => setCreating(false)}
          onSave={handleCreate}
        />
      )}
    </AdminLayout>
  );
};

export default ResourceList;
