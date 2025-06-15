import { useRef, useCallback } from "react";

export function useRafCallback(callback) {
  const rafRef = useRef();

  const rafCallback = useCallback((...args) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      callback(...args);
    });
  }, [callback]);

  return rafCallback;
}
