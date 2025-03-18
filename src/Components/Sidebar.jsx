import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import {
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import SubscriptionsOutlinedIcon from "@mui/icons-material/SubscriptionsOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PlaylistPlayOutlinedIcon from "@mui/icons-material/PlaylistPlayOutlined";
import SmartDisplayOutlinedIcon from "@mui/icons-material/SmartDisplayOutlined";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useTheme } from "@mui/material/styles";

const drawerWidth = 240;
const miniDrawerWidth = 65; // Collapsed drawer width

function ResponsiveDrawer(props) {
  const theme = useTheme();
  const { window } = props;
  const [open, setOpen] = React.useState(true); // Controls drawer open/close state

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            size="medium"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setOpen(!open)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            VTube
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        container={container}
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : miniDrawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : miniDrawerWidth,
            transition: "width 0.3s ease",
            overflowX: "hidden",
            zIndex: 0,
            bgcolor: theme.palette.primary.main,
          },
        }}
      >
        <Toolbar />

        <List sx={{ color: "#fff" }}>
          {["Home", "Shorts", "Subscriptions", !open ? "You" : null]
            .filter(Boolean)
            .map((text, index) => (
              <ListItem key={text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                 selected={index===0}
                  sx={{
                    display: "flex",
                    flexDirection: open ? "row" : "column",
                    alignItems: "center",
                    justifyContent: open ? "flex-start" : "center", // ✅ Fix for icons when collapsed
                    borderRadius: "10px",
                    paddingX: 2,
                    paddingY: open ? 1 : 1.5,
                    marginX: open ? 1 : 0,
                    gap: open ? '0' : "0.5px",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)", 
                      "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)", 

                      }
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "#fff",
                      minWidth: 0,
                      justifyContent: "center",
                    }}
                  >
                    {index === 0 ? (
                      <HomeIcon sx={{ fontSize: "1.5rem" }} />
                    ) : index === 1 ? (
                      <PlayArrowOutlinedIcon sx={{ fontSize: "1.5rem" }} />
                    ) : index === 2 ? (
                      <SubscriptionsOutlinedIcon sx={{ fontSize: "1.5rem" }} />
                    ) : !open ? (
                      <AccountCircleOutlinedIcon sx={{ fontSize: "1.5rem" }} />
                    ) : null}
                  </ListItemIcon>
                  <Typography
                    sx={{
                      marginLeft: open ? 2 : 0,
                      fontSize: open ? "0.9rem" : "0.6rem",
                      mt: open ? 0 : "5px",
                    }}
                  >
                    {text}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
        </List>

        {open && (
          <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", my: 1 }} />
        )}

        {open && (
          <List sx={{ color: "#fff" }}>
            <ListItem disablePadding sx={{ display: "flex" }}>
              <ListItemButton
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start", // ✅ Fix for icons when collapsed
                  borderRadius: "10px",
                  paddingX: 2,
                  paddingY: 1,
                  gap: "0.5rem",
                  marginX: 1,
                  transition: "background-color 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <Typography sx={{ fontSize: "0.9rem" }}>You</Typography>

                <ListItemIcon
                  sx={{ color: "#fff", minWidth: 0, justifyContent: "center" }}
                >
                  <ArrowForwardIosOutlinedIcon sx={{ fontSize: "0.9rem" }} />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>

            {[
              "History",
              "Playlists",
              "Your videos",
              "Watch Later",
              "Liked Videos",
            ].map((text, index) => (
              <ListItem key={text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  sx={{
                    display: "flex",
                    flexDirection: open ? "row" : "column",
                    alignItems: "center",
                    justifyContent: open ? "flex-start" : "center",
                    paddingY: 1,
                    paddingX: open ? 2 : 0,
                    borderRadius: "10px",
                    marginX: 1,
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: "#fff",
                      minWidth: 0,
                      justifyContent: "center",
                    }}
                  >
                    {index === 0 ? (
                      <HistoryOutlinedIcon />
                    ) : index === 1 ? (
                      <PlaylistPlayOutlinedIcon />
                    ) : index === 2 ? (
                      <SmartDisplayOutlinedIcon />
                    ) : index === 3 ? (
                      <WatchLaterOutlinedIcon />
                    ) : (
                      <ThumbUpOutlinedIcon />
                    )}
                  </ListItemIcon>
                  <Typography sx={{ marginLeft: 2, fontSize: "0.9rem" }}>
                    {text}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Drawer>
    </Box>
  );
}

ResponsiveDrawer.propTypes = {
  window: PropTypes.func,
};

export default ResponsiveDrawer;
