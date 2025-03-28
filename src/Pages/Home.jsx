import React from "react";
import VideoCard from "../Components/VideoCard";
import Grid from "@mui/material/Grid2";
import { Box, Typography } from "@mui/material";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetchVideos } from "../apis/videoFn.js";
import formatDate from "../utils/dayjs.js";
import Skeleton from "@mui/material/Skeleton";
import { Link } from "@tanstack/react-router";

function Home({ open }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const videos = data?.data?.docs || []; // ✅ Ensure `videos` is always an array

  return (
    <Box sx={{ flexGrow: 1, padding: "73px 16px", }}>
      {/* {isLoading && (
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          Loading...
        </Typography>
      )} */}

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
        {isLoading
          ? Array.from(new Array(12)).map((_, index) => (
              <Grid
                key={index}
                sx={{
                  gridColumn: {
                    xs: "span 12",
                    sm: "span 6",
                    md: "span 4",
                    lg: open ? "span 3" : "span 12",
                  },
                }}
              >
                <Skeleton
                  variant="rectangular"
                  width={300}
                  height={180}
                  sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: "8px", marginBottom: 1 }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, }}>
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.1)",
                      borderRadius: "50px",
                      marginBottom: 1,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton
                      sx={{
                        bgcolor: "rgba(255,255,255,0.1)",
                 
                      }}
                      width="80%"
                      height={30}
                    />
                    <Skeleton
                      sx={{
                        bgcolor: "rgba(255,255,255,0.1)",
                 
                      }}
                      width="50%"
                      height={30}
                    />
                  </Box>
                </Box>
              </Grid>
            ))
          : videos.map((video) => (
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
                <Link to={`/watch/${video._id}`} style={{textDecoration: "none"}}>
                <VideoCard
                  home={true}
                  thumbnail={video.thumbnail}
                  title={video.title}
                  avatar={video.owner.avatar}
                  open={open}
                  fullName={video.owner.fullName}
                  views={video.views}
                  duration={video.duration}
                  createdAt={formatDate(video.createdAt)}
                />
            </Link>
              </Grid>
            ))}
      </Grid>
    </Box>
  );
}

export default Home;
