import React from "react";

/**
 * Generic, content-shaped loading skeleton used inside TranslationLoadingScreen
 * while the page being viewed/navigated-to is translated into the chosen
 * language (see LocaleContext.isPageLoading). It reads as an Instagram-style
 * "hide content, show the frame" load instead of a flash of untranslated text.
 */
const Bar: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`rounded bg-gray-200 dark:bg-gray-800 ${className}`} />
);

const PageSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse py-10" aria-hidden="true">
      {/* Heading + intro */}
      <Bar className="h-9 w-2/3 max-w-md rounded-lg" />
      <Bar className="mt-4 h-4 w-full max-w-xl" />
      <Bar className="mt-2.5 h-4 w-5/6 max-w-lg" />

      {/* Action row */}
      <div className="mt-8 flex gap-3">
        <Bar className="h-11 w-40 rounded-lg" />
        <Bar className="h-11 w-36 rounded-lg" />
      </div>

      {/* Card grid */}
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 p-6 dark:border-gray-800"
          >
            <Bar className="h-12 w-12 rounded-lg" />
            <Bar className="mt-5 h-5 w-1/2" />
            <Bar className="mt-3 h-4 w-full" />
            <Bar className="mt-2 h-4 w-5/6" />
            <Bar className="mt-2 h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageSkeleton;
