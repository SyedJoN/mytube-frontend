import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { useFullscreen } from "./useFullScreen";


export function useExitFullscreenOnRouteChange() {
const isFullscreen = useFullscreen();

  const location = useLocation();

  useEffect(() => {
    if (isFullscreen) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, [location]); // runs every time route changes
}
