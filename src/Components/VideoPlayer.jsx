import React, { useState, useRef, useEffect, useContext } from "react";
import { keyframes } from "@mui/system";
import { Box, Typography } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchVideos, fetchVideoById } from "../apis/videoFn";
import { getUserChannelProfile } from "../apis/userFn";
import formatDate from "../utils/dayjs";
import { videoView } from "../apis/videoFn";
import confetti from "canvas-confetti";
import { OpenContext } from "../routes/__root";

import { toggleVideoLike } from "../apis/likeFn";
import { toggleVideoDislike } from "../apis/dislikeFn";
import VideoCard from "./VideoCard";
import Grid from "@mui/material/Grid2";
import { Link } from "@tanstack/react-router";
import Skeleton from "@mui/material/Skeleton";
import CardHeader from "@mui/material/CardHeader";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Avatar from "@mui/material/Avatar";

import {
  deepPurple,
  indigo,
  blue,
  teal,
  green,
  amber,
  orange,
  red,
} from "@mui/material/colors";

import { toggleSubscription } from "../apis/subscriptionFn";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";

import { getVideoComments } from "../apis/commentFn";
import Comments from "./Comments";
import AddComment from "./AddComment";

function VideoPlayer({ videoId }) {
  const queryClient = useQueryClient();

  const context = useContext(OpenContext);
  let { data: dataContext } = context;

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
  queryKey: ['video', videoId],
  queryFn: () => fetchVideoById(videoId),
  enabled: !!videoId,
});


// useEffect(() => {
//   console.log("Query triggered:", videoId);
// }, [videoId]);
  console.log("Query triggered:", videoId);  // ✅ Debugging ke liye
  

  const [isLike, setIsLike] = useState({
    isLiked: data?.data?.likedBy.includes(dataContext?.data?._id) || false,
    likeCount: data?.data.likesCount || 0,
  });
  const [isDislike, setIsDislike] = useState({
    isDisliked:data?.data?.disLikedBy.includes(dataContext?.data?._id) || false,
  });
  const user = data?.data?.owner?.username;

  const channelId = data?.data?.owner?._id;

  const {
    data: commentsData,
    isLoading: isCommentLoading,
    isError: isCommentError,
    error: commentError,
  } = useQuery({
    queryKey: ["commentsData", videoId],
    queryFn: () => getVideoComments(videoId),
    enabled: !!videoId, // ✅ Fetch only if videoId exists
  });

  const {
    data: listVideoData,
    isLoading: isLoadingList,
    isError: isErrorList,
    error: errorList,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });
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

  const {
    mutate: mutateSubscription,
    isLoading: isSubscriptionLoading,
    isPending: isSubscriptionPending,
  } = useMutation({
    mutationFn: () => toggleSubscription(channelId),
    onMutate: () => {
      setIsSubscribed((prev) => !prev);
      if (isSubscribed) {
        setSubscriberCount((prev) => prev - 1);
      } else {
        setSubscriberCount((prev) => prev + 1);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["channelProfile", user]); // Refetch data after success
      launchFireworks(); //
    },
    onError: () => {
      setIsSubscribed((prev) => !prev);
    },
  });

  const [isSubscribed, setIsSubscribed] = useState(
    userData?.data[0]?.isSubscribedTo ?? false
  );

  const [subscriberCount, setSubscriberCount] = useState(
    userData?.data[0]?.subscribersCount ?? 0
  );
  const [viewCounted, setViewCounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeEmojiPickerId, setActiveEmojiPickerId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!userData?.data?.length) return;
    const newValue = userData?.data[0]?.isSubscribedTo ?? false;
    if (isSubscribed !== newValue) {
      setIsSubscribed(newValue); // ✅ Only update if different
    }

    const newCount = userData.data[0]?.subscribersCount ?? 0;
    if (subscriberCount !== newCount) {
      setSubscriberCount(newCount);
    }
  }, [userData]);


  useEffect(() => {
    if (data?.data) {
      setIsLike({
        isLiked: data.data.likedBy.includes(dataContext?.data?._id) || false,
        likeCount: data.data.likesCount || 0,
      });
      setIsDislike({
        isDisliked: data.data.disLikedBy.includes(dataContext?.data?._id) || false,
      });
    }
  }, [data?.data, dataContext?.data?._id]);  
  
  
  const {
    mutate: toggleLikeMutation,
    isLoading: isLikeLoading,
    isPending: isLikePending,
  } = useMutation({
    mutationFn: () => toggleVideoLike(videoId),
    onMutate: () => {
      setIsLike((prev) => ({
        isLiked: !prev.isLiked,
        likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
      }));
      setIsDislike((prev) => {
        if (prev.isDisliked) {
          return {
            ...prev,
            isDisliked: false,
          };
        }
        return prev;
      });
    },

  });

  const {
    mutate: toggleDislikeMutation,
    isLoading: isDisLikeLoading,
    isPending: isDisLikePending,
  } = useMutation({
    mutationFn: () => toggleVideoDislike(videoId),
    onMutate: () => {
      setIsDislike((prev) => ({
        isDisliked: !prev.isDisliked,
      }));
      setIsLike((prev) => {
        if (prev.isLiked) {
          return {
            ...prev,
            isLiked: false,
            likeCount: Math.max(prev.likeCount - 1, 0),
          };
        }
        return prev;
      });
    },
  });

  const handleSubscription = () => {
    mutateSubscription();
  };
  const videos = listVideoData?.data?.docs || [];

  const watchTimeRef = useRef(0);
  const { mutate } = useMutation({
    mutationFn: () => videoView(videoId),
  });
  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error: {error.message}</Typography>;

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevents event conflicts
    setExpanded(!expanded);
  };

  const toggleLike = () => {
    toggleLikeMutation();
  };

  const toggleDislike = () => {
    toggleDislikeMutation();
  };

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

  function getColor(name = "") {
    const colors = [
      deepPurple[500],
      indigo[500],
      blue[500],
      teal[500],
      green[500],
      amber[500],
      orange[500],
      red[500],
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index] || blue[500]; // Default to blue if something goes wrong
  }

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
                  sx={{ bgcolor: getColor(data.data?.owner.fullName) }}
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

            {isSubscribed ? (
              <Button
                ref={buttonRef}
                disableRipple
                onClick={() => handleSubscription()}
                variant="contained"
                sx={{
                  position: "relative",
                  background: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    background: "rgba(255,255,255,0.2)",
                  },
                  borderRadius: "50px",
                  width: !isSubscribed ? "0" : "130px",
                  height: "36px",
                  fontSize: "0.8rem",
                  padding: 0,
                  textTransform: "capitalize",
                  fontWeight: "600",
                  transition: "all 1s ease",
                  overflow: "hidden",
                  marginLeft: 2,
                  "&::before": {
                    content: "''",
                    position: "absolute",
                    height: "100%",
                    zIndex: 0,
                    width: userData?.data[0]?.isSubscribedTo ? "0" : "130px",
                    background:
                      "linear-gradient(135deg, rgba(252, 38, 173, 0.99), rgba(255, 0, 187, 0.71))",
                  },
                }}
              >
                <NotificationsNoneIcon
                  sx={{
                    position: "relative",
                    color: "#f1f1f1",
                    marginLeft: "-6px",
                    marginRight: "6px",
                    fontSize: "1.6rem",
                    animation: userData?.data[0]?.isSubscribedTo
                      ? `${rotateAnimation} 1.4s ease-in-out forwards`
                      : "none",
                    transformOrigin: "top",
                  }}
                />{" "}
                <span
                  style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    color: "#f1f1f1",
                    position: "relative",
                  }}
                >
                  Subscribed
                </span>
              </Button>
            ) : (
              <Button
                disableRipple
                onClick={() => handleSubscription()}
                variant="contained"
                sx={{
                  background: "#f1f1f1",

                  "&:hover": {
                    background: "#d9d9d9",
                  },
                  borderRadius: "50px",
                  width: "100px",
                  height: "36px",
                  fontSize: "0.8rem",
                  textTransform: "capitalize",
                  overflow: "hidden",
                  fontWeight: "600",
                  marginLeft: 2,
                  padding: "0 16px",
                }}
              >
                <span style={{ color: "#0f0f0f" }}>Subscribe</span>
              </Button>
            )}
          </Box>
          <Box>
            <ButtonGroup
              disableElevation
              variant="contained"
              color="rgba(255,255,255,0.1)"
              aria-label="Basic button group"
              sx={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50px",
                fontSize: "0.8rem",
                textTransform: "capitalize",
                color: "#0f0f0f",
                fontWeight: "600",
                marginLeft: 2,
              }}
            >
              <Box
                sx={{
                  borderRadius: "50px 0 0 50px",
                  "&:hover": {
                    background: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <Button
                  disableRipple
                  onClick={toggleLike}
                  sx={{
                    paddingX: "12px",

                    "&.MuiButtonGroup-firstButton": {
                      borderRight: "1px solid rgba(255,255,255,0.2)",
                      marginY: 1,
                      paddingY: 0,
                    },
                  }}
                >
                  {isLike.isLiked ? (
                    <ThumbUpAltIcon
                      sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                    />
                  ) : (
                    <ThumbUpOffAltIcon
                      sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                    />
                  )}

                  <span style={{ color: "rgb(255,255,255)" }}>
                    {isLike.likeCount || "0"}
                  </span>
                </Button>
              </Box>

              <Box
                sx={{
                  borderRadius: "0 50px 50px 0",
                  "&:hover": {
                    background: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <Button
                  disableRipple
                  onClick={toggleDislike}
                  sx={{
                    paddingX: "12px",
                    paddingY: 0,
                    marginY: 1,
                  }}
                >
                  {isDislike.isDisliked ? (
                    <ThumbDownAltIcon
                      sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                    />
                  ) : (
                    <ThumbDownOffAltIcon
                      sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                    />
                  )}
                </Button>
              </Box>
            </ButtonGroup>
          </Box>
        </Box>
        <Card
          sx={{
            backgroundColor: "rgba(255,255,255,0.1)",
            marginTop: 2,
            borderRadius: "8px",
            padding: "8px 12px",
            transition: "all 0.3s ease-in-out",
            maxHeight: expanded ? "none" : "120px",
            overflow: "hidden",
          }}
          onClick={() => setExpanded(true)}
        >
          <CardContent sx={{ padding: "8px 0" }}>
            {/* Views and Date */}
            <Typography
              variant="body2"
              color="rgb(255,255,255)"
              fontWeight={500}
            >
              {data.data.views} {data.data.views === 1 ? "view" : "views"} •{" "}
              {formatDate(data.data.createdAt)}
            </Typography>

            {/* Expandable Description */}
            <Typography variant="body2" color="rgb(255,255,255)">
              {expanded
                ? data.data.description
                : `${data.data.description.slice(0, 100)}... `}
              <span
                role="button"
                style={{ cursor: "pointer" }}
                onClick={handleToggle}
              >
                {!expanded ? "more" : ""}
              </span>
            </Typography>
          </CardContent>

          <CardHeader
            sx={{
              display: expanded ? "flex" : "none", // Hide when collapsed
              padding: 0,
              "& .MuiCardHeader-content": { overflow: "hidden", minWidth: 0 },
            }}
            avatar={
              <Avatar
                src={data.data.owner.avatar || null}
                sx={{ bgcolor: getColor(data.data?.owner.fullName) }}
              >
                {data.data.owner.fullName?.charAt(0).toUpperCase() || "?"}
              </Avatar>
            }
            title={
              <Typography variant="p" color="rgb(255,255,255)">
                {data.data.owner.fullName}
              </Typography>
            }
            subheader={
              <Typography variant="body2" color="#aaa" fontSize="0.8rem">
                {subscriberCount}{" "}
                {subscriberCount === 1 ? "subscriber" : "subscribers"}
              </Typography>
            }
          />
          {expanded ? (
            <span
              role="button"
              style={{
                display: "inline-block",
                paddingTop: "20px",
                color: "rgb(255,255,255)",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
              onClick={handleToggle}
            >
              Show less
            </span>
          ) : null}
        </Card>
        <AddComment
          data={data}
          activeEmojiPickerId={activeEmojiPickerId}
          setActiveEmojiPickerId={setActiveEmojiPickerId}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
        />
        <Box>
          {commentsData?.map((comments) => (
            <Comments
              key={comments._id}
              videoId={videoId}
              data={comments}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              activeEmojiPickerId={activeEmojiPickerId}
              setActiveEmojiPickerId={setActiveEmojiPickerId}
            />
          ))}
        </Box>
      </Grid>

      <Grid
        size={{ xs: 12, md: 4 }}
        sx={{
          width: "402px!important",
          minWidth: "300px!important",
        }}
      >
        {isErrorList && <Typography>Error: {errorList.message}</Typography>}

        {videos.length > 0 ? (
          <Grid container spacing={0}>
            {videos.map((video) => (
              <Grid
                sx={{
                  gridColumn: {
                    xs: 12,
                    sm: 6,
                    md: 4,
                  },
                }}
                key={video._id}
              >
                <Link
                  to={`/watch/${video._id}`}
                  style={{ textDecoration: "none" }}
                >
                  <VideoCard
                    thumbnail={video.thumbnail}
                    title={video.title}
                    video={true}
                    fullName={video.owner.fullName}
                    views={video.views}
                    duration={video.duration}
                    createdAt={formatDate(video.createdAt)}
                  />
                </Link>
              </Grid>
            ))}
          </Grid>
        ) : (
          isLoadingList &&
          Array.from(new Array(12)).map((_, index) => (
            <Grid
              key={index}
              sx={{
                gridColumn: {
                  xs: "span 12",
                  sm: "span 6",
                  md: "span 4",
                  lg: "span 2",
                },
              }}
            >
              <Box sx={{ display: "flex" }}>
                <Skeleton
                  variant="rectangular"
                  width={160}
                  height={100}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    marginBottom: 1,
                  }}
                />

                <Box sx={{ flex: 1, paddingLeft: "6px" }}>
                  <Skeleton
                    sx={{
                      bgcolor: "rgba(255,255,255,0.1)",
                    }}
                    width="90%"
                    height={20}
                  />
                  <Skeleton
                    sx={{
                      bgcolor: "rgba(255,255,255,0.1)",
                    }}
                    width="30%"
                    height={20}
                  />
                  <Box sx={{ marginTop: 2 }}>
                    <Skeleton
                      sx={{
                        bgcolor: "rgba(255,255,255,0.1)",
                      }}
                      width="40%"
                      height={20}
                    />
                    <Skeleton
                      sx={{
                        bgcolor: "rgba(255,255,255,0.1)",
                      }}
                      width="40%"
                      height={20}
                    />
                  </Box>
                </Box>
              </Box>
            </Grid>
          ))
        )}
      </Grid>
    </Grid>
  );
}

export default VideoPlayer;
