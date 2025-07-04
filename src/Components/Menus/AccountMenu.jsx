import * as React from "react";
import { UserContext } from "../../routes/__root";
import { useContext, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Avatar,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  Typography,
  Tooltip,
  Button,
  Box,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import {
  deepPurple,
  indigo,
  blue,
  teal,
  green,
  amber,
  orange,
  red,
} from "@mui/material/colors";

import Signin from "../Auth/Signin";
import { logoutUser } from "../../apis/userFn";

export default function AccountMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [createAnchorEl, setCreateAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const openCreate = Boolean(createAnchorEl);
  const [dialogue, setDialogue] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width:400px)");

  const context = useContext(UserContext);

  const { data: userData } = context ?? {};

  const queryClient = useQueryClient();

  const handleClick = (event) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
    setCreateAnchorEl(null);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickCreate = (event) => {
    setCreateAnchorEl((prev) => (prev ? null : event.currentTarget));
    setAnchorEl(null);
  };

  const handleDialogueOpen = () => {
    setDialogue(true);
  };

  const handleDialogueClose = (value) => {
    setDialogue(false);
  };

  const handleLogout = () => {
    mutate();
    setAnchorEl(null);
  };

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.invalidateQueries(["userData"]); // ✅ Clears and refetches user data
      queryClient.setQueryData(["userData"], null); // 🧹 Resets user data to null
      window.location.href = "/";
    },
    onError: (error) => {
      console.error(
        "Registration failed:",
        error.response?.data?.message || error.message
      );
    },
  });

  function getColor(name = "") {
    const colors = [
      deepPurple[500],
      indigo[500],
      blue[500],
      teal[500],
      green[500],
      amber[500],
      orange[500],
      red[500],
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index] || blue[500];
  }
  return (
    <React.Fragment>
      {userData ? (
        <Box
        className="account-wrapper"
          sx={{ display: "flex", alignItems: "center", textAlign: "center",gap: isSmallScreen ? "16px" : 0 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
              paddingY: 1,
              paddingX: 0.3,
              borderRadius: "50px",
              backgroundColor: "hsla(0,0%,100%,.08)",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: "hsl(0,0%,18.82%)",
              },
            }}
          >
            <IconButton
              onClick={handleClickCreate}
              size="small"
              aria-controls={openCreate ? "create-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openCreate ? "true" : undefined}
              sx={{ paddingX: "10px", paddingY: "0" }}
            >
              <AddIcon sx={{ color: "#fff" }} />
              <Typography
                color="#fff"
                sx={{ minWidth: 50, fontSize: "0.9rem", fontWeight: "bold" }}
              >
                Create
              </Typography>
            </IconButton>
          </Box>
          <IconButton
            sx={{
              display: isSmallScreen ? "none" : "inline-flex",
              minWidth: 50,
              paddingY: 1,
              paddingX: 1.5,
            }}
          >
            <NotificationsNoneOutlinedIcon sx={{ color: "#fff" }} />
          </IconButton>
          <Tooltip title="Account settings">
            <IconButton
              sx={{ padding: 0 }}
              onClick={handleClick}
              size="small"
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar
                src={
                  userData?.data?.avatar?.url ? userData.data.avatar?.url : null
                }
                sx={{ bgcolor: getColor(userData?.data?.fullName) }}
              >
                {userData.fullName ? (
                  userData?.data?.fullName.charAt(0).toUpperCase()
                ) : (
                  <PersonIcon />
                )}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box
          sx={{ display: "flex", alignItems: "center", textAlign: "center" }}
        >
          <Button
            variant="outlined"
            onClick={handleDialogueOpen}
            size="small"
            aria-controls={openCreate ? "create-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={openCreate ? "true" : undefined}
            sx={{
              border: "1px solid rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              paddingX: "10px",
              height: "36px",
              lineHeight: "36px",
              borderRadius: "50px",
              backgroundColor: "transparent",
              cursor: "pointer",
              textTransform: "none",
              transition: "none",
              flexShrink: 0,
              "&:hover": {
                backgroundColor: "hsl(0,0%,18.82%)",
                borderColor: "unset",
              },
            }}
          >
            <AccountCircleOutlinedIcon sx={{ color: "#fff" }} />
            <Typography
              sx={{ color: "#fff", fontSize: "0.85rem", paddingLeft: 1 }}
            >
              Sign in
            </Typography>
          </Button>
        </Box>
      )}
      {dialogue && <Signin open={dialogue} onClose={handleDialogueClose} />}

      {anchorEl && (
        <Box
          id="account-menu"
          sx={{
            position: "absolute",
            right: "27px",
            top: "50px",
            borderRadius: "10px",
            backgroundColor: "#282828",
          }}
        >
          <MenuItem
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
            onClick={handleClose}
          >
            <Avatar
              src={
                userData?.data?.avatar?.url ? userData.data.avatar?.url : null
              }
              sx={{
                bgcolor: getColor(userData?.data?.fullName),
                marginRight: 1,
              }}
            >
              {userData?.fullName
                ? userData?.data?.fullName.charAt(0).toUpperCase()
                : "?"}
            </Avatar>
            <Link
              style={{ color: "#f1f1f1", textDecoration: "none" }}
              to={`/@${userData?.username}`}
            >
              <Typography variant="body1">Profile</Typography>
            </Link>
          </MenuItem>
          <MenuItem
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
            onClick={handleClose}
          >
            <Avatar
              src={
                userData?.data?.avatar?.url ? userData.data.avatar?.url : null
              }
              sx={{
                bgcolor: getColor(userData?.data?.fullName),
                marginRight: 1,
              }}
            >
              {userData?.fullName ? (
                userData?.data?.fullName.charAt(0).toUpperCase()
              ) : (
                <PersonIcon />
              )}
            </Avatar>
            <Typography variant="body1">My account</Typography>
          </MenuItem>
          <Divider />
          <MenuItem
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
            onClick={handleClose}
          >
            <ListItemIcon sx={{ color: "#f1f1f1" }}>
              <PersonAdd fontSize="small" />
            </ListItemIcon>
            <Typography variant="body1">Add another account</Typography>
          </MenuItem>
          <MenuItem
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
            onClick={handleClose}
          >
            <ListItemIcon sx={{ color: "#f1f1f1" }}>
              <Settings fontSize="small" />
            </ListItemIcon>
            <Typography variant="body1">Settings</Typography>
          </MenuItem>
          <MenuItem
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
            onClick={handleLogout}
          >
            <ListItemIcon sx={{ color: "#f1f1f1" }}>
              <Logout fontSize="small" />
            </ListItemIcon>
            <Typography variant="body1">Sign out</Typography>
          </MenuItem>
        </Box>
      )}

      {createAnchorEl && (
        <Box
          id="create-menu"
          sx={{
            position: "absolute",
            right: "60px",
            top: "50px",
            borderRadius: "10px",
            backgroundColor: "#282828",
            paddingY: 1,
          }}
        >
          <MenuItem
            sx={{
              paddingTop: 1,
              paddingLeft: "16px",
              paddingRight: "36px",
              gap: "3px",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <SlideshowOutlinedIcon />
            <Typography variant="body2" marginLeft="10px">
              Upload video
            </Typography>
          </MenuItem>
          <MenuItem
            sx={{
              paddingTop: 1,
              paddingLeft: "16px",
              paddingRight: "36px",
              gap: "3px",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <PodcastsIcon />
            <Typography variant="body2" marginLeft="10px">
              Go live
            </Typography>
          </MenuItem>
          <MenuItem
            sx={{
              paddingTop: 1,
              paddingLeft: "16px",
              paddingRight: "36px",
              gap: "3px",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            <BorderColorIcon />
            <Typography variant="body2" marginLeft="10px">
              Create post
            </Typography>
          </MenuItem>
        </Box>
      )}
    </React.Fragment>
  );
}
