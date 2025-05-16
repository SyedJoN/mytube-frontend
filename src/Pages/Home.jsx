import React, { useContext } from "react";
import VideoCard from "../Components/VideoCard";
import Grid from "@mui/material/Grid";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { fetchVideos } from "../apis/videoFn.js";
import formatDate from "../utils/formatDate.js";
import { OpenContext } from "../routes/__root.js";
import Skeleton from "@mui/material/Skeleton";
import { Link } from "@tanstack/react-router";

function Home() {
  const context = useContext(OpenContext);
  let { open, setOpen } = context;
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
  });

  const videos = data?.data?.docs || [];

  return (
    <Box sx={{ display: "flex" }}>
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
        sx={{
          marginTop: "16px",
        }}
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
                    lg: open ? "span 12" : "span 4",
                    marginBottom: 24
                  },
                }}
              >
                <Skeleton
                  variant="rectangular"
                  width={300}
                  height={180}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    marginBottom: 1,
                    marginRight: 2,
                  }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                sx={{
                  flexGrow: "1!important",
                  marginRight: "8px",
                  marginLeft: "8px",
                }}
                key={video._id}
                size={{
                  xs: 12,
                  sm: 5.2,
                  md: 3.5,
                  lg: 3.5,
                  xl: open ? 2.9 : 2.7,
                }}
              >
                <VideoCard
                  owner={video.owner?.username}
                  videoId={video._id}
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
              </Grid>
            ))}
      </Grid>
    </Box>
  );
}

export default Home;
