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
  startTelemetry,
} from "../../helper/Telemetry";
import { getWatchHistory } from "../../apis/userFn";

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
const colors = [red, blue, green, purple, orange, deepOrange, pink];

function VideoCard({
  videoId,
  owner,
  thumbnail,
  isSubscribedTo,
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
  const context = React.useContext(UserInteractionContext);
  const userContext = React.useContext(UserContext);
  const { getTimeStamp, setTimeStamp } = React.useContext(TimeStampContext);
  const { data: dataContext } = userContext ?? {};
  const isAuthenticated = dataContext || null;
  const userId = dataContext?.data?._id || null;
  const { setIsUserInteracted } = context ?? {};
  const hoverVideoRef = React.useRef(null);
  const previewRef = React.useRef(null);
  const theme = useTheme();
  const imgRef = React.useRef(null);
  const [fetchedTime, setFetchedTime] = React.useState(0);
  const [bgColor, setBgColor] = React.useState("rgba(0,0,0,0.6)");
  const [bufferedVal, setBufferedVal] = React.useState(0);
  const [viewVideo, setViewVideo] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [isVolumeMuted, setIsVolumeMuted] = React.useState(true);
  const playlistVideoId = playlist?.videos?.map((video) => {
    return video._id;
  });
  const searchParams = React.useMemo(() => ({ v: videoId }), [videoId]);
  const { refetch: refetchHistory } = useQuery({
    queryKey: ["userHistory"],
    refetchOnWindowFocus: false,
    queryFn: getWatchHistory,
    enabled: !!userId,
  });

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

  React.useEffect(() => {
    let isMounted = true;

    refetchHistory().then((data) => {
      if (!isMounted) return;

      const fetchedVideo = data?.data?.data?.find(
        (video) => video?.video?._id === videoId
      );
      const hasEnded = fetchedVideo?.hasEnded;
      const refetchedTime = fetchedVideo?.currentTime || 0;
      const videoDuration = fetchedVideo?.duration || 0;

      if (videoDuration) {
        setFetchedTime(
          hasEnded ? 100 : Math.round((refetchedTime / videoDuration) * 100)
        );
      } else {
        setFetchedTime(0);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  React.useEffect(() => {
    const video = hoverVideoRef?.current;
    const tracker = hoverTrackerRef.current;
    if (!video || !tracker) return;

    const handlePlay = async () => {
      const savedGuestTime = sessionStorage.getItem(`resumeTime:${videoId}`);
      let refetchedTime = isAuthenticated ? 0 : Number(savedGuestTime) || 0;

      let videoDuration = 0;

      if (isAuthenticated) {
        try {
          const res = await refetchHistory();
          const refetchedVideo = res?.data?.data?.find(
            (video) => video?.video?._id === videoId
          );
          refetchedTime = refetchedVideo?.currentTime || 0;
          videoDuration = refetchedVideo?.duration || 0;

          const isValidResumeTime =
            isFinite(refetchedTime) && refetchedTime < videoDuration;
          video.currentTime = isValidResumeTime ? refetchedTime : 0;
        } catch (error) {
          console.error("Error refetching video history:", error);
        }
      } else {
        const guestResumeTime = sessionStorage.getItem(`resumeTime:${videoId}`);
        const isValidResumeTime =
          isFinite(guestResumeTime) && guestResumeTime > 0;
        const hasVideoEnded = guestResumeTime - video.duration < 0.5;
        video.currentTime = isValidResumeTime
          ? guestResumeTime
          : hasVideoEnded
            ? 0
            : 0;
      }

      try {
        await video.play();
        if (tracker?.telemetryTimer) {
          tracker.telemetryTimer.stop();
          tracker.telemetryTimer = null;
        }

        initializeTelemetryArrays();
        startTelemetry(video, videoId, tracker);
        tracker.startHover(video, refetchedTime);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          video.classList.add("hide-cursor");
        }, 2000);
      } catch (err) {
        setIsVideoPlaying(false);
        if (tracker?.telemetryTimer) {
          tracker.telemetryTimer.stop();
          tracker.telemetryTimer = null;
        }
      }
    };

    const handleStop = () => {
      clearTimeout(timeoutRef.current);
      video.pause();
      video.classList.remove("hide-cursor");
      const telemetryData = tracker.endHover(video, isSubscribedTo);
      console.log("isSubscribedTo", isSubscribedTo);
      console.log("Telemetry data returned:", telemetryData);

      if (telemetryData) {
        sendYouTubeStyleTelemetry(videoId, video, telemetryData);
      }
    };

    if (isHoverPlay && document.visibilityState === "visible") {
      handlePlay();
    } else {
      handleStop();
    }

    return () => {
      handleStop();
      tracker.reset();
      setProgress(0);
      console.log("🧹 useEffect cleanup");
    };
  }, [isHoverPlay]);

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
    const fromTime = parseFloat(hoverVideoRef.current.currentTime.toFixed(3));
    setIsVolumeMuted((prev) => !prev);
    if (tracker && hoverVideoRef.current) {
      tracker.handleMuteToggle(hoverVideoRef.current, fromTime);
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

  React.useEffect(() => {
    const video = hoverVideoRef.current;
    if (!video) return;
    if (isVolumeMuted) {
      video.muted = 1;
    } else {
      video.muted = 0;
    }
  }, [isVolumeMuted]);

  const handleVideoPlaying = () => {
    setIsVideoPlaying(true);
  };
  const handleVideoEnd = (event) => {
    const video = event.target;
    setIsHoverPlay(false);

    video.removeEventListener("mousemove", handleMouseMoveOnce);
    video.addEventListener("mousemove", handleMouseMoveOnce);
  };

  const handleMouseMoveOnce = (event) => {
    setIsHoverPlay(true);
    event.target.removeEventListener("mousemove", handleMouseMoveOnce);
  };

  const handleVideoMouseMove = (e) => {
    const video = e.target;
    if (video.classList.contains("hide-cursor")) {
      video.classList.remove("hide-cursor");
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
            boxShadow: "none",
            width: "100%",
            display: "block",
            backgroundColor: "transparent",
            borderRadius: 0,
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "block",
              width: "100%",
              paddingTop: "56.25%",
              overflow: "hidden",
              borderRadius: isHoverPlay && isVideoPlaying ? "0" : "12px",
            }}
          >
            <Link draggable="false" to="/watch" search={searchParams}>
              <Box height="100%" position="absolute" top="0" left="0">
                {videoMd ? (
                  <LazyLoad height={200} offset={100} once>
                    <CardMedia
                      sx={{
                        flexGrow: "1!important",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        aspectRatio: "16/9",
                        transition: "all 0.3s ease-in-out",
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
                        transition: "all 0.3s ease-in-out",
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
                        onPause={() => {
                          setIsVideoPlaying(false);
                          setIsHoverPlay(false);
                        }}
                        onPlaying={handleVideoPlaying}
                        onEnded={handleVideoEnd}
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
                <Box
                  className={`progress-list ${fetchedTime > 0 ? "" : "hide"}`}
                  sx={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    background: "#717171",
                    transition: "all .1s cubic-bezier(0.4, 0, 1, 1)",
                    opacity: isHoverPlay && isVideoPlaying ? 0 : 1,
                    width: "100%",
                    height: "4px",
                  }}
                >
                  <div
                    className="play-progress"
                    style={{
                      width: `${Math.max(fetchedTime, 10)}%`,
                      height: "100%",
                    }}
                  ></div>
                </Box>
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
                    Math.max(
                      0,
                      hoverVideoRef?.current?.duration -
                        hoverVideoRef?.current?.currentTime
                    ) || 0,
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
            borderRadius: isHoverPlay && isVideoPlaying ? "0" : "8px",
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
                overflow: "hidden",
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
                        borderRadius:
                          isHoverPlay && isVideoPlaying ? "0" : "8px",
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
              <Box
                className={`progress-list ${fetchedTime > 0 ? "" : "hide"}`}
                sx={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  background: "#717171",
                  transition: "all .1s cubic-bezier(0.4, 0, 1, 1)",
                  opacity: isHoverPlay && isVideoPlaying ? 0 : 1,
                  width: "100%",
                  height: "4px",
                }}
              >
                <div
                  className="play-progress"
                  style={{
                    width: `${Math.max(fetchedTime, 10)}%`,
                    height: "100%",
                  }}
                ></div>
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
            overflow: "hidden",
            boxShadow: "none",
            transition: "0.3s ease-in-out",
            borderRadius: 0,
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
                borderRadius: isHoverPlay && isVideoPlaying ? "0" : "12px",
                overflow: "hidden",
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
                      }}
                      loading="lazy"
                      component="img"
                      image={thumbnail}
                    />
                    {videoUrl && (
                      <video
                        muted={isVolumeMuted}
                        ref={hoverVideoRef}
                        onPause={() => {
                          setIsVideoPlaying(false);
                          setIsHoverPlay(false);
                        }}
                        onMouseMove={handleVideoMouseMove}
                        onTimeUpdate={handleTimeUpdate}
                        onPlaying={handleVideoPlaying}
                        onEnded={handleVideoEnd}
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
                        Math.max(
                          0,
                          hoverVideoRef?.current?.duration -
                            hoverVideoRef?.current?.currentTime
                        ) || 0,
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
              <Box
                className={`progress-list ${fetchedTime > 0 ? "" : "hide"}`}
                sx={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  background: "#717171",
                  transition: "all .1s cubic-bezier(0.4, 0, 1, 1)",
                  opacity: isHoverPlay && isVideoPlaying ? 0 : 1,
                  width: "100%",
                  height: "4px",
                }}
              >
                <div
                  className="play-progress"
                  style={{
                    width: `${Math.max(fetchedTime, 10)}%`,
                    height: "100%",
                  }}
                ></div>
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
