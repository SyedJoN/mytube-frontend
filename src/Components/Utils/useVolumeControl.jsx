import { useCallback, useEffect, useRef } from "react";

const useVolumeControl = ({
  videoRef,
  volumeIconRef,
  state,
  updateState,
  previousVolume,
  setPreviousVolume,
  trackerRef,
  playbackSpeed,
  hideVolumeTimer,
  pressTimer,
  animateTimeoutRef,
  prevVolumeRef,
  showControls,
  freezeTimeout,
  resetTimeout,
handleVideoCursorVisiblity
}) => {
  // Handle volume up/down via keyboard
  const handleVolume = useCallback(
    (key) => {
      const video = videoRef.current;
      if (!video) return;
      clearTimeout(pressTimer.current);
      video.playbackRate = playbackSpeed;
      clearTimeout(hideVolumeTimer.current);
      showControls();
freezeTimeout();
handleVideoCursorVisiblity("show")
      const step = 0.05;
      let newVol =
        key === "Up"
          ? Math.min(1, video.volume + step)
          : Math.max(0, video.volume - step);

      updateState((prev) => {
        const newState = {
          ...prev,
          isFastPlayback: false,
          showVolumeIcon: true,
          isVolumeChanged: true,
          volume: newVol * 40,
        };

        if (key === "Up") {
          newState.volumeUp = true;
          newState.volumeDown = false;
          newState.volumeMuted = false;
        } else {
          newState.volumeUp = false;
          if (newVol > 0) {
            newState.volumeDown = true;
            newState.volumeMuted = false;
          } else {
            newState.volumeDown = false;
            newState.volumeMuted = true;
          }
        }

        video.volume = newVol;
        setPreviousVolume(newVol * 40);

        return newState;
      });

      // Visual feedback
      const icon = volumeIconRef.current;
      if (icon) {
        icon.classList.remove("pressed");
        requestAnimationFrame(() => icon.classList.add("pressed"));
      }

      // Auto-hide
      hideVolumeTimer.current = setTimeout(() => {
        updateState({ isVolumeChanged: false });
        resetTimeout();
      }, 500);
    },
    [playbackSpeed, updateState, setPreviousVolume, showControls, freezeTimeout, resetTimeout, handleVideoCursorVisiblity]
  );

  // Handle mute/unmute toggle
  const handleVolumeToggle = useCallback(() => {
    updateState((prev) => {
      const video = videoRef.current;
      const tracker = trackerRef.current;
      if (!video) return prev;

      const fromTime = parseFloat(video.currentTime.toFixed(3));

      if (!prev.isMuted) {
        // Muting
        setPreviousVolume(prev.volume);
        video.muted = true;

        if (tracker && !video.paused) {
          tracker.handleMuteToggle(video, fromTime);
        }

        return { ...prev, isMuted: true };
      } else {
        // Unmuting
        video.volume = previousVolume / 40;
        video.muted = false;

        if (tracker && !video.paused) {
          tracker.handleMuteToggle(video, fromTime);
        }

        return { ...prev, isMuted: false, volume: previousVolume };
      }
    });
  }, [previousVolume]);

  // Update volume icon states based on current volume
  const updateVolumeIconStates = useCallback((volume) => {
    const video = videoRef.current;
    if (!video) return;

    const prev = prevVolumeRef.current;
    const curr = volume;

    updateState((prevState) => {
      const isMutedFromHigh = prevState.isMuted && prev >= 0.5;
      const isUnmutedWithJump = !prevState.isMuted && curr > 0.5 && prev === 0;

      let newState = { ...prevState };

      if (isMutedFromHigh || isUnmutedWithJump) {
        newState.jumpedToMax = true;
        newState.isIncreased = false;
        return newState;
      }

      if (curr >= 0.5 && prev < 0.5 && !isMutedFromHigh && !isUnmutedWithJump) {
        clearTimeout(animateTimeoutRef.current);
        newState.isAnimating = false;
        newState.isIncreased = true;
        return newState;
      }

      if (curr >= 0.5) {
        clearTimeout(animateTimeoutRef.current);
        newState.isAnimating = false;
        return newState;
      }

      clearTimeout(animateTimeoutRef.current);
      newState.isAnimating = false;
      newState.isIncreased = false;
      newState.jumpedToMax = false;

      return newState;
    });

    prevVolumeRef.current = curr;
  }, []);

  // Update volume icon state based on current volume level
  const updateVolumeIconState = useCallback(() => {
    const video = videoRef.current;
    const currentVolume = video?.volume ?? 0;

    if (currentVolume === 0 || video?.muted) {
      updateState({
        volumeMuted: true,
        volumeUp: false,
        volumeDown: false,
      });
    } else if (currentVolume > 0.5) {
      updateState({
        volumeMuted: false,
        volumeUp: true,
        volumeDown: false,
      });
    } else {
      updateState({
        volumeMuted: false,
        volumeUp: false,
        volumeDown: true,
      });
    }
  }, []);

  // Effect to sync mute state with video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = state.isMuted;
  }, [videoRef, state.isMuted]);

  // Effect to sync volume slider with mute state
  useEffect(() => {
    if (state.isMuted) {
      updateState({ volumeSlider: 0 });
    } else {
      updateState({ volumeSlider: state.volume });
    }
  }, [state.isMuted, state.volume]);

  useEffect(() => {
    const normalizedVolume = state.volumeSlider / 40;
    updateVolumeIconStates(normalizedVolume);

    return () => {
      clearTimeout(animateTimeoutRef.current);
    };
  }, [state.volumeSlider, updateVolumeIconStates]);

  return {
    handleVolume,
    handleVolumeToggle,
    updateVolumeIconState,
    updateVolumeIconStates,
  };
};

export default useVolumeControl;
