import { useCallback, useEffect } from "react";

const useVideoPlayback = ({
  videoRef,
  containerRef,
  trackerRef,
  playIconRef,
  state,
  updateState,
  showControls,
  setIsUserInteracted,
  isUserInteracted,
  pressTimer,
  videoPauseStatus,
  isLongPressActiveMouse,
  isLongPressActiveKey,
  setTimeStamp,
  handleVideoCursorVisiblity,
  resetTimeout,
  freezeTimeout,
  playbackSpeed,
}) => {
  // Toggle play/pause
  const togglePlayPause = useCallback(
    (e) => {
      const video = videoRef.current;
      const container = containerRef.current;
      const tracker = trackerRef.current;

      if (!video || !container) return;

      if (!isUserInteracted) {
        setIsUserInteracted(true);
      }

      const fromTime = video.currentTime || 0;

      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }

      const shouldPlay =
        videoPauseStatus.current || video.paused || video.ended;

      if (shouldPlay) {
        console.log("play kro ");
        video.play();
        videoPauseStatus.current = false;
      } else {
        video.pause();
        videoPauseStatus.current = true;
      }

      showControls();
      handleVideoCursorVisiblity("show");

      // Add visual feedback to play icon
      requestAnimationFrame(() => {
        if (playIconRef.current?.classList) {
          playIconRef.current.classList.add("click");
        }
      });

      updateState({
        isPlaying: shouldPlay,
      });

      // Reset long press flags
      isLongPressActiveMouse.current = false;
      isLongPressActiveKey.current = false;
    },
    [state.canPlay, isUserInteracted, showControls, handleVideoCursorVisiblity]
  );

  // Handle video play event
  const handlePlay = useCallback(async () => {
    const video = videoRef.current;
    const tracker = trackerRef.current;

    if (!video || !tracker) return;

    // Start telemetry tracking
    const userResumeTime = state.resumeTime || 0;
    tracker.start(video, video.dataset.videoId, setTimeStamp, userResumeTime);

    try {
      // Hide cursor after delay
      const timeoutId = setTimeout(() => {
        video.classList.add("hide-cursor");
      }, 2000);

      updateState({
        isReplay: false,
        canPlay: true,
        isPlaying: true,
      });
    } catch (err) {
      updateState({ isPlaying: false });
      if (tracker?.telemetryTimer) {
        tracker.stop();
        tracker.telemetryTimer = null;
      }
    }
  }, [state.resumeTime]);

  // Handle forward seek (skip 5 seconds forward)
  const handleForwardSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    if (video.playbackRate === 2.0) {
      video.playbackRate = playbackSpeed;
    }
    freezeTimeout();

    updateState({ isForwardSeek: true, isFastPlayback: false });

    video.currentTime += 5;

    if (!video.paused) {
      video.play();
      updateState({ isPlaying: true });
    }
    resetTimeout();

    setTimeout(() => {
      updateState({ isForwardSeek: false });
    }, 300);
  }, [resetTimeout, freezeTimeout, playbackSpeed]);

  // Handle backward seek (skip 5 seconds backward)
  const handleBackwardSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    if (video.playbackRate === 2.0) {
      video.playbackRate = playbackSpeed;
    }

    freezeTimeout();

    updateState({ isFastPlayback: false });

    const wasEnded = video.ended;

    if (state.isReplay && wasEnded) {
      video.currentTime = Math.max(video.duration - 5, 0);
      updateState({ isReplay: false });
      video.play();
      updateState({ isPlaying: true });
      return;
    }

    updateState({ isBackwardSeek: true });
    video.currentTime = Math.max(video.currentTime - 5, 0);

    if (!video.paused) {
      updateState({ isPlaying: true });
    }
    resetTimeout();

    setTimeout(() => {
      updateState({ isBackwardSeek: false });
    }, 300);
  }, [state.isReplay, freezeTimeout, resetTimeout, playbackSpeed]);

  // Handle video end
  const handleVideoEnd = useCallback(() => {
    updateState({ canPlay: false, isReplay: true });
    freezeTimeout();
  }, [freezeTimeout]);

  // Handle loaded metadata (when video is ready to play)
  const handleLoadedMetadata = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = state.resumeTime || 0;

    if (!isUserInteracted) {
      showControls();
    }

    try {
      if (isUserInteracted) {
        await video.play();
        updateState({ isPlaying: true });
      }
    } catch (err) {
      updateState({ isPlaying: false });
      console.warn("Video play failed:", err);
    }

    updateState({ videoReady: true });
  }, [state.resumeTime, isUserInteracted, showControls]);

  // Handle time update for view counting
  const handleTimeUpdate = useCallback(
    (videoId, mutate) => {
      const video = videoRef.current;
      if (!video || isNaN(video.duration) || video.duration === 0) return;

      const duration = video.duration;
      const watchTime = video.currentTime;

      const hasWatchedEnough =
        (duration < 30 && watchTime >= duration) || watchTime >= 30;

      if (!state.viewCounted && hasWatchedEnough) {
        mutate();
      }
    },
    [state.viewCounted]
  );

  // Effect to handle replay reset
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkReplayReset = () => {
      if (
        video.currentTime < video.duration &&
        state.isReplay &&
        !state.isSeeking
      ) {
        updateState({ isReplay: false });
        video.play();
      }
    };

    video.addEventListener("timeupdate", checkReplayReset);

    return () => {
      video.removeEventListener("timeupdate", checkReplayReset);
    };
  }, [state.isReplay, state.isSeeking]);

  // Effect to auto-play when user interacts
  useEffect(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    if (isUserInteracted) {
      video.play().catch(console.warn);
    }
  }, [isUserInteracted]);

  // Effect to handle isPlaying state changes
  useEffect(() => {
    if (state.isPlaying) {
      setIsUserInteracted(true);
    }
  }, [state.isPlaying]);

  return {
    togglePlayPause,
    handlePlay,
    handleForwardSeek,
    handleBackwardSeek,
    handleVideoEnd,
    handleLoadedMetadata,
    handleTimeUpdate,
  };
};

export default useVideoPlayback;
