import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLocale } from "../../contexts/LocaleContext";
import { useClickOutside } from "../../hooks/useClickOutside";
import { ROUTES } from "../../constants/routes";
import { cn } from "../../utils/cn";
import Button from "../ui/Button";
import {
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

/** Hairline vertical separator that segments the toolbar (desktop only). */
const Divider: React.FC<{ className?: string }> = ({ className }) => (
  <span
    aria-hidden="true"
    className={cn("h-5 w-px bg-gray-200 dark:bg-gray-800", className)}
  />
);

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark } = useTheme();
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
  const roleLabel = user?.role === "ADMIN" ? t("Admin") : t("Student");

  // Primary nav links — what's available depends on auth + role.
  const navLinks = [
    isAuthenticated && { to: ROUTES.DASHBOARD, label: t("Dashboard") },
    isAuthenticated && { to: ROUTES.MY_COURSES, label: t("My Courses") },
    isAuthenticated &&
      user?.role === "ADMIN" && { to: ROUTES.ADMIN, label: t("Admin") },
  ].filter(Boolean) as { to: string; label: string }[];

  // Nav link — flat, hairline radius (rounded-lg, not a pill). Active state
  // uses the one restrained indigo accent.
  const navLinkClasses = (isActive: boolean) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white"
    );

  const mobileLinkClasses = (isActive: boolean) =>
    cn(
      "block rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
      isActive
        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
    );

  const menuItemClasses =
    "flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 transition-colors";

  const iconButtonClasses =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white cursor-pointer";

  // The AI Mentor is the hero entry point, but rendered as a golden text link
  // (not a filled button) — the sparkle icon signals "AI", the gold hue makes
  // it stand out. Always visible (guests too).
  const mentorLink =
    "group items-center gap-1.5 text-sm font-semibold text-amber-500 transition-colors hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300";

  const roleBadge = (
    <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:bg-white/10 dark:text-gray-300">
      {roleLabel}
    </span>
  );

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/85 backdrop-blur-md dark:border-gray-800 dark:bg-[#0d1117]/85">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: brand + primary nav */}
          <div className="flex min-w-0 items-center gap-1">
            <Link to="/" className="flex shrink-0 items-center gap-2 pe-1">
              <img
                src={isDark ? darkLogo : lightLogo}
                alt="SigmaLoop"
                className="h-8 w-auto"
              />
              <span className="font-display text-lg font-bold text-gray-900 dark:text-white">
                SigmaLoop
              </span>
            </Link>

            {navLinks.length > 0 && (
              <div className="hidden items-center gap-0.5 md:flex">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === ROUTES.DASHBOARD}
                    className={({ isActive }) => navLinkClasses(isActive)}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Right: hero CTA + utilities + identity */}
          <div className="flex items-center gap-1.5">
            <NavLink
              to="/mentor"
              className={({ isActive }) =>
                cn(
                  "hidden md:inline-flex",
                  mentorLink,
                  isActive && "text-amber-600 dark:text-amber-300"
                )
              }
            >
              <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
              {t("AI Mentor")}
            </NavLink>

            {/* Language picker — available to everyone, incl. guests on Home */}
            <LanguageSwitcher />

            <Divider className="mx-0.5 hidden md:block" />

            {/* Desktop auth area */}
            <div className="hidden items-center gap-2 md:flex">
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="group flex cursor-pointer items-center gap-2 rounded-lg p-1 pe-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
                    aria-label={t("Account menu")}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                      {initial}
                    </span>
                    <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 dark:text-gray-300 lg:block">
                      {displayName}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-gray-400 transition-transform",
                        profileOpen && "rotate-180"
                      )}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute end-0 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-[#161b22]">
                      <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {displayName}
                          </p>
                          {roleBadge}
                        </div>
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
                          className={cn(
                            menuItemClasses,
                            "w-full text-start text-red-600 dark:text-red-400"
                          )}
                        >
                          <LogOut className="h-4 w-4" />
                          {t("Sign out")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
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
              className={cn(iconButtonClasses, "md:hidden")}
              aria-label={t("Toggle menu")}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-[#0d1117] md:hidden">
          <div className="space-y-1 px-4 py-3">
            <NavLink
              to="/mentor"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10",
                  isActive && "bg-amber-50 dark:bg-amber-500/10"
                )
              }
            >
              <Sparkles className="h-4 w-4" />
              {t("AI Mentor")}
            </NavLink>

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === ROUTES.DASHBOARD}
                className={({ isActive }) => mobileLinkClasses(isActive)}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated && (
              <NavLink
                to={ROUTES.SETTINGS}
                className={({ isActive }) => mobileLinkClasses(isActive)}
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

          <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                    {initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {displayName}
                      </p>
                      {roleBadge}
                    </div>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-start text-base font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
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
