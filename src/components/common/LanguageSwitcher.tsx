import React, { useState } from "react";
import { Globe, Check } from "lucide-react";
import { useLocale } from "../../contexts/LocaleContext";
import { useAuth } from "../../contexts/AuthContext";
import { useClickOutside } from "../../hooks/useClickOutside";
import { userService } from "../../services/userService";
import {
  SUPPORTED_LOCALES,
  getLocaleDir,
  getLocaleNativeName,
} from "../../constants/locales";

interface LanguageSwitcherProps {
  /** Render full-width (used inside the mobile menu). */
  full?: boolean;
}

/**
 * Global language picker. Lives in the Navbar, so it's available everywhere —
 * including the public landing page, where guests can switch language before
 * signing up. Choosing a language flips the whole site (LocaleContext) and, for
 * a signed-in user, persists the choice to their account (server derives the
 * text direction). Guests' choice lives only in localStorage and is cleared on
 * sign-out, so the site returns to its English/LTR default.
 */
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ full }) => {
  const { language, setLanguage, t } = useLocale();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const choose = (code: string) => {
    setOpen(false);
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
          className={`absolute z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-[#161b22] ${
            full ? "inset-x-0" : "end-0 w-56"
          }`}
        >
          {SUPPORTED_LOCALES.map((loc) => {
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
                  <span className="block truncate font-medium">
                    {loc.nativeName}
                  </span>
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
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
