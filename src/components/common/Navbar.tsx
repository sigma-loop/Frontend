import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Button from "../ui/Button";
import { Moon, Sun } from "lucide-react";
import darkLogo from "../../assets/dark-logo.png";
import lightLogo from "../../assets/light-logo.png";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const textClasses = (isActive: boolean) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-indigo-600 dark:text-indigo-400"
        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
    }`;

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
            <NavLink
              to="/courses"
              className={({ isActive }) => textClasses(isActive)}
            >
              Courses
            </NavLink>
            <NavLink
              to="/curriculum"
              className={({ isActive }) => textClasses(isActive)}
            >
              Curriculum
            </NavLink>
            <NavLink
              to="/mentor"
              className={({ isActive }) => textClasses(isActive)}
            >
              Mentors
            </NavLink>

            {isAuthenticated &&
              (user?.role === "ADMIN" || user?.role === "INSTRUCTOR") && (
                <NavLink
                  to="/admin/courses"
                  className={({ isActive }) => textClasses(isActive)}
                >
                  Admin Panel
                </NavLink>
              )}

            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => textClasses(isActive)}
              >
                Dashboard
              </NavLink>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
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

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium hidden sm:block text-gray-700 dark:text-gray-300">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
