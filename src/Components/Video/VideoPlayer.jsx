import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
  startTransition,
} from "react";
import { FastAverageColor } from "fast-average-color";
import { keyframes, useMediaQuery, useTheme } from "@mui/system";
import { fetchVideoById } from "../../apis/videoFn";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import SmartDisplayIcon from "@mui/icons-material/SmartDisplay";
import { Box, Icon, IconButton, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";

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

import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
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

import {
  flushTelemetryQueue,
  getCurrentVideoTelemetryData,
  getSavedHoverTime,
  startTelemetry,
} from "../../helper/Telemetry";
import { getWatchHistory } from "../../apis/userFn";
import { sendTelemetry } from "../../apis/sendTelemetry";

function VideoPlayer({
  videoId,
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

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);
  const fullScreenTitleRef = useRef(null);
  const historyIntervalRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { open: isOpen } = drawerContext ?? {};
  const { data: dataContext } = userContext ?? {};
  const userId = dataContext?._id;
  const isAuthenticated = dataContext || null;
  const { isUserInteracted, setIsUserInteracted } =
    userInteractionContext ?? {};
  const videoPauseStatus = useRef(null);
  const prevVolumeRef = useRef(null);
  const [prevTheatre, setPrevTheatre] = useState(false);
  const [videoHeight, setVideoHeight] = useState(0);
  const [playerHeight, setPlayerHeight] = useState("0px");
  const [playerWidth, setPlayerWidth] = useState("0px");
  const [controlOpacity, setControlOpacity] = useState(0);
  const [titleOpacity, setTitleOpacity] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isPiActive, setIsPiPActive] = useState(false);
  const [canPlay, setCanPlay] = useState(true);
  const [timeStamp, setTimeStamp] = useState(0);
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const prevVideoRef = useRef(null);
  const playIconRef = useRef(null);
  const volumeIconRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [showVolumeIcon, setShowVolumeIcon] = useState(false);
  const [volumeUp, setVolumeUp] = useState(false);
  const [leftOffset, setLeftOffset] = useState("0px");
  const [topOffset, setTopOffset] = useState("0px");
  const [volumeDown, setVolumeDown] = useState(false);
  const [volumeMuted, setVolumeMuted] = useState(false);
  const pressTimer = useRef(null);
  const clickTimeout = useRef(null);
  const clickCount = useRef(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferedVal, setBufferedVal] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showBufferingIndicator, setShowBufferingIndicator] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [isForwardSeek, setIsForwardSeek] = useState(false);
  const [isBackwardSeek, setIsBackwardSeek] = useState(false);
  const [volume, setVolume] = useState(40);
  const [isVolumeChanged, setIsVolumeChanged] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isIncreased, setIsIncreased] = useState(false);
  const [jumpedToMax, setJumpedToMax] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isReplay, setIsReplay] = useState(false);
  const [videoContainerWidth, setVideoContainerWidth] = useState("0px");
  const [isFastPlayback, setIsFastPlayback] = useState(false);
  const animateTimeoutRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const prevHoverStateRef = useRef(null);
  const telemetrySentRef = useRef(null);
  const holdTimer = useRef(null);
  const isHolding = useRef(null);
  const glowCanvasRef = useRef(null);
  const prevSpeedRef = useRef(null);
  const prevSliderSpeedRef = useRef(null);
  const [isMini, setIsMini] = useState(false);
  const [hideMini, setHideMini] = useState(false);
  const [customPlayback, setCustomPlayback] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
    enabled: !!videoId,
  });

  const {
    data: userHistory,
    isHistoryLoading,
    isHistoryError,
    historyError,
  } = useQuery({
    queryKey: ["userHistory"],
    queryFn: getWatchHistory,
    enabled: !!userId,
  });

  const userResumeTime = userId
    ? (userHistory?.data?.find((entry) => entry.video?._id === videoId)
        ?.currentTime ?? 0)
    : 0;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPause = () => flushSync(() => setIsPlaying(false));
    video.addEventListener("pause", onPause);
    return () => video.removeEventListener("pause", onPause);
  }, [setIsPlaying]);

  const storeTimeStamp = () => {
    const video = videoRef.current;
    if (!video) return;
    const currentTime = Math.floor(video.currentTime);
    const duration = Math.floor(video.duration);
    if (currentTime > 0 && currentTime < duration) {
      setTimeStamp(video.currentTime);
    }
  };

  const handlePlay = (event) => {
    const video = event.target;
    if (!video) return;
        console.log("Start tele at time update")
    startTelemetry((userId, videoId, video));
    setIsReplay(false);
    setCanPlay(true);
    setIsPlaying(true);
  };

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

      if (scrollY > threshold && !hideMini && canPlay) {
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
  }, [isTheatre, data?.data?._id, hideMini, canPlay, isOpen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
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
    if (controlOpacity !== 1) setControlOpacity(1);
  };

  const hideControls = () => {
    if (controlOpacity !== 0) setControlOpacity(0);
  };

  const exitingPiPViaOurUIButtonRef = useRef(false);

  const handleEnterPiP = useCallback(() => {
    showControls();
    setIsPiPActive(true);

    if (!prevVideoRef.current) videoRef.current?.play();
  }, []);

  const handleLeavePiP = useCallback(() => {
    setShowIcon(false);

    setIsPiPActive(false);

    exitingPiPViaOurUIButtonRef.current = false;

    requestAnimationFrame(() => {
      setIsPlaying(videoRef.current?.paused ? false : true);
    });
  }, [setIsPlaying]);

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
    if (isReplay) return;
    if (clickTimeout.current || isLongPress) return;
    videoPauseStatus.current = false;
    clickCount.current += 1;
    if (clickCount.current === 1) {
      clickTimeout.current = setTimeout(() => {
        togglePlayPause();
        flushSync(() => {
          setShowIcon(true);
          setShowVolumeIcon(false);
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
    prevHoverStateRef.current = controlOpacity;

    pressTimer.current = setTimeout(() => {
      console.log("down");
      setIsLongPress(true);
      hideControls();
      setTitleOpacity(0);
      setShowIcon(false);
      if (video.paused) {
        video.play();
        videoPauseStatus.current = true;
        setIsPlaying(true);
      }

      video.playbackRate = 2.0;
      setPlaybackSpeed(2.0);
      setPlaybackSliderSpeed(playbackSpeed);
      setIsFastPlayback(true);
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
      setShowIcon(true);
      setShowVolumeIcon(false);
    });
    if (videoPauseStatus.current) {
      video.pause();
      setIsPlaying(false);
      showControls();
      setTitleOpacity(1);
    }
    flushSync(() => {
      setControlOpacity(
        isInside.current && prevHoverStateRef.current === 1
          ? prevHoverStateRef.current
          : 0
      );
      setTitleOpacity(
        isInside.current && prevHoverStateRef.current === 1
          ? prevHoverStateRef.current
          : 0
      );
    });
    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      setIsLongPress(false);
      pressTimer.current = null;
      console.log("up");
    }, 200);
    setIsFastPlayback(false);
    if (customPlayback) {
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
    if (!isLongPress) {
      console.log("move");

      container
        .querySelector(".video-overlay")
        ?.classList.remove("hide-cursor");
      container.querySelector(".controls")?.classList.remove("hide-cursor");
      isInside.current = true;
      showControls();
      setTitleOpacity(1);
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
        isPlaying &&
        !controls.length &&
        !isReplay &&
        !isHolding.current &&
        !showSettings
      ) {
        hideControls();
        setTitleOpacity(0);
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

    if (!isPlaying) {
      showControls();
      setTitleOpacity(1);
      fullScreenTitle.classList.add("show");
      return;
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        if (!controls.length && !isHolding.current && !showSettings) {
          hideControls();
          setTitleOpacity(0);
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
  }, [isPlaying, controlOpacity, isLongPress, isInside]);

  const handleMouseOut = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    const isFullscreen = !!document.fullscreenElement;
    if (
      !container ||
      !video ||
      isFullscreen ||
      !isPlaying ||
      isReplay ||
      showSettings
    )
      return;

    hideControls();
    setTitleOpacity(0);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isBufferingLocal = false;
    let lastTime = video.currentTime;
    let progressCheckId;

    const handleBufferingStart = () => {
      if (!isBufferingLocal) {
        console.log("Buffering started");
        isBufferingLocal = true;
        setIsBuffering(true);
      }
    };

    const handleBufferingEnd = () => {
      if (isBufferingLocal) {
        console.log("Buffering ended");
        isBufferingLocal = false;
        setIsBuffering(false);
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

    if (isBuffering && !isForwardSeek && !isBackwardSeek) {
      timeout = setTimeout(() => {
        setShowBufferingIndicator(true);
      }, 100);
    } else {
      setShowBufferingIndicator(false);
    }

    return () => clearTimeout(timeout);
  }, [isBuffering, isForwardSeek, isBackwardSeek, videoId]);

  const handleVolume = (key) => {
    const video = videoRef.current;
    if (!video) return;
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setIsFastPlayback(false);
    setShowIcon(false);

    const icon = volumeIconRef.current;
    flushSync(() => {
      setShowIcon(false);
      setShowVolumeIcon(true);
      setIsVolumeChanged(true);
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
      setVolumeDown(false);
      setIsMuted(false);
      setVolumeUp(true);
      const newVol = (video.volume = Math.min(1, video.volume + step));
      setVolume(newVol * 40);
    } else if (key === "Down") {
      setVolumeUp(false);
      const newVol = (video.volume = Math.max(0, video.volume - step));
      if (newVol > 0) {
        setVolumeDown(true);
        setVolumeMuted(false);
      } else {
        setVolumeMuted(true);
        setVolumeDown(false);
      }
      setVolume(newVol * 40);
    }

    if (customPlayback) {
      video.playbackRate = prevSliderSpeedRef.current;
    } else {
      video.playbackRate = prevSpeedRef.current;
    }

    setTimeout(() => {
      setIsVolumeChanged(false);
    }, 500);
  };

  const prevVolRef = useRef(0);

  const updateVolumeStates = (volume) => {
    const prev = prevVolRef.current;
    const curr = volume;

    const isUnmutedWithJump = prev === 0 && curr >= 0.5;
    const isMutedFromHigh = prev >= 0.5 && curr === 0;

    if (isUnmutedWithJump || isMutedFromHigh) {
      setJumpedToMax(true);
      setIsIncreased(false);
    }

    if (curr === 0) {
      setIsMuted(true);
      setIsIncreased(false);
      animateTimeoutRef.current = setTimeout(() => setIsAnimating(true), 300);
      return;
    }

    if (curr >= 0.5 && prev < 0.5) {
      clearTimeout(animateTimeoutRef.current);
      setIsAnimating(false);
      setIsMuted(false);
      setIsIncreased(true);
      return;
    }

    if (curr >= 0.5) {
      clearTimeout(animateTimeoutRef.current);
      setIsMuted(false);
      setIsAnimating(false);
      return;
    }

    clearTimeout(animateTimeoutRef.current);
    setIsMuted(false);
    setIsAnimating(false);
    setIsIncreased(false);
    setJumpedToMax(false);
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
    const normalizedVolume = volume / 40;
    debouncedUpdateVolumeStates(normalizedVolume);
    return () => {
      clearTimeout(animateTimeoutRef.current);
    };
  }, [volume, debouncedUpdateVolumeStates]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;

      if (isFullscreen) {
        if (prevTheatre) {
          setIsTheatre(false);
        }
      } else {
        if (prevTheatre) {
          setIsTheatre(true);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [prevTheatre]);

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
    if (!video || !container || !canPlay) return;

    container.querySelector(".video-overlay")?.classList.remove("hide-cursor");
    container.querySelector(".controls")?.classList.remove("hide-cursor");
    if (playIconRef.current?.classList) {
      playIconRef.current.classList.add("click");
    } else {
      console.warn("playIconRef is null");
    }

    if (video.paused || video.ended) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }

    setIsUserInteracted(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () =>
      !isForwardSeek && !isBackwardSeek && setLoadingVideo(true);
    const handleWaiting = () =>
      !isForwardSeek && !isBackwardSeek && setLoadingVideo(true);
    const handleCanPlay = () => {
      setLoadingVideo(false);
    };
    const handlePlaying = () => {
      setLoadingVideo(false);
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
  }, [videoRef.current, videoId, isForwardSeek, isBackwardSeek]);

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
          setBufferedVal(bufferProgress);
        } else {
          setBufferedVal(0);
        }
      } catch (e) {
        console.warn("Buffered read error", e);
        setBufferedVal(0);
      }
    };

    const events = ["progress", "timeupdate", "seeked"];
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
    if (!video || video.readyState < 3) return;
    if (isUserInteracted) {
      videoRef.current?.play();
    }
  }, [isUserInteracted]);

  const handleLoadedMetadata = async () => {
    const video = videoRef?.current;
    if (!video) return;

    if (!isUserInteracted) {
      showControls();
      setTitleOpacity(1);
    }

    const guestResumeTime = getSavedHoverTime(videoId);

    console.log("guest", guestResumeTime);
    console.log("user", userResumeTime);
    const isValidGuestResumeTime =
      isFinite(guestResumeTime) &&
      guestResumeTime > 0 &&
      guestResumeTime < video.duration;
    const isValidUserResumeTime =
      isFinite(userResumeTime) &&
      userResumeTime > 0 &&
      userResumeTime < video.duration;

    const shouldPlay =
      isUserInteracted &&
      (isAuthenticated ? isValidUserResumeTime : isValidGuestResumeTime);

    if (!shouldPlay) return;

    if (isAuthenticated && isValidUserResumeTime && isUserInteracted) {
      video.currentTime = userResumeTime;
    } else if (!isAuthenticated && isValidGuestResumeTime && isUserInteracted) {
      video.currentTime = guestResumeTime;
    }
    try {
      await video.play();
      setIsPlaying(true);
    } catch (err) {
      setIsPlaying(false);
      console.warn("Video play failed:", err);
    }
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
      if (video.currentTime < video.duration && isReplay) {
        setIsReplay(false);
        video.play();
      }
    };

    video.addEventListener("timeupdate", checkReplayReset);

    return () => {
      video.removeEventListener("timeupdate", checkReplayReset);
    };
  }, [isReplay]);

  const handleForwardSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setIsForwardSeek(true);
    setIsFastPlayback(false);

    videoRef.current.currentTime += 5;
    if (!video.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    }
    if (customPlayback) {
      video.playbackRate = prevSliderSpeedRef.current;
    } else {
      video.playbackRate = prevSpeedRef.current;
    }

    setTimeout(() => setIsForwardSeek(false), 300);
  }, []);

  const handleBackwardSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setIsFastPlayback(false);

    const wasEnded = video.ended;

    if (isReplay && wasEnded) {
      video.currentTime = Math.max(video.duration - 5, 0);
      setIsReplay(false);
      video.play();
      setIsPlaying(true);
      return;
    }
    setIsBackwardSeek(true);

    if (customPlayback) {
      video.playbackRate = prevSliderSpeedRef.current;
    } else {
      video.playbackRate = prevSpeedRef.current;
    }
    video.currentTime = Math.max(video.currentTime - 5, 0);

    if (!video.paused) {
      setIsPlaying(true);
    }

    setTimeout(() => setIsBackwardSeek(false), 300);
  }, [isReplay]);

  const handleVolumeToggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentVolume = video.volume;

    if (currentVolume > 0) {
      prevVolumeRef.current = currentVolume;
      video.volume = 0;
      setVolume(0);
    } else {
      const restoreVol = prevVolumeRef.current || 1;
      video.volume = restoreVol;
      setVolume(restoreVol * 40);
    }
  }, []);

  const updateVolumeIconState = () => {
    const currentVolume = videoRef.current?.volume ?? 0;

    setVolumeMuted(false);
    setVolumeUp(false);
    setVolumeDown(false);

    if (currentVolume === 0) {
      setVolumeMuted(true);
    } else if (currentVolume > 0.5) {
      setVolumeUp(true);
    } else {
      setVolumeDown(true);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return;

    const updateSize = () => {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      setVideoContainerWidth(containerWidth);
      const targetAspectRatio = 16 / 9;

      let videoWidth = Math.floor(containerWidth);
      let videoHeight = Math.ceil(videoWidth / targetAspectRatio);
      setVideoHeight(videoHeight);

      if (videoHeight > containerHeight) {
        videoHeight = Math.floor(containerHeight);
        videoWidth = Math.floor(videoHeight * targetAspectRatio);
      }
      const left = Math.floor(Math.max((containerWidth - videoWidth) / 2, 0));
      const top = Math.ceil(Math.max((containerHeight - videoHeight) / 2, 0));
      setPlayerWidth(`${videoWidth}px`);
      setPlayerHeight(`${videoHeight}px`);

      setLeftOffset(`${left}px`);
      setTopOffset(`${top}px`);
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

    const normalized = volume / 40;
    video.volume = normalized;
  }, [volume, data?.data?._id, isMuted]);

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
          setShowIcon(true);
          setShowVolumeIcon(false);
        });
        togglePlayPause();
      } else if (e.code === "Space") {
        e.preventDefault();
        if (isHolding.current) return;
        setControlOpacity(1);
        setTitleOpacity(1);
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
          setShowIcon(false);
          setShowVolumeIcon(true);
          setIsVolumeChanged(true);
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
          setIsVolumeChanged(false);
        }, 400);
      } else if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        const isFullscreen = !!document.fullscreenElement;
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
          flushSync(() => {
            setShowIcon(true);
            setShowVolumeIcon(false);
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
    setPrevTheatre(isTheatre);
  }, [isTheatre]);

  const { mutate } = useMutation({
    mutationFn: () => videoView(videoId),
    onMutate: () => {
      setViewCounted(true);
    },
  });
  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error: {error.message}</Typography>;

  const handleTimeUpdate = (event) => {
    const video = videoRef.current;

    if (!video || isNaN(video.duration) || video.duration === 0) return;

    const value = (video.currentTime / video.duration) * 100;
    setProgress(value);
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
    if (viewCounted) return;
    if (hasWatchedEnough) {
      mutate();
    }
  };

  const handleVideoEnd = () => {
    setCanPlay(false);
    setIsReplay(true);

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
            if (!isLongPress) {
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
                display: isMini ? "none" : "block",
                height: videoHeight,
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
              aspectRatio: isMini ? "1.7777777777777777 !important" : "",
              position:
                isTheatre && !isMini
                  ? "relative"
                  : isMini
                    ? "fixed"
                    : "absolute",
              width: isMini ? "480px" : "100%",
              height: isMini ? "auto" : "100%",
              top: isMini ? "15px" : 0,
              left: isMini ? "15px" : 0,
              right: isMini ? "auto" : "",
              zIndex: isMini ? 9999 : 0,
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
                  autoPlay={isUserInteracted}
                  ref={videoRef}
                  crossOrigin="anonymous"
                  id="video-player"
                  preload="auto"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleVideoEnd}
                  onPlay={handlePlay}
                  onLoadedMetadata={handleLoadedMetadata}
                  style={{
                    aspectRatio: isMini ? "1.7777777777777777" : "",
                    position: "absolute",
                    width: isMini ? "480px" : playerWidth,
                    height: isMini ? "auto" : playerHeight,
                    left: isTheatre && !isMini ? leftOffset : 0,
                    top: isTheatre && !isMini ? topOffset : 0,
                    right: isMini ? "auto" : "",
                    objectFit: "cover",
                    borderRadius: isTheatre && !isMini ? "0" : "8px",
                  }}
                >
                  <source src={data?.data?.videoFile.url} type="video/mp4" />
                </video>
              )}
              <VideoControls
                videoRef={videoRef}
                videoId={videoId}
                playlistId={playlistId}
                shuffledVideos={shuffledVideos}
                isLoading={isLoading}
                isReplay={isReplay}
                togglePlayPause={togglePlayPause}
                toggleFullScreen={toggleFullScreen}
                setShowIcon={setShowIcon}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                playlistVideos={playlistVideos}
                isLongPress={isLongPress}
                index={index}
                volume={volume}
                setVolume={setVolume}
                handleVolumeToggle={handleVolumeToggle}
                handleTogglePiP={handleTogglePiP}
                isMuted={isMuted}
                isIncreased={isIncreased}
                jumpedToMax={jumpedToMax}
                isAnimating={isAnimating}
                isMini={isMini}
                isTheatre={isTheatre}
                isPiActive={isPiActive}
                setIsTheatre={setIsTheatre}
                setPrevTheatre={setPrevTheatre}
                videoContainerWidth={videoContainerWidth}
                controlOpacity={controlOpacity}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                playbackSpeed={playbackSpeed}
                setPlaybackSpeed={setPlaybackSpeed}
                spriteUrl={data?.data?.sprite?.url}
                vttUrl={data?.data?.sprite?.vtt}
                isAmbient={isAmbient}
                setIsAmbient={setIsAmbient}
                playbackSliderSpeed={playbackSliderSpeed}
                setPlaybackSliderSpeed={setPlaybackSliderSpeed}
                customPlayback={customPlayback}
                setCustomPlayback={setCustomPlayback}
                bufferedVal={bufferedVal}
                setBufferedVal={setBufferedVal}
                progress={progress}
                setProgress={setProgress}
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
                {isFastPlayback && (
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
                {isVolumeChanged && (
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
                      {Math.round((volume / 40) * 100)}%
                    </Typography>
                  </Box>
                )}
                {isForwardSeek && (
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

                {isBackwardSeek && (
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
                  {(showBufferingIndicator || loadingVideo) &&
                    !isBackwardSeek &&
                    !isForwardSeek && (
                      <IconButton
                        disableRipple
                        className="buffering-progress"
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
                        opacity: showIcon ? 1 : 0,
                        visibility:
                          showIcon && isUserInteracted ? "visible" : "hidden",
                        transition: "opacity 0.2s ease",
                        position: "absolute",
                      }}
                      ref={playIconRef}
                    >
                      {isPlaying ? (
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
                        opacity: showVolumeIcon ? 1 : 0,
                        visibility: showVolumeIcon ? "visible" : "hidden",
                        transition: "opacity 0.2s ease",
                        position: "absolute",
                      }}
                      ref={volumeIconRef}
                    >
                      {volumeDown ? (
                        <VolumeDownIcon className="vol-icon" sx={iconStyle} />
                      ) : volumeUp ? (
                        <VolumeUpIcon className="vol-icon" sx={iconStyle} />
                      ) : volumeMuted ? (
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
                  isUserInteracted && !isPiActive ? DoubleSpeed : null
                }
                onTouchStart={
                  isUserInteracted && !isPiActive ? DoubleSpeed : null
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
                      background: loadingVideo ? "rgba(0,0,0)" : "transparent",
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
                  opacity: !isFullscreen ? 0 : titleOpacity,
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
