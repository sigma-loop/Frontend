/**
 * Merge CSS class names, filtering out falsy values.
 * A lightweight alternative to clsx + tailwind-merge.
 *
 * For full Tailwind conflict resolution, install clsx and tailwind-merge:
 *   npm install clsx tailwind-merge
 * Then replace this with:
 *   import { clsx, type ClassValue } from "clsx";
 *   import { twMerge } from "tailwind-merge";
 *   export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-indigo-600", className)
 * // → "px-4 py-2 bg-indigo-600 custom-class"
 */
export function cn(
  ...inputs: (string | boolean | undefined | null)[]
): string {
  return inputs.filter(Boolean).join(" ");
}
