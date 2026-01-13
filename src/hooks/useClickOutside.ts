import { useEffect, useCallback, type RefObject } from "react";

/**
 * Hook to detect clicks outside of a referenced element
 * @param ref - Reference to the element to detect clicks outside of
 * @param handler - Callback function when click outside is detected
 * @param enabled - Whether the hook is enabled (default: true)
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled = true
): void {
  const listener = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const element = ref.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!element || element.contains(event.target as Node)) {
        return;
      }

      handler(event);
    },
    [ref, handler]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Use mousedown and touchstart for better UX (triggers before click)
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [enabled, listener]);
}
