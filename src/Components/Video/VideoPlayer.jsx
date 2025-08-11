import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
  startTransition,
} from "react";
import { keyframes, useMediaQuery, useTheme } from "@mui/system";
import { fetchVideoById } from "../../apis/videoFn";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import { Box, IconButton, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CancelIcon from "@mui/icons-material/Cancel";

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  10% { transform: rotate(-15deg); }  /* Move left */
  20% { transform: rotate(15deg); }   /* Move right */
  30% { transform: rotate(-10deg); }  /* Move left */
  40% { transform: rotate(10deg); }   /* Move right */
  50% { transform: rotate(-8deg); }  /* Move left */
  60% { transform: rotate(8deg); }   /* Move right */
  70% { transform: rotate(0deg); }  /* Move left */
  80% { transform: rotate(0deg); }   /* Move right */
  90% { transform: rotate(0deg); }  /* Move left */
  100% { transform: rotate(0deg); }   /* Back to center */
`;
const iconStyle = {
  color: "#f1f1f1",
  maxWidth: "52px",
  height: "52px",
  padding: "12px",
};

import { useQuery, useMutation } from "@tanstack/react-query";
import { videoView } from "../../apis/videoFn";
import { useLocation } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import VideoControls from "./VideoControls";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import { useDebouncedCallback } from "../../helper/debouncedFn";
import { flushSync } from "react-dom";
import { usePlayerSetting } from "../../helper/usePlayerSettings";
import {
  DrawerContext,
  TimeStampContext,
  UserContext,
  UserInteractionContext,
} from "../../Contexts/RootContexts";

import { getWatchHistory } from "../../apis/userFn";
import {
  sendYouTubeStyleTelemetry,
  VideoTelemetryTimer,
} from "../../helper/watchTelemetry";
import useStateReducer from "../Utils/useStateReducer";

function VideoPlayer({
  videoId,
  isSubscribedTo,
  playlistId,
  playlistVideos,
  index,
  shuffledVideos,
  handleNextVideo,
  isTheatre,
  setIsTheatre,
}) {
  const theme = useTheme();
  const userContext = useContext(UserContext);
  const drawerContext = useContext(DrawerContext);
  const userInteractionContext = useContext(UserInteractionContext);
  const { getTimeStamp, setTimeStamp } = useContext(TimeStampContext);

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);
  const fullScreenTitleRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { open: isOpen } = drawerContext ?? {};
  const { data: dataContext } = userContext ?? {};
  const userId = dataContext?._id;
  const isAuthenticated = dataContext || null;
  const { isUserInteracted, setIsUserInteracted } =
    userInteractionContext ?? {};
  const videoPauseStatus = useRef(null);
  const prevVolumeRef = useRef(null);

  const [isAmbient, setIsAmbient] = usePlayerSetting("ambientMode", false);
  const [playbackSpeed, setPlaybackSpeed] = usePlayerSetting(
    "playbackSpeed",
    1.0
  );
  const [playbackSliderSpeed, setPlaybackSliderSpeed] = usePlayerSetting(
    "playbackSpeed",
    1.0
  );
  const isInside = useRef(null);
  const location = useLocation();
  const prevVideoRef = useRef(null);
  const playIconRef = useRef(null);
  const volumeIconRef = useRef(null);
  const pressTimer = useRef(null);
  const clickTimeout = useRef(null);
  const clickCount = useRef(null);
  const animateTimeoutRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const prevHoverStateRef = useRef(null);
  const holdTimer = useRef(null);
  const trackerRef = useRef(new VideoTelemetryTimer());
  const isHolding = useRef(null);
  const glowCanvasRef = useRef(null);
  const prevSpeedRef = useRef(null);
  const prevSliderSpeedRef = useRef(null);
  const { state, updateState } = useStateReducer({
    isPlaying: false,
    viewCounted: false,
    isLongPress: false,
    showIcon: false,
    showVolumeIcon: false,
    volumeUp: false,
    leftOffset: "0px",
    topOffset: "0px",
    volumeDown: false,
    volumeMuted: false,
    isBuffering: false,
    bufferedVal: false,
    progress: false,
    showBufferingIndicator: false,
    loadingVideo: false,
    isForwardSeek: false,
    isBackwardSeek: false,
    volume: 40,
    isVolumeChanged: false,
    isMuted: false,
    isIncreased: false,
    isAnimating: false,
    jumpedToMax: false,
    isFullscreen: false,
    isMini: false,
    hideMini: false,
    customPlayback: false,
    isReplay: false,
    videoContainerWidth: "0px",
    isFastPlayback: false,
    prevTheatre: false,
    videoHeight: 0,
    playerHeight: "0px",
    resumeTime: 0,
    playerWidth: "0px",
    controlOpacity: 0,
    titleOpacity: 0,
    showSettings: false,
    isPipActive: false,
    videoReady: false,
    canPlay: true,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
    refetchOnWindowFocus: false,
    enabled: !!videoId,
  });

  const {
    data: userHistory,
    isHistoryLoading,
    isHistoryError,
    historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["userHistory"],
    refetchOnWindowFocus: false,
    queryFn: getWatchHistory,
    enabled: !!userId,
  });

  const userResumeTime = userId
    ? (userHistory?.data?.find((entry) => entry.video?._id === videoId)
        ?.currentTime ?? 0)
    : 0;

  useEffect(() => {
    updateState({ videoReady: false });
    hideControls();
  }, [videoId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPause = () => flushSync(() => updateState({ isPlaying: false }));
    video.addEventListener("pause", onPause);
    return () => video.removeEventListener("pause", onPause);
  }, []);

  const handlePlay = async () => {
    const video = videoRef?.current;
    const tracker = trackerRef.current;
    if (!video || !tracker) return;
    console.log("PLAYING");
    try {
      // await video.play();
      if (tracker?.telemetryTimer) {
        tracker.stop();
        tracker.telemetryTimer = null;
      }
      const userResumeTime = userId
        ? (userHistory?.data?.find((entry) => entry.video?._id === videoId)
            ?.currentTime ?? 0)
        : 0;
      tracker.start(video, videoId, setTimeStamp, userResumeTime);

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        video.classList.add("hide-cursor");
      }, 2000);
    } catch (err) {
      updateState({ isPlaying: false });
      if (tracker?.telemetryTimer) {
        console.log("STOPPP");
        tracker.stop();
        tracker.telemetryTimer = null;
      }
    }
    updateState({ isReplay: false });
    updateState({ canPlay: true });
    updateState({ isPlaying: true });
  };

  useEffect(() => {
    console.log("useEffect triggered for pathname:", location.pathname);
    const video = videoRef?.current;
    const tracker = trackerRef?.current;
    tracker.reset();

    if (!video || !tracker) return;
    const telemetryData = tracker.end(video, isSubscribedTo ? 1 : 0);
    if (telemetryData) {
      console.log("Sending telmetry");
      sendYouTubeStyleTelemetry(videoId, video, telemetryData, setTimeStamp);
    }
  }, [location.pathname]);

  useEffect(() => {
    const container = containerRef.current;
    if (isOpen) return;
    if (!container) return;
    let threshold;

    const calculateThreshold = () => {
      const rect = container.getBoundingClientRect();
      const topOffset = rect.top + window.scrollY;
      const height = rect.height;
      return isTheatre ? topOffset + height - 50 : topOffset + height - 60;
    };

    const handleScroll = () => {
      threshold = calculateThreshold();
      const scrollY = window.scrollY;

      if (scrollY > threshold && !state.hideMini && state.canPlay) {
        updateState({ isMini: true });
      }
      if (scrollY < threshold) {
        updateState({ isMini: false });

        if (state.hideMini) {
          updateState({ hideMini: false });
        }
      }
    };

    const handleResize = () => {
      requestAnimationFrame(() => {
        threshold = calculateThreshold();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [isTheatre, data?.data?._id, state.hideMini, state.canPlay, isOpen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      updateState({ isFullscreen: !!document.fullscreenElement });
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const width = 110;
    const height = 75;
    const centerX = width / 2;
    const centerY = height / 2;

    const interval = setInterval(() => {
      const video = videoRef.current;
      const captureCanvas = captureCanvasRef.current;
      const glowCanvas = glowCanvasRef.current;

      if (
        !video ||
        !captureCanvas ||
        !glowCanvas ||
        !isAmbient ||
        video.readyState < 2
      ) {
        return;
      }

      const captureCtx = captureCanvas.getContext("2d", {
        willReadFrequently: true,
      });
      const glowCtx = glowCanvas.getContext("2d", {
        willReadFrequently: true,
      });

      if (!captureCtx || !glowCtx) return;

      try {
        captureCtx.drawImage(video, 0, 0, width, height);

        const frame = captureCtx.getImageData(0, 0, width, height).data;

        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        for (let i = 0; i < frame.length; i += 64) {
          r += frame[i];
          g += frame[i + 1];
          b += frame[i + 2];
          count++;
        }

        if (count === 0) return;

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        const color = `rgb(${r}, ${g}, ${b})`;

        glowCtx.clearRect(0, 0, width, height);
        const gradient = glowCtx.createRadialGradient(
          centerX,
          centerY,
          5,
          centerX,
          centerY,
          70
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "transparent");

        glowCtx.fillStyle = gradient;
        glowCtx.fillRect(0, 0, width, height);
      } catch (e) {
        console.warn("Glow error:", e);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isAmbient]);

  const showControls = () => {
    if (state.controlOpacity !== 1) updateState({ controlOpacity: 1 });
  };

  const hideControls = () => {
    if (state.controlOpacity !== 0) updateState({ controlOpacity: 0 });
  };

  const exitingPiPViaOurUIButtonRef = useRef(false);

  const handleEnterPiP = useCallback(() => {
    showControls();
    updateState({ isPipActive: true });

    if (!prevVideoRef.current) videoRef.current?.play();
  }, []);

  const handleLeavePiP = useCallback(() => {
    updateState({ showIcon: false });

    updateState({ isPipActive: false });

    exitingPiPViaOurUIButtonRef.current = false;

    requestAnimationFrame(() => {
      updateState({ isPlaying: videoRef.current?.paused ? false : true });
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener("enterpictureinpicture", handleEnterPiP);
    video.addEventListener("leavepictureinpicture", handleLeavePiP);

    return () => {
      video.removeEventListener("enterpictureinpicture", handleEnterPiP);
      video.removeEventListener("leavepictureinpicture", handleLeavePiP);
    };
  }, [data?.data?._id, handleEnterPiP, handleLeavePiP]);

  const handleTogglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    setIsUserInteracted(true);

    try {
      if (document.pictureInPictureElement) {
        exitingPiPViaOurUIButtonRef.current = true;
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("PiP error:", err);

      exitingPiPViaOurUIButtonRef.current = false;
    }
  }, []);

  const handleClick = (e) => {
    if (e.button === 2) return;
    if (state.isReplay) return;
    if (clickTimeout.current || state.isLongPress) return;
    videoPauseStatus.current = false;
    clickCount.current += 1;
    if (clickCount.current === 1) {
      clickTimeout.current = setTimeout(() => {
        togglePlayPause();
        flushSync(() => {
          updateState({ showIcon: true });
          updateState({ showVolumeIcon: false });
        });
        console.log("Single Click");
        clickCount.current = 0;
        clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
      }, 150);
    } else if (clickCount.current === 2) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      clickCount.current = 0;
      toggleFullScreen();
    }
  };
  const handleMouseUp = (e) => {
    exitDoubleSpeed(e);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("touchend", handleMouseUp);
    window.removeEventListener("touchcancel", handleMouseUp);
  };
  const DoubleSpeed = (e) => {
    if (e.type === "mousedown" && e.button === 2) return;
    const video = videoRef.current;
    if (!video) return;

    prevSliderSpeedRef.current = playbackSliderSpeed;

    prevSpeedRef.current = playbackSpeed;

    console.log("prevsliderspeed", prevSliderSpeedRef.current);
    console.log("prevspeed", prevSpeedRef.current);

    clearTimeout(clickTimeout.current);
    clickTimeout.current = null;
    prevHoverStateRef.current = state.controlOpacity;

    pressTimer.current = setTimeout(() => {
      console.log("down");
      updateState({ isLongPress: true });
      hideControls();
      updateState({ titleOpacity: 0 });
      updateState({ showIcon: false });
      if (video.paused) {
        video.play();
        videoPauseStatus.current = true;
        updateState({ isPlaying: true });
      }

      video.playbackRate = 2.0;
      setPlaybackSpeed(2.0);
      setPlaybackSliderSpeed(playbackSpeed);
      updateState({ isFastPlayback: true });
      pressTimer.current = null;
    }, 600);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleMouseUp);
    window.addEventListener("touchcancel", handleMouseUp);
  };

  const exitDoubleSpeed = (e) => {
    if (e.button === 2) return;

    const video = videoRef.current;
    if (!video) return;
    flushSync(() => {
      updateState({ showIcon: true });
      updateState({ showVolumeIcon: false });
    });
    if (videoPauseStatus.current) {
      video.pause();
      updateState({ isPlaying: false });
      showControls();
      updateState({ titleOpacity: 1 });
    }
    flushSync(() => {

      updateState({controlOpacity:  isInside.current && prevHoverStateRef.current === 1
          ? prevHoverStateRef.current
          : 0})
     updateState({titleOpacity:  isInside.current && prevHoverStateRef.current === 1
          ? prevHoverStateRef.current
          : 0})
    });
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      updateState({ isLongPress: false });
      pressTimer.current = null;
      console.log("up");
    }, 200);
    updateState({ isFastPlayback: false });
    if (state.customPlayback) {
      video.playbackRate = prevSliderSpeedRef.current;
    } else {
      video.playbackRate = prevSpeedRef.current;
    }
    setPlaybackSpeed(prevSpeedRef.current);
    setPlaybackSliderSpeed(prevSliderSpeedRef.current);
  };
  const handleContainerMouseMove = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!state.isLongPress) {
      console.log("move");

      container
        .querySelector(".video-overlay")
        ?.classList.remove("hide-cursor");
      container.querySelector(".controls")?.classList.remove("hide-cursor");
      isInside.current = true;
      showControls();
      updateState({ titleOpacity: 1 });
    }
  };
  const handleMouseMove = (e) => {
    const container = containerRef.current;
    const video = videoRef.current;
    const controls = container.getElementsByClassName("MuiPopper-root");

    const rect = video.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    const inside =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    console.log(inside);
    if (videoPauseStatus.current) return;
    isInside.current = inside;

    container.querySelector(".video-overlay")?.classList.remove("hide-cursor");
    container.querySelector(".controls")?.classList.remove("hide-cursor");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    timeoutRef.current = setTimeout(() => {
      if (
        state.isPlaying &&
        !controls.length &&
        !state.isReplay &&
        !isHolding.current &&
        !state.showSettings
      ) {
        hideControls();
        updateState({ titleOpacity: 0 });
        container.querySelector(".video-overlay")?.classList.add("hide-cursor");
        container.querySelector(".controls")?.classList.add("hide-cursor");
      }
    }, 2000);
  };

  useEffect(() => {
    const container = containerRef.current;
    const fullScreenTitle = fullScreenTitleRef.current;
    const isInsideRef = isInside.current;
    const video = videoRef.current;

    if (!container || !video || !fullScreenTitle || !isInsideRef) return;

    const controls = container.getElementsByClassName("MuiPopper-root");

    if (!state.isPlaying) {
      showControls();
      updateState({ titleOpacity: 1 });
      fullScreenTitle.classList.add("show");
      return;
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        if (!controls.length && !isHolding.current && !state.showSettings) {
          hideControls();
          updateState({ titleOpacity: 0 });
          container
            .querySelector(".video-overlay")
            ?.classList.add("hide-cursor");
          container.querySelector(".controls")?.classList.add("hide-cursor");
        }
      }, 2000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state.isPlaying, state.controlOpacity, state.isLongPress, isInside]);

  const handleMouseOut = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    const isFullscreen = !!document.fullscreenElement;
    if (
      !container ||
      !video ||
      isFullscreen ||
      !state.isPlaying ||
      state.isReplay ||
      state.showSettings
    )
      return;

    hideControls();
    updateState({ titleOpacity: 0 });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isBufferingLocal = false;
    let lastTime = video.currentTime;
    let progressCheckId;

    const handleBufferingStart = () => {
      if (!state.isBufferingLocal) {
        console.log("Buffering started");
        state.isBufferingLocal = true;
        updateState({ isBuffering: true });
      }
    };

    const handleBufferingEnd = () => {
      if (state.isBufferingLocal) {
        console.log("Buffering ended");
        state.isBufferingLocal = false;
        updateState({ isBuffering: false });
      }
    };

    video.addEventListener("waiting", handleBufferingStart);
    video.addEventListener("stalled", handleBufferingStart);
    video.addEventListener("playing", handleBufferingEnd);
    video.addEventListener("canplay", handleBufferingEnd);

    const checkProgress = () => {
      if (video.paused) return;

      if (Math.abs(video.currentTime - lastTime) < 0.1) {
        handleBufferingStart();
      } else {
        handleBufferingEnd();
        lastTime = video.currentTime;
      }
    };

    state.progressCheckId = setInterval(checkProgress, 500);

    return () => {
      video.removeEventListener("waiting", handleBufferingStart);
      video.removeEventListener("stalled", handleBufferingStart);
      video.removeEventListener("playing", handleBufferingEnd);
      video.removeEventListener("canplay", handleBufferingEnd);
      clearInterval(state.progressCheckId);
    };
  }, [data?.data?._id]);

  useEffect(() => {
    let timeout;

    if (state.isBuffering && !state.isForwardSeek && !state.isBackwardSeek) {
      timeout = setTimeout(() => {
        updateState({ showBufferingIndicator: true });
      }, 100);
    } else {
      updateState({ showBufferingIndicator: false });
    }

    return () => clearTimeout(timeout);
  }, [state.isBuffering, state.isForwardSeek, state.isBackwardSeek, videoId]);

  const handleVolume = (key) => {
    const video = videoRef.current;
    if (!video) return;
    if (pressTimer.current) clearTimeout(pressTimer.current);
    updateState({ isFastPlayback: false });
    updateState({ showIcon: false });

    const icon = volumeIconRef.current;
    flushSync(() => {
      updateState({ showIcon: false });
      updateState({ showVolumeIcon: true });
      updateState({ isVolumeChanged: true });
    });

    if (icon) {
      icon.classList.remove("pressed");
      void icon.offsetWidth;
      icon.classList.add("pressed");
    } else {
      console.warn("volumeIconRef is null");
    }

    const step = 0.05;
    if (key === "Up") {
      updateState({ volumeDown: false });
      updateState({ isMuted: false });
      updateState({ volumeUp: true });
      const newVol = (video.volume = Math.min(1, video.volume + step));
      updateState({ volume: newVol * 40 });
    } else if (key === "Down") {
      updateState({ volumeUp: false });
      const newVol = (video.volume = Math.max(0, video.volume - step));
      if (newVol > 0) {
        updateState({ volumeDown: true });
        updateState({ volumeMuted: false });
      } else {
        updateState({ volumeMuted: true });
        updateState({ volumeDown: false });
      }
      updateState({ volume: newVol * 40 });
    }

    if (state.customPlayback) {
      video.playbackRate = prevSliderSpeedRef.current;
    } else {
      video.playbackRate = prevSpeedRef.current;
    }

    setTimeout(() => {
      updateState({ isVolumeChanged: false });
    }, 500);
  };

  const prevVolRef = useRef(0);

  const updateVolumeStates = (volume) => {
    const prev = prevVolRef.current;
    const curr = volume;

    const isUnmutedWithJump = prev === 0 && curr >= 0.5;
    const isMutedFromHigh = prev >= 0.5 && curr === 0;

    if (isUnmutedWithJump || isMutedFromHigh) {
      updateState({ jumpedToMax: true });
      updateState({ isIncreased: false });
    }

    if (curr === 0) {
      updateState({ isMuted: true });
      updateState({ isIncreased: false });
      animateTimeoutRef.current = setTimeout(
        () => updateState({ isAnimating: true }),
        300
      );
      return;
    }

    if (curr >= 0.5 && prev < 0.5) {
      clearTimeout(animateTimeoutRef.current);
      updateState({ isAnimating: false });
      updateState({ isMuted: false });
      updateState({ isIncreased: true });
      return;
    }

    if (curr >= 0.5) {
      clearTimeout(animateTimeoutRef.current);
      updateState({ isMuted: false });
      updateState({ isAnimating: false });
      return;
    }

    clearTimeout(animateTimeoutRef.current);
    updateState({ isMuted: false });
    updateState({ isAnimating: false });
    updateState({ isIncreased: false });
    updateState({ jumpedToMax: false });
  };
  const debouncedUpdateVolumeStates = useDebouncedCallback(
    (normalizedVolume) => {
      updateVolumeStates(normalizedVolume);
      prevVolRef.current = normalizedVolume;
    },
    3,
    0.04
  );

  useEffect(() => {
    const normalizedVolume = state.volume / 40;
    debouncedUpdateVolumeStates(normalizedVolume);
    return () => {
      clearTimeout(animateTimeoutRef.current);
    };
  }, [state.volume, debouncedUpdateVolumeStates]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;

      if (isFullscreen) {
        if (state.prevTheatre) {
          setIsTheatre(false);
        }
      } else {
        if (state.prevTheatre) {
          setIsTheatre(true);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [state.prevTheatre]);

  const toggleFullScreen = () => {
    const el = containerRef.current;
    if (!el) return;

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isFullScreen = !!document.fullscreenElement;

    if (!isFullScreen) {
      el.requestFullscreen?.().then(() => {
        if (!isIOS) {
          screen.orientation?.lock?.("landscape").catch(() => {});
        } else {
          alert("Rotate your device for best fullscreen experience.");
        }
      });
    } else {
      document.exitFullscreen?.().then(() => {
        screen.orientation?.unlock?.();
      });
    }
  };

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    const tracker = trackerRef.current;
    if (!video || !container || !state.canPlay) return;
    setIsUserInteracted(true);

    container.querySelector(".video-overlay")?.classList.remove("hide-cursor");
    container.querySelector(".controls")?.classList.remove("hide-cursor");
    if (playIconRef.current?.classList) {
      playIconRef.current.classList.add("click");
    } else {
      console.warn("playIconRef is null");
    }
    const fromTime = video.currentTime || 0;

    if (video.paused || video.ended) {
      video.play();

      updateState({ isPlaying: true });
    } else {
      video.pause();
      updateState({ isPlaying: false });
    }
    const newTime = video.currentTime || 0;
    if (tracker && video.currentTime !== 0) {
      tracker.trackVideoState(video, fromTime, newTime);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () =>
      !state.isForwardSeek &&
      !state.isBackwardSeek &&
      updateState({ loadingVideo: true });
    const handleWaiting = () =>
      !state.isForwardSeek &&
      !state.isBackwardSeek &&
      updateState({ loadingVideo: true });
    const handleCanPlay = () => {
      updateState({ loadingVideo: false });
    };
    const handlePlaying = () => {
      updateState({ loadingVideo: false });
    };

    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
    };
  }, [videoRef.current, videoId, state.isForwardSeek, state.isBackwardSeek]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateBuffered = () => {
      try {
        if (video.buffered.length > 0 && video.duration > 0) {
          const currentTime = video.currentTime;
          let bufferedEnd = video.buffered.end(0);

          for (let i = 0; i < video.buffered.length; i++) {
            if (
              video.buffered.start(i) <= currentTime &&
              video.buffered.end(i) > currentTime
            ) {
              bufferedEnd = video.buffered.end(i);
              break;
            }
          }

          const bufferProgress = bufferedEnd / video.duration;
          updateState({ bufferedVal: bufferProgress });
        } else {
          updateState({ bufferedVal: 0 });
        }
      } catch (e) {
        console.warn("Buffered read error", e);
        updateState({ bufferedVal: 0 });
      }
    };

    const events = ["state.progress", "timeupdate", "seeked"];
    events.forEach((event) => {
      video.addEventListener(event, updateBuffered);
    });

    return () => {
      events.forEach((event) => {
        video.removeEventListener(event, updateBuffered);
      });
    };
  }, [data?.data?._id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    if (isUserInteracted) {
      videoRef.current?.play();
    }
  }, [isUserInteracted]);

  useEffect(() => {
    let isMounted = true;

    const fetchResumeTime = async () => {
      if (isAuthenticated) {
        try {
          const res = await refetchHistory();
          const refetchedVideo = res?.data?.data?.find(
            (v) => v?.video?._id === videoId
          );
          if (!isMounted) return;

          const duration = refetchedVideo?.duration || 0;
          const time = refetchedVideo?.currentTime || 0;
          updateState({
            resumeTime: isFinite(time) && time < duration ? time : 0,
          });
        } catch (err) {
          console.error("Error fetching history:", err);
          if (isMounted) updateState({ resumeTime: 0 });
        }
      } else {
        const guestTime = getTimeStamp(videoId);
        console.log("guestTimeget", guestTime);

        updateState({
          resumeTime: isFinite(guestTime) && guestTime > 0 ? guestTime : 0,
        });
      }
    };
    fetchResumeTime();

    return () => {
      isMounted = false;
    };
  }, [data?.data?._id, isAuthenticated]);

  const handleLoadedMetadata = async () => {
    const video = videoRef?.current;
    if (!video) return;

    video.currentTime = state.resumeTime;
    const value = (video.currentTime / video.duration) * 100;
    updateState({ progress: value });

    if (!isUserInteracted) {
      showControls();
      updateState({ titleOpacity: 1 });
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
  };

  useEffect(() => {
    let timeoutId;
    if (location.pathname === "/") {
      timeoutId = setTimeout(() => {
        setIsUserInteracted(true);
      }, 500);
    }
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  // useEffect(() => {
  //   sendWatchHistory();
  // }, [location.pathname]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkReplayReset = () => {
      if (video.currentTime < video.duration && state.isReplay) {
        updateState({ isReplay: false });
        video.play();
      }
    };

    video.addEventListener("timeupdate", checkReplayReset);

    return () => {
      video.removeEventListener("timeupdate", checkReplayReset);
    };
  }, [state.isReplay]);

  const handleForwardSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (pressTimer.current) clearTimeout(pressTimer.current);
    updateState({ isForwardSeek: true });
    updateState({ isFastPlayback: false });

    videoRef.current.currentTime += 5;
    if (!video.paused) {
      videoRef.current.play();
      updateState({ isPlaying: true });
    }
    if (state.customPlayback) {
      video.playbackRate = prevSliderSpeedRef.current;
    } else {
      video.playbackRate = prevSpeedRef.current;
    }

    setTimeout(() => updateState({ isForwardSeek: false }), 300);
  }, []);

  const handleBackwardSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (pressTimer.current) clearTimeout(pressTimer.current);
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

    if (state.customPlayback) {
      video.playbackRate = prevSliderSpeedRef.current;
    } else {
      video.playbackRate = prevSpeedRef.current;
    }
    video.currentTime = Math.max(video.currentTime - 5, 0);

    if (!video.paused) {
      updateState({ isPlaying: true });
    }

    setTimeout(() => updateState({ isBackwardSeek: false }), 300);
  }, [state.isReplay]);

  const handleVolumeToggle = useCallback(() => {
    const video = videoRef.current;
    const tracker = trackerRef.current;
    if (!video) return;
    const fromTime = parseFloat(video.currentTime.toFixed(3));
    const currentVolume = video.volume;

    if (currentVolume > 0) {
      prevVolumeRef.current = currentVolume;
      video.muted = true;
      updateState({ volume: 0 });
    } else {
      const restoreVol = prevVolumeRef.current || 1;
      video.volume = restoreVol;
      updateState({ volume: restoreVol * 40 });
      video.muted = false;
    }

    if (tracker && !video.paused) {
      tracker.handleMuteToggle(video, fromTime);
    }
  }, []);

  const updateVolumeIconState = () => {
    const currentVolume = videoRef.current?.volume ?? 0;

    updateState({ volumeMuted: false });
    updateState({ volumeUp: false });
    updateState({ volumeDown: false });

    if (currentVolume === 0) {
      updateState({ volumeMuted: true });
    } else if (currentVolume > 0.5) {
      updateState({ volumeUp: true });
    } else {
      updateState({ volumeDown: true });
    }
  };

  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return;

    const updateSize = () => {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      updateState({ videoContainerWidth: containerWidth });
      const targetAspectRatio = 16 / 9;

      let videoWidth = Math.floor(containerWidth);
      let videoHeightLocal = Math.ceil(videoWidth / targetAspectRatio);
      updateState({ videoHeight: videoHeightLocal });

      if (videoHeightLocal > containerHeight) {
        videoHeightLocal = Math.floor(containerHeight);
        videoWidth = Math.floor(videoHeightLocal * targetAspectRatio);
      }
      const left = Math.floor(Math.max((containerWidth - videoWidth) / 2, 0));
      const top = Math.ceil(
        Math.max((containerHeight - videoHeightLocal) / 2, 0)
      );
      updateState({ playerWidth: `${videoWidth}px` });
      updateState({ playerHeight: `${videoHeightLocal}px` });

      updateState({ leftOffset: `${left}px` });
      updateState({ topOffset: `${top}px` });
    };
    const raf = requestAnimationFrame(updateSize);
    const container = containerRef.current;
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(updateSize);
    });
    if (container) observer.observe(container);
    window.addEventListener("resize", updateSize);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [isTheatre, data?.data?._id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const normalized = state.volume / 40;
    video.volume = normalized;
  }, [state.volume, data?.data?._id, state.isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;
    const handleKeyPress = (e) => {
      const overlay = container.querySelector(".video-overlay");
      const controls = container.querySelector(".controls");
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.isContentEditable);

      if (isInputFocused) return;

      if (e.key === "ArrowRight") {
        handleForwardSeek();
      } else if (e.key === "ArrowLeft") {
        handleBackwardSeek();
      } else if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        flushSync(() => {
          updateState({ showIcon: true });
          updateState({ showVolumeIcon: false });
        });
        togglePlayPause();
      } else if (e.code === "Space") {
        e.preventDefault();
        if (isHolding.current) return;
        updateState({ controlOpacity: 1 });
        updateState({ titleOpacity: 1 });
        if (overlay.classList.contains("hide-cursor")) {
          overlay.classList.remove("hide-cursor");
        }
        if (controls.classList.contains("hide-cursor")) {
          controls.classList.remove("hide-cursor");
        }
        holdTimer.current = setTimeout(() => {
          DoubleSpeed(e);
          isHolding.current = true;
          holdTimer.current = null;
        }, 200);
      } else if (e.shiftKey && e.key.toLowerCase() === "n") {
        handleNextVideo();
      } else if (e.key.toLowerCase() === "f") {
        toggleFullScreen();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleVolume("Up");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleVolume("Down");
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        const icon = volumeIconRef.current;
        flushSync(() => {
          updateState({ showIcon: false });
          updateState({ showVolumeIcon: true });
          updateState({ isVolumeChanged: true });
        });

        if (icon) {
          icon.classList.remove("pressed");
          void icon.offsetWidth;
          icon.classList.add("pressed");
        } else {
          console.warn("volumeIconRef is null");
        }
        handleVolumeToggle();
        updateVolumeIconState();

        setTimeout(() => {
          updateState({ isVolumeChanged: false });
        }, 400);
      } else if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        const isFullscreen = !!document.fullscreenElement;
        if (!isFullscreen && videoRef.current) {
          setIsUserInteracted(true);
          startTransition(() => {
            setIsTheatre((prev) => !prev)
          });
        }
      }
    };

    const handleKeyUp = (e) => {
      e.preventDefault();
      if (e.code === "Space") {
        if (isHolding.current) {
          isHolding.current = false;
          clearTimeout(holdTimer.current);
          holdTimer.current = null;
          exitDoubleSpeed(e);
        } else {
          clearTimeout(holdTimer.current);
          holdTimer.current = null;
          flushSync(() => {
            updateState({ showIcon: true });
            updateState({ showVolumeIcon: false });
          });
          togglePlayPause();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    handleForwardSeek,
    handleBackwardSeek,
    togglePlayPause,
    handleNextVideo,
    playbackSliderSpeed,
    playbackSpeed,
  ]);

  useEffect(() => {
    updateState({ prevTheatre: isTheatre });
  }, [isTheatre]);

  const { mutate } = useMutation({
    mutationFn: () => videoView(videoId),
    onMutate: () => {
      updateState({ viewCounted: true });
    },
  });
  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error: {error.message}</Typography>;

  const handleTimeUpdate = (event) => {
    const video = videoRef.current;

    if (!video || isNaN(video.duration) || video.duration === 0) return;

    const value = (video.currentTime / video.duration) * 100;

    updateState({ progress: value });

    const duration = video.duration;
    const watchTime = video.currentTime;

    // if (!telemetrySentRef.current && Math.floor(watchTime) >= 10) {
    //   telemetrySentRef.current = true;
    //   console.log("🎯 10 seconds passed, telemetry sending...");
    //   const data = getCurrentVideoTelemetryData(userId, videoId, video);
    //   sendTelemetry([data]);
    //   return;
    // }

    const hasWatchedEnough =
      (duration < 30 && watchTime >= duration) || watchTime >= 30;
    if (state.viewCounted) return;
    if (hasWatchedEnough) {
      mutate();
    }
  };

  const handleVideoEnd = () => {
    updateState({ canPlay: false });
    updateState({ isReplay: true });

    if (!playlistVideos || index >= playlistVideos.length - 1) return;

    navigate({
      to: "/watch",
      search: {
        v: playlistVideos[index + 1]._id,
        list: playlistId,
        index: index + 2,
      },
    });
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          paddingTop: isTheatre ? "" : "calc(9 / 16 * 100%)",
        }}
        className="video-inner"
      >
        <Box
          data-theatre={isTheatre}
          ref={containerRef}
          onMouseLeave={handleMouseOut}
          onMouseMove={handleContainerMouseMove}
          onMouseEnter={() => {
            if (!state.isLongPress) {
              isInside.current = true;
              showControls();
            }
          }}
          id="video-container"
          component="div"
          sx={{
            position: isTheatre ? "relative" : "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
          }}
        >
          {!isTheatre && (
            <Box
              sx={{
                display: state.isMini ? "none" : "block",
                height: state.videoHeight,
              }}
              className="ambient-wrapper"
            >
              <Box
                sx={{
                  transform: isMobile ? "scale(1.5, 1.5)" : "scale(1.5, 1.3)",
                }}
                className="canvas-container"
              >
                <canvas
                  ref={captureCanvasRef}
                  width="110"
                  height="75"
                  className="hide"
                />
                <canvas
                  ref={glowCanvasRef}
                  width="110"
                  height="75"
                  className="glow-canvas"
                />
              </Box>
            </Box>
          )}
          <Box
            sx={{
              aspectRatio: state.isMini ? "1.7777777777777777 !important" : "",
              position:
                isTheatre && !state.isMini
                  ? "relative"
                  : state.isMini
                    ? "fixed"
                    : "absolute",
              width: state.isMini ? "480px" : "100%",
              height: state.isMini ? "auto" : "100%",
              top: state.isMini ? "15px" : 0,
              left: state.isMini ? "15px" : 0,
              right: state.isMini ? "auto" : "",
              zIndex: state.isMini ? 9999 : 0,
            }}
          >
            <Box
              className="html5-video-container"
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: "8px",
                overflow: "hidden",
                top: 0,
                left: 0,
              }}
            >
              {data?.data?.videoFile.url && (
                <video
                  key={data?.data?.videoFile.url}
                  ref={videoRef}
                  crossOrigin="anonymous"
                  id="video-player"
                  preload="auto"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnd}
                  onPlay={handlePlay}
                  onLoadedMetadata={handleLoadedMetadata}
                  style={{
                    visibility: state.videoReady ? "visible" : "hidden",
                    aspectRatio: state.isMini ? "1.777" : "",
                    position: "absolute",
                    width: state.isMini ? "480px" : state.playerWidth,
                    height: state.isMini ? "auto" : state.playerHeight,
                    left: isTheatre && !state.isMini ? state.leftOffset : 0,
                    top: isTheatre && !state.isMini ? state.topOffset : 0,
                    right: state.isMini ? "auto" : "",
                    objectFit: "cover",
                    borderRadius: isTheatre && !state.isMini ? "0" : "8px",
                  }}
                >
                  <source src={data?.data?.videoFile.url} type="video/mp4" />
                </video>
              )}
              <VideoControls
                videoRef={videoRef}
                tracker={trackerRef.current}
                videoId={videoId}
                playlistId={playlistId}
                shuffledVideos={shuffledVideos}
                isLoading={isLoading}
                togglePlayPause={togglePlayPause}
                toggleFullScreen={toggleFullScreen}
                playlistVideos={playlistVideos}
                index={index}
                handleVolumeToggle={handleVolumeToggle}
                handleTogglePiP={handleTogglePiP}
                isTheatre={isTheatre}
                setIsTheatre={setIsTheatre}
                playbackSpeed={playbackSpeed}
                setPlaybackSpeed={setPlaybackSpeed}
                spriteUrl={data?.data?.sprite?.url}
                vttUrl={data?.data?.sprite?.vtt}
                isAmbient={isAmbient}
                setIsAmbient={setIsAmbient}
                playbackSliderSpeed={playbackSliderSpeed}
                setPlaybackSliderSpeed={setPlaybackSliderSpeed}
                customPlayback={state.customPlayback}
                {...state}
                updateState={updateState}
              />

              <Box className="title-background-overlay"></Box>
              <Box
                component={"video-cover"}
                sx={{
                  position: "absolute",
                  display: "flex",
                  justifyContent: "center",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                  pointerEvents: "all",
                }}
              >
                {state.isFastPlayback && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "20px",
                      width: "72px",
                      height: "34px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "1rem",
                      color: "#f1f1f1",
                      borderRadius: "50px",
                      background: "rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ pr: 1 }}>
                      2x
                    </Typography>

                    <FastForwardIcon
                      sx={{ width: "1.1rem", height: "1.1rem" }}
                    />
                  </Box>
                )}
                {state.isVolumeChanged && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "60px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "1rem",
                      borderRadius: "4px",
                      color: "#f1f1f1",
                      background: "rgba(0, 0, 0, 0.5)",
                      padding: "6px 20px",
                    }}
                  >
                    <Typography fontWeight="500" variant="h6">
                      {Math.round((state.volume / 40) * 100)}%
                    </Typography>
                  </Box>
                )}
                {state.isForwardSeek && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      marginTop: "-55px",
                      right: "10%",
                      width: "110px",
                      height: "110px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "1rem",
                      color: "#f1f1f1",
                      borderRadius: "50%",
                      background: "rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        position: "relative",
                        left: "6px",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        className="forwardSeek-arrow"
                        component={"span"}
                      ></Box>
                      <Box
                        className="forwardSeek-arrow"
                        component={"span"}
                      ></Box>
                      <Box
                        className="forwardSeek-arrow"
                        component={"span"}
                      ></Box>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ margin: "0 auto", pt: 1 }}
                    >
                      5 seconds{" "}
                    </Typography>
                  </Box>
                )}

                {state.isBackwardSeek && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      marginTop: "-55px",
                      left: "10%",
                      width: "110px",
                      height: "110px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "1rem",
                      color: "#f1f1f1",
                      borderRadius: "50%",
                      background: "rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        position: "relative",
                        right: "6px",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Box className="rewind-arrow" component={"span"}></Box>
                      <Box className="rewind-arrow" component={"span"}></Box>
                      <Box className="rewind-arrow" component={"span"}></Box>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ margin: "0 auto", pt: 1 }}
                    >
                      5 seconds{" "}
                    </Typography>
                  </Box>
                )}

                <Box
                  className="status-overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: 1,
                    color: "#fff",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  {(state.showBufferingIndicator || state.loadingVideo) &&
                    !state.isBackwardSeek &&
                    !state.isForwardSeek && (
                      <IconButton
                        disableRipple
                        className="buffering-state.progress"
                        sx={{
                          position: "absolute",
                          left: "50%",
                          top: "50%",
                          width: "68px",
                          height: "48px",
                          marginLeft: "-34px",
                          marginTop: "-24px",
                          padding: "0",
                          opacity: 1,
                        }}
                      >
                        <CircularProgress
                          sx={{
                            mx: "auto",
                            textAlign: "center",
                            color: "rgb(255, 255, 255)",
                          }}
                          size={50}
                        />
                      </IconButton>
                    )}

                  <>
                    <IconButton
                      sx={{
                        width: "52px",
                        height: "52px",
                        padding: 0,
                        opacity: state.showIcon ? 1 : 0,
                        visibility:
                          state.showIcon && isUserInteracted
                            ? "visible"
                            : "hidden",
                        transition: "opacity 0.2s ease",
                        position: "absolute",
                      }}
                      ref={playIconRef}
                    >
                      {state.isPlaying ? (
                        <PlayArrowIcon
                          className="playback-icon"
                          sx={iconStyle}
                        />
                      ) : (
                        <PauseIcon className="playback-icon" sx={iconStyle} />
                      )}
                    </IconButton>

                    <IconButton
                      sx={{
                        width: "52px",
                        height: "52px",
                        padding: 0,
                        opacity: state.showVolumeIcon ? 1 : 0,
                        visibility: state.showVolumeIcon ? "visible" : "hidden",
                        transition: "opacity 0.2s ease",
                        position: "absolute",
                      }}
                      ref={volumeIconRef}
                    >
                      {state.volumeDown ? (
                        <VolumeDownIcon className="vol-icon" sx={iconStyle} />
                      ) : state.volumeUp ? (
                        <VolumeUpIcon className="vol-icon" sx={iconStyle} />
                      ) : state.volumeMuted ? (
                        <VolumeOffIcon className="vol-icon" sx={iconStyle} />
                      ) : null}
                    </IconButton>
                  </>
                </Box>
              </Box>

              <Box
                sx={{ userSelect: "none" }}
                onClick={handleClick}
                onMouseDown={
                  isUserInteracted && !state.isPipActive ? DoubleSpeed : null
                }
                onTouchStart={
                  isUserInteracted && !state.isPipActive ? DoubleSpeed : null
                }
                className="video-overlay"
              >
                <Box
                  className="thumbnail-overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,

                    justifyContent: "center",
                    alignItems: "center",
                    display: isUserInteracted || state.isMini ? "none" : "flex",
                    transition: "opacity .25s cubic-bezier(0,0,.2,1)",
                    color: "#fff",
                    userSelect: "none",
                    pointerEvents: "all",
                    "&:hover .large-play-btn": {
                      fill: "#f03",
                      fillOpacity: "1",
                    },
                  }}
                >
                  <Box
                    className="thumbnail-overlay-image"
                    sx={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      borderRadius: "8px",
                      background: state.loadingVideo
                        ? "rgba(0,0,0)"
                        : "transparent",
                      backgroundImage: `url(${data?.data?.thumbnail.url})`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }}
                  ></Box>
                  <IconButton
                    disableRipple
                    className="large-play-btn-container"
                    sx={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      width: "68px",
                      height: "48px",
                      marginLeft: "-34px",
                      marginTop: "-24px",
                      padding: "0",
                      display: isUserInteracted ? "none" : "inline-flex",
                      opacity: 1,
                    }}
                  >
                    <svg
                      height="100%"
                      version="1.1"
                      viewBox="0 0 68 48"
                      width="100%"
                    >
                      <path
                        className="large-play-btn"
                        d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55 C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19 C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z"
                        fill="#212121"
                        fillOpacity=".8"
                      ></path>
                      <path d="M 45,24 27,14 27,34" fill="#f1f1f1"></path>
                    </svg>
                  </IconButton>
                </Box>
              </Box>
              <IconButton
                className={`cancel-mini-btn ${state.isMini ? "" : "hide"}`}
                onClick={() => {
                  updateState({ isMini: false });
                  updateState({ hideMini: true });
                }}
                sx={{
                  position: "absolute",
                  top: "-2px",
                  left: "-2px",
                  cursor: "pointer",
                  zIndex: 3,
                }}
              >
                <CancelIcon sx={{ color: "#fff" }} />
              </IconButton>
              <Box
                ref={fullScreenTitleRef}
                className="title-fullscreen"
                sx={{
                  opacity: !state.isFullscreen ? 0 : state.titleOpacity,
                  position: "absolute",
                  width: "100%",
                  top: "0",
                  padding: 2,
                }}
              >
                <Typography
                  className="title-text"
                  sx={{
                    position: "absolute",
                    zIndex: 4,
                    left: "12px",
                    display: "-webkit-box",
                    textOverflow: "ellipsis",
                    maxHeight: "5.6rem",
                    WebkitLineClamp: "2",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    color: "#eee",
                    cursor: "default",
                    "&:hover": {
                      color: "#fff",
                    },
                  }}
                  variant="h3"
                  color="#fff"
                >
                  {data?.data?.title}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default React.memo(VideoPlayer);
