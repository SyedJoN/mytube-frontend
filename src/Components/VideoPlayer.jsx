import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { keyframes, useMediaQuery, useTheme } from "@mui/system";
import { fetchVideos, fetchVideoById } from "../apis/videoFn";
import { shuffleArray } from "../helper/shuffle";
import { getColor } from "../utils/getColor";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { Box, CardMedia, IconButton, Typography } from "@mui/material";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { addToWatchHistory, getUserChannelProfile } from "../apis/userFn";
import CommentSection from "./CommentSection";
import { videoView } from "../apis/videoFn";
import confetti from "canvas-confetti";
import { OpenContext } from "../routes/__root";
import Grid from "@mui/material/Grid";
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import { Link, useLocation } from "@tanstack/react-router";
import { SubscribeButton } from "./SubscribeButton";
import { LikeDislikeButtons } from "./LikeDislikeButton";
import Description from "./Description";
import VideoSideBar from "./VideoSideBar";
import theme from "../assets/Theme";
import { fetchPlaylistById } from "../apis/playlistFn";
import { useNavigate } from "@tanstack/react-router";
import PlaylistContainer from "./PlaylistContainer";

function VideoPlayer({ videoId, playlistId }) {
  const context = useContext(OpenContext);
  const videoRef = useRef(null);
  let { data: dataContext } = context;
  const isAuthenticated = dataContext || null;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isCustomWidth = useMediaQuery("(max-width:1014px)");
  const prevVideoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateBuffered = () => {
      const buffered = video.buffered;
      const duration = video.duration;

      if (!duration || buffered.length === 0) {
        setBufferedPercent(0);
        return;
      }

      let totalBuffered = 0;
      for (let i = 0; i < buffered.length; i++) {
        totalBuffered += buffered.end(i) - buffered.start(i);
      }

      const percent = (totalBuffered / duration) * 100;
      setBufferedPercent(percent);
    };

 
    const events = [
      "loadedmetadata",
      "progress",
      "timeupdate",
      "playing",
      "waiting",
    ];

    events.forEach((event) => {
      video.addEventListener(event, updateBuffered);
    });

    updateBuffered();

    return () => {
      events.forEach((event) => {
        video.removeEventListener(event, updateBuffered);
      });
    };
  }, []);

  const userPlayingVideo = dataContext?.data?.watchHistory?.find(
    (video) => video.video === videoId
  );
  const startTimeDuration = userPlayingVideo?.duration;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleLoadedMetadata = async () => {
      const isValidStart =
        isFinite(startTimeDuration) &&
        startTimeDuration > 0 &&
        startTimeDuration < video.duration;
      if (isValidStart) {
        try {
          video.currentTime = startTimeDuration;
          await video.play();
        } catch (err) {
          console.warn("Video play failed:", err);
        }
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [startTimeDuration]);

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

  const launchFireworks = () => {
    if (!buttonRef.current) return;

    const { left, top, width, height } =
      buttonRef.current.getBoundingClientRect();

    const steps = 10; // Number of steps from left to right
    let currentStep = 0;

    const animateFireworks = () => {
      if (currentStep > steps || !buttonRef.current) return;

      const originX =
        (left + (width / steps) * currentStep) / window.innerWidth;
      const originY = (top + height + 5) / window.innerHeight; // Just below the button

      confetti({
        particleCount: 1,
        startVelocity: 2,
        spread: 260,
        ticks: 10,
        gravity: 0,
        scalar: 0.8,
        shapes: ["star"],
        colors: ["#C71585"], // Yellow Star
        origin: { x: originX, y: originY },
      });

      confetti({
        particleCount: 1,
        startVelocity: 4,
        spread: 260,
        ticks: 10,
        gravity: 0,
        scalar: 1,
        shapes: ["square"],
        colors: ["#FFD700"],
        origin: { x: originX, y: originY },
      });

      currentStep++;
      setTimeout(animateFireworks, 10); 
    };

    animateFireworks(); 
  };
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
    prevVideoRef.current = videoId;
    if (videoRef.current && prevVideoRef !== videoId) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      const duration = Math.floor(videoRef.current.duration);
      if (currentTime > 0 && currentTime < duration) {
        sendHistoryMutation({
          videoId: prevVideoRef.current,
          duration: currentTime,
        });
      }
    }
  };

  useEffect(() => {
    sendWatchHistory();
  }, [location.href]);

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

  const user = data?.data?.owner?.username;

  const channelId = data?.data?.owner?._id;
  const channelName = data?.data?.owner?.fullName;

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: ["channelProfile", user],
    queryFn: () => getUserChannelProfile(user),
    enabled: true,
  });
  const owner = data?.data?.owner?.username;
  const [subscriberCount, setSubscriberCount] = useState(
    userData?.data?.subscribersCount ?? 0
  );
  const [viewCounted, setViewCounted] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState(null);

  const buttonRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;

    const updateBuffered = () => {
      if (!video) return;

      const buffered = video.buffered;
      const duration = video.duration;

      if (buffered.length > 0 && duration > 0) {
        const bufferedEnd = buffered.end(buffered.length - 1);
        const percent = (bufferedEnd / duration) * 100;
        setBufferedPercent(percent);
      }
    };

    if (video) {
      video.addEventListener("loadedmetadata", updateBuffered);
      video.addEventListener("progress", updateBuffered);
    }

    return () => {
      if (video) {
        video.removeEventListener("loadedmetadata", updateBuffered);
        video.removeEventListener("progress", updateBuffered);
      }
    };
  }, []);

  const handleNext = () => {
    if (!videoRef.current) return;
    navigate({
      to: "/watch",
      search: {
        v: filteredVideos[0]?._id,
      },
    });
  };
  const handleNextPlaylist = () => {
    if (index >= playlistVideos.length - 1) return;
    navigate({
      to: "/watch",
      search: {
        v: playlistVideos[index + 1]._id,
        list: playlistId,
        index: index + 2,
      },
    });
  };
  const handlePrev = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime -= 5;
    videoRef.current.play();
  };

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

  const {
    data: listVideoData,
    isLoading: isLoadingList,
    isError: isErrorList,
    error: errorList,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const videos = listVideoData?.data?.docs || [];
  const filteredVideos = useMemo(() => {
    const filtered = videos.filter((video) => video._id !== videoId);
    return shuffleArray(filtered);
  }, [videoId, videos]);

  const {
    data: playlistData,
    isLoading: isPlaylistLoading,
    isError: isPlaylistError,
  } = useQuery({
    queryKey: ["playlists", playlistId],
    queryFn: () => fetchPlaylistById(playlistId),
    enabled: !!playlistId, 
  });
  const playlistVideos = playlistData?.data?.videos || [];
  const index = playlistVideos?.findIndex((video) => video._id === videoId);

  const handleNextVideo = useCallback(() => {
    if (!playlistId) {
      navigate({
        to: "/watch",
        search: { v: filteredVideos[0]?._id },
      });
    } else if (index < playlistVideos.length - 1) {
      navigate({
        to: "/watch",
        search: {
          v: playlistVideos[index + 1]._id,
          list: playlistId,
          index: index + 2,
        },
      });
    }
  }, [navigate, playlistId, filteredVideos, playlistVideos, index]);

  const handleForwardSeek = useCallback(() => {
    videoRef.current?.play();
    if (videoRef.current) videoRef.current.currentTime += 5;
  }, []); 

  const handleBackwardSeek = useCallback(() => {
    videoRef.current?.play();
    if (videoRef.current) videoRef.current.currentTime -= 5;
  }, []);
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight") {
        handleForwardSeek();
      }
      if (e.key === "ArrowLeft") {
        handleBackwardSeek();
      }
      if (e.shiftKey && e.key.toLowerCase() === "n") {
        handleNextVideo();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleForwardSeek, handleBackwardSeek, handleNextVideo]);

  useEffect(() => {
    const newCount = userData?.data?.subscribersCount ?? 0;
    if (subscriberCount !== newCount) {
      setSubscriberCount(newCount);
    }
  }, [userData]);

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

    const timeDifference = Math.abs(watchTime - watchTimeRef.current);

    if (timeDifference >= 10) {
      return;
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

  const handleSeek = (e) => {
    const newProgress = e.target.value;
    const video = videoRef.current;
    video.currentTime = (newProgress / 100) * video.duration;
    setProgress(newProgress);
  };

  const handleVideoEnd = () => {
    if (index >= playlistVideos.length - 1) return;
    navigate({
      to: "/watch",
      search: {
        v: playlistVideos[index + 1]._id,
        list: playlistId,
        index: index + 2,
      },
    });
  };

  const togglePlayPause = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  return (
    <Grid
      container
      direction={isCustomWidth ? "column" : "row"}
      spacing={0}
      sx={{
        flexWrap: "noWrap",
        justifyContent: !isCustomWidth ? "center" : "flex-start",
        alignItems: isCustomWidth ? "center" : "flex-start",
        flexGrow: 1,
      }}
    >
      <Grid
        size={{ xs: 12, sm: 11.5, md: 8 }}
        sx={{ p: 3, width: isCustomWidth ? "100%!important" : "" }}
      >
        {data?.data?.videoFile && (
          <Box
            id="video-container"
            component="div"
            sx={{ position: "relative" }}
          >
            <video
              ref={videoRef}
              id="video-player"
              width="100%"
              height="auto"
              key={data?.data?._id}
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnd}
              style={{ aspectRatio: "16/9", borderRadius: "8px" }}
            >
              {data?.data?.videoFile && (
                <source src={data?.data?.videoFile} type="video/mp4" />
              )}
              Your browser does not support the video tag.
            </video>

            <div
              className="video-controls"
              style={{
                opacity: 0,
                transition: "opacity 0.3s ease",
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "40px",
                backgroundColor: "transparent",
                borderRadius: "3px",
                zIndex: 2,
              }}
            >
              <Box sx={{ display: "flex", height: "100%" }}>
                {playlistId && index > 0 && (
                  <IconButton
                    onClick={playlistId ? handlePrevPlaylist : handlePrev}
                    sx={{ color: "#f1f1f1" }}
                  >
                    <SkipPreviousIcon
                      sx={{ width: "1.25em", height: "1.25em" }}
                    />
                  </IconButton>
                )}
                <IconButton onClick={togglePlayPause} sx={{ color: "#f1f1f1" }}>
                  {videoRef.current?.paused ? (
                    <PlayArrowIcon sx={{ width: "1.25em", height: "1.25em" }} />
                  ) : (
                    <PauseIcon sx={{ width: "1.25em", height: "1.25em" }} />
                  )}
                </IconButton>
                <Tooltip
                  slotProps={{
                    popper: {
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [60, 0],
                          },
                        },
                      ],
                    },
                    tooltip: {
                      sx: {
                        whiteSpace: "nowrap",
                        backgroundColor: "rgba(15, 15, 15, 0.94)",
                        fontSize: "0.75rem",
                        borderRadius: "16px",
                        padding: "0",
                      },
                    },
                  }}
                  sx={{ padding: "0!important", margin: "0!important" }}
                  title={
                    <Box
                      sx={{
                        position: "relative",
                        width: 240,
                        padding: "0 2px 2px 2px",
                      }}
                    >
                      <Box sx={{ padding: "3px" }}>
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
                          playlistVideos[index + 1]?.thumbnail ||
                          filteredVideos[0]?.thumbnail
                        }
                      />
                    </Box>
                  }
                  placement="top"
                >
                  <IconButton
                    onClick={
                      playlistId && index < playlistVideos.length - 1
                        ? handleNextPlaylist
                        : handleNext
                    }
                    sx={{ color: "#f1f1f1" }}
                  >
                    <SkipNextIcon sx={{ width: "1.25em", height: "1.25em" }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <div
                className="buffered-bar"
                style={{
                  position: "absolute",
                  top: "-9px",
                  left: 0,
                  height: "3px",
                  width: `${bufferedPercent}%`,
                  backgroundColor: "#888",
                  borderRadius: "3px",
                  zIndex: 1,
                }}
              />
              <div
                className="progress-bar"
                style={{
                  position: "absolute",
                  top: "-9px",
                  left: 0,
                  width: `${progress}%`,
                  height: "3px",
                  borderRadius: "4px",
                  zIndex: 2,
                }}
              />
              <input
                min="0"
                type="range"
                value={progress}
                onChange={handleSeek}
                className="custom-progress"
                style={{
                  position: "absolute",
                  top: "-27px",
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "transparent",
                  zIndex: 2,
                }}
              />
            </div>
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
                fontWeight: "400",
                fontSize: "1rem",
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              {videoRef.current?.paused ? (
                <PlayArrowIcon sx={{ height: "4rem", width: "4rem" }} />
              ) : (
                <PauseIcon sx={{ width: "4rem", height: "4rem" }} />
              )}
            </Box>

            <Box
              onClick={togglePlayPause}
              component="video-cover"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "90%",
                cursor: "pointer",
                pointerEvents: "all",
              }}
            ></Box>
          </Box>
        )}

        <Box marginTop="8px">
          <Typography
            sx={{
              display: "-webkit-box",
              textOverflow: "ellipsis",
              maxHeight: "5.6rem",
              WebkitLineClamp: "2",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            variant="h3"
            color="#fff"
          >
            {data?.data?.title}
          </Typography>
        </Box>
        {!isCustomWidth && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: {
                xs: "0",
                sm: "24",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginTop: 1,
                position: "relative",
                minWidth: "calc(50% - 6px)",
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
                  "& .css-1r9wl67-MuiCardHeader-avatar": {
                    marginRight: "12px",
                  },
                }}
                avatar={
                  <Link
                    style={{
                      textDecoration: "none",
                    }}
                    to={`/@${owner}`}
                  >
                    <Avatar
                      src={
                        data?.data?.owner?.avatar
                          ? data?.data?.owner?.avatar
                          : null
                      }
                      sx={{
                        bgcolor: getColor(data?.data?.owner?.fullName),
                        cursor: "pointer",
                      }}
                    >
                      {data?.data?.owner?.fullName
                        ? data?.data?.owner?.fullName.charAt(0).toUpperCase()
                        : "?"}
                    </Avatar>
                  </Link>
                }
                title={
                  <Tooltip
                    title={data?.data?.owner?.fullName}
                    placement="top-start"
                  >
                    <Link
                      style={{
                        textDecoration: "none",
                      }}
                      to={`/@${owner}`}
                    >
                      <Typography
                        variant="p"
                        color="#f1f1f1"
                        sx={{ cursor: "pointer" }}
                      >
                        {data?.data?.owner?.fullName}
                      </Typography>
                    </Link>
                  </Tooltip>
                }
                subheader={
                  <>
                    <Typography variant="body2" color="#aaa" fontSize="0.8rem">
                      <span>
                        {subscriberCount}{" "}
                        {subscriberCount === 1 ? "subscriber" : "subscribers"}
                      </span>
                    </Typography>
                  </>
                }
              />

              <SubscribeButton
                isAuthenticated={isAuthenticated}
                channelName={channelName}
                channelId={channelId}
                userData={userData}
                initialSubscribed={userData?.data?.isSubscribedTo}
                initialSubscribers={userData?.data?.subscribersCount}
                user={user}
                activeAlertId={activeAlertId}
                setActiveAlertId={setActiveAlertId}
              />
            </Box>
            <LikeDislikeButtons
              dataContext={dataContext}
              isAuthenticated={isAuthenticated}
              data={data}
              videoId={videoId}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />
          </Box>
        )}

        {!isCustomWidth && (
          <Description
            data={data}
            subscriberCount={userData?.data?.subscribersCount}
          />
        )}

        {!isCustomWidth && (
          <CommentSection
            isAuthenticated={isAuthenticated}
            videoId={videoId}
            data={data}
            activeAlertId={activeAlertId}
            setActiveAlertId={setActiveAlertId}
          />
        )}
      </Grid>
      <Grid
        size={{ xs: 12, sm: 12, md: 4 }}
        sx={{
          flexGrow: isCustomWidth ? "1" : "0",
          maxWidth: "426px!important",
          minWidth: isCustomWidth ? "100%" : "300px!important",
          py: isCustomWidth ? 0 : 3,
          px: isCustomWidth ? 3 : 0,
          pr: 3,
        }}
      >
        {playlistId && (
          <PlaylistContainer
            playlistId={playlistId}
            playlistData={playlistData}
            videoId={videoId}
          />
        )}
        {isCustomWidth && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: {
                xs: "0",
                sm: "24",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginTop: 1,
                position: "relative",
                minWidth: "calc(50% - 6px)",
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
                  "& .css-1r9wl67-MuiCardHeader-avatar": {
                    marginRight: "12px",
                  },
                }}
                avatar={
                  <Link
                    style={{
                      textDecoration: "none",
                    }}
                    to={`/@${owner}`}
                  >
                    <Avatar
                      src={
                        data?.data?.owner?.avatar
                          ? data?.data?.owner?.avatar
                          : null
                      }
                      sx={{
                        bgcolor: getColor(data?.data?.owner?.fullName),
                        cursor: "pointer",
                      }}
                    >
                      {data?.data?.owner?.fullName
                        ? data?.data?.owner?.fullName.charAt(0).toUpperCase()
                        : "?"}
                    </Avatar>
                  </Link>
                }
                title={
                  <Tooltip
                    title={data?.data?.owner?.fullName}
                    placement="top-start"
                  >
                    <Link
                      style={{
                        textDecoration: "none",
                      }}
                      to={`/@${owner}`}
                    >
                      <Typography
                        variant="p"
                        color="#f1f1f1"
                        sx={{ cursor: "pointer" }}
                      >
                        {data?.data?.owner?.fullName}
                      </Typography>
                    </Link>
                  </Tooltip>
                }
                subheader={
                  <>
                    <Typography variant="body2" color="#aaa" fontSize="0.8rem">
                      <span>
                        {subscriberCount}{" "}
                        {subscriberCount === 1 ? "subscriber" : "subscribers"}
                      </span>
                    </Typography>
                  </>
                }
              />

              <SubscribeButton
                isAuthenticated={isAuthenticated}
                channelName={channelName}
                channelId={channelId}
                userData={userData}
                initialSubscribed={userData?.data?.isSubscribedTo}
                initialSubscribers={userData?.data?.subscribersCount}
                user={user}
                activeAlertId={activeAlertId}
                setActiveAlertId={setActiveAlertId}
              />
            </Box>
            <LikeDislikeButtons
              dataContext={dataContext}
              isAuthenticated={isAuthenticated}
              data={data}
              videoId={videoId}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />
          </Box>
        )}

        {isCustomWidth && (
          <Description
            data={data}
            subscriberCount={userData?.data?.subscribersCount}
          />
        )}
        <VideoSideBar
          filteredVideos={filteredVideos}
          videoId={videoId}
          listVideoData={listVideoData}
          isLoadingList={isLoadingList}
          isErrorList={isErrorList}
          errorList={errorList}
        />
        {isCustomWidth && (
          <CommentSection
            isAuthenticated={isAuthenticated}
            videoId={videoId}
            data={data}
            activeAlertId={activeAlertId}
            setActiveAlertId={setActiveAlertId}
          />
        )}
      </Grid>
    </Grid>
  );
}

export default React.memo(VideoPlayer);
