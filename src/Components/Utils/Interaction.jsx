import React from "react";
import { Box } from "@mui/material";
import { useScratch } from "react-use";

const Interaction = React.forwardRef(({ id, circle }, ref) => {
  return (
    <Box
      id={id}
      ref={ref}
      sx={{
        position: "absolute",
        inset: 0,
        top: id == "playlist-interaction" ? "-8px" : "",
        cursor: "pointer",
        margin: id == "video-interaction" || "playlist-interaction" ? "-4px" : "",
        pointerEvents: "none",
      }}
      component="vt-interaction"
    >
      <Box
        className="fill"
        sx={{
          position: "absolute",
          borderRadius: circle
            ? "50%"
            : id !== "video-interaction"
              ? "12px"
              : "4px",

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
          borderRadius: circle
            ? "50%"
            : id !== "video-interaction"
              ? "12px"
              : "4px",

          inset: 0,
          border: "1px solid #fff",
          opacity: 0,
          pointerEvents: "none",
          willChange: "opacity",
        }}
      />
    </Box>
  );
});

export default Interaction;
