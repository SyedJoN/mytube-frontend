import React from "react";
import { Box, Button, useMediaQuery } from "@mui/material";
import { useTheme } from "@emotion/react";

const ManageButtons = () => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ display: "flex", gap: 1, mt: 1, justifyContent: isTablet ? "center" : "start" }}>
      <Button
        sx={{
          flexGrow: isTablet ? 1 : 0,
          maxWidth: "270px",
          borderRadius: "50px",
          position: "relative",
          height: "36px",
          fontSize: "0.8rem",
          textTransform: "capitalize",
          overflow: "hidden",
          fontWeight: "600",
          padding: "0 16px",
          width: "160px",
          background: "rgba(255,255,255,0.1)",
          "&:hover": {
            background: "rgba(255,255,255,0.2)",
          },
        }}
      >
        <span
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            position: "relative",
            color: "#f1f1f1",
            whiteSpace: "nowrap",
          }}
        >
          Customize channel
        </span>
      </Button>
      <Button
        sx={{
          flexGrow: isTablet ? 1 : 0,
          maxWidth: "270px",
          borderRadius: "50px",
          position: "relative",
          height: "36px",
          fontSize: "0.8rem",
          textTransform: "capitalize",
          overflow: "hidden",
          fontWeight: "600",
          padding: "0 16px",
          width: "140px",
          background: "rgba(255,255,255,0.1)",
          "&:hover": {
            background: "rgba(255,255,255,0.2)",
          },
        }}
      >
        <span
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            position: "relative",
            color: "#f1f1f1",
            whiteSpace: "nowrap",
          }}
        >
          Manage videos
        </span>
      </Button>
    </Box>
  );
};

export default ManageButtons;
