import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { Button } from "@mui/material";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AddIcon from "@mui/icons-material/Add";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import Signup from "./Signup";

export default function AccountMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [createAnchorEl, setCreateAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const openCreate = Boolean(createAnchorEl);
  const [dialogue, setDialogue] = useState(false);

  const { authenticated } = props;

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
  }

  const handleDialogueClose = (value) => {
    setDialogue(false);
  };
  const handleCloseCreate = () => {
    setCreateAnchorEl(null);
  };
  return (
    <React.Fragment>
      {authenticated ? (
        <Box
          sx={{ display: "flex", alignItems: "center", textAlign: "center" }}
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
          <IconButton sx={{ minWidth: 50, paddingY: 1, paddingX: 1.5 }}>
            <NotificationsNoneOutlinedIcon sx={{ color: "#fff" }} />
          </IconButton>
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleClick}
              size="small"
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar sx={{ width: 32, height: 32, backgroundColor: "green" }}>
                M
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
            sx={{
              border: "1px solid rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
              paddingY: 0.5,
              paddingX: 0,
              height: "36px",
              borderRadius: "50px",
              backgroundColor: "transparent",
              cursor: "pointer",
              transition: "none",
              "&:hover": {
                backgroundColor: "hsl(0,0%,18.82%)",
                borderColor: "unset"
              },
            }}
          >
            <IconButton
              
              onClick={handleDialogueOpen}
              size="small"
              aria-controls={openCreate ? "create-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={openCreate ? "true" : undefined}
              sx={{ display: "flex", justifyContent: "center", alignItems: "center", paddingX: "10px", paddingY: "0", lineHeight: "36px" }}
            >
              <AccountCircleOutlinedIcon sx={{color: "#fff",}}/>
<Typography sx={{color: "#fff", fontSize: "0.85rem", paddingLeft: 1}}>
Sign in
</Typography>
            </IconButton>
          </Button>
        </Box>
      )}
      {dialogue && 
        <Signup
        open={handleDialogueOpen}
        onClose={handleDialogueClose}
      />
      }
 
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
            <Avatar />
            <Typography variant="body1">Profile</Typography>
          </MenuItem>
          <MenuItem
            sx={{
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
            onClick={handleClose}
          >
            <Avatar />
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
            onClick={handleClose}
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
