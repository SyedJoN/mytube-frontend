import { useCallback } from "react";

const useMouseInteractions = ({
  videoRef,
  containerRef,
  state,
  updateState,
  showControls,
  hideControls,
  handleVideoCursorVisiblity,
  resetTimeout,
  togglePlayPause,
  toggleFullScreen,
  exitDoubleSpeed,
  isUserInteracted,
  isFullscreen,
  videoPauseStatus,
  clickTimeout,
  timeoutRef,
  clickCount,
  pressTimer,
  currentInteractionType,
  isLongPressActiveMouse,
  isLongPressActiveKey,
  isInside,
  isTimeoutFreeze,
  lastMouseMoveTimeRef,
}) => {
  // Helper functions for mouse interactions
  const resetLongPressFlags = useCallback(() => {
    isLongPressActiveMouse.current = false;
    isLongPressActiveKey.current = false;
  }, []);

  const clearTimers = useCallback(() => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  const handleLongPressExit = useCallback(
    (e) => {
      if (state.isLongPress) {
        exitDoubleSpeed(e);
        resetLongPressFlags();
      }
    },
    [state.isLongPress, exitDoubleSpeed, resetLongPressFlags]
  );

  const cleanupEventListeners = useCallback(() => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Main mouse up handler
  const handleMouseUp = useCallback(
    (e) => {
      const video = videoRef.current;
      if (!video) return;

      if (e.button === 2) return; // Right click
      if (currentInteractionType.current !== "mouse") return;

      const shouldExitDoubleSpeed = isLongPressActiveMouse.current;

      if (shouldExitDoubleSpeed) {
        exitDoubleSpeed(e);
        resetLongPressFlags();
        cleanupEventListeners();
        return;
      }

      if (state.isReplay) {
        cleanupEventListeners();
        return;
      }

      clickCount.current += 1;

      console.log("ClickCount", clickCount.current);

      // Double click - toggleFullscreen
      if (
        clickCount.current === 2 &&
        currentInteractionType.current !== "keyboard"
      ) {
        clearTimers();
        handleLongPressExit();
        toggleFullScreen();
        if (videoPauseStatus.current) {
          video.pause();
        } else {
          video.play();
        }
        clickCount.current = 0;
        cleanupEventListeners();
        return;
      }

      // Single click - toggle play/pause
      if (clickCount.current === 1) {
        handleLongPressExit();
        clickTimeout.current = setTimeout(() => {
          togglePlayPause(e);
          updateState({
            showIcon: true,
            showVolumeIcon: false,
          });
          clearTimers();
          clickCount.current = 0;
          cleanupEventListeners();
          return;
        }, 150);
      }

    },
    [
      exitDoubleSpeed,
      resetLongPressFlags,
      cleanupEventListeners,
      state.isReplay,
      clearTimers,
      handleLongPressExit,
      toggleFullScreen,
      togglePlayPause,
    ]
  );

  // Mouse move handler during drag/long press
  const handleMouseMove = useCallback(
    (e) => {
      const video = videoRef.current;
      if (!video) return;

      const rect = video.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      const inside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      if (videoPauseStatus.current || state.isReplay) return;

      isInside.current = inside;
      handleVideoCursorVisiblity("show");

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (!state.isPlaying || state.isControlHovered || state.showSettings)
        return;

      isTimeoutFreeze.current = false;
      resetTimeout();
    },
    [
      videoPauseStatus,
      state.isReplay,
      state.isPlaying,
      state.isControlHovered,
      state.showSettings,
      handleVideoCursorVisiblity,
      isTimeoutFreeze,
      resetTimeout,
    ]
  );

  // Container mouse move handler (for showing controls)
  const handleContainerMouseMove = useCallback(() => {
    const container = containerRef.current;
    if (!container || !isUserInteracted) return;

    const now = Date.now();
    if (now - lastMouseMoveTimeRef.current < 100) {
      return; 
    }
    lastMouseMoveTimeRef.current = now;

    if (state.isLongPress || state.isControlHovered) {
      return;
    }

    showControls();
    handleVideoCursorVisiblity("show");
    isInside.current = true;
    isTimeoutFreeze.current = false;
    resetTimeout();
  }, [
    isUserInteracted,
    state.isLongPress,
    state.isControlHovered,
    showControls,
    handleVideoCursorVisiblity,
    resetTimeout,
  ]);

  // Container mouse enter handler
  const handleContainerMouseEnter = useCallback(() => {
    if (!state.isLongPress) {
      isInside.current = true;
      showControls();
    }
  }, [state.isLongPress, showControls]);

  // Container mouse leave handler
  const handleMouseOut = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || !isUserInteracted) return;

    if (
      isFullscreen ||
      !state.isPlaying ||
      state.isReplay ||
      state.showSettings
    ) {
      return;
    }

    hideControls();
  }, [
    isUserInteracted,
    isFullscreen,
    state.isPlaying,
    state.isReplay,
    state.showSettings,
    hideControls,
  ]);

  // Video overlay handler for initial play
  const handleVideoOverlay = useCallback(
    (e) => {
      togglePlayPause(e);
    },
    [togglePlayPause]
  );

  return {
    handleMouseUp,
    handleMouseMove,
    handleContainerMouseMove,
    handleContainerMouseEnter,
    handleMouseOut,
    handleVideoOverlay,
    resetLongPressFlags,
    clearTimers,
    handleLongPressExit,
  };
};

export default useMouseInteractions;
