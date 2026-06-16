import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../../components/layouts/AdminLayout";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import { useLocale } from "../../../contexts/LocaleContext";
import { adminService } from "../../../services/adminService";
import type { AppSetting } from "../../../types/api";
import {
  Check,
  AlertTriangle,
  RotateCcw,
  Lock,
  Settings as SettingsIcon,
} from "lucide-react";

type Draft = string | number | boolean;

/** Convert a setting's native value into the editable draft representation. */
function toDraft(s: AppSetting): Draft {
  if (s.type === "csv") return Array.isArray(s.value) ? s.value.join(", ") : "";
  if (s.type === "boolean") return Boolean(s.value);
  if (s.type === "number") return s.value == null ? "" : Number(s.value);
  return s.value == null ? "" : String(s.value);
}

/** Convert a draft back into the payload value sent to the API. */
function fromDraft(s: AppSetting, draft: Draft): unknown {
  if (s.type === "boolean") return Boolean(draft);
  if (s.type === "number") return Number(draft);
  return draft; // string / enum / csv (server splits csv)
}

function draftsEqual(s: AppSetting, draft: Draft): boolean {
  return JSON.stringify(toDraft(s)) === JSON.stringify(draft);
}

const Toggle: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#0d1117] disabled:opacity-50 ${
      checked ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const inputClass =
  "w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500 transition-colors dark:border-gray-700 dark:bg-[#0d1117] dark:text-gray-100 dark:focus:ring-indigo-400/50";

const AdminSettings: React.FC = () => {
  const { t } = useLocale();
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (kind: "success" | "error", text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3500);
  };

  const hydrate = (list: AppSetting[]) => {
    setSettings(list);
    setDrafts(Object.fromEntries(list.map((s) => [s.key, toDraft(s)])));
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { settings: list, groups: g } = await adminService.getSettings();
        hydrate(list);
        setGroups(g);
      } catch {
        showToast("error", t("Failed to load settings"));
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byGroup = useMemo(() => {
    const map = new Map<string, AppSetting[]>();
    for (const s of settings) {
      if (!map.has(s.group)) map.set(s.group, []);
      map.get(s.group)!.push(s);
    }
    return map;
  }, [settings]);

  const orderedGroups = useMemo(() => {
    const present = new Set(settings.map((s) => s.group));
    const ordered = groups.filter((g) => present.has(g));
    const extras = [...present].filter((g) => !groups.includes(g));
    return [...ordered, ...extras];
  }, [groups, settings]);

  const setDraft = (key: string, value: Draft) =>
    setDrafts((d) => ({ ...d, [key]: value }));

  const handleSave = async (s: AppSetting) => {
    setSavingKey(s.key);
    try {
      const updated = await adminService.updateSettings([
        { key: s.key, value: fromDraft(s, drafts[s.key]) },
      ]);
      hydrate(updated);
      showToast("success", t("Saved {label}", { label: s.label }));
    } catch (err) {
      const message =
        (
          err as {
            response?: { data?: { details?: string[]; message?: string } };
          }
        )?.response?.data?.details?.[0] ??
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        t("Failed to save");
      showToast("error", message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleReset = async (s: AppSetting) => {
    setSavingKey(s.key);
    try {
      const updated = await adminService.resetSetting(s.key);
      hydrate(updated);
      showToast("success", t("Reset {label} to default", { label: s.label }));
    } catch {
      showToast("error", t("Failed to reset"));
    } finally {
      setSavingKey(null);
    }
  };

  const renderControl = (s: AppSetting) => {
    const draft = drafts[s.key];

    if (s.sensitive) {
      return s.configured ? (
        <Badge variant="success">{t("Configured")}</Badge>
      ) : (
        <Badge variant="warning">{t("Not set")}</Badge>
      );
    }

    if (!s.editable) {
      return (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
          {String(s.value)}
        </span>
      );
    }

    if (s.type === "boolean") {
      return (
        <Toggle
          checked={Boolean(draft)}
          onChange={(next) => setDraft(s.key, next)}
        />
      );
    }

    if (s.type === "enum") {
      return (
        <select
          value={String(draft)}
          onChange={(e) => setDraft(s.key, e.target.value)}
          className={inputClass}
        >
          {s.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={s.type === "number" ? "number" : "text"}
        value={draft as string | number}
        min={s.min}
        max={s.max}
        onChange={(e) => setDraft(s.key, e.target.value)}
        className={`${inputClass} font-mono`}
      />
    );
  };

  return (
    <AdminLayout title={t("Settings")}>
      {toast && (
        <div
          className={`fixed end-4 top-20 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
            toast.kind === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.kind === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {toast.text}
        </div>
      )}

      <div className="mb-6 flex items-center gap-3">
        <div className="icon-tile">
          <SettingsIcon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("Runtime Settings")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t(
              "Override environment defaults live. Changes apply immediately — no restart. Secrets stay env-only."
            )}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400" />
        </div>
      ) : (
        <div className="space-y-8">
          {orderedGroups.map((group) => (
            <section
              key={group}
              className="glass-card rounded-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {t(group)}
                </h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {byGroup.get(group)!.map((s) => {
                  const editable = s.editable && !s.sensitive;
                  const dirty = editable && !draftsEqual(s, drafts[s.key]);
                  const busy = savingKey === s.key;
                  return (
                    <div
                      key={s.key}
                      className="px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 sm:w-1/2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {t(s.label)}
                          </span>
                          <code className="text-xs text-gray-400 dark:text-gray-500">
                            {s.key}
                          </code>
                          {s.source === "db" && !s.sensitive && (
                            <Badge variant="info">{t("Overridden")}</Badge>
                          )}
                          {!s.editable && !s.sensitive && (
                            <Badge variant="warning">
                              {t("Restart required")}
                            </Badge>
                          )}
                          {s.sensitive && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <Lock className="h-3 w-3" />
                              {t("env-only")}
                            </span>
                          )}
                        </div>
                        {s.help && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t(s.help)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 sm:w-1/2 sm:justify-end">
                        <div className="flex-1 sm:max-w-xs">
                          {renderControl(s)}
                        </div>
                        {editable && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSave(s)}
                              isLoading={busy && dirty}
                              disabled={!dirty || busy}
                            >
                              {t("Save")}
                            </Button>
                            {s.source === "db" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReset(s)}
                                disabled={busy}
                                title={t("Reset to environment default")}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;
