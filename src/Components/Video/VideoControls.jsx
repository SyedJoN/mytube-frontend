import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  startTransition,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { PlayPauseSvg } from "../Utils/PlayPauseSvg";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  CardMedia,
  useMediaQuery,
} from "@mui/material";
import { SkipPreviousSvg } from "../Utils/SkipPreviousSvg";
import { SkipNextSvg } from "../Utils/SkipNextSvg";

import formatDuration from "../../utils/formatDuration";

import "../Utils/iconMorph.css";
import { MorphingVolIcon } from "../Utils/VolumeIcon";
import { FullScreenSvg } from "../Utils/FullScreenSvg";
import TheatreSvg from "../Utils/TheatreSvg";
import { useUserInteraction } from "../../routes/__root";
import { PiPSvg } from "../Utils/PiPSvg";
import { useTheme } from "@emotion/react";
import { ReplaySvg } from "../Utils/ReplaySvg";

const tooltipStyles = {
  whiteSpace: "nowrap",
  backgroundColor: "rgb(27,26,27)",
  color: "#f1f1f1",
  fontSize: "0.75rem",
  fontWeight: "600",
  borderRadius: "4px",
  py: "4px",
  px: "6px",
};

const nextVideoStyles = {
  whiteSpace: "nowrap",
  backgroundColor: "rgb(27,26,27)",
  fontSize: "0.75rem",
  borderRadius: "16px",
  padding: "0",
};

const popperModifiers = [
  {
    name: "offset",
    options: {
      offset: [0, 5],
    },
  },
];
const nextVideoModifiers = [
  {
    name: "offset",
    options: {
      offset: [60, 0],
    },
  },
    {
          name: 'flip',
          enabled: false,
        },
        {
          name: 'preventOverflow',
          enabled: false,
        },
        {
          name: 'hide',
          enabled: false,
        },
];

const VideoControls = forwardRef(
  (
    {
      playlistId,
      bufferedVal,
      filteredVideos,
      progress,
      setProgress,
      isPlaying,
      togglePlayPause,
      setShowIcon,
      playlistVideos,
      index,
      toggleFullScreen,
      volume,
      setVolume,
      handleVolumeToggle,
      isMuted,
      jumpedToMax,
      isIncreased,
      isAnimating,
      isTheatre,
      isMini,
      isReplay,
      setIsTheatre,
      videoContainerWidth,
      controlOpacity,
      showVolumePanel,
      setShowVolumePanel,
      handleTogglePiP,
    },
    videoRef
  ) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const controlStyles = {
      width: isMobile ? "40px" : "48px",
      height: "100%",
      cursor: "pointer",
      padding: "0 2px",
    };

    const ContainerStyles = {
      position: "absolute",
      opacity: controlOpacity,
      width: isMini ? "480px" : videoContainerWidth - 24,
      transition: "opacity .25s cubic-bezier(0,0,.2,1)",
      bottom: 0,
      height: isMobile ? "36px" : "48px",
      paddingTop: "3px",
      textAlign: "left",
      left: "12px",
      borderRadius: "3px",
      zIndex: 59,
    };

    const isFullscreen = !!document.fullscreenElement;
    const ariaValueNow = videoRef.current
      ? Math.round(videoRef.current.currentTime)
      : 0;
    const ariaValueMax = videoRef.current
      ? Math.round(videoRef.current.duration)
      : 0;
    const theatreTitle = isTheatre ? "Default view (t)" : "Theatre mode (t)";
    const fullScreenTitle = isFullscreen
      ? "Exit full screen (f)"
      : "Full screen (f)";
    const navigate = useNavigate();
    var thumbWidth = 13;
    const sliderRef = useRef(null);
    const volumeSliderRef = useRef(null);
    const { isUserInteracted, setIsUserInteracted } = useUserInteraction();
    const [BarWidth, setBarWidth] = useState(0);

    const handleSeekMove = (e) => {
      if (!sliderRef.current || !videoRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newProgress = Math.min(
        Math.max((offsetX / rect.width) * 100, 0),
        100
      );

      const newTime = (videoRef.current?.duration * newProgress) / 100;
      videoRef.current.currentTime = newTime;
      setProgress(newProgress);
    };

    const handleSeekEnd = () => {
      window.removeEventListener("mousemove", handleSeekMove);
      window.removeEventListener("mouseup", handleSeekEnd);
    };

    const handleSeekStart = (e) => {
      e.preventDefault();
      window.addEventListener("mousemove", handleSeekMove);
      window.addEventListener("mouseup", handleSeekEnd);
    };

    const handleClickSeek = (e) => {
      if (!sliderRef.current || !videoRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newProgress = Math.min(
        Math.max((offsetX / rect.width) * 100, 0),
        100
      );

      const newTime = (videoRef.current?.duration * newProgress) / 100;
      videoRef.current.currentTime = newTime;
      setProgress(newProgress);
    };

    const handleNext = () => {
      setIsUserInteracted(true);

      navigate({
        to: "/watch",
        search: { v: filteredVideos[0]?._id },
      });
    };
    const handleNextPlaylist = () => {
      if (index >= playlistVideos.length - 1) return;
      setIsUserInteracted(true);

      navigate({
        to: "/watch",
        search: {
          v: playlistVideos[index + 1]._id,
          list: playlistId,
          index: index + 2,
        },
      });
    };
    // const handlePrev = () => {
    //   if (!videoRef.current) return;
    //   videoRef.current.currentTime -= 5;
    //   videoRef.current.play();
    // };

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
    useEffect(() => {
      if (!sliderRef.current || !videoRef.current) return;

      const updateSizes = () => {
        const rect = sliderRef.current.getBoundingClientRect();
        setBarWidth(rect.width);
     
      };

      updateSizes();

      const observer = new ResizeObserver(updateSizes);
      observer.observe(sliderRef.current);
      observer.observe(videoRef.current);

      window.addEventListener("resize", updateSizes);

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateSizes);
      };
    }, [isTheatre]);

    // Volume

    const handleVolumeMove = (e) => {
      e.preventDefault();
      if (!volumeSliderRef.current || !videoRef.current) return;

      setShowVolumePanel(true);

      const rect = volumeSliderRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newVolume = Math.min(Math.max(offsetX / rect.width, 0), 1);

      videoRef.current.volume = newVolume;

      setVolume(newVolume <= 0 ? 0 : Number(newVolume * 40).toFixed(1));
    };

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
      setVolume(newVolume <= 0 ? 0 : Number(newVolume * 40).toFixed(1));
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
              {isReplay ? 
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
                    setShowIcon(false);
                  }}
                >
                  <ReplaySvg />
                </a>
              </Tooltip>
              :  
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
                    setShowIcon(false);
                  }}
                >
                  <PlayPauseSvg isPlaying={isPlaying} />
                </a>
              </Tooltip>
            }
             
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
                title={
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
                        {playlistVideos[index + 1]?.title ||
                          filteredVideos[0]?.title}
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
                      image={
                        playlistVideos[index + 1]?.thumbnail?.url ||
                        filteredVideos[0]?.thumbnail?.url
                      }
                    />
                  </Box>
                }
                placement="top"
              >
                <Link
                  className="control"
                  style={controlStyles}
                  to="/watch"
                  onClick={() => {
                    setIsUserInteracted(true);
                  }}
                  search={{
                    v:
                      playlistId && index < playlistVideos.length - 1
                        ? playlistVideos[index + 1]?._id
                        : filteredVideos[0]?._id,
                    list:
                      playlistId && index < playlistVideos.length - 1
                        ? playlistId
                        : undefined,
                    index:
                      playlistId && index < playlistVideos.length - 1
                        ? index + 2
                        : undefined,
                  }}
                >
                  <SkipNextSvg />
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
                        left: `${volume}px`,
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
              </Box>

              <IconButton disableRipple sx={{ cursor: "default" }}>
                <Typography sx={{ color: "#f1f1f1" }} fontSize={"0.85rem"}>
                  {formatDuration(progress || 0)} /{" "}
                  {formatDuration(videoRef?.current?.duration || 0)}
                </Typography>
              </IconButton>
            </Box>
            <Box
              className={`right-controls ${isMini ? "hidden" : ""}`}
            >
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

          <Box
            className={`progress-bar-container control`}
            sx={{
              position: "absolute",
              display: "block",
              left: isMini ? "-12px" : "0",
              bottom: isMobile && !isMini ? "36px" : isMini ? "-2px" : "48px",
              width: "100%",
              height: isMini ? "10px" : "5px",
            }}
          >
            <Box
              onClick={handleClickSeek}
              ref={sliderRef}
              component={"div"}
              role="slider"
              aria-valuemin={0}
              aria-valuenow={ariaValueNow}
              aria-valuemax={ariaValueMax}
              className="progress-bar"
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                touchAction: "none",
                cursor: "pointer",
                
              }}
            >
       
              <Box
                className="progress-list"
                sx={{
                  position: "relative",
                  height: "100%",
                  transform: "scaleY(.6)",
                  background: isMini ? "rgb(51,51,51)" : "rgba(255,255,255,0.2)",
                  transition:
                    "transform .1s cubic-bezier(0.4, 0, 1, 1)",
                     "&:hover": {
                transform: "scaleY(1.2)",
              },
                }}
                
              >
                <div
                  className="load-progress"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    transform: `scaleX(${progress / 100})`,
                    transformOrigin: "0 0",
                    zIndex: 2,
                    
                  }}
                ></div>
                <div 
                  className={`buffered-bar ${isMini ? "hide" : ""}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${bufferedVal * BarWidth}px`,
                    backgroundColor: "#888",
                    borderRadius: "3px",
                    zIndex: 1,
                    transition: "width 0.1s",
                  }}
                />
              </Box>
              <Box
                onMouseDown={handleSeekStart}
                className={`thumb-container ${isMini ? "hide" : ""}`}
                sx={{
                  position: "absolute",
                  left: `-${thumbWidth / 2}px`,
                  top: "-4px",
                  transform: `translateX(${(progress / 100) * BarWidth}px)`,
                }}
              >
                <div
                  className="custom-thumb"
                  style={{
                    width: `${thumbWidth}px`,
                    height: `${thumbWidth}px`,
                    borderRadius: "50px",
                    zIndex: 253,
                    transition:
                      "transform .1s cubic-bezier(.4,0,1,1),-webkit-transform .1s cubic-bezier(.4,0,1,1)",
                  }}
                ></div>
              </Box>
            </Box>
          </Box>
        </Box>
      </>
    );
  }
);

export default React.memo(VideoControls);
