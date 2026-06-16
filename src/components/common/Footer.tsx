import React from "react";
import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { useLocale } from "../../contexts/LocaleContext";
import { useTheme } from "../../contexts/ThemeContext";

const Footer: React.FC = () => {
  const { t } = useLocale();
  const { isDark, toggleTheme } = useTheme();

  const links = [
    { to: ROUTES.TERMS, label: t("Terms") },
    { to: ROUTES.PRIVACY, label: t("Privacy") },
    { to: ROUTES.CONTACT, label: t("Contact") },
  ];

  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-auto dark:bg-[#0d1117] dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} SigmaLoop.{" "}
              {t("All rights reserved.")}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Theme toggle lives here in the footer. */}
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200 cursor-pointer"
              aria-label={t("Toggle theme")}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span>{isDark ? t("Light mode") : t("Dark mode")}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
