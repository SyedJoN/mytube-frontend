import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  startTransition,
  useContext,
  useMemo,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import CheckIcon from "@mui/icons-material/Check";
import { PlayPauseSvg } from "../Utils/PlayPauseSvg";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  CardMedia,
  useMediaQuery,
  Switch,
  Divider,
  Input,
  Slider,
  Stack,
} from "@mui/material";
import { SkipPreviousSvg } from "../Utils/SkipPreviousSvg";
import { SkipNextSvg } from "../Utils/SkipNextSvg";

import formatDuration from "../../utils/formatDuration";

import "../Utils/iconMorph.css";
import { MorphingVolIcon } from "../Utils/VolumeIcon";
import { FullScreenSvg } from "../Utils/FullScreenSvg";
import TheatreSvg from "../Utils/TheatreSvg";
import { PiPSvg } from "../Utils/PiPSvg";
import { useTheme } from "@emotion/react";
import { ReplaySvg } from "../Utils/ReplaySvg";
import { WebVTT } from "vtt.js";
import { GearSvg } from "../Utils/GearSvg";
import AmbientSvg from "../Utils/AmbientSvg";
import PlaybackSvg from "../Utils/PlaybackSvg";
import ProgressLists from "../Utils/ProgressLists";
import { UserInteractionContext } from "../../Contexts/RootContexts";
import { useFullscreen } from "../Utils/useFullScreen";

const VideoControls = ({
  videoRef,
  tracker,
  videoId,
  playlistId,
  shuffledVideos,
  isPlaying,
  togglePlayPause,
  setPreviousVolume,
  playlistVideos,
  videoReady,
  index,
  toggleFullScreen,
  volume,
  volumeSlider,
  handleVolumeToggle,
  isMuted,
  jumpedToMax,
  isIncreased,
  isAnimating,
  isTheatre,
  setIsTheatre,
  isMini,
  isReplay,
  isPipActive,
  videoContainerWidth,
  controlOpacity,
  handleTogglePiP,
  vttUrl,
  showSettings,
  playbackSpeed,
  setPlaybackSpeed,
  playbackSliderSpeed,
  customPlayback,
  isAmbient,
  setIsAmbient,
  updateState,
  playerWidth,
  playerHeight
}) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.down("xl"));
const isFullscreen = useFullscreen();
  const context = useContext(UserInteractionContext);
  const pipSupported = !!document.pictureInPictureEnabled;

  const tooltipStyles = useMemo(
    () => ({
      whiteSpace: "nowrap",
      backgroundColor: "rgb(27,26,27)",
      color: "#f1f1f1",
      fontSize: "0.75rem",
      fontWeight: "600",
      borderRadius: "4px",
      py: "4px",
      px: "6px",
    }),
    []
  );

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
  const controlStyles = useMemo(
    () => ({
      width: isMobile ? "40px" : "48px",
      height: "100%",
      cursor: "pointer",
      padding: "0 2px",
    }),
    [isMobile]
  );
  const playbackHeight = useMemo(() => {
    return isMobile
      ? "170px"
      : isTablet
        ? "240px"
        : isDesktop
          ? "285px"
          : "414px";
  }, [isMobile, isTablet, isDesktop]);

  const ContainerStyles = useMemo(
    () => ({
      position: "absolute",
      opacity: controlOpacity,
      display: videoReady ? "block" : "none",
      PointerEvent: controlOpacity,
      width: isMini ? "480px" : videoContainerWidth - 24,
      transition: "opacity 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      bottom: 0,
      height: isMobile ? "36px" : "48px",
      paddingTop: "3px",
      textAlign: "left",
      left: "12px",
      borderRadius: "3px",
      zIndex: 59,
    }),
    [controlOpacity, isMini, videoContainerWidth, isMobile, videoReady]
  );

  const theatreTitle = isTheatre ? "Default view (t)" : "Theatre mode (t)";
  const pipTitle = isPipActive
    ? "Exit picture-in-picture"
    : "Picture-in-picture";
  const fullScreenTitle = isFullscreen
    ? "Exit full screen (f)"
    : "Full screen (f)";
  const navigate = useNavigate();
  const volumeSliderRef = useRef(null);
  const { isUserInteracted, setIsUserInteracted } = context ?? {};
  const [showVolumePanel, setShowVolumePanel] = useState(false);

  const [showPlaybackMenu, setShowPlaybackMenu] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

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

  const nextSearch = useMemo(() => {
    const isNextInPlaylist = playlistId && index < playlistVideos.length - 1;
    const fallback = shuffledVideos?.[0]?._id ?? null;

    return {
      v: isNextInPlaylist ? playlistVideos[index + 1]?._id : fallback,
      list: isNextInPlaylist ? playlistId : undefined,
      index: isNextInPlaylist ? index + 2 : undefined,
    };
  }, [playlistId, index, playlistVideos, shuffledVideos]);

  const nextVideo = useMemo(() => {
    if (playlistId && index < playlistVideos.length - 1) {
      return playlistVideos[index + 1];
    }
    return shuffledVideos?.length > 0 ? shuffledVideos[0] : null;
  }, [playlistId, index, playlistVideos, shuffledVideos]);

  const tooltipContent = useMemo(() => {
    if (!nextVideo) return null;

    return (
      <Box
        sx={{
          position: "relative",
          width: isMobile ? 200 : 240,
          padding: "0 2px 2px 2px",
        }}
      >
        <Box sx={{ padding: "0px" }}>
          <Typography
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              textAlign: "center",
              margin: 0,
            }}
            color="#aaa"
            variant="caption"
          >
            NEXT(SHIFT+N)
          </Typography>

          <Typography
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              whiteSpace: "break-spaces",
              textOverflow: "ellipsis",
              textAlign: "center",
              margin: 0,
            }}
            variant="caption"
          >
            {nextVideo.title}
          </Typography>
        </Box>

        <CardMedia
          sx={{
            borderRadius: "16px 16px",
            flexGrow: "1!important",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            aspectRatio: "16/9",
          }}
          component="img"
          loading="lazy"
          image={nextVideo.thumbnail?.url}
        />
      </Box>
    );
  }, [nextVideo, isMobile]);

  const handlePrevPlaylist = () => {
    if (index <= 0) return;
    navigate({
      to: "/watch",
      search: {
        v: playlistVideos[index - 1]._id,
        list: playlistId,
        index: index,
      },
    });
  };

  // playbackSettings

  const handleChange = (_, speed) => {
    console.log("hello");
    updateState({ playbackSpeed: speed });
    updateState({ playbackSliderSpeed: speed });
    if (customPlayback !== true) {
      updateState({ customPlayback: true });
    }
  };

  // Ambient

  const handleAmbientChange = () => {
    setIsAmbient((prev) => !prev);
  };

  // Volume

  const handleVolumeMove = (e) => {
    e.preventDefault();
    if (!volumeSliderRef.current || !videoRef.current) return;
    setShowVolumePanel(true);

    const rect = volumeSliderRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const normalizedVolume = Math.min(Math.max(offsetX / rect.width, 0), 1);
    const volumeValue = normalizedVolume * 40;

    if (normalizedVolume === 0) {
      setPreviousVolume(40);
      updateState({ isMuted: true });
      updateState({ volumeSlider: 0 });
      updateState({ volume: 40 });
    } else {
      updateState({ isMuted: false });
      updateState({ volume: volumeValue });
      updateState({ volumeSlider: volumeValue });
      setPreviousVolume(volumeValue);
    }
  };

  // updateState({
  //   volume: newVolume <= 0 ? 0 : Number(newVolume * 40).toFixed(1),
  // });

  const handleVolumeEnd = () => {
    window.removeEventListener("mousemove", handleVolumeMove);
    window.removeEventListener("mouseup", handleVolumeEnd);
  };

  const handleVolumeStart = (e) => {
    handleVolumeMove(e);
    e.preventDefault();
    window.addEventListener("mousemove", handleVolumeMove);
    window.addEventListener("mouseup", handleVolumeEnd);
  };

  const handleVolumeClick = (e) => {
    if (!volumeSliderRef.current || !videoRef.current) return;

    const rect = volumeSliderRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newVolume = Math.min(Math.max(offsetX / rect.width, 0), 1);

    videoRef.current.volume = newVolume;
    updateState({
      volume: newVolume <= 0 ? 0 : Number(newVolume * 40).toFixed(1),
    });
  };

  const handleVolumeHover = (e) => {
    setShowVolumePanel(true);
  };

  const handleTheatreToggle = () => {
    setIsUserInteracted(true);
    startTransition(() => {
      setIsTheatre((prev) => !prev);
    });
  };

  const handlePlaybackspeed = (speed) => {
    setPlaybackSpeed(speed);
  };
  return (
    <>
      <Box
        sx={{
          opacity: controlOpacity,
          zIndex: 59,
        }}
        className="controls-background-overlay"
      ></Box>

      <Box className="video-controls" sx={ContainerStyles}>
        <Box
          className="controls"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <Box
            className="left-controls"
            sx={{ display: "flex", height: "100%" }}
          >
            {playlistId && index > 0 && (
              <Tooltip
                disableInteractive
                disableFocusListener
                disableTouchListener
                title={"Replay"}
                placement="top"
                slotProps={{
                  popper: {
                    disablePortal: true,
                    modifiers: popperModifiers,
                  },
                  tooltip: {
                    sx: tooltipStyles,
                  },
                }}
              >
                <a
                  className="control"
                  style={controlStyles}
                  onClick={handlePrevPlaylist}
                >
                  <SkipPreviousSvg />
                </a>
              </Tooltip>
            )}
            {isReplay ? (
              <Tooltip
                disableInteractive
                disableFocusListener
                disableTouchListener
                disableHoverListener={isMini}
                title={"Replay"}
                placement="top"
                slotProps={{
                  popper: {
                    disablePortal: true,
                    modifiers: popperModifiers,
                  },
                  tooltip: {
                    sx: tooltipStyles,
                  },
                }}
              >
                <a
                  className="control"
                  style={controlStyles}
                  onClick={() => {
                    togglePlayPause();
                    updateState({ showIcon: false });
                  }}
                >
                  <ReplaySvg />
                </a>
              </Tooltip>
            ) : (
              <Tooltip
                disableInteractive
                disableFocusListener
                disableTouchListener
                disableHoverListener={isMini}
                title={isPlaying ? "Pause (k)" : "Play (k)"}
                placement="top"
                slotProps={{
                  popper: {
                    disablePortal: true,
                    modifiers: popperModifiers,
                  },
                  tooltip: {
                    sx: tooltipStyles,
                  },
                }}
              >
                <a
                  className="control"
                  style={controlStyles}
                  onClick={() => {
                    togglePlayPause();
                    updateState({ showIcon: false });
                  }}
                >
                  <PlayPauseSvg isPlaying={isPlaying} />
                </a>
              </Tooltip>
            )}

            <Tooltip
              disableInteractive
              disableFocusListener
              disableTouchListener
              disableHoverListener={isMini}
              slotProps={{
                popper: {
                  disablePortal: true,
                  modifiers: nextVideoModifiers,
                },
                tooltip: {
                  sx: nextVideoStyles,
                },
              }}
              sx={{ padding: "0!important", margin: "0!important" }}
              title={tooltipContent}
              placement="top"
            >
              <Link
                className="control"
                style={controlStyles}
                to="/watch"
                onClick={() => {
                  setIsUserInteracted(true);
                }}
                search={nextSearch}
              >
                <SkipNextSvg />h
              </Link>
            </Tooltip>

            <Box
              onMouseEnter={handleVolumeHover}
              onMouseLeave={() => setShowVolumePanel(false)}
              component={"div"}
              className="volume-container"
              sx={{ display: "flex" }}
            >
              <Tooltip
                disableInteractive
                disableFocusListener
                disableTouchListener
                disableHoverListener={isMini}
                title={isMuted ? "Unmute (m)" : "Mute (m)"}
                placement="top"
                slotProps={{
                  popper: {
                    disablePortal: true,
                    modifiers: popperModifiers,
                  },
                  tooltip: {
                    sx: tooltipStyles,
                  },
                }}
              >
                <a style={controlStyles} onClick={handleVolumeToggle}>
                  <MorphingVolIcon
                    volume={volume / 40}
                    muted={isMuted}
                    jumpedToMax={jumpedToMax}
                    isIncreased={isIncreased}
                    isAnimating={isAnimating}
                  />
                </a>
              </Tooltip>
              <Tooltip
                disableInteractive
                disableFocusListener
                disableTouchListener
                title={"Volume"}
                placement="top"
                slotProps={{
                  popper: {
                    disablePortal: true,
                    modifiers: popperModifiers,
                  },
                  tooltip: {
                    sx: tooltipStyles,
                  },
                }}
              >
                <Box
                  ref={volumeSliderRef}
                  onMouseDown={handleVolumeClick}
                  className="volume-panel control"
                  sx={{
                    width: showVolumePanel ? "52px" : 0,
                    marginRight: showVolumePanel ? "3px" : 0,
                    transition:
                      "width 0.3s ease-in-out, margin 0.3s ease-in-out",
                    height: "100%",
                    outline: 0,
                    cursor: "pointer",
                  }}
                  component={"div"}
                  role="slider"
                  aria-valuemin="0"
                  aria-valuemax="1"
                  aria-valuenow={Math.round(videoRef.current?.volume)}
                >
                  <Box
                    className="volume-slider"
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      minHeight: "29px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      onMouseDown={handleVolumeStart}
                      className="volume-slider-thumb"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: `${volumeSlider}px`,
                        marginTop: "-6px",
                        color: "#fff",
                        width: "12px",
                        height: "12px",
                        background: "#fff",
                        borderRadius: "50px",
                        cursor: "pointer",
                      }}
                    ></Box>
                  </Box>
                </Box>
              </Tooltip>
            </Box>

            <IconButton disableRipple sx={{ cursor: "default" }}>
              <Typography sx={{ color: "#f1f1f1" }} fontSize={"0.85rem"}>
                {formatDuration(
                  Math.min(
                    Math.max(
                      0,
                        videoRef?.current?.currentTime
                    ) || 0,
                    videoRef?.current?.duration || 0
                  )
                )}{" "}
                / {formatDuration(videoRef?.current?.duration || 0)}
              </Typography>
            </IconButton>
          </Box>
          <Box className={`right-controls ${isMini ? "hidden" : ""}`}>
            <Box
              className={`${showSettings ? "" : "hide"}`}
              sx={{
                position: "absolute",
                right: "12px",
                bottom: isTablet && !showPlaybackMenu ? "47px" : "60px",
                width: showPlaybackMenu ? "251px" : "260px",
                height: showPlaybackMenu ? playbackHeight : "100px",
                display: "block",
                background: "rgba(28,28,28,.9)",
                borderRadius: "12px",
                transition: "all 0.25s cubic-bezier(.2,0,1,1)",
                overflow: "hidden",
                willChange: "width, height",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: "0",
                  width: "100%",
                  height: "100%",
                  transform: showPlaybackMenu
                    ? "translateX(0%)"
                    : "translateX(100%)",
                  transition: "transform 0.25s cubic-bezier(.2,0,1,1)",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
                className="settings-inner"
              >
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Box
                    onClick={() => setShowPlaybackMenu(false)}
                    className="exit-playback"
                    sx={{
                      paddingX: "6px",
                      borderBottom: "1px solid rgba(255,255,255,0.3)",
                      cursor: "pointer",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", py: 3 }}
                      className="item-text"
                    >
                      <KeyboardArrowLeftIcon sx={{ mb: "1px", mr: "12px" }} />
                      <Typography
                        variant="caption"
                        sx={{ display: "inline-block" }}
                      >
                        Playback speed
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Box
                      onClick={() => {
                        handlePlaybackspeed(playbackSliderSpeed);
                        updateState({ customPlayback: true });
                      }}
                      sx={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      className="settings-item"
                    >
                      <CheckIcon
                        sx={{
                          width: "20px",
                          height: "20px",
                          position: "absolute",
                          left: "8px",
                          top: "15px",
                          opacity:
                            customPlayback ||
                            playbackSpeed === playbackSliderSpeed
                              ? 1
                              : 0,
                        }}
                      />
                      <Typography
                        sx={{ fontWeight: "600", p: 2 }}
                        variant="caption"
                      >
                        Custom ({playbackSliderSpeed})
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                        className="item"
                      >
                        <Stack sx={{ flex: 1, mx: 4 }}>
                          <Typography
                            sx={{ px: 2, mx: "auto" }}
                            variant="body1"
                          >
                            {playbackSliderSpeed}x
                          </Typography>
                          <Slider
                            value={playbackSliderSpeed}
                            onChange={handleChange}
                            aria-label="Volume"
                            step={0.05}
                            min={0.25}
                            max={2}
                            sx={{
                              color: "#eee",
                              "& .MuiSlider-track": {
                                backgroundColor: "#eee",
                              },
                              "& .MuiSlider-rail": {
                                backgroundColor: "#eee",
                              },
                              "& .MuiSlider-valueLabel": {
                                backgroundColor: "transparent",
                                color: "transparent",
                              },
                              "& .MuiSlider-thumb": {
                                boxShadow: "none",
                                "&:hover, &:focus, &.Mui-active, &.Mui-focusVisible":
                                  {
                                    boxShadow: "none",
                                  },
                              },
                            }}
                          />
                        </Stack>
                      </Box>
                    </Box>

                    <Box
                      onClick={() => {
                        handlePlaybackspeed(0.25);
                        updateState({ customPlayback: false });
                        setShowPlaybackMenu(false);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="settings-item"
                    >
                      <CheckIcon
                        sx={{
                          width: "20px",
                          height: "20px",
                          position: "absolute",
                          left: "8px",
                          top: "10px",
                          opacity:
                            playbackSpeed === 0.25 &&
                            playbackSpeed != playbackSliderSpeed
                              ? 1
                              : 0,
                        }}
                      />
                      <Typography
                        sx={{ fontWeight: "600", px: 2 }}
                        variant="caption"
                      >
                        0.25
                      </Typography>
                    </Box>
                    <Box
                      onClick={() => {
                        handlePlaybackspeed(0.5);
                        updateState({ customPlayback: false });
                        setShowPlaybackMenu(false);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="settings-item"
                    >
                      <CheckIcon
                        sx={{
                          width: "20px",
                          height: "20px",
                          position: "absolute",
                          left: "8px",
                          top: "10px",
                          opacity:
                            !customPlayback &&
                            playbackSpeed === 0.5 &&
                            playbackSpeed != playbackSliderSpeed
                              ? 1
                              : 0,
                        }}
                      />
                      <Typography
                        sx={{ fontWeight: "600", px: 2 }}
                        variant="caption"
                      >
                        0.5
                      </Typography>
                    </Box>
                    <Box
                      onClick={() => {
                        handlePlaybackspeed(0.75);
                        updateState({ customPlayback: false });
                        setShowPlaybackMenu(false);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="settings-item"
                    >
                      <CheckIcon
                        sx={{
                          width: "20px",
                          height: "20px",
                          position: "absolute",
                          left: "8px",
                          top: "10px",
                          opacity:
                            !customPlayback &&
                            playbackSpeed === 0.75 &&
                            playbackSpeed != playbackSliderSpeed
                              ? 1
                              : 0,
                        }}
                      />
                      <Typography
                        sx={{ fontWeight: "600", px: 2 }}
                        variant="caption"
                      >
                        0.75
                      </Typography>
                    </Box>
                    <Box
                      onClick={() => {
                        handlePlaybackspeed(1.0);
                        updateState({ customPlayback: false });
                        setShowPlaybackMenu(false);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="settings-item"
                    >
                      <CheckIcon
                        sx={{
                          width: "20px",
                          height: "20px",
                          position: "absolute",
                          left: "8px",
                          top: "10px",
                          opacity:
                            !customPlayback &&
                            playbackSpeed === 1 &&
                            playbackSpeed != playbackSliderSpeed
                              ? 1
                              : 0,
                        }}
                      />
                      <Typography
                        sx={{ fontWeight: "600", px: 2 }}
                        variant="caption"
                      >
                        Normal (1)
                      </Typography>
                    </Box>
                    <Box
                      onClick={() => {
                        handlePlaybackspeed(1.25);
                        updateState({ customPlayback: false });
                        setShowPlaybackMenu(false);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="settings-item"
                    >
                      <CheckIcon
                        sx={{
                          width: "20px",
                          height: "20px",
                          position: "absolute",
                          left: "8px",
                          top: "10px",
                          opacity:
                            !customPlayback &&
                            playbackSpeed === 1.25 &&
                            playbackSpeed != playbackSliderSpeed
                              ? 1
                              : 0,
                        }}
                      />
                      <Typography
                        sx={{ fontWeight: "600", px: 2 }}
                        variant="caption"
                      >
                        1.25
                      </Typography>
                    </Box>
                    <Box
                      onClick={() => {
                        handlePlaybackspeed(1.5);
                        updateState({ customPlayback: false });
                        setShowPlaybackMenu(false);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="settings-item"
                    >
                      <CheckIcon
                        sx={{
                          width: "20px",
                          height: "20px",
                          position: "absolute",
                          left: "8px",
                          top: "10px",
                          opacity:
                            !customPlayback &&
                            playbackSpeed === 1.5 &&
                            playbackSpeed != playbackSliderSpeed
                              ? 1
                              : 0,
                        }}
                      />
                      <Typography
                        sx={{ fontWeight: "600", px: 2 }}
                        variant="caption"
                      >
                        1.5
                      </Typography>
                    </Box>
                    <Box
                      onClick={() => {
                        handlePlaybackspeed(1.75);
                        updateState({ customPlayback: false });
                        setShowPlaybackMenu(false);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="settings-item"
                    >
                      <CheckIcon
                        sx={{
                          width: "20px",
                          height: "20px",
                          position: "absolute",
                          left: "8px",
                          top: "10px",
                          opacity:
                            !customPlayback &&
                            playbackSpeed === 1.75 &&
                            playbackSpeed != playbackSliderSpeed
                              ? 1
                              : 0,
                        }}
                      />
                      <Typography
                        sx={{ fontWeight: "600", px: 2 }}
                        variant="caption"
                      >
                        1.75
                      </Typography>
                    </Box>
                    <Box
                      onClick={() => {
                        handlePlaybackspeed(2);
                        updateState({ customPlayback: false });
                        setShowPlaybackMenu(false);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                      className="settings-item"
                    >
                      <CheckIcon
                        sx={{
                          width: "20px",
                          height: "20px",
                          position: "absolute",
                          left: "8px",
                          top: "10px",
                          opacity:
                            !customPlayback &&
                            playbackSpeed === 2 &&
                            playbackSpeed != playbackSliderSpeed
                              ? 1
                              : 0,
                        }}
                      />
                      <Typography
                        sx={{ fontWeight: "600", px: 2 }}
                        variant="caption"
                      >
                        2
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  inset: "0",
                  width: "100%",
                  height: "100%",
                  transform: showPlaybackMenu
                    ? "translateX(-100%)"
                    : "translateX(0%)",
                  transition: "transform 0.25s cubic-bezier(.2,0,1,1)",
                }}
                className="settings-inner"
              >
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Box
                    onClick={handleAmbientChange}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    className="settings-item"
                  >
                    <Box className="label-icon">
                      <Box className="item-icon">
                        <AmbientSvg />
                      </Box>
                      <Box className="item-content">
                        <Typography
                          variant="caption"
                          sx={{
                            display: "inline-block",
                            fontWeight: "600",
                          }}
                        >
                          Ambient Mode
                        </Typography>
                      </Box>
                    </Box>
                    <Box className="item-switch">
                      <Switch
                        checked={isAmbient}
                        slotProps={{
                          input: {
                            "aria-label": "controlled",
                          },
                        }}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              background: "#e1002d",
                              opacity: 1,
                            },
                          "& .MuiSwitch-track": {
                            background: "rgba(255,255,255)", // or your custom color
                          },
                        }}
                        color="default"
                      />
                    </Box>
                  </Box>
                  <Box
                    onClick={() => {
                      setShowPlaybackMenu(true);
                    }}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    className="settings-item"
                  >
                    <Box className="label-icon">
                      <Box className="item-icon">
                        <PlaybackSvg />
                      </Box>
                      <Box className="item-content">
                        <Typography
                          variant="caption"
                          sx={{
                            display: "inline-block",
                            fontWeight: "600",
                          }}
                        >
                          Playback speed
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center" }}
                      className="item-text"
                    >
                      <Typography
                        variant="caption"
                        sx={{ display: "inline-block" }}
                      >
                        {playbackSpeed === 1 ? "Normal" : playbackSpeed}
                      </Typography>
                      <KeyboardArrowRightIcon sx={{ mb: "1px" }} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Tooltip
              disableInteractive
              disableFocusListener
              disableTouchListener
              disableHoverListener={showSettings}
              title={`${showSettings ? "" : "Settings"}`}
              placement="top"
              slotProps={{
                popper: {
                  disablePortal: true,
                  modifiers: popperModifiers,
                },
                tooltip: {
                  sx: tooltipStyles,
                },
              }}
            >
              <a
                className="control"
                style={{ ...controlStyles }}
                onClick={() => {
                  updateState((prev) => ({ showSettings: !prev.showSettings }));
                  setShowPlaybackMenu(false);
                }}
              >
                <GearSvg showSettings={showSettings} />
              </a>
            </Tooltip>
            {!isFullscreen && pipSupported && (
              <Tooltip
                disableInteractive
                disableFocusListener
                disableTouchListener
                title={pipTitle}
                placement="top"
                slotProps={{
                  popper: {
                    disablePortal: true,
                    modifiers: popperModifiers,
                  },
                  tooltip: {
                    sx: tooltipStyles,
                  },
                }}
              >
                <a
                  className="control"
                  style={controlStyles}
                  onClick={handleTogglePiP}
                >
                  <PiPSvg />
                </a>
              </Tooltip>
            )}
            {!isFullscreen && (
              <Tooltip
                disableInteractive
                disableFocusListener
                disableTouchListener
                title={theatreTitle}
                placement="top"
                slotProps={{
                  popper: {
                    disablePortal: true,
                    modifiers: popperModifiers,
                  },
                  tooltip: {
                    sx: tooltipStyles,
                  },
                }}
              >
                <a
                  className="control"
                  style={controlStyles}
                  onClick={handleTheatreToggle}
                >
                  <TheatreSvg isTheatre={isTheatre} />
                </a>
              </Tooltip>
            )}
            <Tooltip
              disableInteractive
              disableFocusListener
              disableTouchListener
              title={fullScreenTitle}
              placement="top"
              slotProps={{
                popper: {
                  disablePortal: true,
                  modifiers: popperModifiers,
                },
                tooltip: {
                  sx: tooltipStyles,
                },
              }}
            >
              <a
                className="full-screen-btn control"
                style={controlStyles}
                onClick={toggleFullScreen}
              >
                <FullScreenSvg isFullscreen={isFullscreen} />
              </a>
            </Tooltip>
          </Box>
        </Box>

        <ProgressLists
          videoRef={videoRef}
          tracker={tracker}
          videoId={videoId}
          isTheatre={isTheatre}
          isMini={isMini}
          vttUrl={vttUrl}
          updateState={updateState}
          playerWidth={playerWidth} 
          playerHeight={playerHeight}
        />
      </Box>
    </>
  );
};

export default React.memo(VideoControls);
