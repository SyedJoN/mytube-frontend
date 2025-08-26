import React from "react";
import VideoCard from "../Video/VideoCard";
import Grid from "@mui/material/Grid";
import { Link } from "@tanstack/react-router";
import Skeleton from "@mui/material/Skeleton";
import CardHeader from "@mui/material/CardHeader";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import formatDate from "../../utils/formatDate";
import Button from "@mui/material/Button";
import { useQuery } from "@tanstack/react-query";
import ButtonGroup from "@mui/material/ButtonGroup";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import handleMouseDown from "../../helper/intertactionHelper";
import Interaction from "../Utils/Interaction";
import SideVideosList from "./SideVideosList";


function VideoSideBar({
  shuffledVideos,
  isLoadingList,
  isErrorList,
  errorList,
}) {
  const [activeOptionsId, setActiveOptionsId] = React.useState(null);

  const theme = useTheme();
  const isCustomWidth = useMediaQuery(theme.breakpoints.down("custom"));

  const gridSize = {
      xs: 12,
      sm: 6,
      md: 4,
      lg: 3.8,
      xl: 2.89,
    }

  const videoList = React.useMemo(() => {
    if (shuffledVideos.length === 0) return [];

    return shuffledVideos.map((video) => ({
      id: video._id,
      owner: video?.owner?.username,
      videoId: video._id,
      thumbnail: video.thumbnail.url,
      previewUrl: video.thumbnail.preview,
      title: video.title,
      fullName: video.owner.fullName,
      views: video.views,
      duration: video.duration,
      createdAt: formatDate(video.createdAt),
    }));
  }, [shuffledVideos]);

  const renderSideVideos = (videoData, index) => {
    const commonProps = {
      owner: videoData.owner,
      verifyInteraction: true,
      videoId: videoData.videoId,
      thumbnail: videoData.thumbnail,
      previewUrl: videoData.previewUrl,
      title: videoData.title,
      fullName: videoData.fullName,
      views: videoData.views,
      duration: videoData.duration,
      createdAt: videoData.createdAt,
      activeOptionsId,
      setActiveOptionsId,
    };

    return (
      <Grid
        key={videoData.id}
        size={isCustomWidth ? gridSize : { xs: 12 }}
        sx={
          !isCustomWidth
            ? { marginBottom: 1, "& > *": { width: "100%" } }
            : undefined
        }
      >
        <SideVideosList
          {...commonProps}
          home={isCustomWidth}
          videoMd={isCustomWidth}
          video={!isCustomWidth}
        />
      </Grid>
    );
  };

  const skeletonItems = Array.from({ length: 12 }, (_, index) => (
    <Grid key={index} size={{ xs: 12 }}>
      <Box sx={{ display: "flex", marginBottom: 1 }}>
        <Skeleton
          variant="rectangular"
          width={160}
          height={100}
          sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
        />
        <Box sx={{ flex: 1, paddingLeft: "6px" }}>
          <Skeleton
            sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            width="90%"
            height={20}
          />
          <Skeleton
            sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            width="30%"
            height={20}
          />
          <Box sx={{ marginTop: 2 }}>
            <Skeleton
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
              width="40%"
              height={20}
            />
            <Skeleton
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
              width="40%"
              height={20}
            />
          </Box>
        </Box>
      </Box>
    </Grid>
  ));

  // console.log("Parent rendering SideVideosList", {
  //   isCustomWidth,
  //   videoCount: videoList.length,
  // });

  return (
    <>
      {isErrorList && <Typography>Error: {errorList.message}</Typography>}

      <Grid
        container
        spacing={isCustomWidth ? 2 : 0}
        sx={{
          width: "100%",
          margin: 0,
        }}
      >
        {videoList.length > 0
          ? videoList.map(renderSideVideos)
          : isLoadingList && skeletonItems}
      </Grid>
    </>
  );
}

export default React.memo(VideoSideBar);
