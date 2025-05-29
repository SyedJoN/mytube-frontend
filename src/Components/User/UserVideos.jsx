import React, {useContext} from "react";
import { OpenContext } from "../../routes/__root";
import Grid from "@mui/material/Grid";
import { Box, Container } from "@mui/material";
import formatDate from "../../utils/formatDate";
import VideoCard from "../Video/VideoCard";
import { useRouteContext } from "@tanstack/react-router";
import { useLoaderData } from '@tanstack/react-router';

const UserVideos = () => {
const { userData } = useLoaderData({
    from: '/$username',
    strict: false 
  });

  return (
    <Grid container spacing={2}>
      {userData?.data?.videos?.map((video) => (
        <Grid
          key={video._id}
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
            xl: 3,
          }}
        >
          <Box sx={{ width: "100%" }}>
            <VideoCard
              profile={true}
              thumbnail={video.thumbnail}
              title={video.title}
              open={open}
              views={video.views}
              duration={video.duration}
              createdAt={formatDate(video.createdAt)}
              videoId={video._id}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default UserVideos;
