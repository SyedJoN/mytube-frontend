import React from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Box } from "@mui/material";

const MAX_HEIGHT = 240;

export default function MobileBottomSheet({ open, onClose }) {
  const [height, setHeight] = React.useState(240);
  const startY = React.useRef(0);
  const startHeight = React.useRef(0);
  const sheetRef = React.useRef(null);
  const isDragging = React.useRef(false);

  const handleDragStart = (clientY) => {
    startY.current = clientY;
    startHeight.current = height;
    isDragging.current = true;
    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleDragEnd);
  };

  const handleTouchStart = (e) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleMove = (clientY) => {
    const dy = clientY - startY.current;
    const newHeight = startHeight.current - dy;
    setHeight(Math.max(1, Math.min(MAX_HEIGHT, newHeight)));
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleMove(e.touches[0].clientY);
  };

  const handleDragEnd = (e) => {
    e.stopPropagation();

    if (!isDragging.current) {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleDragEnd);
      return;
    }

    const touch = e.changedTouches[0];
    const sheetRect = sheetRef?.current.getBoundingClientRect();

    if (touch.clientY >= sheetRect.top && touch.clientY <= sheetRect.bottom) {
      onClose(false);
    }

    isDragging.current = false;
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleDragEnd);
  };

  React.useEffect(() => {
    if (!open) {
      setHeight(300);
      document.body.style.overflow = "";
    } else {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Box
        ref={sheetRef}
        sx={{
          position: "fixed",
          left: 8,
          bottom: 24,
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
          display: "flex",
          flexDirection: "column",
          width: "calc(100% - 16px)",
          borderRadius: 3,
          backgroundColor: "#212121",
          overflow: "hidden",
          zIndex: 999999,
        }}
      >
        {/* Drag handle */}
        <Box
        id="grab-chip"
          onTouchStart={handleTouchStart}
          sx={{
            paddingY: 12,
            cursor: "grab",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 1,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 4,
              borderRadius: 2,
              opacity: 0.3,
              background: "#f1f1f1",
            }}
          />
        </Box>

        {/* Content */}
        <Box
          sx={{
            maxHeight: `${height}px`,
            overflowY: "scroll",
            color: "#f1f1f1",
          }}
          tabIndex={-1}
        >
          <List sx={{p: 0}}>
            <ListItemButton sx={{height: 48, padding: "6px 12px"}}>
              <ListItemText primary="Settings" />
            </ListItemButton>
            <ListItemButton sx={{height: 48, padding: "6px 12px"}}>
              <ListItemText primary="Your data in VTube" />
            </ListItemButton>
            <ListItemButton sx={{height: 48, padding: "6px 12px"}}>
              <ListItemText primary="Open App" />
            </ListItemButton>
            <ListItemButton sx={{height: 48, padding: "6px 12px"}}>
              <ListItemText primary="Feedback" />
            </ListItemButton>
            <ListItemButton>
              <ListItemText primary="Help" />
            </ListItemButton>
          </List>
        </Box>
      </Box>

      <Box
        role="dialog"
        aria-modal="true"
        onTouchEnd={() => onClose(false)}
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          zIndex: 99999,
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
        }}
      />
    </>
  );
}
