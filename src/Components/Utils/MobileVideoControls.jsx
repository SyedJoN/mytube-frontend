import React, {
  useState,
  useRef,
  useEffect,
  startTransition,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { PlayPauseSvg } from "./PlayPauseSvg";
import PauseIcon from "@mui/icons-material/Pause";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FastForwardIcon from "@mui/icons-material/FastForward";

import {
  Box,
  IconButton,
  Typography,
  CardMedia,
  useMediaQuery,
  Switch,
} from "@mui/material";
import { SkipPreviousSvg } from "./SkipPreviousSvg";
import { SkipNextSvg } from "./SkipNextSvg";
import formatDuration from "../../utils/formatDuration";
import "../Utils/iconMorph.css";
import { FullScreenSvg } from "./FullScreenSvg";
import { useTheme } from "@emotion/react";
import ProgressLists from "./ProgressLists";
import { UserInteractionContext } from "../../Contexts/RootContexts";
import { useFullscreen } from "./useFullScreen";

// Constant
const HIDE_TIMEOUT = 2000;

const MobileVideoControls = ({
  videoRef,
  playlistId,
  playlistVideos,
  data,
  videoId,
  videoReady,
  isPlaying,
  isMobileMuted,
  shuffledVideos,
  isSkippingPrevious,
  updateState,
}) => {
  const theme = useTheme();
  const isFullscreen = useFullscreen();
  const [controlOpacity, setControlOpacity] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const pressTimer = useRef(null);
  const timeoutRef = useRef(null);
  const urlStackIndex = useRef(null);
  const prevUrl = useRef(null);
  const isLongPress = useRef(null);
  const showControls = () => {
    if (controlOpacity !== 1) setControlOpacity(1);
  };

  const hideControls = () => {
    if (controlOpacity !== 0) setControlOpacity(0);
  };

  useEffect(() => {
    updateState({ videoReady: false });
    hideControls();
  }, [videoId]);

  const nextVideoStyles = useMemo(
    () => ({
      whiteSpace: "nowrap",
      backgroundColor: "rgb(27,26,27)",
      fontSize: "0.75rem",
      borderRadius: "16px",
      padding: "0",
    }),
    []
  );

  const popperModifiers = [
    {
      name: "offset",
      options: {
        offset: [0, 5],
      },
    },
  ];
  const nextVideoModifiers = useMemo(
    () => [
      {
        name: "offset",
        options: {
          offset: [60, 0],
        },
      },
      {
        name: "flip",
        enabled: false,
      },
      {
        name: "preventOverflow",
        enabled: false,
      },
      {
        name: "hide",
        enabled: false,
      },
    ],
    []
  );
  const navigate = useNavigate();
  const volumeSliderRef = useRef(null);

  // const handleNext = () => {
  //   setIsUserInteracted(true);

  //   navigate({
  //     to: "/watch",
  //     search: { v: shuffledVideos[0]?._id },
  //   });
  // };
  // const handleNextPlaylist = () => {
  //   if (index >= playlistVideos.length - 1) return;
  //   setIsUserInteracted(true);

  //   navigate({
  //     to: "/watch",
  //     search: {
  //       v: playlistVideos[index + 1]._id,
  //       list: playlistId,
  //       index: index + 2,
  //     },
  //   });
  // };
  // const handlePrev = () => {
  //   if (!videoRef.current) return;
  //   videoRef.current.currentTime -= 5;
  //   videoRef.current.play();
  // };

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      hideControls();
    }, HIDE_TIMEOUT);
  }, [hideControls]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !isPlaying) return;

    resetTimeout();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, resetTimeout]);

  useEffect(() => {
    if (isSkippingPrevious.current) return;
    const pathName = location.pathname + location.searchStr;
    if (pathName !== prevUrl.current) {
      prevUrl.current = pathName;
      urlStackIndex.current = urlStackIndex.current + 1;
    }
  }, [videoId]);

  // Mobile event listeners
  const cancelEventBubbling = (e) => {
    e.stopPropagation();
  };

  const handleMobile2x = (e) => {
    const video = videoRef.current;
    if (!video) return;

    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      updateState({ isFastPlayback: true });
      hideControls();
      if (video.paused) {
        video.play();
      }
      video.playbackRate = 2.0;
      pressTimer.current = null;
    }, 600);
  };

  const handleMobile2xExit = (e) => {
    console.log("touched", pressTimer.current);
    const video = videoRef.current;
    if (!video) return;
    clearTimeout(pressTimer.current);
    pressTimer.current = null;
    if (isLongPress.current) {
      isLongPress.current = false;
      video.playbackRate = 1.0;
      updateState({ isFastPlayback: false });
    } else {
      setControlOpacity((prev) => (prev === 1 ? 0 : 1));
    }
  };

  // SkipPrevious
  const handleSkipPrevious = (e) => {
    e.stopPropagation();
    if (!controlOpacity) return;

    isSkippingPrevious.current = true;
    if (playlistId && playlistVideos && index > 0) {
      navigate({
        to: "/watch",
        search: {
          v: playlistVideos[index - 1]._id,
          list: playlistId,
          index: index - 1,
        },
      });
      return;
    }

    const canGoBack = urlStackIndex.current > 1;

    if (canGoBack) {
      urlStackIndex.current = urlStackIndex.current - 1;
      window.history.back();
    } else {
      console.log("urlStackIndex", urlStackIndex.current);
    }
  };

  // Toggle Play/Pause

  const togglePlayPause = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (!controlOpacity) return;
    if (video.paused || video.ended) {
      video.play();
      updateState({ isPlaying: true });
    } else {
      video.pause();
      updateState({ isPlaying: false });
    }
  };
  // SkipNext
  const handleSkipNext = (e) => {
    e.stopPropagation();
    if (!controlOpacity) return;

    isSkippingPrevious.current = false;
    const isNextInPlaylist = playlistId && index < playlistVideos.length - 1;
    const fallback = shuffledVideos?.[0]?._id ?? null;

    navigate({
      to: "/watch",
      search: {
        v: isNextInPlaylist ? playlistVideos[index + 1]?._id : fallback,
        list: isNextInPlaylist ? playlistId : undefined,
        index: isNextInPlaylist ? index + 2 : undefined,
      },
    });
  };
  // playbackSettings

  // Toggle Fullscreen
  const toggleFullScreen = (e) => {
    e.stopPropagation();
    const el = document.documentElement;
    if (!el) return;

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isFullscreen) {
      el.requestFullscreen?.().then(() => {
        requestAnimationFrame(() => {;
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

  const handleChange = (_, speed) => {
    setPlaybackSliderSpeed(speed);
    if (customPlayback !== true) {
      updateState({ customPlayback: true });
    }
  };
  const handlePlayBackClick = (speed) => {
    handlePlaybackspeed(speed);
    updateState({ customPlayback: false });
    setShowPlaybackMenu(false);
  };
  // Ambient

  const handleAmbientChange = () => {
    setIsAmbient((prev) => !prev);
  };

  // Volume

  const handleSwitchToggleChange = (e) => {
    e.stopPropagation();
    if (!controlOpacity) return;
    setIsAutoplay((prev) => !prev);
    resetTimeout();
  };

  const handlePlaybackspeed = (speed) => {
    setPlaybackSpeed(speed);
  };
  return (
    <>
      {/* Mobile Overlay */}
      <Box
        onTouchStart={handleMobile2x}
        onTouchEnd={handleMobile2xExit}
        sx={{ position: "relative", userSelect: "none" }}
        id="video-overlay-mobile"
      >
        <Box
          id="player-background-overlay"
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            left: 0,
            top: 0,
            backgroundColor: controlOpacity
              ? "rgba(15,15,15,0.6)"
              : "rgba(0,0,0,0)",
            transitionProperty: "background-color",
            transitionDuration: ".7s",
          }}
        ></Box>

        {/* Video Player Controls */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            top: 0,
            left: 0,
            pointerEvents: controlOpacity ? "auto" : "none",
            visibility: controlOpacity ? "visible" : "hidden",
            zIndex: 9999,
          }}
          id="player-controls"
        >
          {/* Controls Bar */}
          <Box
            sx={{
              position: "absolute",
              right: 0,
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              zIndex: 9,
            }}
            id="player-controls-top-container"
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                touchAction: "manipulation",
                top: 0,
                left: 0,
              }}
              id="player-controls-top"
            >
              <IconButton
                disableRipple
                onTouchStart={cancelEventBubbling}
                sx={{
                  background: "transparent",
                  borderRadius: "50px",
                  width: 50,
                  height: 50,
                  opacity: 1,
                  "&.Mui-disabled": {
                    background: "transparent",
                  },
                  "& svg": {
                    opacity: 1,
                  },
                  "&.Mui-disabled svg": {
                    opacity: 0.5,
                  },
                  pointerEvents: controlOpacity ? "all" : "none",
                }}
                id="autoplay-switch-icon"
              >
                <Switch
                  disableRipple
                  color="default"
                  checked={isAutoplay}
                  onTouchEnd={cancelEventBubbling}
                  onChange={handleSwitchToggleChange}
                  sx={{
                    "& .MuiSwitch-track": {
                      backgroundColor: "rgba(255,255,255,0.5)",
                      opacity: 1,
                    },
                    "&.Mui-checked .MuiSwitch-track": {
                      backgroundColor: "rgba(255,255,255,0.5)",
                      opacity: 1,
                    },
                  }}
                  slotProps={{
                    thumb: {
                      sx: {
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: "#747373",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        ".Mui-checked &": {
                          backgroundColor: "#fff",
                        },
                      },
                      children: isAutoplay ? (
                        <PlayArrowIcon
                          fontSize="small"
                          sx={{ fontSize: 14, color: "#000" }}
                        />
                      ) : (
                        <PauseIcon
                          fontSize="small"
                          sx={{ fontSize: 14, color: "#fff" }}
                        />
                      ),
                    },
                  }}
                />
              </IconButton>
              <IconButton
                disableRipple
                onTouchStart={cancelEventBubbling}
                onTouchEnd={cancelEventBubbling}
                sx={{
                  background: "transparent",
                  borderRadius: "50px",
                  width: 50,
                  height: 50,
                  opacity: 1,
                  "&.Mui-disabled": {
                    background: "transparent",
                  },
                  "& svg": {
                    opacity: 1,
                  },
                  "&.Mui-disabled svg": {
                    opacity: 0.5,
                  },
                  pointerEvents: controlOpacity ? "all" : "none",
                }}
                id="gear-icon"
              >
                <SettingsOutlinedIcon sx={{ color: "#f1f1f1" }} />
              </IconButton>
            </Box>
          </Box>
          {/* Playback Controls */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              right: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              justifyContent: "center",
              gap: "36px",
              alignItems: "center",
              touchAction: "manipulation",
              zIndex: 9,
            }}
            id="player-controls-middle"
          >
            <IconButton
              disableRipple
              disabled={urlStackIndex.current <= 1}
              onTouchStart={cancelEventBubbling}
              onTouchEnd={handleSkipPrevious}
              sx={{
                background: "rgba(0,0,0,0.3)",
                borderRadius: "50px",
                width: 50,
                height: 50,
                "&.Mui-disabled": {
                  background: "rgba(0,0,0,.3)",
                },
                "& svg": {
                  opacity: 1,
                },
                "&.Mui-disabled svg": {
                  opacity: 0.5,
                },
                pointerEvents: controlOpacity ? "all" : "none",
              }}
              id="mobile-skip-backward-icon"
            >
              <SkipPreviousSvg scale={1.5} />
            </IconButton>
            <IconButton
              disableRipple
              onTouchStart={cancelEventBubbling}
              onTouchEnd={togglePlayPause}
              sx={{
                background: "rgba(0,0,0,.3)",
                borderRadius: "50px",
                width: 55,
                height: 55,
                pointerEvents: controlOpacity ? "all" : "none",
              }}
              id="playPause-icon"
            >
              <PlayPauseSvg isPlaying={isPlaying} scale={1.4} />
            </IconButton>
            <IconButton
              disableRipple
              onTouchStart={cancelEventBubbling}
              onTouchEnd={handleSkipNext}
              sx={{
                background: "rgba(0,0,0,.3)",
                borderRadius: "50px",
                width: 50,
                height: 50,
                pointerEvents: controlOpacity ? "all" : "none",
              }}
              id="mobile-skip-forward-icon"
            >
              <SkipNextSvg scale={1.5} />
            </IconButton>
          </Box>

          {/* Progress + Timestamp + FullScreen */}
          <Box id="player-controls-bottom">
            <Box
              id="player-time-display"
              sx={{
                position: "absolute",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.3)",
                height: 24,
                padding: "0 8px",
                borderRadius: "12px",
                bottom: 37,
                left: 30,
                zIndex: 9,
              }}
            >
              <Typography
                component="span"
                sx={{ color: "#fff" }}
                fontSize={"0.75rem"}
              >
                {formatDuration(
                  Math.min(
                    Math.max(0, videoRef?.current?.currentTime) || 0,
                    videoRef?.current?.duration || 0
                  )
                )}{" "}
              </Typography>
              <Typography
                component="span"
                sx={{ color: "#fff", opacity: 0.7, margin: "0 4px" }}
                fontSize={"0.75rem"}
              >
                /
              </Typography>
              <Typography
                component="span"
                sx={{ color: "#ffff", opacity: 0.7 }}
                fontSize={"0.75rem"}
              >
                {formatDuration(videoRef?.current?.duration || 0)}
              </Typography>
            </Box>
            <Box
              onTouchStart={cancelEventBubbling}
              onTouchEnd={toggleFullScreen}
              sx={{
                position: "absolute",
                bottom: 37,
                right: 23,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9,
                pointerEvents: controlOpacity ? "auto" : "none",
              }}
              id="player-fs-toggle"
            >
              <a
                className="control"
                style={{
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                }}
              >
                <FullScreenSvg isFullscreen={isFullscreen} />
              </a>
            </Box>
            <Box
            onTouchStart={cancelEventBubbling}
            onTouchEnd={cancelEventBubbling}
         
              id="player-progress-list"
              sx={{
                display: "flex",
                position: "absolute",
                justifyContent: "center",
                alignItems: "center",
                transition: "opacity 0.3s",
                right: 30,
                left: 30,
                bottom: 0,
                height: "44px",
                zIndex: 10,
                pointerEvents: controlOpacity ? "auto" : "none",
              }}
            >
              <ProgressLists
                isMobileDevice={true}
                playsInline={true}
                videoRef={videoRef}
                vttUrl={data?.data?.sprite?.vtt}
                resetTimeout={resetTimeout}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          display: "block",
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: isMobileMuted ? 3 : 0,
          overflow: "hidden",
        }}
        onClick={() => updateState({ isMobileMuted: false })}
        id="initial-btn"
      >
        <Box
          id="unmute-btn-container"
          sx={{
            position: "absolute",
            top: "12px",
            left: "12px",
            overflow: "hidden",
          }}
        >
          <IconButton
            id="unmute-btn-icon"
            size="medium"
            onClick={() => updateState({ isMobileMuted: false })}
            sx={{
              position: "relative",
              display: isMobileMuted ? "inline-flex" : "none",
              width: 50,
              height: 50,
              background: "#fff",
              fontWeight: "bolder",
              fontSize: 12,
              overflow: "hidden",
              zIndex: 1,
              borderRadius: "2px",
            }}
          >
            {isMobileMuted && (
              <VolumeOffIcon sx={{ width: 30, height: 30, color: "#000" }} />
            )}
          </IconButton>
          <IconButton
            id="unmute-btn-text"
            size="medium"
            sx={{
              position: "relative",
              display: isMobileMuted ? "inline-flex" : "none",
              transform: videoReady ? "translateX(-270px)" : "translateX(-8px)",
              borderRadius: "2px",
              background: "#fff",
              color: "#000",
              fontWeight: 500,
              fontSize: "82%",
              pr: "10px",
              height: 50,
              zIndex: 0,
              transition: "transform 0.4s ease-in 3s",
            }}
          >
            TAP TO UNMUTE
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default React.memo(MobileVideoControls);
