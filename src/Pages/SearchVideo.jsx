import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchVideos } from "../apis/videoFn";
import { useParams } from "@tanstack/react-router";
import VideoCard from "../Components/Video/VideoCard";
import { Box, Typography } from "@mui/material";
import formatDate from "../utils/formatDate";
import Grid from "@mui/material/Grid";
import { Link } from "@tanstack/react-router";
import Skeleton from "@mui/material/Skeleton";

function SearchVideo() {
  const params = useParams({ from: "/search/$query" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["videos", params.query || ""], // Ensure query isn't undefined
    queryFn: ({ queryKey }) => fetchVideos({ queryKey }), // Properly pass queryKey
    enabled: !!params.query, // Prevent fetching if query is empty
  });
  const videos = data?.data?.docs;

  return (
    <Box sx={{}}>
      {isError && <Typography>Error: {error.message}</Typography>}

      {data?.data?.docs.length > 0 ? (
        <Grid
          container
          sx={{
            marginX: "24px",
            justifyContent: "center"
          }}
        >
          {data?.data?.docs.map((video) => (
            <Grid
              size={{
                xs: 12,
                sm: 12,
                md: 8,
                lg: 8,
                xl: 8,
              }}
              key={video._id}
            >
              <Link
                to={`/watch/${video._id}`}
                style={{ textDecoration: "none" }}
              >
                <VideoCard
                  fontSize="2rem!important"
                  thumbnail={video.thumbnail.url}
                  title={video.title}
                  description={video.description}
                  avatar={video.owner.avatar.url}
                  search={true}
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
        <>
          <Typography color="#fff" variant="h3">
            No videos found
          </Typography>
        </>
      )}
    </Box>
  );
}

export default SearchVideo;
