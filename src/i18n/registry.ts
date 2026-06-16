/**
 * Module-level registry of every English UI string the app has rendered through
 * `t()`. This is how localization stays *lazy*: we never maintain a static
 * catalog — strings register themselves the first time they render, and the
 * LocaleContext translates whatever has accumulated (and is still missing for
 * the current language), in batches, caching globally on the server.
 *
 * It lives outside React on purpose: `t()` can register a string during render
 * (a cheap, idempotent Set insert) without touching React state. The provider
 * subscribes to get nudged when something new shows up.
 */
const allStrings = new Set<string>();
const listeners = new Set<() => void>();

/** Called by `t()` for every string. Notifies the provider only on first sight. */
export function registerString(text: string): void {
  if (!text || allStrings.has(text)) return;
  allStrings.add(text);
  listeners.forEach((fn) => fn());
}

export function getAllStrings(): string[] {
  return [...allStrings];
}

export function subscribeToStrings(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
