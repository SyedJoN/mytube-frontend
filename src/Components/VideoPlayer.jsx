import React, { useState, useRef, useEffect, useCallback } from "react";
import {debounce} from "lodash"
import { Box, Divider, Typography } from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchVideos, fetchVideoById } from "../apis/videoFn";
import { getUserChannelProfile } from "../apis/userFn";
import formatDate from "../utils/dayjs";
import { videoView } from "../apis/videoFn";
import { AspectRatio } from "@mui/icons-material";
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
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import EmojiPicker from "emoji-picker-react";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt"; 
import TextField from '@mui/material/TextField';
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
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { toggleSubscription } from "../apis/subscriptionFn";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { getVideoLikes } from "../apis/likeFn";

function VideoPlayer({ videoId }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
    enabled: !!videoId, // ✅ Fetch only if videoId exists
  });
  const user = data?.data?.owner?.username;
  const channelId = data?.data?.owner?._id;

  const {
    data: likesData,
    isLoading: isLikeLoading,
    isError: isLikeError,
    error: likeError,
  } = useQuery({
    queryKey: ["videoLikes", videoId],
    queryFn: () => getVideoLikes(videoId),
    enabled: !!videoId, // ✅ Fetch only if videoId exists
  });

  const likes = likesData?.data;

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
    queryKey: ["userData", user],
    queryFn: () => getUserChannelProfile(user),
    enabled: !!user, // ✅ Fetch only if videoId exists
  });

  const {
    mutate: handleSubscription,
    isSubscription,
    isSubscriptionError,
    subscriptionError,
  } = useMutation({
    mutationFn: () => toggleSubscription(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries(["toggleSubscription", channelId]);
    },
  });

  useEffect(() => {
    console.log(userData?.data[0].subscriberCount);
  }, [userData]);
  const videos = listVideoData?.data?.docs || [];

  const [viewCounted, setViewCounted] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [addComment, setAddComment] = useState(false);
  const [comment, setComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);


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

  const handleInputChange = (e) => {
    setComment(e.target.value)
  }
  
  const handleEmojiClick = (emojiData) => {
    setComment((prev) => prev + emojiData.emoji); // Add emoji to input
  };
 
  const handleTimeUpdate = (event) => {
    if (viewCounted || !isVideoVisible) return;

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
    console.log(data.data);
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
          <Box sx={{ display: "flex", alignItems: "center", marginTop: 1 }}>
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
                      {userData?.data[0].subscribersCount}{" "}
                      {userData?.data[0].subscribersCount === 1
                        ? "subscriber"
                        : "subscribers"}
                    </span>
                  </Typography>
                </>
              }
            />
            <Button
              onClick={() => handleSubscription()}
              variant="contained"
              sx={{
                background: userData?.data[0].isSubscribedTo
                  ? "rgb(255,255,255)"
                  : "rgba(255,255,255,0.1)",
                borderRadius: "50px",
                padding: "6px 16px",
                fontSize: "0.8rem",
                textTransform: "capitalize",
                color: "#0f0f0f",
                fontWeight: "600",
                marginLeft: 2,
              }}
              color="rgba(255,255,255,0.1)"
            >
              {!userData?.data[0].isSubscribedTo ? (
                <>
                  <NotificationsNoneIcon
                    sx={{ color: "rgb(255,255,255)", fontSize: "1.6rem" }}
                  />{" "}
                  <span
                    style={{ color: "rgb(255,255,255)", paddingLeft: "4px" }}
                  >
                    Subscribed
                  </span>
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </Box>
          <Box>
            <ButtonGroup
              onClick={() => handleSubscription()}
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
              <Box sx={{
                borderRadius: "50px 0 0 50px",
                  "&:hover": {
                    background: "rgba(255,255,255,0.1)",
                  },
              }}>
              <Button
                sx={{
                  paddingX: "12px",
                
                  "&.MuiButtonGroup-firstButton": {
                    borderRight: "1px solid rgba(255,255,255,0.2)",
                    marginY: 1,
                    paddingY: 0,
                  },
                }}
              >
                <ThumbUpOffAltIcon
                  sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                />

                <span style={{ color: "rgb(255,255,255)" }}>{likes}</span>
              </Button>
              </Box>
            
              <Box sx={{
                borderRadius: "0 50px 50px 0",
                  "&:hover": {
                    background: "rgba(255,255,255,0.1)",
                  },
              }}>
              <Button
                sx={{
                  paddingX: "12px",
                  paddingY: 0,
                  marginY: 1,
                }}
              >
                <ThumbDownOffAltIcon
                  sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                />
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
                {userData?.data[0].subscribersCount}{" "}
                {userData?.data[0].subscribersCount === 1
                  ? "subscriber"
                  : "subscribers"}
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
        <Box marginTop="12px">
          <Typography variant="h3" color="rgb(255,255,255)">
            1,962 Comments
          </Typography>
          <Box sx={{display: "flex", alignItems: "center"}}>
          <CardHeader
              sx={{
                alignItems: "flex-start",
                alignSelf: "flex-end",
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
                  sx={{ bgcolor: getColor(data.data?.owner.fullName)}}
                >
                  {data.data.owner.fullName
                    ? data.data.owner.fullName.charAt(0).toUpperCase()
                    : "?"}
                </Avatar>
              }>
              </CardHeader>
          <FormControl fullWidth sx={{ m: 1 }} variant="standard">
          <InputLabel
          disabled = {comment !== ""}
          shrink
           sx={{
            color: "rgba(255,255,255,0.7)",
            fontSize: "1.1rem",
            transform: "translate(0, 23.5px) scale(0.75)",
            "&.MuiInputLabel-root.Mui-focused": {
              color: "#fff !important", // Label color when focused
            },
            
          }} htmlFor="standard-adornment-amount">Add a comment...</InputLabel>
          <Input
          value={comment}
          onChange={handleInputChange} 
          onClick={()=> setAddComment(true)}
  id="standard-adornment-amount"
  sx={{
    "&::before": {
      borderBottom: "1px solid rgb(255,255,255) !important",
    },
    "&::after": {
      borderBottom: "2px solid rgb(255,255,255) !important"
    },
    input: {
      color: "white",
     
    },
  "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0px 1000px #0f0f0f inset",
      WebkitTextFillColor: "#fff !important",
    },
    "& input:-webkit-autofill:hover": {
      WebkitTextFillColor: "#fff !important",
    },
  }}
/>
        </FormControl>
       
        </Box>
    
        <Box sx={{display: "flex", justifyContent: "space-between", color: "#fff", marginTop: "6px"}}>
           {addComment && 
<Box sx={{position: "relative", marginLeft: "48px"}}>
  <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)} sx={{color: "#fff" }}>
        <SentimentSatisfiedAltIcon />
      </IconButton>

     
      <Box sx={{ position: "absolute", left: "10px", zIndex: 100, display: showEmojiPicker ? "block" : "none" }}>
  <EmojiPicker onEmojiClick={handleEmojiClick} />
</Box>
</Box>
}

{addComment && 
  <Box sx={{display: "flex", gap:"8px"}}>
  <Button onClick={()=> setAddComment(false)} variant="outlined" sx={{color: "rgb(255,255,255)", borderRadius: "50px", textTransform: "capitalize", paddingY: 1,
    "&:hover": {
      background: "rgba(255,255,255,0.1)"
    }
  }}>Cancel</Button>
  <Button  disabled={comment === ""} variant="outlined" sx={{color: "#0f0f0f", fontWeight: "550", borderRadius: "50px", textTransform: "capitalize", paddingY: 1,
  background: "#3ea6ff",
    "&:hover": {
      background: "#65b8ff"
    },
   "&.Mui-disabled": {
      background: "rgba(255, 255, 255, 0.1) !important",
      color: "rgba(255, 255, 255, 0.4) !important",
    },
  }}>Comment</Button>
</Box>}

        </Box>
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
                    avatar={false}
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
