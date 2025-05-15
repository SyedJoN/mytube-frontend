import React from "react";
import { Box } from "@mui/material";

const Interaction = ({ id }) => {
  const handleRipple = (e) => {
    e.currentTarget.classList.remove("down");
  };
  const handleRippleDown = (e) => {
    e.currentTarget.classList.add("down");
  };
  return (
    <Box
      id={id}
      onMouseDown={handleRippleDown}
      onMouseUp={handleRipple}
      sx={{
        position: "absolute",
        inset: 0,
        cursor: "pointer"
      }}
      component="vt-interaction"
    >
      <Box
        className="fill"
        sx={{
          position: "absolute",
          borderRadius: "12px",
          inset: 0,
          background: "#fff",
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      <Box
        className="stroke"
        sx={{
          position: "absolute",
          borderRadius: "12px",
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
