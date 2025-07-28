import React from "react";

export const startTrackingTime = (video, lastTimeRef, endTimeArrayRef, animationFrameRef) => {


  const trackTime = () => {

    if (!video.paused && !video.ended) {
      const currentTime = parseFloat(video.currentTime.toFixed(3));
      
      if (currentTime !== lastTimeRef.current) {
        endTimeArrayRef.current.push(currentTime);
        lastTimeRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(trackTime);
    }
  };

  animationFrameRef.current = requestAnimationFrame(trackTime);
};

export const stopTrackingTime = (animationFrameRef) => {
  cancelAnimationFrame(animationFrameRef.current);
  animationFrameRef.current = null;
};
