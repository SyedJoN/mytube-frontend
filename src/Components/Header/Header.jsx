import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import {
  Box,
  css,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MicOutlinedIcon from "@mui/icons-material/MicOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import SubscriptionsOutlinedIcon from "@mui/icons-material/SubscriptionsOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import PlaylistPlayOutlinedIcon from "@mui/icons-material/PlaylistPlayOutlined";
import SmartDisplayOutlinedIcon from "@mui/icons-material/SmartDisplayOutlined";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import { useTheme } from "@mui/material/styles";
import Search from "../Search/Search";
import { Link } from "@tanstack/react-router";
import AccountMenu from "../Menus/AccountMenu";
import { useLocation } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { throttle } from "lodash";
import CustomSlide from "./Slide";
import { DrawerContext, UserContext } from "../../Contexts/RootContexts";
import { useFullscreen } from "../Utils/useFullScreen";
import { usePlayerSetting } from "../../helper/usePlayerSettings";
import { DeviceContext } from "../../Contexts/DeviceContext";

const getListItemButtonStyles = (isExpanded, isUserMenu = false) => {
  return {
    display: "flex",
    flexDirection: isExpanded ? "row" : "column",
    alignItems: "center",
    justifyContent: isExpanded ? "flex-start" : "center",
    borderRadius: "10px",
    paddingX: 2,
    paddingY: isExpanded ? 1 : 1.5,
    marginX: isExpanded ? 1 : 0,
    gap: isExpanded ? "0" : "0.5px",
    transition: "background-color 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    "&.Mui-selected": {
      backgroundColor: isExpanded ? "rgba(255, 255, 255, 0.1)" : "",
      "&:hover": {
        backgroundColor: isExpanded
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(255, 255, 255, 0.1)",
      },
    },
  };
};

const getListItemTypographyStyles = (isExpanded) => ({
  marginLeft: isExpanded ? 2 : 0,
  fontSize: isExpanded ? "0.9rem" : "0.6rem",
  mt: isExpanded ? 0 : "5px",
});

const getListItemIconStyles = () => ({
  color: "#fff",
  minWidth: 0,
  justifyContent: "center",
});

const DrawerContent = React.memo(
  ({
    isExpanded,
    mainMenuItems,
    secondaryMenuItems,
    location,
    toggleDrawer,
  }) => {
    return (
      <Box className="drawer-content" sx={{ flex: 1 }}>
        <Toolbar
          sx={{
            paddingLeft: "16px",
            paddingRight: "16px",
            minHeight: "var(--header-height)",
            "@media (min-width:600px)": {
              paddingLeft: "16px",
              paddingRight: "16px",
              minHeight: "var(--header-height)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            className="start"
          >
            <IconButton
              disableRipple
              size="medium"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{
                width: "40px",
                height: "40px",
                m: 0,
              }}
            >
              <MenuIcon sx={{ color: "#fff" }} />
            </IconButton>
            <Link
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                color: "#fff",
                textDecoration: "none",
                paddingLeft: "8px",
                flexGrow: 1,
              }}
              to="/"
            >
              <Typography variant="h6" noWrap component="div">
                VTube
              </Typography>
            </Link>
          </Box>
        </Toolbar>

        <List sx={{ color: "#fff" }}>
          {mainMenuItems.map(({ text, path, icon, iconOutlined }) => {
            const isSelected = location.pathname === path;
            return (
              <ListItem
                key={text}
                disablePadding
                sx={{
                  display: "block",
                  width: isExpanded ? "calc(100% - 12px)" : "100%",
                }}
              >
                <ListItemButton
                  disableRipple
                  component={Link}
                  to={path}
                  selected={isSelected}
                  sx={getListItemButtonStyles(isExpanded)}
                >
                  <ListItemIcon sx={getListItemIconStyles()}>
                    {iconOutlined && !isSelected ? iconOutlined : icon}
                  </ListItemIcon>
                  <Typography sx={getListItemTypographyStyles(isExpanded)}>
                    {text}
                  </Typography>
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {isExpanded && (
          <>
            <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", my: 1 }} />
            <List sx={{ color: "#fff" }}>
              <ListItem disablePadding sx={{ display: "flex" }}>
                <ListItemButton
                  disableRipple
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
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
                  <ListItemIcon sx={getListItemIconStyles()}>
                    <ArrowForwardIosOutlinedIcon sx={{ fontSize: "0.9rem" }} />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>

              {secondaryMenuItems.map(({ text, icon }) => (
                <ListItem key={text} disablePadding sx={{ display: "block" }}>
                  <ListItemButton
                    disableRipple
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      paddingY: 1,
                      paddingX: 2,
                      borderRadius: "10px",
                      marginX: 1,
                      transition: "background-color 0.3s ease",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    <ListItemIcon sx={getListItemIconStyles()}>
                      {icon}
                    </ListItemIcon>
                    <Typography sx={{ marginLeft: 2, fontSize: "0.9rem" }}>
                      {text}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    );
  }
);

DrawerContent.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
  mainMenuItems: PropTypes.array.isRequired,
  secondaryMenuItems: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
};

function Header({ ...props }) {
  const location = useLocation();
  const home = location.pathname === "/";
  const search = location.pathname.startsWith("/search");
  const watch = location.pathname.startsWith("/watch");
  const userProfile = location.pathname.startsWith("/@");
  const theme = useTheme();
  const isFullscreen = useFullscreen();
  const context = React.useContext(DrawerContext);
  const userContext = React.useContext(UserContext);
  const { open, setOpen } = context ?? {};
  const { data: dataContext } = userContext ?? {};
  const isAuthenticated = dataContext || null;
  const isLaptop = useMediaQuery(theme.breakpoints.down("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isSmallScreen = useMediaQuery("(max-width:430px)");
  const drawerWidth = "var(--drawer-width)";
  const miniDrawerWidth = "var(--mini-drawer-width)";

  const [searchMenu, setSearchMenu] = useState(false);
  const [isTheatre, setIsTheatre] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { window: windowProp } = props;
  const [opacity, setOpacity] = useState(0);
  const navigate = useNavigate();
  const { device } = React.useContext(DeviceContext);

  const toggleDrawer = useCallback(() => {
    if (setOpen) {
      React.startTransition(() => {
        setOpen((prev) => !prev);
      });
    }
  }, [setOpen]);

  const handleScroll = useCallback(() => {
    if (open) return;

    const scrollY = Math.max(0, window.scrollY);
    const maxScroll = 31;
    const stepsArray = [0, 0.3, 0.6, 1];
    const stepSize = maxScroll / stepsArray.length;
    const stepIndex = Math.min(
      stepsArray.length - 1,
      Math.floor(scrollY / stepSize)
    );

    setOpacity(stepsArray[stepIndex]);
  }, [open]);

  React.useEffect(() => {
    console.log("isTheatre", isTheatre);
  }, [isTheatre]);

  React.useEffect(() => {
    if (home || search || userProfile || isFullscreen || isTheatre) return;

    const throttledHandleScroll = throttle(handleScroll, 100);
    window.addEventListener("scroll", throttledHandleScroll);
    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, [home, search, userProfile, handleScroll, isFullscreen, isTheatre]);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate({ to: `/search/${searchQuery}` });
      }
    },
    [searchQuery, navigate]
  );

  React.useEffect(() => {
    if (!isMobile) {
      setSearchMenu(false);
    }
  }, [isMobile]);

  React.useEffect(() => {
    if (!open) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [open]);

  const mainMenuItems = useMemo(
    () => [
      {
        text: "Home",
        path: "/",
        icon: <HomeIcon sx={{ fontSize: "1.5rem" }} />,
        iconOutlined: <HomeOutlinedIcon sx={{ fontSize: "1.5rem" }} />,
      },
      {
        text: "Shorts",
        path: "/shorts",
        icon: <PlayArrowOutlinedIcon sx={{ fontSize: "1.5rem" }} />,
      },
      {
        text: "Subscriptions",
        path: "/subscriptions",
        icon: <SubscriptionsOutlinedIcon sx={{ fontSize: "1.5rem" }} />,
      },
    ],
    []
  );

  const secondaryMenuItems = useMemo(
    () => [
      {
        text: "History",
        icon: <HistoryOutlinedIcon />,
      },
      {
        text: "Playlists",
        icon: <PlaylistPlayOutlinedIcon />,
      },
      {
        text: "Your videos",
        icon: <SmartDisplayOutlinedIcon />,
      },
      {
        text: "Watch Later",
        icon: <WatchLaterOutlinedIcon />,
      },
      {
        text: "Liked Videos",
        icon: <ThumbUpOutlinedIcon />,
      },
    ],
    []
  );

  const isPermanentDrawerVisible = (home || search || userProfile) && !isLaptop;
  const isWatchTemporaryDrawerVisible = watch;

  const isDrawerContentExpanded = useMemo(() => {
    if (isWatchTemporaryDrawerVisible) {
      return true;
    }

    if ((home || search || userProfile) && !isLaptop) {
      return open;
    }
    if ((home || search || userProfile) && isLaptop && !isTablet) {
      return false;
    }

    return true;
  }, [
    open,
    isLaptop,
    isTablet,
    home,
    search,
    userProfile,
    watch,
    isWatchTemporaryDrawerVisible,
  ]);

  const currentDrawerWidth = isDrawerContentExpanded
    ? drawerWidth
    : miniDrawerWidth;

  const jsControlledDrawerStyles = {
    "& .MuiDrawer-paper": {
      width: currentDrawerWidth,
      overflowX: "hidden",
      border: "none",
      zIndex: 1,
      bgcolor: theme.palette.primary.main,
    },
  };
  const cssVarDrawerStyles = {
    "& .MuiDrawer-paper": {
      width: "var(--drawer-width)",
      overflowX: "hidden",
      border: "none",
      zIndex: 1,
      bgcolor: theme.palette.primary.main,
    },
  };

  return (
    <>
      <CssBaseline />

      <AppBar
        data-fullscreen={isFullscreen}
        id="header"
        position="fixed"
        sx={{
          boxShadow: "none",
          background: isFullscreen || isTheatre ? "#0f0f0f" : "none",
        }}
      >
        <Toolbar
          sx={{
            display: searchMenu ? "none" : "block",
            paddingLeft: "16px",
            paddingRight: "16px",
            minHeight: "var(--header-height)",
            "@media (min-width:600px)": {
              paddingLeft: "16px",
              paddingRight: "16px",
              minHeight: "var(--header-height)",
            },
          }}
        >
          <Box
            className="header-content"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: "var(--header-height)",
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              className="start"
            >
              <IconButton
                disableRipple
                size="medium"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
                sx={{
                  width: "40px",
                  height: "40px",
                  m: 0,
                  borderRadius: "50px",
                  "&:hover": {
                    background: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Link
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  color: "#fff",
                  textDecoration: "none",
                  paddingLeft: "8px",
                  flexGrow: 1,
                }}
                to="/"
              >
                <Typography variant="h6" noWrap component="div">
                  VTube
                </Typography>
              </Link>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: "0 1 732px",
              }}
              className="middle"
            >
              <Box
                sx={{
                  flex: 1,
                  display: !isMobile ? "inline-flex" : "none",
                }}
              >
                <Search
                device={device}
                  handleSearch={handleSearch}
                  searchQuery={searchQuery || ""}
                  setSearchQuery={setSearchQuery}
                />
              </Box>

              <IconButton
                disableRipple
                onClick={() => setSearchMenu(true)}
                type="button"
                sx={{
                  display: isMobile ? "inline-flex" : "none",
                  borderRadius: "50px",
                  color: "#fff",
                  backgroundColor: "none",
                  "&:hover": {
                    backgroundColor: "hsla(0,0%,100%,.08)",
                  },
                }}
                aria-label="search"
              >
                <SearchIcon />
              </IconButton>

              <IconButton
                disableRipple
                sx={{
                  display: isSmallScreen ? "none" : "inline-flex",
                  padding: "10px",
                  borderRadius: "50px",
                  backgroundColor: "hsla(0,0%,100%,.08)",
                  marginLeft: 1,
                  marginRight: "0",
                  "&:hover": {
                    backgroundColor: "hsl(0,0%,18.82%)",
                  },
                }}
              >
                <MicOutlinedIcon sx={{ color: "#fff" }} />
              </IconButton>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  isSmallScreen && isAuthenticated ? "flex-start" : "flex-end",
                alignItems: "center",
                flex: "none",
                minWidth: isSmallScreen ? 0 : "225px",
              }}
              className="end"
            >
              <AccountMenu />
            </Box>
          </Box>
        </Toolbar>
        <Box
          sx={{
            display: searchMenu ? "block" : "none",
          }}
        >
          <Search
            setSearchMenu={setSearchMenu}
            isMobileScreen={isMobile}
            device={device}
            handleSearch={handleSearch}
            searchQuery={searchQuery || ""}
            setSearchQuery={setSearchQuery}
          />
        </Box>

        <Box
          sx={{
            background: "#0f0f0f",
            opacity: watch ? `${opacity}!important` : 1,
            visibility: isFullscreen ? "hidden" : "visible",
            position: "absolute",
            zIndex: -1,
            inset: 0,
          }}
          id="background"
        ></Box>
      </AppBar>

      <Drawer
        TransitionComponent={CustomSlide}
        variant={
          isPermanentDrawerVisible || (!isTablet && !watch)
            ? "permanent"
            : "temporary"
        }
        open={watch && open}
        onClose={() => setOpen(false)}
        ModalProps={{
          keepMounted: true,
          disableScrollLock: true,
        }}
        slotProps={{
          backdrop: {
            onClick: toggleDrawer,
          },
        }}
        sx={jsControlledDrawerStyles}
      >
        <DrawerContent
          isExpanded={isDrawerContentExpanded}
          mainMenuItems={mainMenuItems}
          secondaryMenuItems={secondaryMenuItems}
          location={location}
          toggleDrawer={toggleDrawer}
        />
      </Drawer>
      {(home || search || userProfile) && isLaptop && (
        <Drawer
          TransitionComponent={CustomSlide}
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{
            keepMounted: true,
            disableScrollLock: true,
          }}
          sx={cssVarDrawerStyles}
        >
          <DrawerContent
            isExpanded={true}
            mainMenuItems={mainMenuItems}
            secondaryMenuItems={secondaryMenuItems}
            location={location}
            toggleDrawer={toggleDrawer}
          />
        </Drawer>
      )}
    </>
  );
}

Header.propTypes = {
  watch: PropTypes.bool,
  search: PropTypes.bool,
  home: PropTypes.bool,
  userProfile: PropTypes.bool,
  window: PropTypes.func,
};

export default Header;
