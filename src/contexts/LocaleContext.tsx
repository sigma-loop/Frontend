import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "./AuthContext";
import { i18nService } from "../services/i18nService";
import {
  getAllStrings,
  registerString,
  subscribeToStrings,
} from "../i18n/registry";
import {
  DEFAULT_LOCALE,
  getLocaleDir,
  type TextDirection,
} from "../constants/locales";

type TParams = Record<string, string | number>;

interface LocaleContextType {
  language: string;
  direction: TextDirection;
  /** True while ANY batch of UI strings is being translated (on-demand). */
  isTranslating: boolean;
  /**
   * True only while switching INTO a language (the initial bulk translation of
   * the current page) — drives the full-page loading skeleton. Stays false for
   * the small incremental fetches that happen as new strings appear on
   * navigation, so we don't blank the page on every minor update.
   */
  isSwitchingLanguage: boolean;
  setLanguage: (code: string) => void;
  /**
   * Translate a UI string. The English source IS the key — pass the literal.
   * Supports {placeholder} interpolation: t("Lesson {n}", { n: 3 }).
   */
  t: (text: string, params?: TParams) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function interpolate(str: string, params?: TParams): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (m, k) =>
    k in params ? String(params[k]) : m
  );
}

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [language, setLanguageState, removeLanguage] = useLocalStorage<string>(
    "locale",
    DEFAULT_LOCALE
  );
  const [map, setMap] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  // Start in the "switching" state when a non-English language is already
  // persisted, so the very first paint is the skeleton (not a flash of English).
  const [isSwitchingLanguage, setIsSwitchingLanguage] = useState(
    () => language !== DEFAULT_LOCALE
  );

  const direction = getLocaleDir(language);

  // Adopt the user's server-saved language once they're loaded (server is the
  // source of truth; localStorage is the pre-auth/guest fallback).
  const serverLang = user?.preferences?.localization?.language;
  useEffect(() => {
    if (serverLang && serverLang !== language) {
      setLanguageState(serverLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverLang]);

  // Localization is per-account: when the session ends (sign-out or token
  // expiry), forget the chosen language so the site resets to its English/LTR
  // default for the next (guest) session.
  useEffect(() => {
    const reset = () => removeLanguage();
    window.addEventListener("auth:logout", reset);
    return () => window.removeEventListener("auth:logout", reset);
  }, [removeLanguage]);

  // Keep <html lang/dir> in sync — this is what flips the whole layout RTL/LTR.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = getLocaleDir(language);
  }, [language]);

  // Translate every registered string still missing for the current language,
  // in batches. Re-runs on language change and whenever new strings are
  // discovered (navigation) via the registry subscription.
  useEffect(() => {
    if (language === DEFAULT_LOCALE) {
      setMap({});
      setIsTranslating(false);
      setIsSwitchingLanguage(false);
      return;
    }

    let cancelled = false;
    const fetched: Record<string, string> = {};
    let timer: number | undefined;
    // The first batch is the bulk translation of the current page — that's the
    // one that shows the skeleton; later batches are incremental top-ups.
    let firstBatch = true;

    const fetchMissing = async () => {
      const missing = getAllStrings().filter((s) => !(s in fetched));
      if (missing.length === 0) {
        if (firstBatch && !cancelled) {
          firstBatch = false;
          setIsSwitchingLanguage(false);
        }
        return;
      }
      setIsTranslating(true);
      try {
        const res = await i18nService.translateUi(
          language,
          missing.map((s) => ({ key: s, text: s }))
        );
        Object.assign(fetched, res);
        if (!cancelled) setMap((prev) => ({ ...prev, ...res }));
      } catch {
        // Leave the English fallback in place; retry on the next nudge.
      } finally {
        if (!cancelled) {
          setIsTranslating(false);
          if (firstBatch) {
            firstBatch = false;
            setIsSwitchingLanguage(false);
          }
        }
      }
    };

    setMap({}); // fresh language — drop the previous map
    setIsSwitchingLanguage(true); // entering a new language → show the skeleton
    fetchMissing();

    const unsub = subscribeToStrings(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(fetchMissing, 150);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unsub();
    };
  }, [language]);

  const t = useCallback(
    (text: string, params?: TParams) => {
      registerString(text);
      return interpolate(map[text] ?? text, params);
    },
    [map]
  );

  const setLanguage = useCallback(
    (code: string) => setLanguageState(code),
    [setLanguageState]
  );

  return (
    <LocaleContext.Provider
      value={{
        language,
        direction,
        isTranslating,
        isSwitchingLanguage,
        setLanguage,
        t,
      }}
    >
      {children}
      {/* Slim indeterminate progress bar — replaces the old corner toast. The
          full-page skeleton (MainLayout) covers a language switch; this bar
          marks the smaller incremental fetches on navigation. */}
      {isTranslating && language !== DEFAULT_LOCALE && (
        <div
          className="fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden bg-indigo-500/15"
          role="status"
          aria-label={t("Translating…")}
        >
          <div className="loading-bar h-full w-1/3 bg-indigo-500" />
        </div>
      )}
    </LocaleContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
