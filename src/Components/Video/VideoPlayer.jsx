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
import { addToWatchHistory } from "../../apis/userFn";
import { videoView } from "../../apis/videoFn";
import { useLocation } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import VideoControls from "./VideoControls";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import { useDebouncedCallback } from "../../helper/debouncedFn";
import { flushSync } from "react-dom";
import { OpenContext, useUserInteraction } from "../../routes/__root";

function VideoPlayer({
  videoId,
  playlistId,
  playlistVideos,
  index,
  filteredVideos,
  handleNextVideo,
  isTheatre,
  setIsTheatre,
}) {
  const context = useContext(OpenContext);
    const theme = useTheme();
  
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const timeoutRef = useRef(null);
  const fullScreenTitleRef = useRef(null);
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const { data: dataContext } = context ?? {};
  const isAuthenticated = dataContext || null;
  const { isUserInteracted, setIsUserInteracted } = useUserInteraction();
  const videoPauseStatus = useRef(null);
  const prevVolumeRef = useRef(null);
  const [prevTheatre, setPrevTheatre] = useState(false);
  const [videoHeight, setVideoHeight] = useState(0);
  const [controlOpacity, setControlOpacity] = useState(0);
  const [titleOpacity, setTitleOpacity] = useState(0);
  const [showVolumePanel, setShowVolumePanel] = useState(false);
  const isInside = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const prevVideoRef = useRef(null);
  const playIconRef = useRef(null);
  const volumeIconRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [showVolumeIcon, setShowVolumeIcon] = useState(false);
  const [volumeUp, setVolumeUp] = useState(false);
  const [leftOffset, setLeftOffset] = useState("0px");
  const [volumeDown, setVolumeDown] = useState(false);
  const [volumeMuted, setVolumeMuted] = useState(false);
  const pressTimer = useRef(null);
  const clickTimeout = useRef(null);
  const clickCount = useRef(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferedVal, setBufferedVal] = useState(0);
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
  const [videoContainerWidth, setVideoContainerWidth] = useState("0px");
  const isFastPlayback = videoRef?.current?.playbackRate === 2.0;
  const animateTimeoutRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const glowCanvasRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      const captureCanvas = captureCanvasRef.current;
      const glowCanvas = glowCanvasRef.current;

      if (!video || !captureCanvas || !glowCanvas || video.readyState < 2) return;

      const captureCtx = captureCanvas.getContext('2d');
      const glowCtx = glowCanvas.getContext('2d');

      try {
        captureCtx.drawImage(video, 0, 0, 110, 75);
        const frame = captureCtx.getImageData(0, 0, 110, 75).data;

       
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < frame.length; i += 4) {
          r += frame[i];
          g += frame[i + 1];
          b += frame[i + 2];
          count++;
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        const color = `rgb(${r}, ${g}, ${b})`;

      
        glowCtx.clearRect(0, 0, 110, 75);
        const gradient = glowCtx.createRadialGradient(
          55, 37.5, 5, 
          55, 37.5, 70 
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        glowCtx.fillStyle = gradient;
        glowCtx.fillRect(0, 0, 110, 75);
      } catch (e) {
        console.warn('Glow error:', e);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (isUserInteracted) {
      setControlOpacity(1);
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const controls = container.getElementsByClassName("MuiPopper-root");

    timeoutRef.current = setTimeout(() => {
      if (!controls.length) {
        if (!showVolumePanel) {
          setControlOpacity(0);
          setTitleOpacity(0);
        }
      }
    }, 2000);
  }, [videoId]);

  const handleClick = (e) => {
    if (e.button === 2) return;
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

  const DoubleSpeed = (e) => {
    if (e.button === 2) return;
    const video = videoRef.current;
    if (!video) return;
    clearTimeout(clickTimeout.current);
    clickTimeout.current = null;
    pressTimer.current = setTimeout(() => {
      console.log("down");
      setIsLongPress(true);
      setControlOpacity(0);
      setTitleOpacity(0);
      setShowIcon(false);
      if (video.paused) {
        video.play();
        videoPauseStatus.current = true;
        setIsPlaying(true);
      }

      video.playbackRate = 2.0;
      pressTimer.current = null;
    }, 600);
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
      setControlOpacity(1);
      setTitleOpacity(1);
    }
    flushSync(() => {
      setControlOpacity(isInside.current ? 1 : 0);
      setTitleOpacity(isInside.current ? 1 : 0);
    });

    clearTimeout(pressTimer.current);
    pressTimer.current = setTimeout(() => {
      setIsLongPress(false);

      pressTimer.current = null;
    }, 200);

    video.playbackRate = 1.0;
  };

  useEffect(() => {
    const handleMouseUp = (e) => {
      exitDoubleSpeed(e);
    };

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const fullScreenTitle = fullScreenTitleRef.current;
    const isInsideRef = isInside.current;

    if (!container || !fullScreenTitle || !isInsideRef) return;

    const controls = container.getElementsByClassName("MuiPopper-root");

    if (!isPlaying) {
      setControlOpacity(1);
      setTitleOpacity(1);

      fullScreenTitle.classList.add("show");
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        if (!controls.length) {
          if (!showVolumePanel) {
            setControlOpacity(0);
            setTitleOpacity(0);
          }
        }
      }, 2000);
    }
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      console.log("isPlaying", isPlaying);
      const inside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      if (videoPauseStatus.current) return;
      isInside.current = inside;

      container
        .querySelector(".video-overlay")
        ?.classList.remove("hide-cursor");
      container.querySelector(".controls")?.classList.remove("hide-cursor");

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      timeoutRef.current = setTimeout(() => {
        if (isPlaying && !controls.length) {
          if (!showVolumePanel) {
            setControlOpacity(0);
            setTitleOpacity(0);
            container
              .querySelector(".video-overlay")
              ?.classList.add("hide-cursor");
            container.querySelector(".controls")?.classList.add("hide-cursor");
          }
        }
      }, 2000);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, controlOpacity, isLongPress, isInside]);

  const handleMouseOut = () => {
    const container = containerRef.current;
    const isFullscreen = !!document.fullscreenElement;
    const video = videoRef.current;
    if (!container || !video || isFullscreen || !isPlaying) return;

    setControlOpacity(0);
    setTitleOpacity(0);
  };

  useEffect(() => {
    if (!containerRef.current || !videoRef.current) return;

    const updateLeftOffset = () => {
      if (isTheatre && containerRef.current && videoRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setVideoContainerWidth(containerWidth);
        setVideoHeight(containerRef.current?.offsetHeight);
        const videoWidth = videoRef.current.offsetWidth;
        const offset = (containerWidth - videoWidth) / 2;
        setLeftOffset(`${offset}px`);
      } else {
        setLeftOffset("0px");
      }
    };

    const containerObserver = new ResizeObserver(updateLeftOffset);
    const videoObserver = new ResizeObserver(updateLeftOffset);

    containerObserver.observe(containerRef.current);
    videoObserver.observe(videoRef.current);

    updateLeftOffset();

    return () => {
      containerObserver.disconnect();
      videoObserver.disconnect();
    };
  }, [isTheatre]);

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
  }, [videoId]);

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

    video.playbackRate = 1.0;
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

  const toggleFullScreen = useCallback(() => {
    const el = containerRef.current;
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsUserInteracted(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    container.querySelector(".video-overlay")?.classList.remove("hide-cursor");
    container.querySelector(".controls")?.classList.remove("hide-cursor");
    if (playIconRef.current?.classList) {
      playIconRef.current.classList.add("click");
    } else {
      console.warn("playIconRef is null");
    }
    if (video.paused) {
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
  }, [videoId]);

  const userPlayingVideo = dataContext?.data?.watchHistory?.find(
    (video) => video.video === videoId
  );
  let startTimeDuration = userPlayingVideo?.duration;

  const handleLoadedMetadata = async () => {
    const video = videoRef?.current;
    if (!video) return;

    const isValidStart =
      isFinite(startTimeDuration) &&
      startTimeDuration > 0 &&
      startTimeDuration < video.duration;
    if (!isUserInteracted) {
      setControlOpacity(1);
      setTitleOpacity(1);
    }
    const shouldPlay =
      isUserInteracted && (isAuthenticated ? isValidStart : true);

    if (!shouldPlay) return;

    try {
      if (isAuthenticated && isValidStart && isUserInteracted) {
        video.currentTime = startTimeDuration;
      }

      await video.play();
      setIsPlaying(true);
    } catch (err) {
      setIsPlaying(false);
      console.warn("Video play failed:", err);
    }
  };

  useEffect(() => {
    if (isUserInteracted) {
      handleLoadedMetadata();
    }
  }, [isUserInteracted]);
  useEffect(() => {
    if (location.pathname === "/") {
      setIsUserInteracted(true);
    }
  }, [location.pathname]);

  const { mutate: sendHistoryMutation } = useMutation({
    mutationFn: (data) => addToWatchHistory(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
    },
    onError: () => {
      console.error("watchHistory error");
    },
  });

  const sendWatchHistory = () => {
    if (videoRef.current && prevVideoRef.current !== videoId) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      const duration = Math.floor(videoRef.current.duration);
      if (currentTime > 0 && currentTime < duration) {
        sendHistoryMutation({
          videoId: prevVideoRef.current,
          duration: currentTime,
        });
      }
    }
    prevVideoRef.current = videoId;
  };

  useEffect(() => {
    sendWatchHistory();
  }, [videoId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sendWatchHistory();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
    enabled: !!videoId,
  });

  const handleForwardSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setIsForwardSeek(true);

    videoRef.current.currentTime += 5;
    if (!video.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    }
    video.playbackRate = 1.0;

    setTimeout(() => setIsForwardSeek(false), 300);
  }, []);

  const handleBackwardSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setIsBackwardSeek(true);
    video.playbackRate = 1.0;
    videoRef.current.currentTime -= 5;

    if (!video.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    }
    video.playbackRate = 1.0;

    setTimeout(() => setIsBackwardSeek(false), 300);
  }, []);

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
      } else if (e.code === "Space" || e.key.toLowerCase() === "k") {
        e.preventDefault();
        flushSync(() => {
          setShowIcon(true);
          setShowVolumeIcon(false);
        });

        togglePlayPause();
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
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleForwardSeek, handleBackwardSeek, togglePlayPause, handleNextVideo]);

  useEffect(() => {
    setPrevTheatre(isTheatre);
  }, [isTheatre]);

  const watchTimeRef = useRef(0);
  const { mutate } = useMutation({
    mutationFn: () => videoView(videoId),
  });
  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error: {error.message}</Typography>;

  const handleTimeUpdate = (event) => {
    const video = event.target;
    if (video?.duration && !isNaN(video.duration)) {
      const value = (video.currentTime / video.duration) * 100;
      setProgress(value);
    }
    if (viewCounted) return;

    const duration = video.duration;
    const watchTime = video.currentTime;
    watchTimeRef.current = watchTime;

    if (!viewCounted) {
      if ((duration < 30 && watchTime >= duration) || watchTime >= 30) {
        mutate();
        setViewCounted(true);
      }
    }

    if (duration < 30) {
      if (watchTime >= duration) {
        mutate();
        setViewCounted(true);
      }
    } else {
      if (watchTime >= 30) {
        mutate();
        setViewCounted(true);
      }
    }
  };

  const handleVideoEnd = () => {
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
        {...(isTheatre ? { "data-theatre": true } : {})}
        ref={containerRef}
        onMouseLeave={handleMouseOut}
        onMouseMove={() => {
          if (!isLongPress) {
            isInside.current = true;
            setControlOpacity(1);
            setTitleOpacity(1);
          }
        }}
        onMouseEnter={() => {
          if (!isLongPress) {
            isInside.current = true;
            setControlOpacity(1);
          }
        }}
        id="video-container"
        className={isLongPress ? "long-pressing" : ""}
        component="div"
        sx={{
          position: "relative",
        }}
      >
   {!isTheatre &&   <Box sx={{
       height: videoRef.current?.offsetHeight  
    }} className="ambient-wrapper">
     <Box sx={{
      transform: isMobile ? "scale(1.5, 1.5)" : "scale(1.5, 2)"

     }}className="canvas-container">
        <canvas ref={captureCanvasRef} width="110" height="75" className="hidden" />
        <canvas ref={glowCanvasRef} width="110" height="75" className="glow-canvas" />
      </Box>
      </Box>}
      

        <Box sx={{ flex: 1 }}>
          <Box className="html5-video-container" sx={{ position: "relative" }}>
       
            <video
              ref={videoRef}
              id="video-player"
              key={data?.data?._id}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnd}
              onLoadedMetadata={handleLoadedMetadata}
              crossOrigin="anonymous"
              style={{
                position: "absolute",
                top: isTheatre ? 0 : "",
                bottom: isTheatre ? "" : "0",
                aspectRatio: "16/9",
                borderRadius: isTheatre ? "0" : "8px",
                width: "100%",
                height: isTheatre ? videoHeight + "px" : "",
                left: isTheatre ? leftOffset : "0",
              }}
            >
              {data?.data?.videoFile.url && (
                <source src={data?.data?.videoFile.url} type="video/mp4" />
              )}
            </video>
            
            <Box className="title-background-overlay"></Box>
   
            <Box
              ref={fullScreenTitleRef}
              className="title-fullscreen"
              sx={{
                opacity: titleOpacity,
                position: "absolute",
                width: "100%",
                top: "-1080px",
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

              <FastForwardIcon sx={{ width: "1.1rem", height: "1.1rem" }} />
            </Box>
          )}
          {isVolumeChanged && (
            <Box
              sx={{
                position: "absolute",
                top: "60px",
                width: "80px",
                height: "50px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "1rem",
                borderRadius: "4px",
                color: "#f1f1f1",
                background: "rgba(0, 0, 0, 0.5)",
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
                <Box className="forwardSeek-arrow" component={"span"}></Box>
                <Box className="forwardSeek-arrow" component={"span"}></Box>
                <Box className="forwardSeek-arrow" component={"span"}></Box>
              </Box>
              <Typography variant="caption" sx={{ margin: "0 auto", pt: 1 }}>
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
              <Typography variant="caption" sx={{ margin: "0 auto", pt: 1 }}>
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
        <VideoControls
          ref={videoRef}
          playlistId={playlistId}
          bufferedVal={bufferedVal}
          filteredVideos={filteredVideos}
          isLoading={isLoading}
          progress={progress}
          setProgress={setProgress}
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
          isMuted={isMuted}
          isIncreased={isIncreased}
          jumpedToMax={jumpedToMax}
          isAnimating={isAnimating}
          isTheatre={isTheatre}
          setIsTheatre={setIsTheatre}
          setPrevTheatre={setPrevTheatre}
          videoContainerWidth={videoContainerWidth}
          controlOpacity={controlOpacity}
          showVolumePanel={showVolumePanel}
          setShowVolumePanel={setShowVolumePanel}
        />
        <Box
          onClick={handleClick}
          onMouseDown={DoubleSpeed}
          className="video-overlay"
        >
          <Box
            className="thumbnail-overlay"
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              opacity: isUserInteracted ? 0 : 1,
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
              <svg height="100%" version="1.1" viewBox="0 0 68 48" width="100%">
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
      </Box>
    </>
  );
}

export default React.memo(VideoPlayer);
