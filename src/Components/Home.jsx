import React from "react";
import VideoCard from "./VideoCard";
import Grid from "@mui/material/Grid2"; // ✅ Correct import
import { Box } from "@mui/material";

function Home({ open }) {
  console.log("Home open:", open);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={open ? 3 : 2} sx={{ padding: "10px" }} key={open}>
        {[...Array(5)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={open ? 3 : 4} key={index}>
            <VideoCard open={open} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Home;
