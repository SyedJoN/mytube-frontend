import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { keyframes } from "@mui/system";
import { fetchVideoById } from "../../apis/videoFn";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import SmartDisplayIcon from "@mui/icons-material/SmartDisplay";
import { Box, Icon, IconButton, Typography } from "@mui/material";

import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
} from "@tanstack/react-query";
import { addToWatchHistory } from "../../apis/userFn";
import { videoView } from "../../apis/videoFn";
import confetti from "canvas-confetti";
import { OpenContext } from "../../routes/__root";
import { useLocation } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import VideoControls from "./VideoControls";

function VideoPlayer({
  dataContext,
  videoId,
  playlistId,
  playlistVideos,
  index,
  filteredVideos,
  handleNextVideo,
  isUserInteracted,
  setIsUserInteracted,
}) {
  const videoRef = useRef(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const prevVideoRef = useRef(null);
  const playIconRef = useRef(null);
  const buttonRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);

  const [viewCounted, setViewCounted] = useState(false);

  const [isLongPress, setIsLongPress] = useState(false);
  const pressTimer = useRef(null);

  const [bufferedPercent, setBufferedPercent] = useState(0);

  const togglePlayPause = useCallback(() => {
    setIsUserInteracted(true);
    const video = videoRef.current;
    if (!video) return;
    if (playIconRef.current) {
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
  }, []);

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
  const handleLoadedMetadata = async () => {
    const video = videoRef?.current;
    if (!video) return;

    const isValidStart =
      isFinite(startTimeDuration) &&
      startTimeDuration > 0 &&
      startTimeDuration < video.duration;
    if (isValidStart && isUserInteracted) {
      try {
        video.currentTime = startTimeDuration;
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        setIsPlaying(false);
        console.warn("Video play failed:", err);
      }
    }
  };

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateBuffered = () => {
      try {
        const buffered = video.buffered;
        const duration = video.duration;

        if (buffered.length > 0 && duration > 0) {
          const bufferedEnd = buffered.end(buffered.length - 1);
          const percent = (bufferedEnd / duration) * 100;
          setBufferedPercent(percent);
        } else {
          setBufferedPercent(0);
        }
      } catch (e) {
        console.warn("Buffered read error", e);
        setBufferedPercent(0);
      }
    };

    video.addEventListener("loadedmetadata", updateBuffered);
    video.addEventListener("progress", updateBuffered);

    updateBuffered();

    return () => {
      video.removeEventListener("loadedmetadata", updateBuffered);
      video.removeEventListener("progress", updateBuffered);
    };
  }, [videoId]);

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

  const DoubleSpeed = (e) => {
    const video = videoRef.current;
    if (!video) return;
    pressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      videoRef.current.playbackRate = 2.0;
    }, 300);
  };
  const exitDoubleSpeed = (e) => {
    const video = videoRef.current;
    if (!video) return;
    clearTimeout(pressTimer.current);

    if (isLongPress) {
      setIsLongPress(false);
      videoRef.current.playbackRate = 1.0;
    } else {
      togglePlayPause(e);
    }
  };
  return (
    <>
      <Box
        id="video-container"
        component="div"
        sx={{
          position: "relative"
        }}
      >
        {data?.data?.videoFile && (
          <video
            ref={videoRef}
            id="video-player"
            width="100%"
            height="auto"
            key={data?.data?._id}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            onLoadedMetadata={handleLoadedMetadata}
            poster={data?.data?.thumbnail}
            style={{ aspectRatio: "16/9", borderRadius: "8px" }}
          >
            {data?.data?.videoFile && (
              <source src={data?.data?.videoFile} type="video/mp4" />
            )}
            Your browser does not support the video tag.
          </video>
        )}
  
          <VideoControls
          ref={videoRef}
          isUserInteracted={isUserInteracted}
          playlistId={playlistId}
          bufferedPercent={bufferedPercent}
          filteredVideos={filteredVideos}
          progress={progress}
          setProgress={setProgress}
          togglePlayPause={togglePlayPause}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          playlistVideos={playlistVideos}
          index={index}
        />
      

        <Box
          onMouseDown={DoubleSpeed}
          onMouseUp={exitDoubleSpeed}
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
          {isLongPress && (
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
              <Typography variant="subtitle2" sx={{ paddingRight: 1 }}>
                2x{" "}
              </Typography>
              <FastForwardIcon sx={{ width: "1.1rem", height: "1.1rem" }} />
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
            {!isUserInteracted && (
              <Box
                className="thumbnail-overlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: 1,
                  color: "#fff",
                  userSelect: "none",
                  zIndex: 999,
                  pointerEvents: "all",
                  "&:hover .large-play-btn": {
                    fill: "#f03",
                    opacity: "1!important"
                  },
                   "&:hover .large-play-btn-container": {
                    opacity: 1
                  },
                }}
              >
                <IconButton
                className="large-play-btn-container"
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: "78px",
                    height: "58px",
                    marginLeft: "-34px",
                    marginTop: "-24px",
                    transition: "opacity .25s cubic-bezier(0,0,.2,1)",
                    opacity: "0.8"
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
                    ></path>
                    <path d="M 45,24 27,14 27,34" fill="#f1f1f1"></path>
                  </svg>
                </IconButton>
              </Box>
            )}

            <IconButton
              sx={{ width: "52px", height: "52px", padding: 0 }}
              ref={playIconRef}
            >
              {!isPlaying ? (
                <PlayArrowIcon
                  className="playback-icon"
                  sx={{
                    color: "#f1f1f1",
                    height: "52px",
                    maxWidth: "52px",
                    padding: "12px",
                  }}
                />
              ) : (
                <PauseIcon
                  className="playback-icon"
                  sx={{
                    color: "#f1f1f1",
                    maxWidth: "52px",
                    height: "52px",
                    padding: "12px",
                  }}
                />
              )}
            </IconButton>
          </Box>
        </Box>
      </Box>

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
    </>
  );
}

export default React.memo(VideoPlayer);
