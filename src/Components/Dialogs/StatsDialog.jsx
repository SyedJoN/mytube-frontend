import * as React from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import {
  Box,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LanguageIcon from "@mui/icons-material/Language";
import { formatDayDate } from "../../utils/formatDateDay";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShareDialog from "./ShareDialog";

export default function StatsDialog({
  title,
  desc,
  buttonTxt,
  dialogOpen,
  setDialogOpen,
  username,
  userData,
  onConfirm,
}) {
  const listItemStyles = {
    color: "#f1f1f1",
    textDecoration: "none",
    ".css-rizt0-MuiTypography-root": {
      fontSize: "0.85rem",
    },
  };

  const listItemIconStyles = {
    color: "#f1f1f1",
    minWidth: "40px",
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  if (!userData?.data) return null;

  const { subscribersCount, createdAt, videos } = userData.data;
  const videoCount = videos.length;
  const views = videos.reduce((acc, video) => acc + (video.views || 0), 0);

  const [shareDialog, setShareDialog] = React.useState(false);

  if (!userData?.data?.videos || userData.data.videos.length === 0) return null;

  return (
    <>
      {shareDialog && (
        <ShareDialog
          open={shareDialog}
          onClose={()=> setShareDialog(false)}
          shareUrl={`http://localhost:5173/@${username}`}
        />
      )}
      <Dialog
      disableScrollLock
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "#1e1e1e", // dark bg
              color: "#f1f1f1", // text color
              borderRadius: 3,
              boxShadow: 5,
              padding: 1,
              width: "450px",
            },
          },
        }}
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box
          sx={{
            display: "flex",
            alignContent: "center",
            justifyContent: "space-between",
          }}
        >
          <DialogTitle
            sx={{ fontSize: "1rem", fontWeight: "600", padding: "16px" }}
            id="alert-dialog-title"
          >
            {title}
          </DialogTitle>
          <IconButton
            onClick={handleClose}
            sx={{
              borderRadius: "50px",
              width: "40px",
              height: "40px",
              mt: 1,
              "&:hover": {
                background: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <CloseIcon sx={{ color: "#aaa" }} />
          </IconButton>
        </Box>
        <DialogTitle
          sx={{
            paddingX: "16px",
            paddingTop: "16px",
            paddingBottom: "4px",
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "rgb(255,255,255)",
          }}
          id="alert-dialog-title"
        >
          More Info
        </DialogTitle>
        <DialogContent sx={{ padding: "16px 0px" }}>
          <Box sx={{ fontSize: "0.9rem", color: "#aaa" }}>
            <List sx={{ paddingY: 0 }}>
              <ListItem
                sx={listItemStyles}
                component="a"
                href={`/@${username}`}
                target="_blank"
              >
                <ListItemIcon sx={listItemIconStyles}>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText primary={`www.youtube.com/@${username}`} />
              </ListItem>
              <ListItem sx={listItemStyles} component="div">
                <ListItemIcon sx={listItemIconStyles}>
                  <InfoOutlinedIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`Joined at ${formatDayDate(createdAt)}`}
                />
              </ListItem>
              <ListItem sx={listItemStyles} component="div">
                <ListItemIcon sx={listItemIconStyles}>
                  <RecordVoiceOverIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`${subscribersCount} ${subscribersCount === 1 ? "subscriber" : "subscribers"}`}
                />
              </ListItem>
              <ListItem sx={listItemStyles} component="div">
                <ListItemIcon sx={listItemIconStyles}>
                  <SlideshowIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`${videoCount} ${videoCount === 1 ? "video" : "videos"}`}
                />
              </ListItem>
              <ListItem sx={listItemStyles} component="div">
                <ListItemIcon sx={listItemIconStyles}>
                  <TrendingUpIcon />
                </ListItemIcon>
                <ListItemText
                  primary={`${views} ${views === 1 ? "view" : "views"}`}
                />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{
              textTransform: "capitalize",
              color: "#3ea6ff",
              transition: "none",
              "&:hover": {
                background: "#263850",
                borderRadius: "50px",
              },
            }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            sx={{
              textTransform: "capitalize",
              color: "#3ea6ff",
              transition: "none",
              "&:hover": {
                background: "#263850",
                borderRadius: "50px",
              },
            }}
            onClick={() => {
              setShareDialog(true);
            }}
            autoFocus
          >
            {buttonTxt}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
