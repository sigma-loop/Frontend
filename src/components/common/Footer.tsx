import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useLocale } from "../../contexts/LocaleContext";

const Footer: React.FC = () => {
  const { t } = useLocale();

  const links = [
    { to: ROUTES.TERMS, label: t("Terms") },
    { to: ROUTES.PRIVACY, label: t("Privacy") },
    { to: ROUTES.CONTACT, label: t("Contact") },
  ];

  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-auto dark:bg-[#0d1117] dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} SigmaLoop.{" "}
              {t("All rights reserved.")}
            </p>
          </div>
          <div className="flex space-x-6 rtl:space-x-reverse">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
