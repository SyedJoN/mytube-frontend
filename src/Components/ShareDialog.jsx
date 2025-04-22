import React, {useRef, useState} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Button,
  TextField,
} from "@mui/material";
import ScrollableTabsButton from "./ScrollableTabs";
import SimpleSnackbar from "./Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import FacebookIcon from "@mui/icons-material/Facebook";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
// ...add more icons as needed

export default function ShareDialog({ open, onClose, shareUrl }) {
  console.log("In ShareDialog →", shareUrl);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setSnackbarOpen(true);
  };



  return (
    <>
      <SimpleSnackbar
              open={snackbarOpen}
              setOpen={setSnackbarOpen}
              message="Link copied to clipboard"
            />
             <Dialog
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "#1e1e1e", // dark bg
            color: "#f1f1f1", // text color
            borderRadius: 3,
            boxShadow: 5,
            width: "520px",
            height: "265px",
            padding: "8px 0px"
          },
        },
      }}
      open={open}
      onClose={onClose}
    >
      <DialogTitle
        sx={{
          position: "relative",
          display: "flex",
          marginBottom: "-28px",
          justifyContent: "space-between",
          fontSize: "1rem",
        }}
      >
        Share
        <IconButton sx={{top: "-12px", right: "-17px"}}onClick={onClose}>
          <CloseIcon sx={{color: "#aaa"}}/>
        </IconButton>

      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: "24px", overflow: "hidden" }}>
         <ScrollableTabsButton shareUrl={shareUrl}/>
        </Box>
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            outlineColor: "#f1f1f1",
          }}
        >
          <TextField
            sx={{
              bgcolor: "#0f0f0f",
              outline: "none",
              border: "none",
              borderRadius: "12px",
              ".css-1ll44ll-MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.2) !important",
                borderWidth: "0.4px",
              },
              ".css-16wblaj-MuiInputBase-input-MuiOutlinedInput-input": {
                padding: "17px 19px",
                color: "#f1f1f1",
                fontSize: "0.85rem",
              },
              ".css-nhrfdh-MuiInputBase-root-MuiOutlinedInput-root": {
                borderRadius: "inherit",
              },
            }}
            variant="outlined"
            fullWidth
            value={shareUrl}
            slotProps={{ readOnly: true }}
          />
          <Box sx={{ position: "absolute", top: "8px", right: "8px" }}>
            <Button
              sx={{
                color: "#0f0f0f",
                background: "#3ea6ff",
                borderRadius: "50px",
                textTransform: "none",
                fontSize: "0.75rem",
                fontWeight: "600",
                padding: "8px 16px",
                "&:hover": {
                  background: "#65b8ff",
                },
              }}
              variant="contained"
              onClick={handleCopy}
            >
              Copy
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
    </>
   
  );
}
