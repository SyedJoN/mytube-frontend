import { useEffect, useRef } from "react";

export const useAmbientEffect = (
  videoRef,
  videoId,
  glowCanvasRef,
  isPlaying,
  isAmbient,
  isTheatre
) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (
      !isPlaying ||
      !videoRef?.current ||
      !isAmbient ||
      !videoId ||
      document.fullscreenElement ||
      isTheatre
    ) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const updateVideoReflection = () => {
      const video = videoRef.current;
      const glowCanvas = glowCanvasRef.current;

      if (!video || !glowCanvas || video.paused || video.ended) return;

   const ctx = glowCanvas.getContext("2d");
ctx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);

ctx.globalAlpha = 3;
ctx.filter = "blur(8px)";

const padding = 12; 
ctx.drawImage(
  video,
  padding,
  padding,
  glowCanvas.width - padding * 2,
  glowCanvas.height - padding * 2
);

ctx.filter = "none";
ctx.globalAlpha = 1;

      if (!isAmbient || isTheatre || document.fullscreenElement) {
        const ctx = glowCanvas.getContext("2d");
        ctx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        return;
      }

      animationRef.current = requestAnimationFrame(updateVideoReflection);
    };

    updateVideoReflection();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isAmbient, videoId, isTheatre]);
};
