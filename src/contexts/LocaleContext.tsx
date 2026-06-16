import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
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

type TParams = Record<string, string | number>;

interface LocaleContextType {
  language: string;
  direction: TextDirection;
  /** True while a batch of UI strings is being translated (on-demand). */
  isTranslating: boolean;
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
  const [language, setLanguageState] = useLocalStorage<string>(
    "locale",
    DEFAULT_LOCALE
  );
  const [map, setMap] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

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
      return;
    }

    let cancelled = false;
    const fetched: Record<string, string> = {};
    let timer: number | undefined;

    const fetchMissing = async () => {
      const missing = getAllStrings().filter((s) => !(s in fetched));
      if (missing.length === 0) return;
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
        if (!cancelled) setIsTranslating(false);
      }
    };

    setMap({}); // fresh language — drop the previous map
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
      value={{ language, direction, isTranslating, setLanguage, t }}
    >
      {children}
      {isTranslating && language !== DEFAULT_LOCALE && (
        <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900/90 px-4 py-2 text-sm text-white shadow-lg backdrop-blur dark:bg-white/10">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{getLocaleNativeName(language)}…</span>
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
