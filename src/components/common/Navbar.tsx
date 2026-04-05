import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "../ui/Button";
import { Moon, Sun, Menu, X } from "lucide-react";
import darkLogo from "../../assets/dark-logo.png";
import lightLogo from "../../assets/light-logo.png";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

  const textClasses = (isActive: boolean) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400"
        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
    }`;

  const mobileTextClasses = (isActive: boolean) =>
    `block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
    }`;

  const navLinks = (
    <>
      <NavLink to="/courses" className={({ isActive }) => textClasses(isActive)}>
        Courses
      </NavLink>
      <NavLink to="/curriculum" className={({ isActive }) => textClasses(isActive)}>
        Curriculum
      </NavLink>
      <NavLink to="/mentor" className={({ isActive }) => textClasses(isActive)}>
        Mentors
      </NavLink>
      {isAuthenticated && (user?.role === "ADMIN" || user?.role === "INSTRUCTOR") && (
        <NavLink to="/admin/courses" className={({ isActive }) => textClasses(isActive)}>
          Admin Panel
        </NavLink>
      )}
      {isAuthenticated && (
        <NavLink to="/dashboard" className={({ isActive }) => textClasses(isActive)}>
          Dashboard
        </NavLink>
      )}
    </>
  );

  const mobileNavLinks = (
    <>
      <NavLink
        to="/courses"
        className={({ isActive }) => mobileTextClasses(isActive)}
        onClick={() => setMobileOpen(false)}
      >
        Courses
      </NavLink>
      <NavLink
        to="/curriculum"
        className={({ isActive }) => mobileTextClasses(isActive)}
        onClick={() => setMobileOpen(false)}
      >
        Curriculum
      </NavLink>
      <NavLink
        to="/mentor"
        className={({ isActive }) => mobileTextClasses(isActive)}
        onClick={() => setMobileOpen(false)}
      >
        Mentors
      </NavLink>
      {isAuthenticated && (user?.role === "ADMIN" || user?.role === "INSTRUCTOR") && (
        <NavLink
          to="/admin/courses"
          className={({ isActive }) => mobileTextClasses(isActive)}
          onClick={() => setMobileOpen(false)}
        >
          Admin Panel
        </NavLink>
      )}
      {isAuthenticated && (
        <NavLink
          to="/dashboard"
          className={({ isActive }) => mobileTextClasses(isActive)}
          onClick={() => setMobileOpen(false)}
        >
          Dashboard
        </NavLink>
      )}
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 dark:bg-[#0d1117]/80 dark:border-gray-800">
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
          <div className="hidden md:flex items-center space-x-8">
            {navLinks}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Desktop auth buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.profileData?.name || user?.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
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
            {mobileNavLinks}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.profileData?.name || user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="md" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Get Started
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
