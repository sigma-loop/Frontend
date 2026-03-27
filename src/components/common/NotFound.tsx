import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

/**
 * 404 page shown when a route doesn't match.
 */
export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-[#0d1117] dark:to-[#161b22]">
      <h1 className="text-8xl font-bold text-gradient mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Page Not Found
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to={ROUTES.HOME}
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        Go Home
      </Link>
    </div>
  );
}
