import { useMemo } from "react";

export function useMobileOS() {
  return useMemo(() => {
    if (typeof navigator === "undefined") return "unknown";

    const ua = navigator.userAgent;

    if (/android/i.test(ua)) return "android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";

    return "unknown";
  }, []);
}
