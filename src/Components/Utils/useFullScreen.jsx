import { useState, useEffect } from 'react';

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    checkFullscreen();

    document.addEventListener('fullscreenchange', checkFullscreen);


    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);

    };
  }, []);

  return isFullscreen;
};