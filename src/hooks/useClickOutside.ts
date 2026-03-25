import { useEffect, useRef, type RefObject } from "react";

/**
 * Fires a callback when a click occurs outside the referenced element.
 * Useful for closing dropdowns, modals, and popovers.
 *
 * @param callback Function to call on outside click
 * @returns A ref to attach to the target element
 *
 * @example
 * const dropdownRef = useClickOutside(() => setOpen(false));
 * return <div ref={dropdownRef}>...</div>;
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  callback: () => void
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [callback]);

  return ref;
}
