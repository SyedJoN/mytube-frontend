import React, { createContext, useContext, useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const showMessage = useCallback((msg) => {
    setMessage(msg);
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar
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
        open={open}
        onClose={handleClose}
        autoHideDuration={3000}
        message={message}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </SnackbarContext.Provider>
  );
};
export const useSnackbar = () => useContext(SnackbarContext); 
