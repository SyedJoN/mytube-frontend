import React from "react";
import { useLoaderData } from "@tanstack/react-router";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/material";
import formatDate from "../../utils/formatDate";
import VideoCard from "../Video/VideoCard";

const Playlists = () => {
  const { userData } = useLoaderData({
    from: "/$username",
    strict: false,
  });


  return (
    <Grid container spacing={0}>
      {userData?.data?.playlists?.map((playlist) => (
        <Grid
          key={playlist._id}
          sx={{
            width: "210px!important",
            marginRight: "4px",
            marginBottom: 3,
            flex: "none!important",
          }}
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 2,
            xl: 2,
          }}
        >
          <VideoCard
            playlist={playlist}
            playlistId={playlist._id}
            thumbnail={playlist.videos[0].thumbnail}
            title={playlist.name}
            videoCount={playlist.videos.length}
            open={open}
            createdAt={formatDate(playlist.createdAt)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default Playlists;
