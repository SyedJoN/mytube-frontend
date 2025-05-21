import React, { useState, useRef, useEffect, useContext } from "react";
import { keyframes, useMediaQuery, useTheme } from "@mui/system";
import { getColor } from "../utils/getColor";
import { Box, Typography } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVideoById } from "../apis/videoFn";
import { getUserChannelProfile } from "../apis/userFn";
import CommentSection from "./CommentSection";
import { videoView } from "../apis/videoFn";
import confetti from "canvas-confetti";
import { OpenContext } from "../routes/__root";
import Grid from "@mui/material/Grid";
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import { Link } from "@tanstack/react-router";
import { SubscribeButton } from "./SubscribeButton";
import { LikeDislikeButtons } from "./LikeDislikeButton";
import Description from "./Description";
import VideoSideBar from "./VideoSideBar";
import theme from "../assets/Theme";
import { fetchPlaylistById } from "../apis/playlistFn";
import { useNavigate } from "@tanstack/react-router";
import PlaylistContainer from "./PlaylistContainer";

function VideoPlayer({ videoId, playlistId }) {
  console.log("videoId", videoId);
  const context = useContext(OpenContext);
  let { data: dataContext } = context;
  const isAuthenticated = dataContext || null;
  const navigate = useNavigate();

  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isCustomWidth = useMediaQuery("(max-width:1014px)");

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
      if (currentStep > steps) return; // Stop animation when reaching the right side

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
      setTimeout(animateFireworks, 10); // Delay before next step
    };

    animateFireworks(); // Start animation
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
    enabled: !!videoId,
  });

  console.log("Query triggered:", videoId); // ✅ Debugging ke liye

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

  const {
    data: playlistData,
    isLoading: isPlaylistLoading,
    isError: isPlaylistError,
  } = useQuery({
    queryKey: ["playlists", playlistId],
    queryFn: () => fetchPlaylistById(playlistId),
    enabled: !!playlistId, // only fetch when playlistId is truthy
  });

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
    if (viewCounted) return;

    const video = event.target;
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
  const handleChannelClick = () => {
    navigate({
      to: `/@${owner}`,
    });
  };

  const handleVideoEnd = () => {
    if (!playlistId || !playlistData?.data?.videos?.length) return;

    const videos = playlistData.data.videos;
    const currentIndex = videos.findIndex((v) => v._id === videoId);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % videos.length;
    const nextVideoId = videos[nextIndex]._id;
    if (nextIndex !== 0) {
      navigate({
        to: "/watch",
        search: playlistId ? { v: nextVideoId, list: playlistId, index: nextIndex } : undefined,
      });
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
        <video
          width="100%"
          height="auto"
          key={data?.data?._id}
          controls
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
        <VideoSideBar />
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
