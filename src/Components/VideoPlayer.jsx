import React, { useState, useRef, useEffect, useContext } from "react";
import { keyframes } from "@mui/system";
import { getColor } from "../utils/getColor";
import { Box, Typography } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVideoById } from "../apis/videoFn";
import { getUserChannelProfile } from "../apis/userFn";
import CommentSection from "./CommentSection";
import { videoView } from "../apis/videoFn";
import confetti from "canvas-confetti";
import { OpenContext } from "../routes/__root";
import Grid from "@mui/material/Grid2";
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@mui/material/Avatar";

import { SubscribeButton } from "./SubscribeButton";
import { LikeDislikeButtons } from "./LikeDislikeButton";
import Description from "./Description";
import VideoSideBar from "./VideoSideBar";

function VideoPlayer({ videoId }) {
  const context = useContext(OpenContext);
  let { data: dataContext } = context;
  const isAuthenticated = dataContext || null;

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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // useEffect(() => {
  //   console.log("Query triggered:", videoId);
  // }, [videoId]);
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
    enabled: Boolean(user),
  });

  const [subscriberCount, setSubscriberCount] = useState(
    userData?.data[0]?.subscribersCount ?? 0
  );
  const [viewCounted, setViewCounted] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState(null);

  const buttonRef = useRef(null);

  useEffect(() => {
    const newCount = userData?.data[0]?.subscribersCount ?? 0;
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

  return (
    <Grid
      container
      spacing={0}
      sx={{ flexWrap: "noWrap", paddingTop: "80px", justifyContent: "center" }}
    >
      <Grid size={{ xs: 12, md: 8 }} sx={{ paddingRight: "24px" }}>
        <video
          width="100%"
          height="auto"
          controls
          key={data.data.videoFile}
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          style={{ aspectRatio: "16/9", borderRadius: "8px" }}
        >
          <source src={data.data.videoFile} type="video/mp4" />
        </video>
        <Box marginTop="8px">
          <Typography variant="h3" color="#fff">
            {data.data.title}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginTop: 1,
              position: "relative",
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
                <Avatar
                  src={data.data.owner.avatar ? data.data.owner.avatar : null}
                  sx={{ bgcolor: getColor(data?.data?.owner?.fullName) }}
                >
                  {data.data.owner.fullName
                    ? data.data.owner.fullName.charAt(0).toUpperCase()
                    : "?"}
                </Avatar>
              }
              title={
                <Typography variant="p" color="#f1f1f1">
                  {data.data.owner.fullName}
                </Typography>
              }
              // action={
              //   <IconButton aria-label="settings">
              //     <MoreVertIcon sx={{ color: "#fff" }} />
              //   </IconButton>
              // }
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
              initialSubscribed={userData?.data[0]?.isSubscribedTo}
              initialSubscribers={userData?.data[0]?.subscribersCount}
              user={user}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />
          </Box>
          <LikeDislikeButtons
            isAuthenticated={isAuthenticated}
            videoId={videoId}
            initialLikes={data?.data?.likesCount || 0}
            initialIsLiked={data?.data?.likedBy.includes(
              dataContext?.data?._id
            )}
            initialIsDisliked={data?.data?.disLikedBy.includes(
              dataContext?.data?._id
            )}
            activeAlertId={activeAlertId}
            setActiveAlertId={setActiveAlertId}
          />
        </Box>
        <Description
          data={data}
          subscriberCount={userData?.data[0]?.subscribersCount}
        />
        <CommentSection
          isAuthenticated={isAuthenticated}
          videoId={videoId}
          data={data}
          activeAlertId={activeAlertId}
          setActiveAlertId={setActiveAlertId}
        />
      </Grid>
      <Grid
        size={{ xs: 12, md: 4 }}
        sx={{
          width: "402px!important",
          minWidth: "300px!important",
        }}
      >
        <VideoSideBar />
      </Grid>
    </Grid>
  );
}

export default React.memo(VideoPlayer);
