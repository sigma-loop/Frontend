import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLocale } from "../../contexts/LocaleContext";
import { useClickOutside } from "../../hooks/useClickOutside";
import { ROUTES } from "../../constants/routes";
import Button from "../ui/Button";
import {
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Settings as SettingsIcon,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import darkLogo from "../../assets/dark-logo.png";
import lightLogo from "../../assets/light-logo.png";
import LanguageSwitcher from "./LanguageSwitcher";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useClickOutside<HTMLDivElement>(() =>
    setProfileOpen(false)
  );

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/login");
  };

  const displayName = user?.profileData?.name || user?.email || t("Account");
  const initial = (user?.profileData?.name || user?.email || "?")
    .charAt(0)
    .toUpperCase();

  // Modern pill-style nav link.
  const pillClasses = (isActive: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
    }`;

  const mobilePillClasses = (isActive: boolean) =>
    `block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
    }`;

  const menuItemClasses =
    "flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors";

  // The mentor is the hero — a clean amber accent pill (flat, no gradient/glow),
  // matching the Learn-a-New-Thing CTA. Always visible (guests can use it too).
  const goldPill =
    "bg-amber-400 text-amber-950 hover:bg-amber-300 transition-colors";

  const aiBadge = (
    <span className="rounded bg-amber-950/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">
      {t("AI")}
    </span>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md border-b border-gray-200 dark:bg-[#0d1117]/85 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={isDark ? darkLogo : lightLogo}
              alt="SigmaLoop"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold font-display text-gray-900 dark:text-white">
              SigmaLoop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            <NavLink
              to="/mentor"
              className={`group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold ${goldPill}`}
            >
              <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
              {t("Mentor")}
              {aiBadge}
            </NavLink>
            {isAuthenticated && user?.role === "ADMIN" && (
              <NavLink
                to="/admin"
                className={({ isActive }) => pillClasses(isActive)}
              >
                {t("Admin Panel")}
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => pillClasses(isActive)}
              >
                {t("Dashboard")}
              </NavLink>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Language picker — available to everyone, incl. guests on Home */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={t("Toggle theme")}
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Desktop auth area */}
            <div className="hidden md:flex items-center space-x-3 rtl:space-x-reverse">
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-full py-1 ps-1 pe-2 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label={t("Account menu")}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                      {initial}
                    </span>
                    <span className="max-w-[120px] truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                      {displayName}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute end-0 mt-2 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-[#161b22]">
                      <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to={ROUTES.DASHBOARD}
                          onClick={() => setProfileOpen(false)}
                          className={menuItemClasses}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          {t("Dashboard")}
                        </Link>
                        <Link
                          to={ROUTES.SETTINGS}
                          onClick={() => setProfileOpen(false)}
                          className={menuItemClasses}
                        >
                          <SettingsIcon className="h-4 w-4" />
                          {t("Settings")}
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 py-1 dark:border-gray-800">
                        <button
                          onClick={handleLogout}
                          className={`${menuItemClasses} w-full text-start text-red-600 dark:text-red-400`}
                        >
                          <LogOut className="h-4 w-4" />
                          {t("Sign out")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      {t("Log in")}
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      {t("Get Started")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
              aria-label={t("Toggle menu")}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0d1117] shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <NavLink
              to="/mentor"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-bold ${goldPill}`}
            >
              <Sparkles className="w-4 h-4" />
              {t("Mentor")}
              {aiBadge}
            </NavLink>
            {isAuthenticated && user?.role === "ADMIN" && (
              <NavLink
                to="/admin"
                className={({ isActive }) => mobilePillClasses(isActive)}
                onClick={() => setMobileOpen(false)}
              >
                {t("Admin Panel")}
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => mobilePillClasses(isActive)}
                onClick={() => setMobileOpen(false)}
              >
                {t("Dashboard")}
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink
                to={ROUTES.SETTINGS}
                className={({ isActive }) => mobilePillClasses(isActive)}
                onClick={() => setMobileOpen(false)}
              >
                {t("Settings")}
              </NavLink>
            )}
            {/* Language picker (guests included) */}
            <div className="pt-1">
              <LanguageSwitcher full />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-start px-3 py-2.5 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  {t("Sign Out")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="md" className="w-full">
                    {t("Log in")}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    {t("Get Started")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
