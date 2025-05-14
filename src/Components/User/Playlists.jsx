import React from 'react'
import { useLoaderData } from '@tanstack/react-router';
import Grid from "@mui/material/Grid";
import { Box } from '@mui/material';
import formatDate from '../../utils/formatDate';
import VideoCard from '../VideoCard';


const Playlists = () => {
    const { userData } = useLoaderData({
        from: '/$username',
        strict: false 
      });
  return (
     <Grid container spacing={2}>
      {userData?.data?.playlists?.map((playlist) => (
        <Grid
          key={playlist._id}
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
              playlist={true}
              thumbnail={playlist.videos[0].thumbnail}
              title={playlist.name}
              videoCount={playlist.videos.length}
              open={open}
              createdAt={formatDate(playlist.createdAt)}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  )
}

export default Playlists