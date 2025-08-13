import { useRef } from "react";

export function useDebouncedCallback(callback, delay = 0, minStep = 0) {
  const timeoutRef = useRef(null);
  const lastValueRef = useRef(null);
  const frameRef = useRef(null);

  return (value) => {
    if (lastValueRef.current !== null && Math.abs(value - lastValueRef.current) < minStep) return;

    lastValueRef.current = value;

    if (delay <= 1) {
  
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => callback(value));
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(value), delay);
    }
  };
}
