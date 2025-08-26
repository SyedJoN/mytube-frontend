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
import { MenuItem, useMediaQuery } from "@mui/material";
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
import { Box } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTheme } from "@mui/material/styles";
import formatDuration from "../../utils/formatDuration";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import Interaction from "../Utils/Interaction";
import handleMouseDown from "../../helper/intertactionHelper";
import { useHoverPreview } from "../../helper/useHoverPreview";
import { HoverTelemetryTracker } from "../../helper/Telemetry";
import useRefReducer from "../Utils/useRefReducer";
import { useQuery } from "@tanstack/react-query";
import { getWatchHistory } from "../../apis/userFn";
import {
  UserContext,
  UserInteractionContext,
} from "../../Contexts/RootContexts";

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

const linkStyles = { display: "inline-block", textDecoration: "none" };

const viewStyles = {
  display: "inline-block",
  verticalAlign: "top",
  textDecoration: "none",
  userSelect: "none",
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
const colors = [red, blue, green, purple, orange, deepOrange, pink];

function SideVideosList({
  videoId,
  owner,
  thumbnail,
  previewUrl,
  avatar,
  title,
  fullName,
  views,
  duration,
  createdAt,
  activeOptionsId,
  setActiveOptionsId,
  userId,
  isAuthenticated,
}) {
  const theme = useTheme();
  const [fetchedTime, setFetchedTime] = React.useState(0);
  const context = React.useContext(UserInteractionContext);
  const isCustomWidth = useMediaQuery("(max-width:1014px)", {
  noSsr: true, 
  defaultMatches: false, 
  })
  const { setIsUserInteracted } = context ?? {};
  const [isVolumeMuted, setIsVolumeMuted] = React.useState(true);

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

  const { interactionRef, timeoutRef, hoverVideoRef, previewRef } =
    useRefReducer({
      interactionRef: null,
      hoverTrackerRef: new HoverTelemetryTracker(),
      timeoutRef: null,
      imgRef: null,
      hoverVideoRef: null,
      previewRef: null,
    });

  const searchParams = React.useMemo(() => ({ v: videoId }), [videoId]);

  // In SideVideosList, replace your current useEffect with this:
  // React.useEffect(() => {
  //   console.log("SideVideosList re-rendered", {
  //     videoId,
  //     thumbnail,
  //     isHoverPlay,
  //     isVideoPlaying,
  //     searchParams,
  //   });
  // }, [videoId, thumbnail, isHoverPlay, isVideoPlaying, searchParams]); // Add dependencies


  const { refetch: refetchHistory } = useQuery({
    queryKey: ["userHistory"],
    refetchOnWindowFocus: false,
    queryFn: getWatchHistory,
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });

  React.useEffect(() => {
    let isMounted = true;
    if (!userId) return;

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


   const getColor = (name) => {
      if (!name) return red[500];
      const index = name.charCodeAt(0) % colors.length;
      return colors[index][500];
    };

  const handleToggleOptions = (id) => {
    setActiveOptionsId((prev) => (prev === id ? null : id));
  };

  const handleInteraction = () => {
    requestAnimationFrame(() => {
      setIsUserInteracted(true);
    });
  };
    const handleVolumeToggle = () => {
    const tracker = hoverTrackerRef.current;
    const fromTime = parseFloat(hoverVideoRef.current.currentTime.toFixed(3));
    setIsVolumeMuted((prev) => !prev);
    if (tracker && hoverVideoRef.current) {
      tracker.handleMuteToggle(hoverVideoRef.current, fromTime);
    }
  };
  const handleChannelClick = () => {
    navigate({
      to: `/@${owner}`,
    });
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

  return (
    <>
      {" "}
      <Card
        onClick={handleInteraction}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={(e) => {
          handleMouseDown(e);
          e.stopPropagation();
        }}
        sx={{
          display: isCustomWidth ? "block" : "none",
          position: "relative",
          padding: 0,
          cursor: "pointer",
          overflow: "hidden",
          boxShadow: "none",
          width: "100%",
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
            overflow: isHoverPlay && isVideoPlaying ? "visible" : "hidden",
            borderRadius: isHoverPlay && isVideoPlaying ? "0" : "12px",
          }}
        >
          <Link draggable="false" to="/watch" search={searchParams}>
            <Box height="100%" position="absolute" top="0" left="0">
             
                <CardMedia
                  sx={{
                    flexGrow: "1!important",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    aspectRatio: "16/9",
                    borderRadius: 0,
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
              userId={userId}
              videoId={videoId}
              viewVideo={viewVideo}
              videoRef={hoverVideoRef}
              setViewVideo={setViewVideo}
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
          display: !isCustomWidth ? "flex" : "none",
          transition: "0.3s ease-in-out",
          padding: 0,
          cursor: "pointer",
          overflow: "visible",
          boxShadow: "none",
          borderRadius: 0,
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
              borderRadius: isHoverPlay && isVideoPlaying ? "0" : "8px",
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
                <CardMedia
                  loading="lazy"
                  sx={{
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
    </>
  );
}

export default React.memo(SideVideosList, (prevProps, nextProps) => {
  const compareKeys = [
    "videoId",
    "thumbnail",
    "title",
    "fullName",
    "views",
    "duration",
    "createdAt",
    "userId",
  ];

  return (
    compareKeys.every((key) => prevProps[key] === nextProps[key]) &&
    prevProps.activeOptionsId === nextProps.activeOptionsId
  );
});
