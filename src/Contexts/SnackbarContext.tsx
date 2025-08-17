import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import Snackbar from "@mui/material/Snackbar";
import { useFullscreen } from "../Components/Utils/useFullScreen";
import { createPortal } from "react-dom";

type SnackbarContextType = {
  showMessage: (msg: string) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

type SnackbarProviderProps = {
  children: ReactNode;
};

export const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const renderSnackbar = () => (
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
  )
  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };
  const isFullscreen = useFullscreen()

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
 
      {isFullscreen && document.fullscreenElement
      ? createPortal(renderSnackbar(), document.fullscreenElement)
      : renderSnackbar()
    }
    </SnackbarContext.Provider>
  );
};

// Custom hook with safety check
export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
