import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { fetchVideos } from '../apis/videoFn';
import { useParams } from '@tanstack/react-router';
import VideoCard from "../Components/VideoCard";
import { Box, Typography } from '@mui/material';
import formatDate from '../utils/dayjs';
import Grid from "@mui/material/Grid2";
import { Link } from "@tanstack/react-router";
import Skeleton from "@mui/material/Skeleton";


function SearchVideo() {
  const params = useParams({ from: '/search/$query' });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["videos", params.query || ""], // Ensure query isn't undefined
    queryFn: ({ queryKey }) => fetchVideos({ queryKey }), // Properly pass queryKey
    enabled: !!params.query, // Prevent fetching if query is empty
  });
 const videos = data?.data?.docs;


  return (
    <Box sx={{
     
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "100px",
      
    }}>
       
        {isError && <Typography>Error: {error.message}</Typography>}

        {data?.data?.docs.length > 0 ? (
          <Grid
          sx={{
            paddingBottom: 3,
            width: {
              xs: "90%",  // 90% width on extra small screens (mobile)
              sm: "80%",  // 80% width on small screens (tablets)
              md: "60%",  // 60% width on medium screens (laptops)
              lg: "50%",  // 50% width on large screens (desktops)
              xl: "60%",  // 40% width on extra large screens (big monitors)
            },
          }}
            >
            {data?.data?.docs.map((video) => (
              <Grid
                sx={{
                  gridColumn: {
                    xs: 12,
                    sm: 9,
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
                    fontSize="2rem!important"
                    thumbnail={video.thumbnail}
                    title={video.title}
                    description={video.description}
                    avatar={video.owner.avatar}
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
        
        ) :
        (
          <>
          <Typography color="#fff" variant='h3'>No videos found</Typography>
          </>
        )
      }
      </Box>
     
     
 
  );
}

export default SearchVideo;
