import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import Slide from "@mui/material/Slide";

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

export default function SimpleSnackbar({ open, setOpen, message }) {
  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      message={message}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      slots={{
        transition: SlideTransition, 
      }}
      slotProps={{
        content: {
          sx: {
            backgroundColor: "#f1f1f1",
            color: "#0f0f0f",
            borderRadius: "8px",
            px: 2,
          },
        },
      }}
    />
  );
}
