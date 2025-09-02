import { useEffect, useCallback, useRef } from 'react';

const useKeyboardShortcuts = ({
  videoRef,
  state,
  updateState,
  togglePlayPause,
  handleForwardSeek,
  handleBackwardSeek,
  handleVolume,
  handleVolumeToggle,
  updateVolumeIconState,
  toggleFullScreen,
  setIsTheatre,
  setIsUserInteracted,
  handleNextVideo,
  DoubleSpeed,
  exitDoubleSpeed,
  volumeIconRef,
  pressTimer,
  hideVolumeTimer,
  currentInteractionType,
  isSpacePressed,
  isLongPressActiveKey,
  lastKeyPress,
  isFullscreen,
  playbackSpeed
}) => {
  const rafId = useRef(null);

  const handleKeyPress = useCallback((e) => {
    const activeElement = document.activeElement;
    const isInputFocused =
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable);

    if (isInputFocused) return;

    const video = videoRef.current;
    if (!video) return;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        handleForwardSeek();
        break;
        
      case "ArrowLeft":
        e.preventDefault();
        handleBackwardSeek();
        break;
        
      case "k":
      case "K":
        e.preventDefault();
        updateState({ showIcon: true, showVolumeIcon: false });
        togglePlayPause(e);
        break;
        
      case " ": // Space
        e.preventDefault();
        if (isSpacePressed.current) return;
        isSpacePressed.current = true;
        DoubleSpeed(e);
        break;
        
      case "n":
      case "N":
        if (e.shiftKey) {
          e.preventDefault();
          handleNextVideo();
        }
        break;
        
      case "f":
      case "F":
        e.preventDefault();
        toggleFullScreen();
        break;
        
      case "ArrowUp":
      case "ArrowDown":
        e.preventDefault();
        if (rafId.current) return;
        rafId.current = requestAnimationFrame(() => {
          handleVolume(e.key === "ArrowUp" ? "Up" : "Down");
          rafId.current = null;
        });
        break;
        
      case "m":
      case "M":
        e.preventDefault();
        handleMuteToggle();
        break;
        
      case "t":
      case "T":
        e.preventDefault();
        handleTheatreToggle();
        break;
        
      default:
        break;
    }
  }, [
    handleForwardSeek,
    handleBackwardSeek,
    togglePlayPause,
    DoubleSpeed,
    handleNextVideo,
    toggleFullScreen,
    handleVolume,
  ]);

  const handleMuteToggle = useCallback(() => {
    const now = Date.now();
    if (now - lastKeyPress.current < 100) return;
    lastKeyPress.current = now;

    const icon = volumeIconRef.current;
    updateState({
      showVolumeIcon: true,
      isVolumeChanged: true,
    });

    if (icon) {
      icon.classList.remove("pressed");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          icon.classList.add("pressed");
        });
      });
    }

    handleVolumeToggle();
    
    requestAnimationFrame(() => {
      updateVolumeIconState();
    });

    if (hideVolumeTimer.current) {
      clearTimeout(hideVolumeTimer.current);
    }
    
    hideVolumeTimer.current = setTimeout(() => {
      updateState({ isVolumeChanged: false });
    }, 400);
  }, [
    handleVolumeToggle,
    updateVolumeIconState,
  ]);

  const handleTheatreToggle = useCallback(() => {
    if (isFullscreen) {
      setIsUserInteracted(true);
      setIsTheatre(true);
      document.exitFullscreen?.()
        .then(() => {
          screen.orientation?.unlock?.();
        })
        .catch(console.error);
    } else {
      setIsTheatre(prev => !prev);
    }
  }, [isFullscreen, setIsUserInteracted, setIsTheatre]);

  const handleKeyUp = useCallback((e) => {
    const video = videoRef.current;
    if (!video) return;

    if (e.code === "Space") {
      if (currentInteractionType.current === "keyboard") {
        isSpacePressed.current = false;
        const shouldExitDoubleSpeed =
          state.isLongPress && isLongPressActiveKey.current;
          
        if (shouldExitDoubleSpeed) {
          exitDoubleSpeed(e);
        } else {
          if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
          }
          video.playbackRate = playbackSpeed;
          togglePlayPause(e);
        }
      } else {
        isSpacePressed.current = false;
      }
    }
    
    updateState({ isFastPlayback: false, showIcon: true });
  }, [
    state.isLongPress,
    exitDoubleSpeed,
    playbackSpeed,
    togglePlayPause,
  ]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [handleKeyPress, handleKeyUp]);

  // Return any values that might be needed by the parent component
  return {
    // Currently no return values needed, but this structure allows for future expansion
  };
};

export default useKeyboardShortcuts;