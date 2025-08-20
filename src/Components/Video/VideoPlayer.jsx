import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
  startTransition,
  useImperativeHandle,
  useMemo,
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
import useRefReducer from "../Utils/useRefReducer";
import { useFullscreen } from "../Utils/useFullScreen";

function VideoPlayer(
  {
    videoId,
    isSubscribedTo,
    playlistId,
    playlistVideos,
    index,
    shuffledVideos,
    handleNextVideo,
    isMini,
    setIsMini,
    hideMini,
    setHideMini,
    isTheatre,
    watchRef,
    setIsTheatre,
    data,
    isLoading,
    isError,
    error,
  },
  ref
) {
  const theme = useTheme();
  const isFullscreen = useFullscreen();

  const userContext = useContext(UserContext);
  const drawerContext = useContext(DrawerContext);
  const userInteractionContext = useContext(UserInteractionContext);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { open: isOpen } = drawerContext ?? {};
  const { data: dataContext } = userContext ?? {};
  const userId = dataContext?._id;
  const isAuthenticated = dataContext || null;
  const { isUserInteracted, setIsUserInteracted } =
    userInteractionContext ?? {};

  const [isAmbient, setIsAmbient] = usePlayerSetting("ambientMode", false);
  const [playbackSpeed, setPlaybackSpeed] = usePlayerSetting(
    "playbackSpeed",
    1.0
  );
  const [playbackSliderSpeed, setPlaybackSliderSpeed] = useState(1);
  const location = useLocation();
  const { getTimeStamp, setTimeStamp } = useContext(TimeStampContext);

  const { state, updateState } = useStateReducer({
    isPlaying: false,
    viewCounted: false,
    isLongPress: false,
    showIcon: false,
    showVolumeIcon: false,
    volumeUp: false,
    leftOffset: "0px",
    topOffset: "0px",
    volumeSlider: 40,
    volumeDown: false,
    volumeMuted: false,
    isBuffering: false,
    showBufferingIndicator: false,
    loadingVideo: false,
    isForwardSeek: false,
    isBackwardSeek: false,
    volume: 40,
    isVolumeChanged: false,
    isMuted: false,
    isIncreased: true,
    isAnimating: false,
    jumpedToMax: false,
    customPlayback: false,
    isReplay: false,
    isSeeking: false,
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
    aspectRatio: 0.75,
  });

  const {
    isInside,
    prevVideoRef,
    videoPauseStatus,
    playIconRef,
    volumeIconRef,
    containerRef,
    videoRef,
    savedVideoRef,
    timeoutRef,
    pressTimer,
    fullScreenTitleRef,
    clickTimeout,
    clickCount,
    animateTimeoutRef,
    captureCanvasRef,
    prevOpacityRef,
    prevVolRef,
    prevVolumeRef,
    exitingPiPViaOurUIButtonRef,
    holdTimer,
    trackerRef,
    isHolding,
    glowCanvasRef,
    volTimeoutRef,
    lastKeyPress,
    hideVolumeTimer,
  } = useRefReducer({
    isInside: null,
    prevVideoRef: null,
    videoPauseStatus: null,
    playIconRef: null,
    volumeIconRef: null,
    containerRef: null,
    videoRef: null,
    savedVideoRef: null,
    timeoutRef: null,
    pressTimer: null,
    fullScreenTitleRef: null,
    clickTimeout: null,
    clickCount: 0,
    animateTimeoutRef: null,
    captureCanvasRef: null,
    prevOpacityRef: null,
    prevVolRef: null,
    prevVolumeRef: 0.5,
    exitingPiPViaOurUIButtonRef: null,
    holdTimer: null,
    trackerRef: new VideoTelemetryTimer(),
    isHolding: null,
    glowCanvasRef: null,
    volTimeoutRef: null,
    lastKeyPress: null,
    hideVolumeTimer: null,
  });
  useImperativeHandle(ref, () => videoRef.current);

  const [previousVolume, setPreviousVolume] = useState(state.volume || 40);
  const isCustomWidth = useMediaQuery("(max-width:1014px)");

  // Conditional Constants

  /* HTML 5 Container */
  const containerAspectRatio = isMini
    ? "calc((var(--vtd-watch-flexy-player-width-ratio) / var(--vtd-watch-flexy-player-height-ratio)))"
    : "";
  const containerPosition =
    isTheatre && !isMini ? "relative" : isMini ? "fixed" : "absolute";
  const containerWidth = isMini ? "480px" : "100%";
  const containerHeight = isMini ? "auto" : "100%";
  const containerTopOffset = isMini ? "15px" : 0;
  const containerLeftOffset = isMini ? "15px" : 0;
  const containerRightOffset = isMini ? "auto" : "";
  const containerZindex = isMini ? 9999 : 0;

  /* HTML 5 VideoPlayer */
  const playerVisiblity = state.videoReady ? "visible" : "hidden";
  const playerAspectRatio = containerAspectRatio;
  const playerWidth = isMini ? "480px" : state.playerWidth;
  const playerHeight = isMini ? "auto" : state.playerHeight;
  const playerTopOffset = state.topOffset;
  const playerLeftOffset = isMini ? 0 : state.leftOffset;
  const playerRightOffset = isMini ? "auto" : "";
  const playerBorderRadius = isTheatre && !isMini ? "0" : "8px";

  /* Utility Functions */

  const showControls = () => {
    if (state.controlOpacity !== 1) updateState({ controlOpacity: 1 });
    if (state.titleOpacity !== 1) updateState({ titleOpacity: 1 });
  };

  const hideControls = () => {
    if (state.controlOpacity !== 0) updateState({ controlOpacity: 0 });

    if (state.titleOpacity !== 0) updateState({ titleOpacity: 0 });
  };

  const handleVideoCursorVisiblity = (prop) => {
    const container = containerRef.current;
    if (!container) return;

    container
      .querySelectorAll(".video-overlay, .controls")
      .forEach((el) =>
        prop === "hide"
          ? el.classList.add("hide-cursor")
          : el.classList.remove("hide-cursor")
      );
  };

  useEffect(() => {
    if (state.isMuted) {
      updateState({ volumeSlider: 0 });
    } else {
      updateState({ volumeSlider: state.volume });
    }
  }, [state.isMuted, state.volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (state.isMuted) {
      video.muted = true;
    } else {
      video.muted = false;
    }
  }, [state.isMuted]);

  // const { data, isLoading, isError, error } = useQuery({
  //   queryKey: ["video", videoId],
  //   queryFn: () => fetchVideoById(videoId),
  //   refetchOnWindowFocus: false,
  //   enabled: !!videoId,
  // });

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

  const handlePlay = async () => {
    const video = videoRef?.current;
    const tracker = trackerRef.current;
    if (!video || !tracker) return;
    tracker.start(video, videoId, setTimeStamp, userResumeTime);

    try {
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
    updateState({ isReplay: false, canPlay: true, isPlaying: true });
  };
  useEffect(() => {
    if (videoRef.current) {
      savedVideoRef.current = videoRef.current;
    }
  }, [videoRef.current]);

  useEffect(() => {
    return () => {
      const video = savedVideoRef.current;
      const tracker = trackerRef.current;

      if (tracker) tracker.reset();

      if (!video || !tracker) {
        console.log("No video or tracker at unmount");
        return;
      }

      const telemetryData = tracker.end(video, isSubscribedTo ? 1 : 0);
      if (telemetryData) {
        console.log("Sending telemetry");
        sendYouTubeStyleTelemetry(videoId, video, telemetryData, setTimeStamp);
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (isOpen || isFullscreen) return;
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

      if (scrollY > threshold && !hideMini && state.canPlay) {
        setIsMini(true);
      }
      if (scrollY < threshold) {
        setIsMini(false);

        if (hideMini) {
          setHideMini(false);
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
  }, [
    isTheatre,
    data?.data?._id,
    hideMini,
    state.canPlay,
    isOpen,
    isFullscreen,
  ]);

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
        isCustomWidth ||
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

  const handleEnterPiP = useCallback(() => {
    showControls();
    updateState({ isPipActive: true });

    if (!prevVideoRef.current) videoRef.current?.play();
  }, []);

  const handleLeavePiP = useCallback(() => {
    updateState({
      showIcon: false,
      isPipActive: false,
      isPlaying: videoRef.current?.paused ? false : true,
    });

    exitingPiPViaOurUIButtonRef.current = false;
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
    videoPauseStatus.current = false;
    if (clickTimeout.current || state.isLongPress) return;
    clickCount.current += 1;
    if (clickCount.current === 1) {
      clickTimeout.current = setTimeout(() => {
        console.log("Single Click");

        togglePlayPause();

        updateState({ showIcon: true, showVolumeIcon: false });

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
    console.log("MOUSE UP")
    exitDoubleSpeed(e);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("touchend", handleMouseUp);
    window.removeEventListener("touchcancel", handleMouseUp);
  };
  const DoubleSpeed = (e) => {
    if ((e.type === "mousedown" && e.button === 2) || isHolding.current) return;
    const video = videoRef.current;
    if (!video) return;

    clearTimeout(clickTimeout.current);
    clickTimeout.current = null;
    prevOpacityRef.current = state.controlOpacity;
    console.log("video paused", video.paused);
    videoPauseStatus.current = video.paused;

    pressTimer.current = setTimeout(() => {
      console.log("down");
      updateState({ isLongPress: true, showIcon: false });
      hideControls();
      if (video.paused) {
        video.play();
        updateState({ isPlaying: true });
      }
      video.playbackRate = 2.0;
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

    updateState({ showIcon: true, showVolumeIcon: false });
    console.log({
      longPress: state.isLongPress,
      isPlaying: state.isPlaying,
      videoPauseStatusCurrent: videoPauseStatus.current,
    });

    if (isHolding.current) {
      if (videoPauseStatus.current) {
        console.log("play");
        video.play();
        updateState({ isPlaying: true });
        showControls();
        video.playbackRate = playbackSpeed;

      } else {
        video.pause();
        console.log("pause");
        showControls();
        updateState({ isPlaying: false });

      }
    } else if (videoPauseStatus.current && !state.isLongPress) {
      video.pause();
      updateState({ isPlaying: false });
    }

    updateState({
      controlOpacity:
        isInside.current && prevOpacityRef.current === 1
          ? prevOpacityRef.current
          : 0,
      titleOpacity:
        isInside.current && prevOpacityRef.current === 1
          ? prevOpacityRef.current
          : 0,
    });

    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      updateState({ isLongPress: false });
      pressTimer.current = null;
      console.log("up");
    }, 200);
    updateState({ isFastPlayback: false });

    video.playbackRate = playbackSpeed;
  };
  const handleContainerMouseMove = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!state.isLongPress) {
      handleVideoCursorVisiblity("show");

      isInside.current = true;
      showControls();
    }
  };
  const handleMouseMove = (e) => {
    const container = containerRef.current;
    const video = videoRef.current;

    const rect = video.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    const inside =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    if (videoPauseStatus.current) return;
    isInside.current = inside;

    handleVideoCursorVisiblity("show");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    timeoutRef.current = setTimeout(() => {
      const controls = container.getElementsByClassName("MuiPopper-root");

      if (
        state.isPlaying &&
        !controls.length &&
        !state.isReplay &&
        !isHolding.current &&
        !state.showSettings
      ) {
        hideControls();
        handleVideoCursorVisiblity("hide");
      }
    }, 2000);
  };

  useEffect(() => {
    const container = containerRef.current;
    const fullScreenTitle = fullScreenTitleRef.current;
    const isInsideRef = isInside.current;
    const video = videoRef.current;

    if (!container || !video || !fullScreenTitle || !isInsideRef) return;

    if (!state.isPlaying) {
      showControls();
      fullScreenTitle.classList.add("show");
      return;
    }

    const handleMouseMove = () => {
      let lastCall = 0;
      const throttleMs = 100;

      const now = Date.now();
      if (now - lastCall < throttleMs) return;
      lastCall = now;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        const currentControls =
          container.getElementsByClassName("MuiPopper-root");
        if (
          !currentControls.length &&
          !isHolding.current &&
          !state.showSettings
        ) {
          hideControls();
          handleVideoCursorVisiblity("hide");
        }
      }, 2000);
    };

    container.addEventListener("mousemove", handleMouseMove);

    handleMouseMove();

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [
    state.isPlaying,
    state.controlOpacity,
    state.isLongPress,
    state.showSettings,
  ]);
  const handleMouseOut = () => {
    const container = containerRef.current;
    const video = videoRef.current;
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
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isBufferingLocal = false;
    let lastTime = video.currentTime;
    let progressCheckId;

    const handleBufferingStart = () => {
      if (!isBufferingLocal) {
        isBufferingLocal = true;
        updateState({ isBuffering: true });
      }
    };

    const handleBufferingEnd = () => {
      if (isBufferingLocal) {
        isBufferingLocal = false;
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

    progressCheckId = setInterval(checkProgress, 500);

    return () => {
      video.removeEventListener("waiting", handleBufferingStart);
      video.removeEventListener("stalled", handleBufferingStart);
      video.removeEventListener("playing", handleBufferingEnd);
      video.removeEventListener("canplay", handleBufferingEnd);
      clearInterval(progressCheckId);
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
    if (hideVolumeTimer.current) clearTimeout(hideVolumeTimer.current);

    const step = 0.05;
    let newVol = video.volume;

    updateState((prev) => ({ ...prev, isVolumeChanged: false }));

    requestAnimationFrame(() => {
      updateState((prev) => {
        newVol =
          key === "Up"
            ? Math.min(1, video.volume + step)
            : Math.max(0, video.volume - step);
        const newState = {
          ...prev,
          isFastPlayback: false,
          showIcon: false,
          showVolumeIcon: true,
          isVolumeChanged: true,
        };

        if (key === "Up") {
          newState.volumeUp = true;
          newState.volumeDown = false;
        } else if (key === "Down") {
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
        newState.volume = newVol * 40;
        newState.volumeSlider = !prev.isMuted ? newVol * 40 : 0;
        setPreviousVolume((p) => (!prev.isMuted ? prev.volume : p));
        console.log("prev.vol", prev.volume);

        if (state.customPlayback) {
          video.playbackRate = prevSliderSpeedRef.current;
        } else {
          video.playbackRate = prevSpeedRef.current;
        }

        return newState;
      });

      const icon = volumeIconRef.current;
      if (icon) {
        icon.classList.remove("pressed");
        requestAnimationFrame(() => icon.classList.add("pressed"));
      }
    });

    hideVolumeTimer.current = setTimeout(() => {
      updateState((prev) => ({ ...prev, isVolumeChanged: false }));
    }, 500);
  };

  const updateVolumeIconStates = (volume) => {
    const video = videoRef.current;
    if (!video) return;

    const prev = prevVolumeRef.current;
    const curr = volume;

    updateState((prevState) => {
      const isMutedFromHigh = prevState.isMuted && prev >= 0.5;
      const isUnmutedWithJump = !prevState.isMuted && curr > 0.5 && prev === 0;

      let newState = { ...prevState };

      if (isMutedFromHigh || isUnmutedWithJump) {
        console.log("UNMUTED OR MUTED WITH JUMP");
        console.log({
          volume: prevState.volume,
          currVolume: state.volume,
          isMuted: prevState.isMuted,
          volumeSlider: prevState.volumeSlider,
          prev: prev,
          curr: curr,
        });
        newState.jumpedToMax = true;
        newState.isIncreased = false;
        return newState;
      }

      if (curr >= 0.5 && prev < 0.5 && !isMutedFromHigh && !isUnmutedWithJump) {
        clearTimeout(animateTimeoutRef.current);
        console.log({
          xd: "xd",
        });

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
  };

  useEffect(() => {
    const normalizedVolume = state.volumeSlider / 40;
    updateVolumeIconStates(normalizedVolume);
    prevVolRef.current = normalizedVolume;

    return () => {
      clearTimeout(animateTimeoutRef.current);
    };
  }, [state.volumeSlider]);

  useEffect(() => {
    if (isFullscreen) {
      if (state.prevTheatre) {
        setIsTheatre(false);
      }
    } else {
      if (state.prevTheatre) {
        setIsTheatre(true);
      }
    }
  }, [state.prevTheatre]);

  const toggleFullScreen = () => {
    const el = document.documentElement;
    if (!el) return;

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isFullscreen) {
      el.requestFullscreen?.().then(() => {
        requestAnimationFrame(() => {
          el.scrollTop = 0;
          setIsMini(false);
        });
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

    handleVideoCursorVisiblity("show");

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
      tracker.trackVideoState(video, fromTime, setTimeStamp);
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
  }, [state.isReplay]);

  const handleForwardSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (pressTimer.current) clearTimeout(pressTimer.current);
    updateState({ isForwardSeek: true, isFastPlayback: false });

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
    updateState((prev) => {
      const video = videoRef.current;
      const tracker = trackerRef.current;
      if (!video) return prev;

      const fromTime = parseFloat(video.currentTime.toFixed(3));

      if (!prev.isMuted) {
        console.log("Muting via toggle");

        setPreviousVolume(prev.volume);
        video.muted = true;

        if (tracker && !video.paused) {
          tracker.handleMuteToggle(video, fromTime);
        }

        return { ...prev, isMuted: true };
      } else {
        console.log("Unmuting via toggle. Restoring volume:", previousVolume);

        video.volume = previousVolume / 40;
        video.muted = false;

        if (tracker && !video.paused) {
          tracker.handleMuteToggle(video, fromTime);
        }

        return { ...prev, isMuted: false, volume: previousVolume };
      }
    });
  }, [previousVolume]);

  const updateVolumeIconState = useCallback(() => {
    const currentVolume = videoRef.current?.volume ?? 0;

    if (currentVolume === 0) {
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

  // Updating Video Container Layout

  useEffect(() => {
    const flexyWatchContainer = watchRef.current;
    if (!containerRef.current || !videoRef.current || !flexyWatchContainer)
      return;

    const updateSize = () => {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;

      const video = videoRef.current;
      if (!video.videoWidth || !video.videoHeight) return;

      const targetAspectRatio = video.videoWidth / video.videoHeight;

      let videoWidth = video.videoWidth;
      let videoHeightLocal = Math.ceil(videoWidth / targetAspectRatio);

      if (videoHeightLocal > containerHeight) {
        videoHeightLocal = containerHeight;
        videoWidth = Math.floor(videoHeightLocal * targetAspectRatio);
      }
      const fsWidth = containerHeight * targetAspectRatio;

      const left = isFullscreen
        ? Math.floor((containerWidth - fsWidth) / 2)
        : Math.floor((containerWidth - videoWidth) / 2);
      const top = isFullscreen
        ? 0
        : Math.floor((containerHeight - videoHeightLocal) / 2);

      flexyWatchContainer.style.setProperty(
        "--vtd-watch-flexy-player-height-ratio",
        video.videoHeight / video.videoWidth
      );

      updateState({
        videoContainerWidth: containerWidth,
        videoHeight: videoHeightLocal,
        playerWidth: isFullscreen
          ? `${containerHeight * targetAspectRatio}px`
          : `${videoWidth}px`,
        playerHeight: isFullscreen
          ? `${containerHeight}px`
          : `${videoHeightLocal}px`,
        leftOffset: `${left}px`,
        topOffset: isFullscreen ? 0 : `${top}px`,
      });
    };

    const container = containerRef.current;
    const observer = new ResizeObserver(updateSize);
    if (container) observer.observe(container);

    window.addEventListener("resize", updateSize);

    const video = videoRef.current;
    video.addEventListener("loadedmetadata", updateSize);

    updateSize();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
      video.removeEventListener("loadedmetadata", updateSize);
    };
  }, [isTheatre, data?.data?._id, isFullscreen]);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let rafId = null;

    const handleKeyPress = (e) => {
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
        updateState({ showIcon: true, showVolumeIcon: false });
        togglePlayPause();
      } else if (e.code === "Space") {
        e.preventDefault();
        if (isHolding.current) return;
        showControls();
        handleVideoCursorVisiblity("show");

        holdTimer.current = setTimeout(() => {
          DoubleSpeed(e);
          isHolding.current = true;
          holdTimer.current = null;
        }, 200);
      } else if (e.shiftKey && e.key.toLowerCase() === "n") {
        handleNextVideo();
      } else if (e.key.toLowerCase() === "f") {
        toggleFullScreen();
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          handleVolume(e.key === "ArrowUp" ? "Up" : "Down");
          rafId = null;
        });
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();

        const now = Date.now();
        if (now - lastKeyPress.current < 100) return;
        lastKeyPress.current = now;
        const icon = volumeIconRef.current;
        updateState({
          showIcon: false,
          showVolumeIcon: true,
          isVolumeChanged: true,
        });

        icon.classList.remove("pressed");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            icon.classList.add("pressed");
          });
        });
        handleVolumeToggle();
        updateVolumeIconState();
        if (volTimeoutRef.current) {
          clearTimeout(volTimeoutRef.current);
        }
        volTimeoutRef.current = setTimeout(() => {
          updateState({ isVolumeChanged: false });
        }, 400);
      } else if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        if (!isFullscreen && videoRef.current) {
          setIsUserInteracted(true);
          startTransition(() => {
            setIsTheatre((prev) => !prev);
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

          updateState({ showIcon: true, showVolumeIcon: false });

          togglePlayPause();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(volTimeoutRef.current);
      volTimeoutRef.current = null;
    };
  }, [
    handleForwardSeek,
    handleBackwardSeek,
    togglePlayPause,
    handleNextVideo,
    playbackSliderSpeed,
    playbackSpeed,
    handleVolumeToggle,
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

    const duration = video.duration;
    const watchTime = video.currentTime;

    // if (!telemetrySentRef.current && Math.floor(watchTime) >= 10) {
    //   telemetrySentRef.current = true;
    //   console.log("🎯 10 seconds passed, telemetry sending...");
    //   const data = getCurrentVideoTelemetryData(userId, videoId, video);
    //   sendTelemetry([data]);
    //   return;
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
    updateState({ canPlay: false, isReplay: true });

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
        className="player-inner"
        sx={{
          position: "relative",
          height: isFullscreen ? "100%" : "",
          paddingTop:
            isTheatre || isCustomWidth || isMobile || isFullscreen
              ? ""
              : "calc(var(--vtd-watch-flexy-player-height-ratio) / var(--vtd-watch-flexy-player-width-ratio) * 100%)",
        }}
      >
        <Box
          data-theatre={isTheatre}
          data-fullbleed={isCustomWidth}
          data-fullscreen={isFullscreen}
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
            position: isTheatre || isCustomWidth ? "relative" : "absolute",
            minHeight: "var(--vtd-watch-flexy-min-player-height)",
            maxHeight: "var(--vtd-watch-flexy-max-player-height)",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
          }}
        >
          {!isTheatre && (
            <Box
              sx={{
                display: isMini ? "none" : "block",
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
              aspectRatio: containerAspectRatio,
              position: containerPosition,
              width: containerWidth,
              height: containerHeight,
              top: containerTopOffset,
              left: containerLeftOffset,
              right: containerRightOffset,
              zIndex: containerZindex,
            }}
          >
            {" "}
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
                  src={data?.data?.videoFile.url}
                  muted={state.isMuted}
                  key={data?.data?.videoFile.url}
                  ref={videoRef}
                  crossOrigin="anonymous"
                  controlsList="nodownload"
                  id="video-player"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnd}
                  onPlay={handlePlay}
                  onLoadedMetadata={handleLoadedMetadata}
                  style={{
                    position: "absolute",
                    visibility: playerVisiblity,
                    aspectRatio: playerAspectRatio,
                    width: playerWidth,
                    height: playerHeight,
                    left: playerLeftOffset,
                    top: playerTopOffset,
                    right: playerRightOffset,
                    borderRadius: playerBorderRadius,
                  }}
                ></video>
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
                setPreviousVolume={setPreviousVolume}
                playbackSliderSpeed={playbackSliderSpeed}
                setPlaybackSliderSpeed={setPlaybackSliderSpeed}
                customPlayback={state.customPlayback}
                isMini={isMini}
                setIsMini={setIsMini}
                {...state}
                updateState={updateState}
              />
            </Box>
            <Box
              className={`${isFullscreen ? "title-background-overlay" : "hide"}`}
            ></Box>
            <Box
              className="video-cover"
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
              {state.isFastPlayback && !state.showIcon && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "20px",
                    width: "72px",
                    left: "50%",
                    transform: "translateX(-50%)",
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

                  <FastForwardIcon sx={{ width: "1.1rem", height: "1.1rem" }} />
                </Box>
              )}
              {state.isVolumeChanged && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "60px",
                    display: "flex",
                    left: "50%",
                    transform: "translateX(-50%)",
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
                    <Box className="forwardSeek-arrow" component={"span"}></Box>
                    <Box className="forwardSeek-arrow" component={"span"}></Box>
                    <Box className="forwardSeek-arrow" component={"span"}></Box>
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
                      <PlayArrowIcon className="playback-icon" sx={iconStyle} />
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
                  display: isUserInteracted || isMini ? "none" : "flex",
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
              className={`cancel-mini-btn ${isMini ? "" : "hide"}`}
              onClick={() => {
                setIsMini(false);
                setHideMini(true);
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
                opacity: !isFullscreen ? 0 : state.titleOpacity,
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
    </>
  );
}

export default React.forwardRef(VideoPlayer);
