import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Lock,
  Bell,
  ShieldCheck,
  AlertTriangle,
  Download,
  Trash2,
  Check,
  X,
  Languages,
  GraduationCap,
  Eye,
} from "lucide-react";
import MainLayout from "../../components/layouts/MainLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { userService } from "../../services/userService";
import type { UserPreferences, LessonLockMode } from "../../types/api";
import { SUPPORTED_LOCALES, getLocaleDir } from "../../constants/locales";

const DEFAULT_PREFERENCES: UserPreferences = {
  notifications: {
    curriculumReady: true,
    weeklyProgress: true,
    productUpdates: false,
  },
  privacy: {
    marketingEmails: false,
    usageAnalytics: true,
  },
  learning: {
    lessonLockMode: "PROGRESS",
  },
};

type TabId =
  | "account"
  | "security"
  | "language"
  | "learning"
  | "notifications"
  | "privacy"
  | "danger";

// `label` is the English source string; it's run through t() at render time.
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "account", label: "Account", icon: UserIcon },
  { id: "security", label: "Security", icon: Lock },
  { id: "language", label: "Language", icon: Languages },
  { id: "learning", label: "Learning", icon: GraduationCap },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: ShieldCheck },
  { id: "danger", label: "Danger zone", icon: AlertTriangle },
];

// ── Small primitives ──────────────────────────────────────────

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

const SettingRow: React.FC<{
  title: string;
  description: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="flex items-center justify-between gap-4 py-4">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {title}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    {children}
  </div>
);

const SectionCard: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="glass-card rounded-xl p-6">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
      {title}
    </h2>
    {description && (
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    )}
    <div className="mt-5">{children}</div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────

const Settings: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { t, language, setLanguage } = useLocale();
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabId>("account");
  const [toast, setToast] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  // Account
  const [name, setName] = useState(user?.profileData?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  // Security
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  // Preferences
  const [prefs, setPrefs] = useState<UserPreferences>(
    user?.preferences ?? DEFAULT_PREFERENCES
  );

  // Danger zone
  const [exporting, setExporting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Pull the freshest profile/preferences once on mount.
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep local state in sync when the context user loads/changes.
  useEffect(() => {
    if (user?.profileData?.name !== undefined) setName(user.profileData.name);
    if (user?.preferences) setPrefs(user.preferences);
  }, [user]);

  const toastTimer = useRef<number | undefined>(undefined);
  const notify = (kind: "success" | "error", text: string) => {
    setToast({ kind, text });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  };

  const errText = (err: unknown) =>
    err instanceof Error ? err.message : t("Something went wrong");

  // ── Handlers ──

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    try {
      await userService.updateProfile(name.trim());
      await refreshUser();
      notify("success", t("Profile updated"));
    } catch (err) {
      notify("error", errText(err));
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 6) {
      notify("error", t("New password must be at least 6 characters"));
      return;
    }
    if (pw.next !== pw.confirm) {
      notify("error", t("New passwords don't match"));
      return;
    }
    setSavingPw(true);
    try {
      await userService.updatePassword(pw.current, pw.next);
      setPw({ current: "", next: "", confirm: "" });
      notify("success", t("Password updated"));
    } catch (err) {
      notify("error", errText(err));
    } finally {
      setSavingPw(false);
    }
  };

  const persistPrefs = async (next: UserPreferences) => {
    const previous = prefs;
    setPrefs(next); // optimistic
    try {
      await userService.updatePreferences(next);
      notify("success", t("Preferences saved"));
    } catch (err) {
      setPrefs(previous); // revert
      notify("error", errText(err));
    }
  };

  const setNotif = (key: keyof UserPreferences["notifications"], v: boolean) =>
    persistPrefs({
      ...prefs,
      notifications: { ...prefs.notifications, [key]: v },
    });

  const setPrivacy = (key: keyof UserPreferences["privacy"], v: boolean) =>
    persistPrefs({ ...prefs, privacy: { ...prefs.privacy, [key]: v } });

  const setLessonLockMode = (mode: LessonLockMode) =>
    persistPrefs({ ...prefs, learning: { lessonLockMode: mode } });

  // Switch the UI language: flip the site instantly (LocaleContext), then
  // persist the choice. The server derives the text direction from the language.
  const handleChangeLanguage = async (code: string) => {
    if (code === language) return;
    setLanguage(code);
    try {
      await userService.updatePreferences({
        localization: { language: code, direction: getLocaleDir(code) },
      });
      notify("success", t("Language updated"));
    } catch (err) {
      notify("error", errText(err));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await userService.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sigmaloop-export.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      notify("success", t("Your data is downloading"));
    } catch (err) {
      notify("error", errText(err));
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePassword) {
      notify("error", t("Enter your password to confirm"));
      return;
    }
    setDeleting(true);
    try {
      await userService.deleteAccount(deletePassword);
      logout();
      navigate("/");
    } catch (err) {
      notify("error", errText(err));
      setDeleting(false);
    }
  };

  return (
    <MainLayout title={t("Settings")}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-4 top-20 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
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

      <div className="py-6">
        <h1 className="font-display text-3xl font-semibold text-gray-900 dark:text-white">
          {t("Settings")}
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          {t("Manage your account, security, and preferences.")}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Tab nav */}
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {TABS.map((item) => {
              const active = tab === item.id;
              const isDanger = item.id === "danger";
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex flex-shrink-0 items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? isDanger
                        ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                        : "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {t(item.label)}
                </button>
              );
            })}
          </nav>

          {/* Tab content */}
          <div className="max-w-2xl space-y-6">
            {tab === "account" && (
              <SectionCard
                title={t("Profile")}
                description={t("This name appears across SigmaLoop.")}
              >
                <form onSubmit={handleSaveName} className="space-y-4">
                  <Input
                    id="name"
                    label={t("Display name")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("Your name")}
                  />
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("Email")}
                    </label>
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
                      <span className="truncate">{user?.email}</span>
                      <span className="ms-2 flex-shrink-0 text-xs">
                        {t("Can't be changed")}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    isLoading={savingName}
                    disabled={
                      !name.trim() ||
                      name.trim() === (user?.profileData?.name ?? "")
                    }
                  >
                    {t("Save changes")}
                  </Button>
                </form>
              </SectionCard>
            )}

            {tab === "security" && (
              <SectionCard
                title={t("Change password")}
                description={t("Use at least 6 characters.")}
              >
                <form onSubmit={handleSavePassword} className="space-y-4">
                  <Input
                    id="current"
                    label={t("Current password")}
                    type="password"
                    autoComplete="current-password"
                    value={pw.current}
                    onChange={(e) => setPw({ ...pw, current: e.target.value })}
                  />
                  <Input
                    id="next"
                    label={t("New password")}
                    type="password"
                    autoComplete="new-password"
                    value={pw.next}
                    onChange={(e) => setPw({ ...pw, next: e.target.value })}
                  />
                  <Input
                    id="confirm"
                    label={t("Confirm new password")}
                    type="password"
                    autoComplete="new-password"
                    value={pw.confirm}
                    onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  />
                  <Button
                    type="submit"
                    isLoading={savingPw}
                    disabled={!pw.current || !pw.next || !pw.confirm}
                  >
                    {t("Update password")}
                  </Button>
                </form>
              </SectionCard>
            )}

            {tab === "language" && (
              <SectionCard
                title={t("Language")}
                description={t(
                  "Choose your language. The interface and your lessons are translated on demand — content is created in English and translated when you switch."
                )}
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SUPPORTED_LOCALES.map((loc) => {
                    const active = loc.code === language;
                    return (
                      <button
                        key={loc.code}
                        type="button"
                        onClick={() => handleChangeLanguage(loc.code)}
                        className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-start transition-colors ${
                          active
                            ? "border-indigo-500 bg-indigo-50 dark:border-indigo-500/60 dark:bg-indigo-500/10"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                            {loc.nativeName}
                          </span>
                          <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                            {t(loc.name)}
                            {loc.dir === "rtl" ? " · RTL" : ""}
                          </span>
                        </span>
                        {active && (
                          <Check className="h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {tab === "learning" && (
              <SectionCard
                title={t("Lesson access")}
                description={t(
                  "Choose how lessons unlock as you work through a course."
                )}
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(
                    [
                      {
                        mode: "PROGRESS",
                        title: t("Progress"),
                        desc: t(
                          "Unlock each lesson only after completing the one before it."
                        ),
                        icon: Lock,
                      },
                      {
                        mode: "VIEW_ALL",
                        title: t("View all"),
                        desc: t(
                          "Unlock every lesson so you can jump around freely."
                        ),
                        icon: Eye,
                      },
                    ] as const
                  ).map(({ mode, title, desc, icon: Icon }) => {
                    const active =
                      (prefs.learning?.lessonLockMode ?? "PROGRESS") === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setLessonLockMode(mode)}
                        className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-start transition-colors ${
                          active
                            ? "border-indigo-500 bg-indigo-50 dark:border-indigo-500/60 dark:bg-indigo-500/10"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                        }`}
                      >
                        <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white">
                            {title}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {desc}
                          </span>
                        </span>
                        {active && (
                          <Check className="ms-auto h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {tab === "notifications" && (
              <SectionCard
                title={t("Email notifications")}
                description={t(
                  "Choose what we email you about. (Email delivery is rolling out soon — your choices are saved now.)"
                )}
              >
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  <SettingRow
                    title={t("Course ready")}
                    description={t(
                      "When a course you requested finishes generating."
                    )}
                  >
                    <Toggle
                      checked={prefs.notifications.curriculumReady}
                      onChange={(v) => setNotif("curriculumReady", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    title={t("Weekly progress")}
                    description={t(
                      "A weekly recap of your streak and progress."
                    )}
                  >
                    <Toggle
                      checked={prefs.notifications.weeklyProgress}
                      onChange={(v) => setNotif("weeklyProgress", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    title={t("Product updates")}
                    description={t(
                      "Occasional news about new SigmaLoop features."
                    )}
                  >
                    <Toggle
                      checked={prefs.notifications.productUpdates}
                      onChange={(v) => setNotif("productUpdates", v)}
                    />
                  </SettingRow>
                </div>
              </SectionCard>
            )}

            {tab === "privacy" && (
              <SectionCard
                title={t("Privacy")}
                description={t("Control how your data is used.")}
              >
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  <SettingRow
                    title={t("Marketing emails")}
                    description={t("Receive occasional tips and offers.")}
                  >
                    <Toggle
                      checked={prefs.privacy.marketingEmails}
                      onChange={(v) => setPrivacy("marketingEmails", v)}
                    />
                  </SettingRow>
                  <SettingRow
                    title={t("Usage analytics")}
                    description={t(
                      "Help improve SigmaLoop with anonymous usage data."
                    )}
                  >
                    <Toggle
                      checked={prefs.privacy.usageAnalytics}
                      onChange={(v) => setPrivacy("usageAnalytics", v)}
                    />
                  </SettingRow>
                </div>
              </SectionCard>
            )}

            {tab === "danger" && (
              <div className="space-y-6">
                <SectionCard
                  title={t("Export your data")}
                  description={t(
                    "Download everything tied to your account as JSON."
                  )}
                >
                  <Button
                    variant="secondary"
                    onClick={handleExport}
                    isLoading={exporting}
                  >
                    <Download className="me-2 h-4 w-4" />
                    {t("Download my data")}
                  </Button>
                </SectionCard>

                <div className="rounded-xl border border-red-200 bg-red-50/60 p-6 dark:border-red-500/30 dark:bg-red-500/5">
                  <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
                    {t("Delete account")}
                  </h2>
                  <p className="mt-1 text-sm text-red-600/90 dark:text-red-400/80">
                    {t(
                      "Permanently delete your account and all of your courses, lessons, progress, and chats. This cannot be undone."
                    )}
                  </p>
                  <Button
                    variant="danger"
                    className="mt-5"
                    onClick={() => setShowDelete(true)}
                  >
                    <Trash2 className="me-2 h-4 w-4" />
                    {t("Delete my account")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-[#161b22]">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("Delete your account?")}
              </h3>
              <button
                onClick={() => {
                  setShowDelete(false);
                  setDeletePassword("");
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t(
                "This permanently removes your account and all of your content. Enter your password to confirm."
              )}
            </p>
            <div className="mt-4">
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                placeholder={t("Your password")}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDelete(false);
                  setDeletePassword("");
                }}
              >
                {t("Cancel")}
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={deleting}
                disabled={!deletePassword}
              >
                {t("Delete forever")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Settings;
