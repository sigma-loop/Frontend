import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import Button from "../ui/Button";
import PageMeta from "../common/PageMeta";
import { ADMIN_RESOURCES } from "../../constants/adminResources";
import {
  LayoutDashboard,
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
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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
};

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ADMIN only — there is no INSTRUCTOR role
  React.useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium"
        : "text-gray-700 dark:text-gray-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
    }`;

  const sidebarContent = (
    <>
      <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gradient">
            {t("Admin Panel")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
            {user?.email}
          </p>
        </div>
        <button
          onClick={closeSidebar}
          className="lg:hidden -me-2 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
          aria-label={t("Close menu")}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavLink to="/admin" end onClick={closeSidebar} className={linkClass}>
          <LayoutDashboard className="w-5 h-5" />
          <span>{t("Command Center")}</span>
        </NavLink>
        <NavLink
          to="/admin/settings"
          onClick={closeSidebar}
          className={linkClass}
        >
          <Settings className="w-5 h-5" />
          <span>{t("Settings")}</span>
        </NavLink>

        <p className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {t("Collections")}
        </p>
        {ADMIN_RESOURCES.map((r) => {
          const Icon = ICONS[r.icon] ?? Sparkles;
          return (
            <NavLink
              key={r.key}
              to={`/admin/data/${r.key}`}
              onClick={closeSidebar}
              className={linkClass}
            >
              <Icon className="w-5 h-5" />
              <span>{t(r.label)}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5 me-3" />
          {t("Logout")}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0d1117]">
      <PageMeta
        title={title ? t("Admin - {title}", { title }) : t("Admin Dashboard")}
      />

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar: static on lg, slide-in drawer below it */}
      <aside
        className={`fixed inset-y-0 start-0 z-40 w-64 flex flex-col bg-white dark:bg-[#161b22] border-e border-gray-200 dark:border-gray-800 transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="-ms-2 p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
            aria-label={t("Open menu")}
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-gradient">{t("Admin Panel")}</span>
        </div>

        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
