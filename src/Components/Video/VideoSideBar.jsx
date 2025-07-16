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

function VideoSideBar({
  shuffledVideos,
  isLoadingList,
  isErrorList,
  errorList,
}) {
  const [activeOptionsId, setActiveOptionsId] = React.useState(null);
  const isCustomWidth = useMediaQuery("(max-width:1014px)");
  const gridSize = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3.8,
    xl: open ? 3.88 : 2.89,
  };
  return (
    <>
      {isErrorList && <Typography>Error: {errorList.message}</Typography>}

      {shuffledVideos.length > 0 ? (
        <Grid
          spacing={isCustomWidth ? 2 : 0}
          container
          sx={{
            marginTop: isCustomWidth ? "16px" : "",
          }}
        >
          {shuffledVideos.map((video) => (
            <React.Fragment key={video._id}>
              {isCustomWidth ? (
                <Grid size={gridSize}>
                  <VideoCard
                    owner={video?.owner?.username}
                    verifyInteraction={true}
                    videoId={video._id}
                    thumbnail={video.thumbnail.url}
                    previewUrl={video.thumbnail.preview}
                    title={video.title}
                    home={true}
                    videoMd={true}
                    fullName={video.owner.fullName}
                    views={video.views}
                    duration={video.duration}
                    createdAt={formatDate(video.createdAt)}
                    activeOptionsId={activeOptionsId}
                    setActiveOptionsId={setActiveOptionsId}
                  />
                </Grid>
              ) : (
                <Box
                  key={video._id}
                  sx={{
                    marginBottom: 1,
                    flexGrow: "1!important",
                    width: "100%",
                  }}
                >
                  <VideoCard
                    verifyInteraction={true}
                    owner={video?.owner?.username}
                    videoId={video._id}
                    thumbnail={video.thumbnail.url}
                    previewUrl={video.thumbnail.preview}
                    title={video.title}
                    video={true}
                    fullName={video.owner.fullName}
                    views={video.views}
                    duration={video.duration}
                    createdAt={formatDate(video.createdAt)}
                    activeOptionsId={activeOptionsId}
                    setActiveOptionsId={setActiveOptionsId}
                  />
                </Box>
              )}
            </React.Fragment>
          ))}
        </Grid>
      ) : (
        isLoadingList &&
        Array.from(new Array(12)).map((_, index) => (
          <Box key={index}>
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
          </Box>
        ))
      )}
    </>
  );
}

export default React.memo(VideoSideBar);
