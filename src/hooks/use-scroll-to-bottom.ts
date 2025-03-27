import { useEffect, useRef, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement, E extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<E | null>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<E>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        end.scrollIntoView({ behavior: 'instant', block: 'end' });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return [containerRef, endRef];
}