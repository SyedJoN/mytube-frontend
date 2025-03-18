import React from "react";
import { Box } from "@mui/material";

function Container({ children, size }) {
  return (
    <Box
      sx={{
        bgcolor: "primary.main",
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        minHeight: "100vh",
        maxWidth: size ? `${size}xl` : "1280px", // Default to 7xl if size is not provided
      }}
    >
      {children}
    </Box>
  );
}

export default Container;
