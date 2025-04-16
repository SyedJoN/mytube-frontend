import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function AlertDialog({ title, desc, buttonTxt, dialogOpen, setDialogOpen, onConfirm }) {
  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <Dialog
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "#1e1e1e", // dark bg
            color: "#f1f1f1", // text color
            borderRadius: 3,
            boxShadow: 5,
          },
        },
      }}
      open={dialogOpen}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle sx={{ fontSize: "1rem" }} id="alert-dialog-title">
       {title}
      </DialogTitle>
      <DialogContent>
        {desc && <DialogContentText
          sx={{ fontSize: "0.9rem", color: "#aaa" }}
          id="alert-dialog-description"
        >
         {desc}
        </DialogContentText> }
    
      </DialogContent>
      <DialogActions>
        <Button
          
          sx={{ textTransform: "capitalize", color: "#3ea6ff",
            transition: "none",
            "&:hover": {
              background: "#263850",
              borderRadius: "50px"
            }
           }}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
           sx={{ textTransform: "capitalize", color: "#3ea6ff",
            transition: "none",
            "&:hover": {
              background: "#263850",
              borderRadius: "50px"
            }
           }}
          onClick={() => {
            onConfirm(); 
            handleClose();
          }}
          autoFocus
        >
          {buttonTxt}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
