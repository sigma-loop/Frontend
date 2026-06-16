import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useLocale } from "../../contexts/LocaleContext";

/**
 * 404 page shown when a route doesn't match.
 */
export function NotFound() {
  const { t } = useLocale();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-8 text-center bg-gray-50 dark:bg-[#0d1117]">
      <span className="eyebrow mb-3">{t("Error 404")}</span>
      <h1 className="font-display text-6xl sm:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
        {t("Page not found")}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        {t("The page you're looking for doesn't exist or has been moved.")}
      </p>
      <Link
        to={ROUTES.HOME}
        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        {t("Go home")}
      </Link>
    </div>
  );
}
