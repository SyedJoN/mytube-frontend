import React, { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchVideos, fetchVideoById } from "../apis/videoFn";
import formatDate from "../utils/dayjs";
import { videoView } from "../apis/videoFn";
import { AspectRatio } from "@mui/icons-material";
import VideoCard from "./VideoCard";
import Grid from '@mui/material/Grid2';
import { Link } from "@tanstack/react-router";
import Skeleton from "@mui/material/Skeleton";


function VideoPlayer({ videoId }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => fetchVideoById(videoId),
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

  const videos = listVideoData?.data?.docs || [];

  const [viewCounted, setViewCounted] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const watchTimeRef = useRef(0);
  const { mutate } = useMutation({
    mutationFn: () => videoView(videoId),
  });
  if (isLoading) return <Typography>Loading...</Typography>;
  if (isError) return <Typography>Error: {error.message}</Typography>;

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

  };

  return (
    <Grid container spacing={0} sx={{flexWrap: "noWrap", paddingTop: "80px", justifyContent: "center"}}  
  >
       <Grid size={{xs: 12, md: 8}} sx={{paddingRight: "24px"}}>

    <video
        width="100%"
        height="auto"
        controls
        key={data.data.videoFile} 
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        style={{ aspectRatio: "16/9", borderRadius: "8px" }} // Correct way to set aspect ratio
      >
        <source src={data.data.videoFile} type="video/mp4" />
      </video>
    </Grid>
     
    <Grid size={{xs: 12, md: 4}} 
     sx={{
      width: "402px!important",
      minWidth: "300px!important"
    }} >
    {isErrorList && <Typography>Error: {errorList.message}</Typography>}

      {videos.length > 0 ? (
    <Grid
    container spacing={0}>
    {videos.map((video) => (
      <Grid 
      sx={{
        gridColumn: {
          xs:12,
          sm:6,
          md:4
        }

      }
      }
       key={video._id}>
        <Link to={`/watch/${video._id}`} style={{textDecoration: "none"}}>
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
  isLoadingList && Array.from(new Array(12)).map((_, index) => (
    <Grid
      key={index}
      sx={{
        gridColumn: {
          xs: "span 12",
          sm: "span 6",
          md: "span 4",
          lg: "span 2"
        },
      }}
    >
     <Box sx={{display: "flex"}}>
      <Skeleton
        variant="rectangular"
        width={160}
        height={100}
        sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: "8px", marginBottom: 1 }}
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
          <Box sx={{marginTop: 2}}>
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
