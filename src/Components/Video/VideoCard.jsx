import * as React from "react";
import LazyLoad from "react-lazyload";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import Avatar from "@mui/material/Avatar";
import PlaylistPlayOutlinedIcon from "@mui/icons-material/PlaylistPlayOutlined";
import { MenuItem } from "@mui/material";
import OutlinedFlagOutlinedIcon from "@mui/icons-material/OutlinedFlagOutlined";
import { FastAverageColor } from "fast-average-color";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import {
  red,
  blue,
  green,
  purple,
  orange,
  deepOrange,
  pink,
} from "@mui/material/colors";
import Tooltip from "@mui/material/Tooltip";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Box } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTheme } from "@mui/material/styles";
import formatDuration from "../../utils/formatDuration";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import Interaction from "../Utils/Interaction";
import handleMouseDown from "../../helper/intertactionHelper";
import { useHoverPreview } from "../../helper/useHoverPreview";
import ProgressLists from "../Utils/ProgressLists";
import {
  TimeStampContext,
  UserContext,
  UserInteractionContext,
} from "../../Contexts/RootContexts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flushSync } from "react-dom";
import { TimeStampProvider } from "../../Contexts/TimeStampProvider";
import {
  HoverTelemetryTracker,
  initializeTelemetryArrays,
  sendYouTubeStyleTelemetry,
  setupVideoTelemetryEvents,
  startTelemetry,
} from "../../helper/Telemetry";
import { getWatchHistory } from "../../apis/userFn";
import { sendTelemetry } from "../../apis/sendTelemetry";

const tooltipStyles = {
  whiteSpace: "nowrap",
  backgroundColor: "rgba(26,25,25,255)",
  maxWidth: 700,
  color: "#f1f1f1",
  fontSize: "0.75rem",
  border: "1px solid #f1f1f1",
  borderRadius: "0",
  padding: "4px",
};

const hoverVideoTooltipStyles = {
  whiteSpace: "nowrap",
  backgroundColor: "#0f0f0f",
  maxWidth: 700,
  color: "#aaa",
  fontSize: "0.75rem",
  border: "1px solid #aaa",
  borderRadius: "0",
};

const linkStyles = { display: "inline-block", textDecoration: "none" };

const viewStyles = {
  display: "inline-block",
  verticalAlign: "top",
  textDecoration: "none",
  userSelect: "none",
};

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: "rotate(0deg)",
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: "rotate(180deg)",
      },
    },
  ],
}));

function VideoCard({
  videoId,
  owner,
  thumbnail,
  previewUrl,
  videoUrl,
  vttUrl,
  title,
  description,
  avatar,
  fullName,
  views,
  duration,
  videoCount,
  createdAt,
  fontSize,
  home,
  search,
  video,
  profile,
  playlist,
  playlistId,
  activeOptionsId,
  setActiveOptionsId,
  videoMd,
  ...props
}) {
  const navigate = useNavigate();
  const interactionRef = React.useRef(null);
  const hoverTrackerRef = React.useRef(new HoverTelemetryTracker());
  const timeoutRef = React.useRef(null);
  const queryClient = useQueryClient();

  const context = React.useContext(UserInteractionContext);
  const { setTimeStamp, setFromHome, getTimeStamp } =
    React.useContext(TimeStampContext);

  const userContext = React.useContext(UserContext);
  const { data: dataContext } = userContext ?? {};
  const isAuthenticated = dataContext || null;
  const userId = dataContext?._id || null;
  const { setIsUserInteracted } = context ?? {};
  const hoverVideoRef = React.useRef(null);
  const previewRef = React.useRef(null);
  const theme = useTheme();
  const imgRef = React.useRef(null);
  const hasWatchedEnoughRef = React.useRef(false);
  const check3SecIntervalRef = React.useRef(null);
  const historyIntervalRef = React.useRef(null);
  const [bgColor, setBgColor] = React.useState("rgba(0,0,0,0.6)");
  const [bufferedVal, setBufferedVal] = React.useState(0);
  const [viewVideo, setViewVideo] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [isVolumeMuted, setIsVolumeMuted] = React.useState(true);

  const fac = new FastAverageColor();
  const colors = [red, blue, green, purple, orange, deepOrange, pink];
  const playlistVideoId = playlist?.videos?.map((video) => {
    return video._id;
  });
  const searchParams = React.useMemo(() => ({ v: videoId }), [videoId]);

  const {
    data: userHistory,
    isHistoryLoading,
    isHistoryError,
    historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["userHistory"],
    queryFn: getWatchHistory,
    enabled: !!userId,
  });

  let userResumeTime = userId
    ? (userHistory?.data?.find((entry) => entry.video?._id === videoId)
        ?.currentTime ?? 0)
    : 0;
  const {
    isHoverPlay,
    setIsHoverPlay,
    isVideoPlaying,
    setIsVideoPlaying,
    onMouseEnter,
    onMouseLeave,
  } = useHoverPreview({
    delay: 1000,
  });

  const sendWatchHistory = (videoId) => {
    if (watchHistoryTimeout.current) return;
    watchHistoryTimeout.current = setTimeout(() => {
      sendHistoryMutation(videoId);
    }, 10000);
  };

  const handleLoadedMetadata = () => {
    const video = hoverVideoRef.current;
    if (!video) return;
    // const guestResumeTime = getSavedHoverTime(videoId);

    // const isValidGuestResumeTime =
    //   isFinite(guestResumeTime) &&
    //   guestResumeTime > 0 &&
    //   guestResumeTime < video.duration;

    const isValidUserResumeTime =
      isFinite(userResumeTime) &&
      userResumeTime > 0 &&
      userResumeTime < video.duration;
  };
  // React.useEffect(() => {
  //   if (!videoReady || !home) return;

  //   const video = hoverVideoRef.current;
  //   if (!video) return;
  //   const clearAllIntervals = () => {
  //     clearInterval(check3SecIntervalRef.current);
  //     clearInterval(historyIntervalRef.current);
  //   };

  //   const handlePlay = () => {
  //     console.log("handleplay");
  //     clearAllIntervals();
  //     hasWatchedEnoughRef.current = false;
  //     prevTimeRef.current = video.currentTime;

  //     check3SecIntervalRef.current = setInterval(() => {
  //       const timeWatched = video.currentTime - prevTimeRef.current;

  //       if (timeWatched >= 3) {
  //         hasWatchedEnoughRef.current = true;
  //         clearInterval(check3SecIntervalRef.current);

  //         // Start sending history
  //         historyIntervalRef.current = setInterval(sendWatchHistory, 3000);
  //       }
  //     }, 1000);
  //   };

  //   const handlePause = () => {
  //     clearAllIntervals();
  //     prevTimeRef.current = video.currentTime;
  //     hasWatchedEnoughRef.current = false;
  //   };

  //   const handleResume = () => {
  //     clearInterval(historyIntervalRef.current);
  //     if (hasWatchedEnoughRef.current) {
  //       historyIntervalRef.current = setInterval(sendWatchHistory, 5000);
  //     } else {
  //       handlePlay(); // re-check from current point
  //     }
  //   };

  //   video.addEventListener("loadedmetadata", handleLoadedMetadata);
  //   video.addEventListener("play", handlePlay);
  //   video.addEventListener("pause", handlePause);
  //   video.addEventListener("ended", handlePause);
  //   video.addEventListener("waiting", clearAllIntervals);
  //   video.addEventListener("playing", handleResume);
  //   video.addEventListener("seeked", sendWatchHistory);

  //   return () => {
  //     clearAllIntervals();
  //     video.removeEventListener("loadedmetadata", handleLoadedMetadata);
  //     video.removeEventListener("play", handlePlay);
  //     video.removeEventListener("pause", handlePause);
  //     video.removeEventListener("ended", handlePause);
  //     video.removeEventListener("waiting", clearAllIntervals);
  //     video.removeEventListener("playing", handleResume);
  //     video.removeEventListener("seeked", sendWatchHistory);
  //   };
  // }, [videoReady, home, videoId]);

  React.useEffect(() => {
    const video = hoverVideoRef?.current;
    const tracker = hoverTrackerRef.current;

    if (!video || !tracker) return;

    setupVideoTelemetryEvents(video, tracker, videoId);

    console.log("🎯 Telemetry events setup complete for video:", videoId);

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up telemetry events");
    };
  }, [videoId, userId]);

  React.useEffect(() => {
    const video = hoverVideoRef?.current;
    const tracker = hoverTrackerRef.current;

    if (!video) return;

    const handlePlay = async () => {
      let refetchedTime = 0;
      if (isAuthenticated) {
        try {
          const res = await refetchHistory();
          const refetchedVideo = res.data?.data?.find(
            (video) => video.video._id === videoId
          );
          refetchedTime = refetchedVideo?.currentTime || 0;
        } catch (error) {
          console.error("Error refetching video history:", error);
        }
      } else {
        // refetchedTime = getSavedHoverTime(videoId);
      }

      const isValidResumeTime =
        isFinite(refetchedTime) && refetchedTime < video.duration;

      try {
        await video.play();
        clearTimeout(timeoutRef.current);
        if (isVideoPlaying) {
          timeoutRef.current = setTimeout(() => {
            video.classList.add("hide-cursor");
          }, 2000);
        }
        video.currentTime = isValidResumeTime ? refetchedTime : 0;
      } catch (err) {
        setIsVideoPlaying(false);
      }
    };

    const handleStop = () => {
      clearTimeout(timeoutRef.current);
      video.pause();
      video.classList.remove("hide-cursor");
    };

    if (isHoverPlay && document.visibilityState === "visible") {
      handlePlay();
      initializeTelemetryArrays();
      startTelemetry(video, videoId, tracker);
      tracker.startHover(video);
    } else if (tracker.isTracking) {
      const telemetryData = tracker.endHover(video);
      console.log("Telemetry data returned:", telemetryData);
      if (telemetryData) {
        sendYouTubeStyleTelemetry(videoId, video, telemetryData);
      }
      handleStop();
      tracker.reset();
    }
    return () => {
      handleStop();
      console.log("🧹 useEffect cleanup");
    };
  }, [isHoverPlay]);

  React.useEffect(() => {
    return () => {
      console.log("🧹 Component unmount cleanup");
      const tracker = hoverTrackerRef.current;
      if (tracker?.telemetryTimer) {
        tracker.telemetryTimer.stop();
      }
      tracker?.reset();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  React.useEffect(() => {
    const preview = previewRef.current;
    let playTimeout;

    if (!preview) return;
    if (isHoverPlay) {
      playTimeout = setTimeout(() => {
        if (preview.paused) {
          preview.play().catch((err) => {
            if (err.name !== "AbortError") {
              console.error("Video play error:", err);
            }
          });
        }
      }, 100);
    } else {
      clearTimeout(playTimeout);
      if (!preview.paused) {
        preview.pause();
      }
    }

    return () => clearTimeout(playTimeout);
  }, [isHoverPlay]);

  const handleVolumeToggle = () => {
    const tracker = hoverTrackerRef.current;

    setIsVolumeMuted((prev) => !prev);
    if (tracker && hoverVideoRef.current) {
      tracker.handleVolumeToggle(hoverVideoRef.current);
    }
  };

  const getColor = (name) => {
    if (!name) return red[500];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index][500];
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      fac
        .getColorAsync(imgRef.current)
        .then((color) => {
          console.log("Extracted Color:", color.rgba);
          setBgColor(color.rgba);
        })
        .catch((err) => console.log("Color extraction error:", err));
    }
  };
  const handleToggleOptions = (id) => {
    setActiveOptionsId((prev) => (prev === id ? null : id));
  };

  const handleChannelClick = () => {
    navigate({
      to: `/@${owner}`,
    });
  };
  const handleInteraction = () => {
    setIsUserInteracted(true);
  };
  const handleDragEnd = () => {
    if (interactionRef.current) {
      interactionRef.current.classList.remove("down");
      interactionRef.current.classList.add("animate");
    }
  };
  // Hover Video

  React.useEffect(() => {
    const video = hoverVideoRef.current;
    if (!video) return;
    if (isVolumeMuted) {
      video.volume = 0;
    } else {
      video.volume = 1;
    }
  }, [isVolumeMuted]);

  const handleVideoPlaying = () => {
    setIsVideoPlaying(true);
  };
  const handleVideoEnd = (event) => {
    const video = event.target;
    setIsHoverPlay(false);

    // setTimeout(() => {
    //   setIsHoverPlay(true);
    // }, 600);
  };

  const handleVideoMouseMove = (e) => {
    const video = e.target;
    if (video.classList.contains("hide-cursor")) {
      video.classList.remove("hide-cursor");
    }
    if (!isHoverPlay) {
      setIsHoverPlay(true);
    }
    clearTimeout(timeoutRef.current);
    if (isVideoPlaying) {
      timeoutRef.current = setTimeout(() => {
        video.classList.add("hide-cursor");
      }, 2000);
    }
  };

  const handleTimeUpdate = (event) => {
    const video = event.target;
    if (video?.duration && !isNaN(video.duration)) {
      const value = (video.currentTime / video.duration) * 100;
      setProgress(value);
    }
    // if (video.currentTime === video.duration) {
    //   flushTelemetryQueue();
    //   refetchHistory();
    // }

    // if (!telemetrySentRef.current && Math.floor(watchTime) >= 10) {
    //   telemetrySentRef.current = true;
    //   console.log("🎯 10 seconds passed, telemetry sending...");
    //   const data = getCurrentVideoTelemetryData(userId, videoId, video);
    //   sendTelemetry([data]);
    //   return;
    // }
  };
  return (
    <>
      {home ? (
        <Card
          onClick={handleInteraction}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseDown={(e) => {
            handleMouseDown(e);
            e.stopPropagation();
          }}
          sx={{
            position: "relative",
            padding: 0,
            cursor: "pointer",
            overflow: "hidden",
            borderRadius: isHoverPlay && isVideoPlaying ? "0" : "10px",
            boxShadow: "none",
            width: "100%",
            display: "block",
            backgroundColor: "transparent",
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "block",
              width: "100%",
              paddingTop: "56.25%",
            }}
          >
            <Link
              draggable="false"
              to="/watch"
              onClick={() => hasWatchedEnoughRef.current && setFromHome(true)}
              search={searchParams}
            >
              <Box height="100%" position="absolute" top="0" left="0">
                {videoMd ? (
                  <LazyLoad height={200} once offset={100}>
                    <CardMedia
                      sx={{
                        borderRadius: "10px",
                        flexGrow: "1!important",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        aspectRatio: "16/9",
                      }}
                      loading="lazy"
                      component="img"
                      image={thumbnail}
                    />
                    {previewUrl && (
                      <video
                        loop
                        ref={previewRef}
                        muted
                        onPlaying={() => setIsVideoPlaying(true)}
                        id="video-player"
                        key={previewUrl}
                        src={isHoverPlay ? previewUrl : undefined}
                        className={`hover-interaction ${isHoverPlay ? "" : "hide"}`}
                        crossOrigin="anonymous"
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          left: 0,
                          top: 0,
                          objectFit: "cover",
                          opacity: isHoverPlay && isVideoPlaying ? 1 : 0,
                          transition: "opacity 0.3s ease",
                        }}
                      ></video>
                    )}
                  </LazyLoad>
                ) : (
                  <LazyLoad once>
                    <CardMedia
                      sx={{
                        flexGrow: "1!important",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        aspectRatio: "16/9",
                      }}
                      loading="lazy"
                      component="img"
                      image={thumbnail}
                    />
                    {videoUrl && (
                      <video
                        muted={isVolumeMuted}
                        onMouseMove={handleVideoMouseMove}
                        ref={hoverVideoRef}
                        onTimeUpdate={handleTimeUpdate}
                        onPlaying={handleVideoPlaying}
                        onEnded={handleVideoEnd}
                        onLoadedMetadata={handleLoadedMetadata}
                        id="video-player"
                        key={videoId}
                        className="hover-interaction"
                        crossOrigin="anonymous"
                        preload="none"
                        src={isHoverPlay ? videoUrl : undefined}
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          left: 0,
                          top: 0,
                          objectFit: "cover",
                          opacity: isHoverPlay && isVideoPlaying ? 1 : 0,
                          transition: "opacity 0.3s ease",
                        }}
                      ></video>
                    )}
                  </LazyLoad>
                )}
              </Box>
            </Link>
            <Tooltip
              disableInteractive
              disableFocusListener
              disableTouchListener
              title={`${isVolumeMuted ? "Unmute" : "Mute"}`}
              placement="bottom-end"
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [30, -14],
                      },
                    },
                  ],
                },
                tooltip: {
                  sx: { ...hoverVideoTooltipStyles },
                },
              }}
            >
              <Box
                onClick={handleVolumeToggle}
                className={`volume-overlay ${isHoverPlay && isVideoPlaying ? 1 : 0 ? "" : "hide"}`}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "35px",
                  height: "35px",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: "50px",
                }}
              >
                {isVolumeMuted ? (
                  <VolumeOffIcon sx={{ color: "#f1f1f1" }} />
                ) : (
                  <VolumeUpIcon sx={{ color: "#f1f1f1" }} />
                )}
              </Box>
            </Tooltip>
            <Box
              className={`${isHoverPlay && isVideoPlaying ? "hidden" : ""}`}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                bottom: "8px",
                right: "8px",
                width: "35px",
                height: "20px",
                backgroundColor: "rgba(0,0,0,0.6)",
                borderRadius: "5px",
              }}
            >
              <Typography
                variant="body2"
                color="#f1f1f1"
                fontSize="0.75rem"
                lineHeight="0"
              >
                {formatDuration(duration)}
              </Typography>
            </Box>
            <Box
              className={`${isHoverPlay && isVideoPlaying ? "" : "hidden"}`}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                bottom: "8px",
                right: "8px",
                width: "35px",
                height: "20px",
                backgroundColor: "rgba(0,0,0,0.6)",
                borderRadius: "5px",
              }}
            >
              <Typography
                variant="body2"
                color="#f1f1f1"
                fontSize="0.75rem"
                lineHeight="0"
              >
                {formatDuration(
                  Math.min(
                    hoverVideoRef?.current?.currentTime || 0,
                    hoverVideoRef?.current?.duration || 0
                  )
                )}
              </Typography>
            </Box>
            {isHoverPlay && isVideoPlaying && (
              <ProgressLists
                bufferedVal={bufferedVal}
                hoverVideoRef={hoverVideoRef}
                userId={userId}
                setBufferedVal={setBufferedVal}
                progress={progress}
                setProgress={setProgress}
                videoId={videoId}
                viewVideo={viewVideo}
                setViewVideo={setViewVideo}
                videoRef={hoverVideoRef}
                vttUrl={vttUrl}
                playsInline={true}
                tracker={hoverTrackerRef.current}
              />
            )}
          </Box>

          <CardContent
            sx={{
              position: "relative",
              backgroundColor: theme.palette.primary.main,
              padding: 0,
              paddingTop: "10px",
            }}
          >
            <Box sx={{ display: "flex" }}>
              <Avatar
                onClick={handleChannelClick}
                src={avatar ? avatar : null}
                sx={{ bgcolor: getColor(fullName), marginRight: "16px" }}
              >
                {fullName ? fullName.charAt(0).toUpperCase() : "?"}
              </Avatar>

              <Box
                sx={{
                  overflowX: "hidden",
                  paddingRight: "24px",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Link to="/watch" search={{ searchParams }}>
                  <Tooltip
                    disableInteractive
                    disableFocusListener
                    disableTouchListener
                    title={title}
                    placement="bottom"
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, -20],
                            },
                          },
                        ],
                      },
                      tooltip: {
                        sx: { ...tooltipStyles },
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="#f1f1f1"
                      sx={{
                        display: "-webkit-box",
                        fontSize: "0.85rem",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        WebkitLineClamp: 2,
                        textOverflow: "ellipsis",
                        fontWeight: 600,
                        height: "auto",
                        maxHeight: "3.5em",
                      }}
                    >
                      {title}
                    </Typography>
                  </Tooltip>
                </Link>

                {fullName && (
                  <>
                    <Link to={`/@${owner}`}>
                      <Tooltip
                        disableInteractive
                        disableFocusListener
                        disableTouchListener
                        title={fullName}
                        placement="top-start"
                        slotProps={{
                          popper: {
                            disablePortal: true,
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="#aaa"
                          sx={{
                            display: "inline-block",
                            "&:hover": {
                              color: "#fff",
                            },
                          }}
                        >
                          {fullName}
                        </Typography>
                      </Tooltip>
                    </Link>
                    <Typography variant="body2" color="#aaa">
                      <span>
                        {views} {views === 1 ? "view" : "views"} &bull;{" "}
                        {createdAt}
                      </span>
                    </Typography>
                  </>
                )}
              </Box>
            </Box>

            <IconButton
              sx={{ position: "absolute", right: "-12px", top: "4px" }}
              aria-label="settings"
            >
              <MoreVertIcon sx={{ color: "#fff" }} />
            </IconButton>
          </CardContent>
        </Card>
      ) : video ? (
        <Card
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={handleInteraction}
          onMouseDown={(e) => {
            handleMouseDown(e);
            e.stopPropagation();
          }}
          sx={{
            position: "relative",
            transition: "0.3s ease-in-out",
            padding: 0,
            cursor: "pointer",
            overflow: "visible",
            borderRadius: "8px",
            boxShadow: "none",
            display: "flex",
            backgroundColor: "transparent",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flex: "none",
              maxWidth: "500px",
              width: "176px",
              paddingRight: 1,
            }}
          >
            <Box
              width="100%"
              height="100%"
              sx={{
                position: "relative",
                display: "block",
                paddingTop: "56.25%",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  top: "50%",
                  left: "0%",
                  transform: "translateY(-50%)",
                }}
              >
                <Link
                  to="/watch"
                  search={searchParams}
                  style={{ ...linkStyles }}
                  onDragEnd={handleDragEnd}
                >
                  <LazyLoad height={200} once offset={100}>
                    <CardMedia
                      loading="lazy"
                      sx={{
                        borderRadius: "8px",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        userSelect: "none",
                      }}
                      component="img"
                      draggable="false"
                      image={thumbnail}
                    />
                    {previewUrl && (
                      <video
                        loop
                        ref={previewRef}
                        muted
                        onPlaying={() => setIsVideoPlaying(true)}
                        id="video-player"
                        key={previewUrl}
                        preload="none"
                        className={`hover-interaction ${isHoverPlay ? "" : "hide"}`}
                        crossOrigin="anonymous"
                        src={isHoverPlay ? previewUrl : undefined}
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          left: 0,
                          top: 0,
                          objectFit: "cover",
                          borderRadius: "8px",
                          opacity: isHoverPlay && isVideoPlaying ? 1 : 0,
                          transition: "opacity 0.3s ease",
                        }}
                      ></video>
                    )}
                  </LazyLoad>

                  <Box
                    className={`${isHoverPlay && isVideoPlaying ? "hidden" : ""}`}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      margin: "4px",
                      width: "35px",
                      height: "20px",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: "6px",
                      userSelect: "none",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="#f1f1f1"
                      fontSize="0.75rem"
                      lineHeight="0"
                    >
                      {formatDuration(duration)}
                    </Typography>
                  </Box>
                </Link>
              </Box>
            </Box>
          </Box>

          <CardContent
            sx={{
              backgroundColor: theme.palette.primary.main,
              display: "flex",
              flexDirection: "column",
              padding: "0!important",
              paddingRight: "24px!important",
              minWidth: 0,
              flex: 1,
            }}
          >
            <Link
              to="/watch"
              search={searchParams}
              style={{ ...linkStyles }}
              onDragEnd={() => {
                if (interactionRef.current) {
                  interactionRef.current.classList.remove("down");
                  interactionRef.current.classList.add("animate");
                }
              }}
            >
              <CardHeader
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  padding: 0,
                  "& .MuiCardHeader-content": {
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    minWidth: 0,
                  },
                  "& .css-1ro85z9-MuiTypography-root": {
                    lineHeight: 0.5,
                  },
                }}
                title={
                  <Tooltip
                    disableInteractive
                    disableFocusListener
                    disableTouchListener
                    title={title}
                    placement="bottom"
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, -20],
                            },
                          },
                        ],
                      },
                      tooltip: {
                        sx: { ...tooltipStyles },
                      },
                    }}
                  >
                    <Typography
                      variant="h8"
                      color="#f1f1f1"
                      sx={{
                        display: "-webkit-box",
                        fontSize: "0.85rem",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 600,
                        lineHeight: 1.5,
                        userSelect: "none",
                      }}
                    >
                      {title}
                    </Typography>
                  </Tooltip>
                }
                subheader={
                  <>
                    <Tooltip
                      disableInteractive
                      disableFocusListener
                      disableTouchListener
                      title={fullName}
                      placement="top-start"
                    >
                      <Typography
                        sx={{
                          display: "inline-block",
                          verticalAlign: "top",
                          textDecoration: "none",
                          userSelect: "none",
                        }}
                        fontSize="0.75rem"
                        color="#aaa"
                      >
                        {fullName}
                      </Typography>
                    </Tooltip>
                    <Typography fontSize="0.75rem" color="#aaa">
                      <span style={viewStyles}>
                        {views} {views === 1 ? "view" : "views"} &bull;{" "}
                        {createdAt}
                      </span>
                    </Typography>
                  </>
                }
              />
            </Link>
          </CardContent>

          <>
            <IconButton
              disableRipple
              className="no-ripple"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e);
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleOptions(videoId);
              }}
              sx={{
                position: "absolute",
                padding: 0,
                right: "-8px",
                top: "0",
                zIndex: "999",
              }}
              aria-label="settings"
            >
              <MoreVertIcon sx={{ color: "#fff", borderRadius: "50px" }} />

              <Interaction id="interaction" circle={true} />
            </IconButton>
            {activeOptionsId === videoId && (
              <Box
                id="create-menu"
                sx={{
                  position: "absolute",
                  top: "28px",
                  right: "0",
                  borderRadius: "12px",
                  backgroundColor: "#282828",
                  zIndex: 2,
                  paddingY: 1,
                }}
              >
                <MenuItem
                  sx={{
                    paddingTop: 1,
                    paddingLeft: "16px",
                    paddingRight: "36px",
                    gap: "3px",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <OutlinedFlagOutlinedIcon sx={{ color: "#f1f1f1" }} />
                  <Typography variant="body2" marginLeft="10px" color="#f1f1f1">
                    Report
                  </Typography>
                </MenuItem>
              </Box>
            )}
          </>
          <Interaction ref={interactionRef} id="video-interaction" />
        </Card>
      ) : search ? (
        <Card
          onClick={handleInteraction}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseDown={(e) => {
            handleMouseDown(e);
            e.stopPropagation();
          }}
          sx={{
            position: "relative",
            width: "100%",
            display: "flex",
            padding: 0,
            cursor: "pointer",
            overflow: "visible",
            borderRadius: "10px",
            boxShadow: "none",
            transition: "0.3s ease-in-out",
            backgroundColor: "transparent",
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            sx={{
              display: "flex",
              flex: "1",
              minWidth: "240px",
              maxWidth: "500px",
              paddingRight: 2,
            }}
          >
            <Box
              width="100%"
              sx={{
                position: "relative",
                display: "block",
                paddingTop: "56.25%",
                height: "0",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  top: "50%",
                  left: "0%",
                  transform: "translateY(-50%)",
                }}
              >
                <Link
                  draggable="false"
                  to="/watch"
                  search={searchParams}
                  style={{ ...linkStyles }}
                  onDragEnd={handleDragEnd}
                >
                  <LazyLoad once>
                    <CardMedia
                      sx={{
                        flexGrow: "1!important",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        aspectRatio: "16/9",
                        borderRadius:
                          isHoverPlay && isVideoPlaying ? "0" : "10px",
                      }}
                      loading="lazy"
                      component="img"
                      image={thumbnail}
                    />
                    {videoUrl && (
                      <video
                        muted={isVolumeMuted}
                        ref={hoverVideoRef}
                        onMouseMove={handleVideoMouseMove}
                        onTimeUpdate={handleTimeUpdate}
                        onPlaying={handleVideoPlaying}
                        onEnded={handleVideoEnd}
                        onLoadedMetadata={handleLoadedMetadata}
                        id="video-player"
                        key={videoId}
                        className="hover-interaction"
                        crossOrigin="anonymous"
                        preload="none"
                        src={isHoverPlay ? videoUrl : undefined}
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          left: 0,
                          top: 0,
                          objectFit: "cover",
                          opacity: isHoverPlay && isVideoPlaying ? 1 : 0,
                          transition: "opacity 0.3s ease",
                        }}
                      ></video>
                    )}
                  </LazyLoad>
                </Link>
                <Tooltip
                  disableInteractive
                  disableFocusListener
                  disableTouchListener
                  title={`${isVolumeMuted ? "Unmute" : "Mute"}`}
                  placement="bottom-end"
                  slotProps={{
                    popper: {
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [30, -14],
                          },
                        },
                      ],
                    },
                    tooltip: {
                      sx: { ...hoverVideoTooltipStyles },
                    },
                  }}
                >
                  <Box
                    onClick={handleVolumeToggle}
                    className={`volume-overlay ${isHoverPlay && isVideoPlaying ? "" : "hide"}`}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      width: "35px",
                      height: "35px",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: "50px",
                    }}
                  >
                    {isVolumeMuted ? (
                      <VolumeOffIcon sx={{ color: "#f1f1f1" }} />
                    ) : (
                      <VolumeUpIcon sx={{ color: "#f1f1f1" }} />
                    )}
                  </Box>
                </Tooltip>
                <Box
                  className={`${isHoverPlay && isVideoPlaying ? "hidden" : ""}`}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    width: "35px",
                    height: "20px",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: "5px",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="#f1f1f1"
                    fontSize="0.75rem"
                    lineHeight="0"
                  >
                    {formatDuration(duration)}
                  </Typography>
                </Box>
                <Box
                  className={`${isHoverPlay && isVideoPlaying ? "" : "hidden"}`}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    bottom: "8px",
                    right: "8px",
                    width: "35px",
                    height: "20px",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: "5px",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="#f1f1f1"
                    fontSize="0.75rem"
                    lineHeight="0"
                  >
                    {formatDuration(
                      Math.min(
                        hoverVideoRef?.current?.currentTime || 0,
                        hoverVideoRef?.current?.duration || 0
                      )
                    )}
                  </Typography>
                </Box>
                {isHoverPlay && isVideoPlaying && (
                  <ProgressLists
                    bufferedVal={bufferedVal}
                    hoverVideoRef={hoverVideoRef}
                    userId={userId}
                    setBufferedVal={setBufferedVal}
                    progress={progress}
                    setProgress={setProgress}
                    videoId={videoId}
                    viewVideo={viewVideo}
                    setViewVideo={setViewVideo}
                    videoRef={hoverVideoRef}
                    vttUrl={vttUrl}
                    playsInline={true}
                    tracker={hoverTrackerRef.current}
                  />
                )}
              </Box>
            </Box>
          </Box>

          <CardContent
            sx={{
              flex: 1,
              backgroundColor: theme.palette.primary.main,
              display: "flex",
              flexDirection: "column",
              padding: 0,
              minWidth: 0,
            }}
          >
            <CardHeader
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                padding: 0,
                "& .MuiCardHeader-content": {
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  minWidth: 0,
                },
              }}
              title={
                <Tooltip
                  disableInteractive
                  disableFocusListener
                  disableTouchListener
                  title={title}
                  placement="bottom-end"
                  slotProps={{
                    popper: {
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [-30, 0],
                          },
                        },
                      ],
                    },
                    tooltip: {
                      sx: {
                        ...tooltipStyles,
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h3"
                      color="#f1f1f1"
                      sx={{
                        display: "-webkit-box",
                        fontSize: "1.2rem!important",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "normal",
                        maxHeight: "5.2rem",
                        fontWeight: 500,
                        color: "rgb(255,255,255)",
                        lineHeight: 1.5,
                        marginRight: 2,
                      }}
                    >
                      {title}
                    </Typography>
                    <IconButton sx={{ padding: 0 }} aria-label="settings">
                      <MoreVertIcon sx={{ color: "#fff" }} />
                    </IconButton>
                  </Box>
                </Tooltip>
              }
              subheader={
                <>
                  <Typography fontSize="0.75rem" color="#aaa">
                    <span>
                      {views} {views === 1 ? "view" : "views"} &bull;{" "}
                      {createdAt}
                    </span>
                  </Typography>
                  <Link to={`/@${owner}`} onDragEnd={handleDragEnd}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", marginY: 1 }}
                    >
                      <Avatar
                        src={avatar ? avatar : null}
                        sx={{
                          bgcolor: getColor(fullName),
                          width: "25px",
                          height: "25px",
                          marginRight: 1,
                        }}
                      >
                        {fullName ? fullName.charAt(0).toUpperCase() : "?"}
                      </Avatar>
                      <Tooltip
                        disableInteractive
                        disableFocusListener
                        disableTouchListener
                        title={fullName}
                        placement="top-start"
                        slotProps={{
                          popper: {
                            disablePortal: true,
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="#aaa"
                          sx={{
                            display: "inline-block",
                            "&:hover": {
                              color: "#fff",
                            },
                          }}
                        >
                          {fullName}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Link>
                  <Tooltip
                    disableInteractive
                    disableFocusListener
                    disableTouchListener
                    title={"From the video description"}
                    placement="bottom"
                    slotProps={{
                      popper: {
                        disablePortal: true,
                      },
                    }}
                  >
                    <Typography
                      fontSize="0.75rem"
                      color="#aaa"
                      sx={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "normal",
                        fontWeight: 500,
                        marginTop: "2px",
                      }}
                    >
                      {description}
                    </Typography>
                  </Tooltip>
                </>
              }
            />
          </CardContent>
          <Interaction ref={interactionRef} id="video-interaction" />
        </Card>
      ) : profile ? (
        <Card
          onMouseDown={(e) => {
            handleMouseDown(e);
            e.stopPropagation();
          }}
          sx={{
            position: "relative",
            transition: "0.3s ease-in-out",
            padding: 0,
            cursor: "pointer",
            overflow: "visible",
            borderRadius: "10px",
            boxShadow: "none",
            display: "block",
            paddingTop: "",
            backgroundColor: "transparent",
          }}
        >
          <Link
            to="/watch"
            search={searchParams}
            style={{ ...linkStyles, width: "100%" }}
            onDragEnd={() => {
              if (interactionRef.current) {
                interactionRef.current.classList.remove("down");
                interactionRef.current.classList.add("animate");
              }
            }}
          >
            <Box
              sx={{
                position: "relative",
                display: "block",
                width: "100%",
                paddingTop: "56.25%",
              }}
            >
              <Box height="100%" position="absolute" top="0" left="0">
                <CardMedia
                  sx={{
                    borderRadius: "10px",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    aspectRatio: "16/9",
                  }}
                  component="img"
                  image={thumbnail}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  bottom: "4px",
                  right: "8px",
                  width: "35px",
                  height: "20px",
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderRadius: "5px",
                }}
              >
                <Typography
                  variant="body2"
                  color="#f1f1f1"
                  fontSize="0.75rem"
                  lineHeight="0"
                >
                  {formatDuration(duration)}
                </Typography>
              </Box>
            </Box>
          </Link>
          <Box sx={{ position: "relative", display: "flex" }}>
            <CardContent
              sx={{
                backgroundColor: theme.palette.primary.main,
                padding: 0,
                paddingRight: "24px",
                paddingTop: "10px",
              }}
            >
              <Link
                to="/watch"
                search={{ searchParams }}
                style={linkStyles}
                onDragEnd={() => {
                  if (interactionRef.current) {
                    interactionRef.current.classList.remove("down");
                    interactionRef.current.classList.add("animate");
                  }
                }}
              >
                <CardHeader
                  sx={{
                    alignItems: "flex-start",
                    padding: 0,
                    "& .MuiCardHeader-content": {
                      overflow: "hidden",
                      minWidth: 0,
                    },
                  }}
                  title={
                    <Typography
                      variant="body2"
                      color="#f1f1f1"
                      sx={{
                        display: "-webkit-box",
                        fontSize: "0.85rem",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        WebkitLineClamp: 2,
                        textOverflow: "ellipsis",
                        fontWeight: 600,
                      }}
                    >
                      {title}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="body2" color="#aaa">
                      <span>
                        {views} {views === 1 ? "view" : "views"} &bull;{" "}
                        {createdAt}
                      </span>
                    </Typography>
                  }
                />
              </Link>
            </CardContent>
            <IconButton
              sx={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                position: "absolute",
                padding: 0,
                right: "-13px",
              }}
              disableRipple
              className="no-ripple"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e);
              }}
              aria-label="settings"
            >
              <MoreVertIcon sx={{ color: "#fff" }} />
              <Interaction id="interaction" circle={true} />
            </IconButton>
          </Box>
          <Interaction ref={interactionRef} id="video-interaction" />
        </Card>
      ) : (
        playlist && (
          <Box
            onClick={handleInteraction}
            sx={{
              position: "relative",
              display: "block",
              width: "210px",
              height: "100%",
            }}
          >
            <Card
              onMouseDown={(e) => {
                handleMouseDown(e);
                e.stopPropagation();
              }}
              sx={{
                position: "relative",
                transition: "0.3s ease-in-out",
                padding: 0,
                cursor: "pointer",
                overflow: "visible!important",
                borderRadius: "12px",
                boxShadow: "none",
                display: "block",
                paddingTop: "",
                backgroundColor: "transparent",
              }}
            >
              <Link
                to="/watch"
                search={{ v: playlistVideoId[0], list: playlistId }}
                style={linkStyles}
                onDragEnd={() => {
                  if (interactionRef.current) {
                    interactionRef.current.classList.remove("down");
                    interactionRef.current.classList.add("animate");
                  }
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    display: "block",
                    width: "100%",
                    background: "none",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      height: "100%",
                      left: "12px",
                      right: "12px",
                      top: "-8px",
                      backgroundColor: bgColor,
                      borderRadius: "12px",
                      opacity: "50%",
                    }}
                  ></Box>
                  <Box
                    sx={{
                      position: "absolute",
                      height: "100%",
                      left: "8px",
                      right: "8px",
                      top: "-4px",
                      borderTop: "1px solid #0f0f0f",
                      marginTop: "-1px",
                      backgroundColor: bgColor,
                      borderRadius: "12px",
                    }}
                  ></Box>

                  <Box
                    sx={{
                      position: "relative",
                      display: "block",
                      overflow: "hidden",
                      borderTop: "1px solid #0f0f0f",
                      marginTop: "-1px",
                      width: "100%",
                      paddingTop: "56.25%",
                      borderRadius: "12px",
                      backgroundColor: "transparent",
                      "&:hover .hover-overlay": {
                        opacity: 1,
                      },
                    }}
                  >
                    <Box height="100%" position="absolute" top="0" left="0">
                      <CardMedia
                        sx={{
                          borderRadius: "12px",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          aspectRatio: "16/9",
                          userSelect: "none",
                        }}
                        crossOrigin="anonymous"
                        ref={imgRef}
                        component="img"
                        image={thumbnail}
                        draggable={false}
                      />
                    </Box>
                    <Box
                      className="hover-overlay"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        opacity: 0,
                        color: "#fff",
                        fontWeight: "400",
                        fontSize: "1rem",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                    >
                      <PlayArrowIcon sx={{ marginRight: 1 }} />
                      Play All
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        margin: "4px",
                        width: "75px",
                        height: "20px",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        borderRadius: "5px",
                      }}
                    >
                      <Typography
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        variant="body2"
                        color="#f1f1f1"
                        fontSize="0.75rem"
                        lineHeight="0"
                      >
                        <PlaylistPlayOutlinedIcon /> {videoCount}{" "}
                        {videoCount === 1 ? "video" : "videos"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Link>
              <CardContent
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  padding: 0,
                  paddingTop: "10px",
                }}
              >
                <Link
                  to="/watch"
                  search={{ searchParams }}
                  style={linkStyles}
                  onDragEnd={() => {
                    if (interactionRef.current) {
                      interactionRef.current.classList.remove("down");
                      interactionRef.current.classList.add("animate");
                    }
                  }}
                >
                  <CardHeader
                    sx={{
                      alignItems: "flex-start",
                      padding: 0,
                      "& .MuiCardHeader-content": {
                        overflow: "hidden",
                        minWidth: 0,
                      },
                    }}
                    title={
                      <Typography
                        variant="body2"
                        color="#f1f1f1"
                        sx={{
                          display: "-webkit-box",
                          fontSize: "0.85rem",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          WebkitLineClamp: 2,
                          textOverflow: "ellipsis",
                          fontWeight: 600,
                        }}
                      >
                        {title}
                      </Typography>
                    }
                    subheader={
                      <Typography variant="body2" color="#aaa">
                        <span>view full playlist</span>
                      </Typography>
                    }
                  />
                </Link>
              </CardContent>
              <Interaction ref={interactionRef} id="playlist-interaction" />
            </Card>
          </Box>
        )
      )}
    </>
  );
}

export default React.memo(VideoCard);
