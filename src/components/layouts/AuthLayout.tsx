import React from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import darkLogo from "../../assets/dark-logo.png";
import lightLogo from "../../assets/light-logo.png";
import PageMeta from "../common/PageMeta";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#0d1117]">
      <PageMeta title={title} />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <img
            src={isDark ? darkLogo : lightLogo}
            alt="SigmaLoop"
            className="h-12 w-auto"
          />
        </Link>
        <h2 className="text-center text-3xl font-display font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-8 px-4 shadow sm:rounded-2xl sm:px-10">
          {children}
        </div>
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} SigmaLoop</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
