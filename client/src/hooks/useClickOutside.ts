import { useCallback, useEffect } from "react";

export default function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
  eventType: "mousedown" | "mouseup" = "mousedown"
): void {
  const clickOutsideHandler = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    },
    [ref, handler]
  );
  useEffect(() => {
    if (!ref.current) return;
    const body = document.body;
    body.addEventListener(eventType, clickOutsideHandler);
    return () => {
      body.removeEventListener(eventType, clickOutsideHandler);
    };
  }, [ref, clickOutsideHandler, eventType]);
}
