import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
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
  getLocaleNativeName,
  type TextDirection,
} from "../constants/locales";
import TranslationLoadingScreen from "../components/common/TranslationLoadingScreen";

type TParams = Record<string, string | number>;

interface LocaleContextType {
  language: string;
  direction: TextDirection;
  /** True while ANY batch of UI strings is being translated (on-demand). */
  isTranslating: boolean;
  /**
   * True while the page the user is ON (or just navigated TO) is being
   * translated for the first time in the current language — drives the
   * full-screen loading skeleton. Fires on a language switch AND on navigating
   * to a route whose strings aren't translated yet. Stays false for the small
   * incremental top-ups (e.g. async-loaded data) once the page is up.
   */
  isPageLoading: boolean;
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
  const { pathname } = useLocation();
  const [language, setLanguageState, removeLanguage] = useLocalStorage<string>(
    "locale",
    DEFAULT_LOCALE
  );
  const [map, setMap] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  // Start in the loading state when a non-English language is already persisted,
  // so the very first paint is the skeleton (not a flash of English).
  const [isPageLoading, setIsPageLoading] = useState(
    () => language !== DEFAULT_LOCALE
  );

  // Strings already translated (or attempted) for the CURRENT language. Persists
  // across navigation so we never re-translate, and is reset on language change.
  const translatedRef = useRef<Record<string, string>>({});
  const prevLangRef = useRef(language);

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

  // Translate the current page on a language switch AND on every navigation.
  // useLayoutEffect runs before paint, so when the route we land on has
  // untranslated strings we flip the skeleton ON before any English shows; once
  // its strings are fetched we flip it OFF and reveal the translated page.
  // Later-appearing strings (async-loaded data) top up via the slim bar instead.
  useLayoutEffect(() => {
    // Language changed → drop the previous language's translations entirely.
    if (prevLangRef.current !== language) {
      prevLangRef.current = language;
      translatedRef.current = {};
      setMap({});
    }

    if (language === DEFAULT_LOCALE) {
      setIsPageLoading(false);
      setIsTranslating(false);
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    // `initial` = the navigation/switch batch that drives the full skeleton.
    // Follow-up batches (new strings discovered later) only nudge the top bar.
    const run = async (initial: boolean) => {
      const missing = getAllStrings().filter(
        (s) => !(s in translatedRef.current)
      );
      if (missing.length === 0) {
        if (initial && !cancelled) setIsPageLoading(false);
        return;
      }
      if (initial) setIsPageLoading(true);
      else setIsTranslating(true);
      try {
        const res = await i18nService.translateUi(
          language,
          missing.map((s) => ({ key: s, text: s }))
        );
        // Mark every requested string done (echo source on any gap) so we never
        // loop on it, then publish the translations.
        missing.forEach((s) => {
          translatedRef.current[s] = res[s] ?? s;
        });
        if (!cancelled) setMap((prev) => ({ ...prev, ...res }));
      } catch {
        // Leave the English fallback; a later nudge retries.
      } finally {
        if (!cancelled) {
          setIsTranslating(false);
          if (initial) setIsPageLoading(false);
        }
      }
    };

    run(true);

    const unsub = subscribeToStrings(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => run(false), 150);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unsub();
    };
  }, [language, pathname]);

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
        isPageLoading,
        setLanguage,
        t,
      }}
    >
      {children}

      {/* The page being viewed/navigated-to is still being translated: a
          full-screen app-shell skeleton covers the ENTIRE app (every page + the
          navbar) until its strings are ready — not just a bar on top. */}
      {isPageLoading && language !== DEFAULT_LOCALE && (
        <TranslationLoadingScreen
          label={t("Translating to {language}…", {
            language: getLocaleNativeName(language),
          })}
        />
      )}

      {/* Slim indeterminate bar for the small top-ups (async-loaded strings that
          appear after the page is already up). */}
      {isTranslating && !isPageLoading && language !== DEFAULT_LOCALE && (
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
