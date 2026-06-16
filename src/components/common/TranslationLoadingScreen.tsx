import React from "react";
import { Loader2 } from "lucide-react";
import PageSkeleton from "./PageSkeleton";

/**
 * Full-screen, app-shell loading skeleton shown while switching INTO a new
 * language. Rendered at the app root (LocaleProvider), so it covers EVERY page
 * and component — lessons, dashboard, admin, auth — not just the ones using
 * MainLayout. It includes a faux navbar so even the chrome reads as "loading",
 * masking the whole UI until the new language is ready instead of flashing
 * half-translated English.
 */
const Block: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`rounded bg-gray-200 dark:bg-gray-800 ${className}`} />
);

interface TranslationLoadingScreenProps {
  /** Pre-built "Translating to X…" label (translated when possible). */
  label: string;
}

const TranslationLoadingScreen: React.FC<TranslationLoadingScreenProps> = ({
  label,
}) => (
  <div
    className="fixed inset-0 z-[250] flex flex-col bg-gray-50 dark:bg-[#0d1117]"
    role="status"
    aria-live="polite"
    aria-label={label}
  >
    {/* Faux navbar — so even the nav buttons appear in a loading state. */}
    <div className="h-16 flex-shrink-0 border-b border-gray-200 px-4 dark:border-gray-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <div className="flex animate-pulse items-center gap-2">
          <Block className="h-8 w-8" />
          <Block className="h-5 w-28" />
        </div>
        <div className="flex animate-pulse items-center gap-2">
          <Block className="h-8 w-24 rounded-full" />
          <Block className="hidden h-8 w-20 rounded-full sm:block" />
          <Block className="h-9 w-9 rounded-lg" />
        </div>
      </div>
    </div>

    {/* Content skeleton. */}
    <div className="mx-auto w-full max-w-7xl flex-1 overflow-hidden px-4 sm:px-6 lg:px-8">
      <PageSkeleton />
    </div>

    {/* Clear, central loading hint so the masked UI reads as intentional. */}
    <div className="pointer-events-none fixed inset-x-0 bottom-10 flex justify-center px-4">
      <div className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm dark:border-gray-800 dark:bg-[#161b22] dark:text-gray-200">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
        {label}
      </div>
    </div>
  </div>
);

export default TranslationLoadingScreen;
