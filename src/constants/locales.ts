/**
 * UI languages the learner can switch the site into. Mirrors the backend
 * `constants/locales.ts`. English is the canonical default; every other locale
 * is produced on demand by the AI translation layer and cached server-side.
 *
 * `dir` drives the global layout direction (set on <html dir>). RTL languages
 * mirror the whole UI.
 */
export type TextDirection = "ltr" | "rtl";

export interface Locale {
  code: string;
  name: string; // English name
  nativeName: string; // endonym, shown in the picker
  dir: TextDirection;
}

export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES: Locale[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "he", name: "Hebrew", nativeName: "עברית", dir: "rtl" },
  { code: "fa", name: "Persian", nativeName: "فارسی", dir: "rtl" },
  { code: "ur", name: "Urdu", nativeName: "اردو", dir: "rtl" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", dir: "ltr" },
  { code: "it", name: "Italian", nativeName: "Italiano", dir: "ltr" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", dir: "ltr" },
  { code: "ru", name: "Russian", nativeName: "Русский", dir: "ltr" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", dir: "ltr" },
  { code: "pl", name: "Polish", nativeName: "Polski", dir: "ltr" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", dir: "ltr" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", dir: "ltr" },
  {
    code: "zh-CN",
    name: "Simplified Chinese",
    nativeName: "简体中文",
    dir: "ltr",
  },
  {
    code: "zh-TW",
    name: "Traditional Chinese",
    nativeName: "繁體中文",
    dir: "ltr",
  },
  { code: "ja", name: "Japanese", nativeName: "日本語", dir: "ltr" },
  { code: "ko", name: "Korean", nativeName: "한국어", dir: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", dir: "ltr" },
  {
    code: "id",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    dir: "ltr",
  },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", dir: "ltr" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", dir: "ltr" },
  { code: "th", name: "Thai", nativeName: "ไทย", dir: "ltr" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", dir: "ltr" },
  { code: "ro", name: "Romanian", nativeName: "Română", dir: "ltr" },
  { code: "cs", name: "Czech", nativeName: "Čeština", dir: "ltr" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar", dir: "ltr" },
];

const LOCALE_BY_CODE: Record<string, Locale> = SUPPORTED_LOCALES.reduce(
  (acc, l) => {
    acc[l.code] = l;
    return acc;
  },
  {} as Record<string, Locale>
);

export function isSupportedLocale(code: string): boolean {
  return code in LOCALE_BY_CODE;
}

export function getLocale(code: string): Locale | undefined {
  return LOCALE_BY_CODE[code];
}

export function getLocaleDir(code: string): TextDirection {
  return LOCALE_BY_CODE[code]?.dir ?? "ltr";
}

export function getLocaleNativeName(code: string): string {
  return LOCALE_BY_CODE[code]?.nativeName ?? code;
}
