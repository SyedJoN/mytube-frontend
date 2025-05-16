import React from "react";
import { Box } from "@mui/material";
import { useScratch } from "react-use";

const Interaction = ({ id, expanded }) => {



  return (
    <Box
      id={id}

      sx={{
        position: "absolute",
        inset: 0,
        cursor: "pointer",
        margin: id == "video-interaction" ? "-4px" : "",
        pointerEvents: "none"
      }}
      component="vt-interaction"
    >
      <Box
        className="fill"
        sx={{
          position: "absolute",
          borderRadius: id != "video-interaction" ? "12px" : "4px",
          inset: 0,
          background: "#fff",
          opacity: 0,
          pointerEvents: "none",
          willChange: "opacity",
        }}
      />

      <Box
        className="stroke"
        sx={{
          position: "absolute",
          borderRadius: id !== "video-interaction" ? "12px" : "4px",
          inset: 0,
          border: "1px solid #fff",
          opacity: 0,
          pointerEvents: "none",
          willChange: "opacity",
        }}
      />
    </Box>
  );
};

export default Interaction;
