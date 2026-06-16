import api from "./api";
import { type JSendResponse } from "../types/api";

export interface UiTranslateEntry {
  key: string;
  text: string;
}

interface UiTranslateResponse {
  language: string;
  translations: Record<string, string>;
}

export const i18nService = {
  /**
   * Translate a batch of UI strings into `language`. The server fills a global
   * cache, so repeat calls for the same language/strings are cheap. Returns a
   * map of key → translated string (key is the source English text).
   */
  translateUi: async (
    language: string,
    entries: UiTranslateEntry[]
  ): Promise<Record<string, string>> => {
    const response = await api.post<JSendResponse<UiTranslateResponse>>(
      "/i18n/translate",
      { language, entries }
    );
    return response.data.data?.translations ?? {};
  },
};
