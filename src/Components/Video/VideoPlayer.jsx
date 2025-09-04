import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
  useImperativeHandle,
  useMemo,
} from "react";
import { keyframes, useMediaQuery, useTheme } from "@mui/system";
import { fetchVideoById } from "../../apis/videoFn";
import CancelIcon from "@mui/icons-material/Cancel";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import { Box, IconButton, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";

import { useQuery, useMutation } from "@tanstack/react-query";
import { videoView } from "../../apis/videoFn";
import { useLocation, useNavigate } from "@tanstack/react-router";
import VideoControls from "./VideoControls";
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
import { useMobileOS } from "../Utils/useMobileOS";
import LargePlayIcon from "../../Svgs/LargePlayIcon";
import MobileVideoControls from "../Utils/MobileVideoControls";

// Custom Hooks
import useKeyboardShortcuts from "../Utils/useKeyboardShortcuts";
import useMouseInteractions from "../Utils/useMouseInteractions";
import useVolumeControl from "../Utils/useVolumeControl";
import useVideoPlayback from "../Utils/useVideoPlayback";
import { DeviceContext } from "../../Contexts/DeviceContext";
import { useAmbientEffect } from "./useCinematicAmbient";

// Constants
const HIDE_TIMEOUT = 2000;
const LONG_PRESS_DELAY = 600;
const DOUBLE_SPEED_RATE = 2.0;

const iconStyle = {
  color: "#f1f1f1",
  maxWidth: "52px",
  height: "52px",
  padding: "12px",
};

const VideoPlayer = React.forwardRef(
  (
    {
      videoId,
      isSubscribedTo,
      isSkippingPrevious,
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
  ) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isFullscreen = useFullscreen();
    const userContext = useContext(UserContext);
    const drawerContext = useContext(DrawerContext);
    const userInteractionContext = useContext(UserInteractionContext);
    // Device detection
    const { device } = useContext(DeviceContext);
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { open: isOpen } = drawerContext ?? {};
    const { data: dataContext } = userContext ?? {};
    const userId = dataContext?._id;
    const isAuthenticated = dataContext || null;
    const { isUserInteracted, setIsUserInteracted } =
      userInteractionContext ?? {};

    const [isAmbient, setIsAmbient] = usePlayerSetting("ambientMode", true);
    const [playbackSpeed, setPlaybackSpeed] = usePlayerSetting(
      "playbackSpeed",
      1.0
    );
    const [playbackSliderSpeed, setPlaybackSliderSpeed] = useState(1);
    const location = useLocation();
    const { getTimeStamp, setTimeStamp } = useContext(TimeStampContext);
    const detectedOS = useMobileOS();
    const isCustomWidth = useMediaQuery(theme.breakpoints.down("custom"));

    // State management
    const { state, updateState } = useStateReducer({
      // === PLAYBACK CONTROL ===
      isPlaying: false,
      isLongPress: false,
      isFastPlayback: false,
      customPlayback: false,
      isReplay: false,
      resumeTime: 0,
      viewCounted: false,
      isAutoplay: false,

      // === VOLUME CONTROL ===
      volume: 40,
      volumeSlider: 40,
      volumeUp: false,
      volumeDown: false,
      volumeMuted: false,
      isMuted: false,
      isVolumeChanged: false,

      // === UI ICONS & ANIMATIONS ===
      showIcon: true,
      showVolumeIcon: false,
      isAnimating: false,
      isIncreased: true,

      // === SEEK & SCRUBBING ===
      isForwardSeek: false,
      isBackwardSeek: false,
      isSeeking: false,
      jumpedToMax: false,

      // === LOADING & BUFFERING ===
      isBuffering: false,
      showBufferingIndicator: false,
      loadingVideo: false,
      videoReady: false,
      canPlay: true,

      // === PLAYER LAYOUT & POSITIONING ===
      leftOffset: "0px",
      topOffset: "0px",
      videoContainerWidth: "0px",
      videoHeight: 0,
      playerHeight: "0px",
      playerWidth: "0px",

      // === UI CONTROLS & OPACITY ===
      controlOpacity: 0,
      titleOpacity: 0,
      showSettings: false,
      isPipActive: false,

      // === Mobile & Device ===
      controlOverlayOpacity: 0.6,
      bottomPad: 0,
      isMobileMuted: true,
      isControlHovered: false,
    });

    // Refs management
    const {
      isInside,
      videoPauseStatus,
      playIconRef,
      volumeIconRef,
      containerRef,
      videoRef,
      savedVideoRef,
      timeoutRef,
      pressTimer,
      isTimeoutFreeze,
      clickTimeout,
      clickCount,
      animateTimeoutRef,
      captureCanvasRef,
      prevOpacityRef,
      fullScreenTitleRef,
      prevVolumeRef,
      exitingPiPViaOurUIButtonRef,
      trackerRef,
      glowCanvasRef,
      ambientIntervalRef,
      lastKeyPress,
      hideVolumeTimer,
      currentInteractionType,
      isSpacePressed,
      isLongPressActiveMouse,
      isLongPressActiveKey,
      lastMouseMoveTimeRef,
    } = useRefReducer({
      isInside: null,
      videoPauseStatus: null,
      playIconRef: null,
      volumeIconRef: null,
      containerRef: null,
      videoRef: null,
      savedVideoRef: null,
      timeoutRef: null,
      pressTimer: null,
      isTimeoutFreeze: false,
      clickTimeout: null,
      clickCount: 0,
      animateTimeoutRef: null,
      captureCanvasRef: null,
      prevOpacityRef: null,
      fullScreenTitleRef: null,
      prevVolumeRef: 0.5,
      exitingPiPViaOurUIButtonRef: null,
      trackerRef: new VideoTelemetryTimer(),
      glowCanvasRef: null,
      ambientIntervalRef: null,
      lastKeyPress: null,
      hideVolumeTimer: null,
      currentInteractionType: null,
      isSpacePressed: null,
      isLongPressActiveMouse: false,
      isLongPressActiveKey: false,
      lastMouseMoveTimeRef: 0,
    });

    const [previousVolume, setPreviousVolume] = useState(state.volume || 40);

    // Imperative Handler for videoRef
    useImperativeHandle(ref, () => videoRef.current);

    // ===== UTILITY FUNCTIONS =====
    const showControls = useCallback(() => {
      if (state.controlOpacity !== 1) updateState({ controlOpacity: 1 });
      if (state.titleOpacity !== 1) updateState({ titleOpacity: 1 });
    }, [state.controlOpacity, state.titleOpacity]);

    const hideControls = useCallback(() => {
      if (state.controlOpacity !== 0) updateState({ controlOpacity: 0 });
      if (state.titleOpacity !== 0) updateState({ titleOpacity: 0 });
      console.log("HIDING CONTROLS");
    }, [state.controlOpacity, state.titleOpacity]);

    const handleVideoCursorVisiblity = useCallback(
      (prop) => {
        const container = containerRef.current;
        if (!container) return;

        container
          .querySelectorAll("#video-overlay, .controls")
          .forEach((el) =>
            prop === "hide"
              ? el.classList.add("hide-cursor")
              : el.classList.remove("hide-cursor")
          );
      },
      [containerRef]
    );

    const resetTimeout = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        hideControls();
        handleVideoCursorVisiblity("hide");
        console.log("RESET TIMEOUT");
      }, HIDE_TIMEOUT);
    }, [hideControls, handleVideoCursorVisiblity]);

    const freezeTimeout = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      showControls();
      handleVideoCursorVisiblity("show");
      console.log("FREEZE TIMEOUT");
    }, [showControls, handleVideoCursorVisiblity]);

    // ===== FULLSCREEN =====
    const toggleFullScreen = useCallback(() => {
      const el = document.documentElement;
      if (!el) return;

      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      try {
        if (!document.fullscreenElement) {
          el.requestFullscreen?.()
            .then(() => {
              requestAnimationFrame(() => {
                el.scrollTop = 0;
                setIsMini(false);
                setIsUserInteracted(true);
              });
              if (!isIOS) {
                screen.orientation?.lock?.("landscape").catch(() => {});
              }
            })
            .catch((err) => {
              console.error("Fullscreen failed:", err);
            });
        } else {
          document
            .exitFullscreen?.()
            .then(() => {
              screen.orientation?.unlock?.();
            })
            .catch((err) => {
              console.error("Exit fullscreen failed:", err);
            });
        }
      } catch (error) {
        console.error("Fullscreen error:", error);
      }
    }, []);

    // ===== DOUBLE SPEED FUNCTIONALITY =====
    const DoubleSpeed = useCallback(
      (e) => {
        const isKeyboard = e.type === "keydown";
        const isMouse = e.type === "mousedown";
        const video = videoRef.current;

        if (!video || video.readyState < 2) return;
        if (isMouse && e.button === 2) return;

        const isLongPressActiveAlready =
          isLongPressActiveKey.current || isLongPressActiveMouse.current;

        if (!isUserInteracted) {
          setIsUserInteracted(true);
        }

        currentInteractionType.current = isKeyboard ? "keyboard" : "mouse";
        prevOpacityRef.current = state.controlOpacity;

        if (!state.isLongPress) {
          videoPauseStatus.current = video.paused;
        }

        if (isKeyboard && !state.isLongPress) {
          clickCount.current = 0;
          showControls();
        }

        if (pressTimer.current) {
          clearTimeout(pressTimer.current);
          pressTimer.current = null;
        }

        pressTimer.current = setTimeout(() => {
          if (isLongPressActiveAlready) return;

          isLongPressActiveKey.current = isKeyboard;
          isLongPressActiveMouse.current = isMouse;

          const wasVideoPaused = video.paused;

          let newState = {
            isLongPress: true,
            showIcon: false,
            isFastPlayback: true,
            controlOpacity: 0,
            titleOpacity: 0,
          };

          if (wasVideoPaused) {
            video.play();
            newState.isPlaying = true;
          }

          updateState(newState);
          video.playbackRate = DOUBLE_SPEED_RATE;
          pressTimer.current = null;
        }, LONG_PRESS_DELAY);

        if (isMouse) {
          window.addEventListener("mousemove", mouseHandlers.handleMouseMove);
          window.addEventListener("mouseup", mouseHandlers.handleMouseUp, {
            once: true,
          });
        }

        resetTimeout();
      },
      [
        isUserInteracted,
        state.controlOpacity,
        state.isLongPress,
        showControls,
        resetTimeout,
      ]
    );

    const exitDoubleSpeed = useCallback(
      (e) => {
        if (e?.button === 2) return;

        const video = videoRef.current;
        if (!video) return;

        const isKeyboard = e?.type === "keyup";
        const shouldShowControls =
          (isKeyboard || isInside.current) && prevOpacityRef.current === 1
            ? prevOpacityRef.current
            : 0;

        if (pressTimer.current) {
          clearTimeout(pressTimer.current);
          pressTimer.current = null;
        }

        isTimeoutFreeze.current = false;
        video.playbackRate = playbackSpeed;

        const shouldPlay = !videoPauseStatus.current;

        if (shouldPlay) {
          video.play();
        } else {
          video.pause();
        }

        showControls();

        updateState({
          showIcon: true,
          showVolumeIcon: false,
          isLongPress: false,
          isFastPlayback: false,
          controlOpacity: shouldShowControls,
          titleOpacity: shouldShowControls,
          isPlaying: shouldPlay,
        });

        isLongPressActiveMouse.current = false;
        isLongPressActiveKey.current = false;
      },
      [playbackSpeed, showControls]
    );

    // ===== PICTURE IN PICTURE =====
    const handleEnterPiP = useCallback(() => {
      updateState({ isPipActive: true });
    }, []);

    const handleLeavePiP = useCallback(() => {
      requestAnimationFrame(() => {
        updateState({
          showIcon: false,
          isPipActive: false,
          isPlaying: !videoRef.current?.paused,
        });
      });
      exitingPiPViaOurUIButtonRef.current = false;
    }, [exitingPiPViaOurUIButtonRef]);

    const handleTogglePiP = useCallback(async () => {
      const video = videoRef.current;
      if (!video) return;
      try {
        if (document.pictureInPictureElement) {
          exitingPiPViaOurUIButtonRef.current = true;
          await document.exitPictureInPicture();
          updateState({ isPipActive: false });
        } else {
          await video.requestPictureInPicture();
          updateState({ isPipActive: true });
        }
      } catch (err) {
        console.error("PiP error:", err);
        exitingPiPViaOurUIButtonRef.current = false;
      }
    }, [exitingPiPViaOurUIButtonRef]);

    // ===== CUSTOM HOOKS =====

    // Volume Control Hook
    const volumeHandlers = useVolumeControl({
      videoRef,
      volumeIconRef,
      state,
      updateState,
      previousVolume,
      setPreviousVolume,
      trackerRef,
      hideVolumeTimer,
      playbackSpeed,
      pressTimer,
      animateTimeoutRef,
      prevVolumeRef,
      showControls,
      freezeTimeout,
      resetTimeout,
    });

    // Video Playback Hook
    const playbackHandlers = useVideoPlayback({
      videoRef,
      containerRef,
      trackerRef,
      playIconRef,
      state,
      updateState,
      showControls,
      handleVideoCursorVisiblity,
      setIsUserInteracted,
      isUserInteracted,
      pressTimer,
      videoPauseStatus,
      isLongPressActiveMouse,
      isLongPressActiveKey,
      setTimeStamp,
      freezeTimeout,
      resetTimeout,
      playbackSpeed,
    });

    // Mouse Interactions Hook
    const mouseHandlers = useMouseInteractions({
      videoRef,
      containerRef,
      state,
      updateState,
      showControls,
      hideControls,
      handleVideoCursorVisiblity,
      resetTimeout,
      timeoutRef,
      togglePlayPause: playbackHandlers.togglePlayPause,
      toggleFullScreen,
      exitDoubleSpeed,
      DoubleSpeed,
      isUserInteracted,
      isFullscreen,
      videoPauseStatus,
      clickTimeout,
      clickCount,
      pressTimer,
      currentInteractionType,
      isLongPressActiveMouse,
      isLongPressActiveKey,
      isInside,
      isTimeoutFreeze,
      lastMouseMoveTimeRef,
    });

    // Keyboard Shortcuts Hook
    useKeyboardShortcuts({
      videoRef,
      state,
      updateState,
      togglePlayPause: playbackHandlers.togglePlayPause,
      handleForwardSeek: playbackHandlers.handleForwardSeek,
      handleBackwardSeek: playbackHandlers.handleBackwardSeek,
      handleVolume: volumeHandlers.handleVolume,
      handleVolumeToggle: volumeHandlers.handleVolumeToggle,
      updateVolumeIconState: volumeHandlers.updateVolumeIconState,
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
      playbackSpeed,
    });

    // ===== EFFECTS =====

    // Controls timeout management
    useEffect(() => {
      const video = videoRef.current;
      const container = containerRef.current;
      if (!video || !container || !isUserInteracted) return;

      const shouldFreeze =
        (state.isReplay ||
          !state.isPlaying ||
          state.isControlHovered ||
          state.showSettings) &&
        !state.isLongPress;

      if (shouldFreeze && !isTimeoutFreeze.current) {
        isTimeoutFreeze.current = true;
        freezeTimeout();
      }

      if (!shouldFreeze) {
        isTimeoutFreeze.current = false;
        resetTimeout();
      }
    }, [
      isUserInteracted,
      state.isPlaying,
      state.isReplay,
      state.showSettings,
      state.isControlHovered,
      state.isLongPress,
      resetTimeout,
      freezeTimeout,
    ]);

    // Video ready state
    useEffect(() => {
      updateState({ videoReady: false });
      showControls();
      handleVideoCursorVisiblity("show");
    }, [videoId]);

    // Ambient lighting effect
    useAmbientEffect(
      videoRef,
      videoId,
      glowCanvasRef,
      state.isPlaying,
      isAmbient,
      isTheatre
    );

    // PiP event listeners
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

    // Buffering detection
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

    // Buffering indicator
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

    // Mini player scroll detection
    useEffect(() => {
      const container = containerRef.current;
      if (isOpen || isFullscreen || device === "mobile") return;
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
      device,
    ]);

    // Cleanup telemetry on unmount
    useEffect(() => {
      if (videoRef.current) {
        savedVideoRef.current = videoRef.current;
      }
    }, [videoRef.current, savedVideoRef]);

    useEffect(() => {
      return () => {
        const video = savedVideoRef.current;
        const tracker = trackerRef.current;

        if (tracker) tracker.reset();

        if (!video || !tracker) {
          return;
        }

        const telemetryData = tracker.end(video, isSubscribedTo ? 1 : 0);
        if (telemetryData) {
          sendYouTubeStyleTelemetry(
            videoId,
            video,
            telemetryData,
            setTimeStamp
          );
        }
      };
    }, [videoId, isSubscribedTo, setTimeStamp]);

    // ===== QUERY AND MUTATIONS =====

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

    // Resume time calculation
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
          updateState({
            resumeTime: isFinite(guestTime) && guestTime > 0 ? guestTime : 0,
          });
        }
      };

      fetchResumeTime();

      return () => {
        isMounted = false;
      };
    }, [data?.data?._id, isAuthenticated, refetchHistory, getTimeStamp]);

    const { mutate } = useMutation({
      mutationFn: () => videoView(videoId),
      onMutate: () => {
        updateState({ viewCounted: true });
      },
    });

    const handleTimeUpdate = useCallback(() => {
      return playbackHandlers.handleTimeUpdate(videoId, mutate);
    }, [playbackHandlers, videoId]);

    // ===== LAYOUT CALCULATIONS =====

    const containerAspectRatio = isMini
      ? "calc((var(--vtd-watch-flexy-player-width-ratio) / var(--vtd-watch-flexy-player-height-ratio)))"
      : "";
    const containerPosition =
      isTheatre && !isMini && device === "windows"
        ? "relative"
        : isMini || device === "mobile"
          ? "fixed"
          : "absolute";
    const containerWidth = isMini ? "480px" : "100%";
    const containerHeight = isMini
      ? "auto"
      : device === "mobile"
        ? state.playerHeight
        : "100%";
    const containerTopOffset =
      device === "mobile" ? "var(--header-height)" : isMini ? "15px" : 0;
    const containerLeftOffset = isMini ? "15px" : 0;
    const containerRightOffset = isMini ? "auto" : "";
    const containerZindex = isMini || device === "mobile" ? 9999 : 0;

    const playerVisiblity = state.videoReady ? "visible" : "hidden";
    const playerAspectRatio = containerAspectRatio;
    const playerWidth = isMini ? "480px" : state.playerWidth;
    const playerHeight = isMini ? "auto" : state.playerHeight;
    const playerTopOffset = state.topOffset;
    const playerLeftOffset = isMini ? 0 : state.leftOffset;
    const playerRightOffset = isMini ? "auto" : "";
    const playerBorderRadius =
      (isTheatre && !isMini) || device === "mobile" ? "0" : "8px";

    // Video container layout effect
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
        const widescreenAspect = 16 / 9;

        let videoWidth = containerWidth;
        let videoHeightLocal =
          device === "mobile"
            ? video.videoHeight
            : Math.ceil(videoWidth / targetAspectRatio);

        if (videoHeightLocal > containerHeight) {
          videoHeightLocal = containerHeight;
          videoWidth = Math.floor(videoHeightLocal * targetAspectRatio);
        }
        if (device === "mobile" && isFullscreen) {
          ((videoHeightLocal = 309), (videoWidth = containerWidth));
        }
        const fsWidth = containerHeight * targetAspectRatio;

        const left =
          isFullscreen && device !== "mobile"
            ? Math.floor((containerWidth - fsWidth) / 2)
            : Math.floor((containerWidth - videoWidth) / 2);
        const top =
          isFullscreen && device !== "mobile"
            ? 0
            : Math.floor((containerHeight - videoHeightLocal) / 2);

        if (targetAspectRatio >= widescreenAspect) {
          flexyWatchContainer.style.setProperty(
            "--vtd-watch-flexy-player-width-ratio",
            16
          );
          flexyWatchContainer.style.setProperty(
            "--vtd-watch-flexy-player-height-ratio",
            9
          );
        } else {
          flexyWatchContainer.style.setProperty(
            "--vtd-watch-flexy-player-width-ratio",
            1
          );
          flexyWatchContainer.style.setProperty(
            "--vtd-watch-flexy-player-height-ratio",
            video.videoHeight / video.videoWidth
          );
        }

        updateState({
          videoContainerWidth: containerWidth,
          videoHeight: videoHeightLocal,
          playerWidth:
            isFullscreen && device !== "mobile"
              ? `${containerHeight * targetAspectRatio}px`
              : `${videoWidth}px`,
          playerHeight:
            isFullscreen && device !== "mobile"
              ? `${containerHeight}px`
              : `${videoHeightLocal}px`,
          leftOffset: `${left}px`,
          topOffset: `${top}px`,
          bottomPad: "309px",
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
    }, [isTheatre, data?.data?._id, isFullscreen, device]);

    // ===== RENDER =====

    if (isLoading) return <Typography>Loading...</Typography>;
    if (isError) return <Typography>Error: {error.message}</Typography>;

    return (
      <Box id="player-container">
        <Box
          className="player-inner"
          sx={{
            position: "relative",
            height: isFullscreen && !isTheatre ? "100%" : "unset",
            paddingBottom:
              ((isCustomWidth || isMobile || isTheatre) && device === "windows") 
                ? ""
                : isFullscreen
                  ? "calc((9/16)*100%)"
                  : "calc(var(--vtd-watch-flexy-player-height-ratio) / var(--vtd-watch-flexy-player-width-ratio) * 100%)",
          }}
        >
          <Box
            data-theatre={isTheatre && !isFullscreen && device !== "mobile"}
            data-fullbleed={isCustomWidth && device !== "mobile"}
            data-fullscreen={isFullscreen}
            data-mobile={device === "mobile" && !isFullscreen}
            ref={containerRef}
            onMouseLeave={mouseHandlers.handleMouseOut}
            onMouseMove={mouseHandlers.handleContainerMouseMove}
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
            {/* Ambient Lighting Canvas */}
            <Box
              sx={{
                display: isMini || isTheatre ? "none" : "block",
                height: state.videoHeight,
              }}
              className="ambient-wrapper"
            >
              <Box
                sx={{
                  transform:
                    isMobile || device === "mobile"
                      ? "scale(1, 1.5)"
                      : "scale(1.5, 2)",
        
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

            {/* Main Video Container */}
            <Box
              id="main-video-container"
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
              <Box
                className="html5-video-container"
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  top: 0,
                  left: 0,
                  borderRadius: playerBorderRadius,
                }}
              >
                {/* Video Element */}
                {data?.data?.videoFile.url && (
                  <video
                    autoPlay={device === "mobile"}
                    src={data?.data?.videoFile.url}
                    muted={
                      state.isMuted ||
                      (device === "mobile" && state.isMobileMuted)
                    }
                    key={data?.data?.videoFile.url}
                    ref={videoRef}
                    crossOrigin="anonymous"
                    controlsList="nodownload"
                    id="video-player"
                    onEnded={playbackHandlers.handleVideoEnd}
                    onPlay={playbackHandlers.handlePlay}
                    onLoadedMetadata={playbackHandlers.handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    style={{
                      position: "absolute",
                      visibility: playerVisiblity,
                      aspectRatio: playerAspectRatio,
                      width: playerWidth,
                      height: playerHeight,
                      left: playerLeftOffset,
                      top: playerTopOffset,
                      right: playerRightOffset,
                    }}
                  />
                )}
                {device === "windows" && (
                  <>
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
                        zIndex: 4,
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
                  </>
                )}
                {/* Desktop Controls */}
                {device === "windows" && (
                  <VideoControls
                    videoRef={videoRef}
                    tracker={trackerRef.current}
                    videoId={videoId}
                    playlistId={playlistId}
                    shuffledVideos={shuffledVideos}
                    isLoading={isLoading}
                    togglePlayPause={playbackHandlers.togglePlayPause}
                    toggleFullScreen={toggleFullScreen}
                    playlistVideos={playlistVideos}
                    index={index}
                    handleVolumeToggle={volumeHandlers.handleVolumeToggle}
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
                    isMini={isMini}
                    setIsMini={setIsMini}
                    {...state}
                    updateState={updateState}
                  />
                )}
              </Box>

              {/* Title Background Overlay for Fullscreen */}
              <Box
                className={`${isFullscreen ? "title-background-overlay" : "hide"}`}
              />

              {/* Video Overlay with Icons and Indicators */}
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
                {/* 2x Speed Indicator */}
                <Box
                  sx={{
                    position: "absolute",
                    opacity: state.isFastPlayback ? "1" : "0",
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

                {/* Volume Indicator */}
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
                    opacity: state.isVolumeChanged ? 1 : 0,
                    padding: "6px 20px",
                  }}
                >
                  <Typography fontWeight="500" variant="h6">
                    {Math.round((state.volume / 40) * 100)}%
                  </Typography>
                </Box>

                {/* Forward Seek Indicator */}
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
                    opacity: state.isForwardSeek ? 1 : 0,
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
                    5 seconds
                  </Typography>
                </Box>

                {/* Backward Seek Indicator */}
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
                    opacity: state.isBackwardSeek ? 1 : 0,
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
                    5 seconds
                  </Typography>
                </Box>

                {/* Status Overlay with Play/Pause and Volume Icons */}
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
                  {/* Buffering Indicator */}
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
                      opacity:
                        (state.showBufferingIndicator || state.loadingVideo) &&
                        !state.isBackwardSeek &&
                        !state.isForwardSeek
                          ? 1
                          : 0,
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

                  {/* Play/Pause Icon */}
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
                      <PauseIcon className="playback-icon" sx={iconStyle} />
                    ) : (
                      <PlayArrowIcon className="playback-icon" sx={iconStyle} />
                    )}
                  </IconButton>

                  {/* Volume Icon */}
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
                </Box>
              </Box>

              {/* Video Overlay for Mouse/Touch Interactions */}
              <Box
                id="video-overlay"
                sx={{ userSelect: "none" }}
                onMouseDown={!isUserInteracted ? undefined : DoubleSpeed}
                onMouseUp={
                  !isUserInteracted
                    ? mouseHandlers.handleVideoOverlay
                    : undefined
                }
                className={`${device === "mobile" ? "hide" : ""}`}
              >
                {/* Thumbnail Overlay (shown before first interaction) */}
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
                  />
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
                    <LargePlayIcon scale={1.1} />
                  </IconButton>
                </Box>
              </Box>

              {/* Mobile Controls */}
              {device === "mobile" && (
                <MobileVideoControls
                  videoRef={videoRef}
                  data={data}
                  videoId={videoId}
                  videoReady={state.videoReady}
                  isPlaying={state.isPlaying}
                  isMobileMuted={state.isMobileMuted}
                  shuffledVideos={shuffledVideos}
                  playlistVideos={playlistVideos}
                  playlistId={playlistId}
                  isSkippingPrevious={isSkippingPrevious}
                  updateState={updateState}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
);

export default VideoPlayer;
