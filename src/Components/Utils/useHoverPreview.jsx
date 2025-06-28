import { useState, useRef, useCallback } from "react";

function useHoverPreview(delay = 300) {
  const [isHoverPlay, setIsHoverPlay] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const timeoutRef = useRef(null);

  const onMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setIsHoverPlay(true);
      timeoutRef.current = null;
    }, delay);
  }, [delay]);

  const onMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsHoverPlay(false);
    setIsVideoPlaying(false);
  }, []);

  return {
    isHoverPlay,
    isVideoPlaying,
    setIsVideoPlaying,
    onMouseEnter,
    onMouseLeave,
  };
}

export default useHoverPreview;
