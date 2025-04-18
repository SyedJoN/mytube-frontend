import React, { useRef } from "react";
import { Typography, Box, Button } from "@mui/material";
import Paper from "@mui/material/Paper";
import ClickAwayListener from '@mui/material/ClickAwayListener';

function SignInAlert({
  width = 375,
  height = 180,
  title,
  desc,
  isOpen,
  handleClose,
  onConfirm,
  leftVal,
  setActiveAlertId,
}) {
  if (!isOpen) return null;
  const alertRef = useRef(null);

  return (
    <ClickAwayListener onClickAway={() => setActiveAlertId(null)}>
    <Box
      ref={alertRef}
      sx={{
        position: "absolute",
        top: "100%", // places Paper just below the button
        left: leftVal ? leftVal : "0",
        width: width,
        height: height,
        zIndex: 10,
      }}
      open={isOpen}
    >
      <Paper
        elevation={2}
        sx={{ background: "#212121", height: "100%", width: "100%" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: 3,
          }}
        >
          <Typography
            marginBottom="16px"
            textTransform="none"
            color="#f1f1f1"
            variant="body1"
            textAlign="start"
          >
            {title}
          </Typography>

          <Typography
            marginBottom="24px"
            textTransform="none"
            color="#bbb"
            variant="body2"
            textAlign="start"
          >
            {desc}
          </Typography>
          <Box sx={{ marginLeft: "-16px" }}>
            <Button
              onClick={() => {
                onConfirm?.();
                handleClose();
              }}
              variant="text"
              sx={{
                textTransform: "none",
                cursor: "pointer",
                color: "#3ea6ff",
                "&:hover": {
                  background: "#263850",
                },
                justifyContent: "center",
                width: "80px",
                borderRadius: "50px!important",
              }}
              marginTop="24px"
            >
              Sign in
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
    </ClickAwayListener>
  );
}

export default SignInAlert;
