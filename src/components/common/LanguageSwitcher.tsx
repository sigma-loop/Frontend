import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Globe, Check, Search, X } from "lucide-react";
import { useLocale } from "../../contexts/LocaleContext";
import { useAuth } from "../../contexts/AuthContext";
import { useClickOutside } from "../../hooks/useClickOutside";
import { userService } from "../../services/userService";
import {
  SUPPORTED_LOCALES,
  getLocale,
  getLocaleDir,
  getLocaleNativeName,
  type Locale,
} from "../../constants/locales";

interface LanguageSwitcherProps {
  /** Render full-width (used inside the mobile menu). */
  full?: boolean;
}

// The handful surfaced directly in the Navbar dropdown; the rest live behind
// "View full list". Kept short so the menu stays scannable.
const FEATURED_CODES = ["en", "ar", "zh-CN", "hi"];

/**
 * Global language picker. Lives in the Navbar, so it's available everywhere —
 * including the public landing page, where guests can switch language before
 * signing up. The compact dropdown shows a few featured languages plus a "View
 * full list" button that opens a modal with every supported locale. Choosing a
 * language flips the whole site (LocaleContext) and, for a signed-in user,
 * persists the choice to their account (server derives the text direction).
 * Guests' choice lives only in localStorage and is cleared on sign-out.
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ full }) => {
  const { language, setLanguage, t } = useLocale();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const choose = (code: string) => {
    setOpen(false);
    setShowAll(false);
    if (code === language) return;
    setLanguage(code);
    if (isAuthenticated) {
      // Persist to the account (fire-and-forget; direction is server-derived).
      userService
        .updatePreferences({
          localization: { language: code, direction: getLocaleDir(code) },
        })
        .catch(() => {});
    }
  };

  // Featured set, but always include the active language so the current choice
  // is visible/selectable even when it isn't one of the featured ones.
  const featured = FEATURED_CODES.map(getLocale).filter((l): l is Locale =>
    Boolean(l)
  );
  const shortList = featured.some((l) => l.code === language)
    ? featured
    : ([getLocale(language), ...featured].filter(Boolean) as Locale[]);

  // Lock body scroll + close-on-Escape while the full-list modal is open.
  useEffect(() => {
    if (!showAll) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowAll(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [showAll]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? SUPPORTED_LOCALES.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.nativeName.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q)
      )
    : SUPPORTED_LOCALES;

  const localeButton = (loc: Locale) => {
    const active = loc.code === language;
    return (
      <button
        key={loc.code}
        type="button"
        onClick={() => choose(loc.code)}
        className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-start text-sm transition-colors hover:bg-gray-100 dark:hover:bg-white/5 ${
          active
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        <span className="min-w-0">
          <span className="block truncate font-medium">{loc.nativeName}</span>
          <span className="block truncate text-xs text-gray-400 dark:text-gray-500">
            {t(loc.name)}
            {loc.dir === "rtl" ? " · RTL" : ""}
          </span>
        </span>
        {active && (
          <Check className="h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
        )}
      </button>
    );
  };

  return (
    <div className={`relative ${full ? "w-full" : ""}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("Change language")}
        className={`flex items-center gap-1.5 rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white ${
          full ? "w-full px-3 py-2.5 text-base font-medium" : "px-2 py-2"
        }`}
      >
        <Globe className="h-5 w-5 flex-shrink-0" />
        <span className={full ? "" : "hidden sm:inline"}>
          {getLocaleNativeName(language)}
        </span>
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-[#161b22] ${
            full ? "inset-x-0" : "end-0 w-56"
          }`}
        >
          {shortList.map(localeButton)}
          <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setQuery("");
              setShowAll(true);
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-gray-100 dark:text-indigo-400 dark:hover:bg-white/5"
          >
            <Globe className="h-4 w-4" />
            {t("View full list")}
          </button>
        </div>
      )}

      {/* Full-list modal — portaled to <body> so the Navbar's backdrop-filter
          containing block doesn't trap the fixed overlay. */}
      {showAll &&
        createPortal(
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowAll(false)}
          >
            <div
              className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-[#161b22]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("Choose a language")}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  aria-label={t("Close")}
                  className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="border-b border-gray-200 p-3 dark:border-gray-800">
                <div className="relative">
                  <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("Search languages…")}
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 ps-9 pe-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-[#0d1117] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1 overflow-y-auto p-2 sm:grid-cols-2">
                {filtered.length > 0 ? (
                  filtered.map((loc) => (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => choose(loc.code)}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-start transition-colors ${
                        loc.code === language
                          ? "border-indigo-500 bg-indigo-50 dark:border-indigo-500/60 dark:bg-indigo-500/10"
                          : "border-transparent hover:bg-gray-100 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">
                          {loc.nativeName}
                        </span>
                        <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                          {t(loc.name)}
                          {loc.dir === "rtl" ? " · RTL" : ""}
                        </span>
                      </span>
                      {loc.code === language && (
                        <Check className="h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                  ))
                ) : (
                  <p className="col-span-full px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    {t("No languages match “{query}”.", { query })}
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default LanguageSwitcher;
