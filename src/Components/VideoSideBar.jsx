import React from "react";
import VideoCard from "./VideoCard";
import Grid from "@mui/material/Grid";
import { Link } from "@tanstack/react-router";
import Skeleton from "@mui/material/Skeleton";
import { fetchVideos } from "../apis/videoFn";
import CardHeader from "@mui/material/CardHeader";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import formatDate from "../utils/formatDate";
import Button from "@mui/material/Button";
import { useQuery } from "@tanstack/react-query";
import ButtonGroup from "@mui/material/ButtonGroup";
import { Box, Typography } from "@mui/material";

function VideoSideBar() {
  const {
    data: listVideoData,
    isLoading: isLoadingList,
    isError: isErrorList,
    error: errorList,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });
  const [activeOptionsId, setActiveOptionsId] = React.useState(null);
  const videos = listVideoData?.data?.docs || [];

  return (
    <>
      {isErrorList && <Typography>Error: {errorList.message}</Typography>}

      {videos.length > 0 ? (
        <>
          {videos.map((video) => (
            <Box
              sx={{
                marginBottom: 2,
              }}
              key={video._id}
            >
              <VideoCard
                videoId={video._id}
                thumbnail={video.thumbnail}
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
          ))}
        </>
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
