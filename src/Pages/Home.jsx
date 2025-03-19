import React from "react";
import VideoCard from "../Components/VideoCard";
import Grid from "@mui/material/Grid2";
import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {fetchVideos} from "../apis/videoFn.js";
import formatDate from "../utils/dayjs.js"

function Home({ open }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const videos = data?.data?.docs || []; // ✅ Ensure `videos` is always an array

  return (
    <Box sx={{ flexGrow: 1, padding: "10px" }}>
      {isLoading && (
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          Loading...
        </Typography>
      )}

      {isError && (
        <Typography variant="body1" color="error" sx={{ textAlign: "center" }}>
          {error?.message || "Failed to load videos"}
        </Typography>
      )}

      {!isLoading && !isError && videos.length === 0 && (
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          No videos available
        </Typography>
      )}

      <Grid
        container
        spacing={open ? 3 : 2}
        key={open}
        columns={{ xs: 12, sm: 12, md: 12, lg: 12 }}
      >
        {videos.map((video) => (
          <Grid
            key={video._id}
            sx={{
              gridColumn: {
                xs: "span 12",
                sm: "span 6",
                md: "span 4",
                lg: open ? "span 3" : "span 12",
              },
            }}
          >
            <VideoCard
              thumbnail={video.thumbnail}
              title={video.title}
              avatar={video.owner.avatar}
              open={open}
              fullName={video.owner.fullName}
              views={video.views}
              duration={video.duration}
              createdAt={formatDate(video.createdAt)}
            />
          </Grid>
        ))}
      </Grid>

    </Box>
    
  );
}

export default Home;
