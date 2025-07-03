import * as React from "react";
import { useState, useCallback, useMemo } from "react";
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
import { DrawerContext, UserContext } from "../../routes/__root";
import { throttle } from "lodash";

function Header({ watch, search, home, userProfile, ...props }) {
  const theme = useTheme();
  const context = React.useContext(DrawerContext);
  const userContext = React.useContext(UserContext);
  const { open, setOpen } = context ?? {}; // Ensure setOpen is available
  const { data: dataContext } = userContext ?? {};
  const isAuthenticated = dataContext || null;
  const isLaptop = useMediaQuery(theme.breakpoints.down("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallScreen = useMediaQuery("(max-width:430px)");
  const drawerWidth = "var(--drawer-width)";
  const miniDrawerWidth = "var(--mini-drawer-width)";

  const location = useLocation();
  const [searchMenu, setSearchMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { window: windowProp } = props;
  const [opacity, setOpacity] = useState(0);
  const navigate = useNavigate();

  const container = useCallback(
    () => (windowProp !== undefined ? windowProp().document.body : undefined),
    [windowProp]
  );

  const toggleDrawer = useCallback(() => {
    if (setOpen) { 
      React.startTransition(() => {
        setOpen((prev) => !prev);
      });
    }
  }, []);

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
    if (home || search || userProfile) return;

    const throttledHandleScroll = throttle(handleScroll, 100);
    window.addEventListener("scroll", throttledHandleScroll);
    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, [home, search, userProfile, handleScroll]);


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

  const mainMenuStyles = useMemo(
    () => ({
      display: "flex",
      flexDirection: open ? "row" : "column",
      alignItems: "center",
      justifyContent: open ? "flex-start" : "center",
      borderRadius: "10px",
      paddingX: 2,
      paddingY: open ? 1 : 1.5,
      marginX: open ? 1 : 0,
      gap: open ? "0" : "0.5px",
      transition: "background-color 0.3s ease",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
      "&.Mui-selected": {
        backgroundColor: open ? "rgba(255, 255, 255, 0.1)" : "",
        "&:hover": {
          backgroundColor: open
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(255, 255, 255, 0.1)",
        },
      },
    }),
    [open]
  );

  const mainMenuUserStyles = useMemo(
    () => ({
      display: "flex",
      flexDirection: open && !isLaptop ? "row" : "column",
      alignItems: "center",
      justifyContent: open && !isLaptop ? "flex-start" : "center",
      borderRadius: "10px",
      paddingX: 2,
      paddingY: open && !isLaptop ? 1 : 1.5,
      marginX: open && !isLaptop ? 1 : 0,
      gap: open && !isLaptop ? "0" : "0.5px",
      transition: "background-color 0.3s ease",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
      "&.Mui-selected": {
        backgroundColor: open && !isLaptop ? "rgba(255, 255, 255, 0.1)" : "",
        "&:hover": {
          backgroundColor:
            open && !isLaptop
              ? "rgba(255, 255, 255, 0.2)"
              : "rgba(255, 255, 255, 0.1)",
        },
      },
    }),
    [open, isLaptop]
  );

  const drawerStylesUser = useMemo(
    () => ({
      "& .MuiDrawer-paper": {
        width: !isLaptop
          ? open
            ? drawerWidth
            : miniDrawerWidth
          : miniDrawerWidth,
        overflowX: "hidden",
        border: "none",
        zIndex: 0,
        bgcolor: theme.palette.primary.main,
        transitionDuration: "200ms!important",
      },
    }),
    [open, isLaptop, drawerWidth, miniDrawerWidth, theme.palette.primary.main]
  );

  const drawerStylesHome = useMemo(
    () => ({
      "& .MuiDrawer-paper": {
        width: open ? drawerWidth : miniDrawerWidth,
        overflowX: "hidden",
        border: "none",
        zIndex: 0,
        bgcolor: theme.palette.primary.main,
      },
    }),
    [open, drawerWidth, miniDrawerWidth, theme.palette.primary.main]
  );

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

  return (
    <>
      <CssBaseline />

      <AppBar position="fixed" sx={{ boxShadow: "none", background: "none" }}>
        {!searchMenu ? (
          <Toolbar
            sx={{
              paddingLeft: "16px",
              paddingRight: "16px",
              minHeight: "var(--toolbar-height)",
              "@media (min-width:600px)": {
                paddingLeft: "16px",
                paddingRight: "16px",
                minHeight: "var(--toolbar-height)",
              },
            }}
          >
            <Box className="header-content" sx={{display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, minWidth: 0}}>
                 <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}} className="start">
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
            <Link style={{ display: "inline-block", verticalAlign: "middle", color: "#fff", textDecoration: "none", paddingLeft: "16px", flexGrow: 1 }} to="/">
              <Typography
                variant="h6"
                noWrap
                component="div"
              >
                VTube
              </Typography>
            </Link>
            </Box>
            <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", flex: "0 1 732px"}} className="middle">
            {!isMobile ? (
              <Search
                handleSearch={handleSearch}
                searchQuery={searchQuery || ""}
                setSearchQuery={setSearchQuery}
              />
            ) : (
              <IconButton
                disableRipple
                onClick={() => setSearchMenu(true)}
                type="button"
                sx={{
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
            )}

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
            <Box sx={{display: "flex", justifyContent: isSmallScreen && isAuthenticated ? "flex-start" : "flex-end", alignItems: "center", flex: "none", minWidth: isSmallScreen ? 0 : "225px"}} className="end">
            <AccountMenu />
          </Box>
          </Box>
          </Toolbar>
        ) : (
          <Search
            setSearchMenu={setSearchMenu}
            isMobile={isMobile}
            handleSearch={handleSearch}
            searchQuery={searchQuery || ""}
            setSearchQuery={setSearchQuery}
          />
        )}
        <Box
          sx={{
            background: "#0f0f0f",
            opacity: watch ? `${opacity}!important` : 1,
            position: "absolute",
            zIndex: -1,
            inset: 0,
          }}
          id="background"
        ></Box>
      </AppBar>

      {(home || search) && !isTablet && (
        <Drawer
          container={container}
          variant="permanent"
          open={open}
          sx={drawerStylesHome}
        >
          <Box className="drawer-content" sx={{ flex: 1 }}>
            <Toolbar
              sx={{
                minHeight: "var(--toolbar-height)",
                "@media (min-width:600px)": {
                  minHeight: "var(--toolbar-height)",
                },
              }}
            >
              {/* <IconButton
                disableRipple
                size="medium"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
                sx={{ pl: 2, mr: 1 }}
              >
                <MenuIcon sx={{ color: "#f1f1f1" }} />
              </IconButton> */}
              <Link style={{ color: "#fff", textDecoration: "none" }} to="/">
                <Typography sx={{ padding: "10px" }} variant="h6" noWrap>
                  VTube Permanent
                </Typography>
              </Link>
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
                      width: open ? "calc(100% - 12px)" : "100%",
                    }}
                  >
                    <ListItemButton
                      disableRipple
                      component={Link}
                      to={path}
                      selected={isSelected}
                      sx={mainMenuStyles}
                    >
                      <ListItemIcon
                        sx={{
                          color: "#fff",
                          minWidth: 0,
                          justifyContent: "center",
                        }}
                      >
                        {iconOutlined && !isSelected ? iconOutlined : icon}
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
                );
              })}
            </List>

            {open && (
              <>
                <Divider
                  sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", my: 1 }}
                />
                <List sx={{ color: "#fff" }}>
                  <ListItem disablePadding>
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
                      <ListItemIcon
                        sx={{
                          color: "#fff",
                          minWidth: 0,
                          justifyContent: "center",
                        }}
                      >
                        <ArrowForwardIosOutlinedIcon
                          sx={{ fontSize: "0.9rem" }}
                        />
                      </ListItemIcon>
                    </ListItemButton>
                  </ListItem>

                  {secondaryMenuItems.map(({ text, icon }) => (
                    <ListItem
                      key={text}
                      disablePadding
                      sx={{ display: "block" }}
                    >
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
                        <ListItemIcon
                          sx={{
                            color: "#fff",
                            minWidth: 0,
                            justifyContent: "center",
                          }}
                        >
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
        </Drawer>
      )}

      {userProfile && !isTablet && (
        <Drawer
          id="userProfile"
          container={container}
          variant="permanent"
          open={open}
          sx={drawerStylesUser}
        >
          <Box className="drawer-content" sx={{ flex: 1 }}>
            <Toolbar
              sx={{
                minHeight: "var(--toolbar-height)",
                "@media (min-width:600px)": {
                  minHeight: "var(--toolbar-height)",
                },
              }}
            >
              <IconButton
                disableRipple
                size="medium"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
                sx={{ pl: 2, mr: 1 }}
              >
                <MenuIcon sx={{ color: "#f1f1f1" }} />
              </IconButton>
              <Link style={{ color: "#fff", textDecoration: "none" }} to="/">
                <Typography sx={{ padding: "10px" }} variant="h6" noWrap>
                  VTube
                </Typography>
              </Link>
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
                      width: open && !isLaptop ? "calc(100% - 12px)" : "100%",
                    }}
                  >
                    <ListItemButton
                      disableRipple
                      component={Link}
                      to={path}
                      selected={isSelected}
                      sx={mainMenuUserStyles}
                    >
                      <ListItemIcon
                        sx={{
                          color: "#fff",
                          minWidth: 0,
                          justifyContent: "center",
                        }}
                      >
                        {iconOutlined && !isSelected ? iconOutlined : icon}
                      </ListItemIcon>
                      <Typography
                        sx={{
                          marginLeft: open && !isLaptop ? 2 : 0,
                          fontSize: open && !isLaptop ? "0.9rem" : "0.6rem",
                          mt: open && !isLaptop ? 0 : "5px",
                        }}
                      >
                        {text}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            {open && !isLaptop && (
              <>
                <Divider
                  sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", my: 1 }}
                />
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
                      <ListItemIcon
                        sx={{
                          color: "#fff",
                          minWidth: 0,
                          justifyContent: "center",
                        }}
                      >
                        <ArrowForwardIosOutlinedIcon
                          sx={{ fontSize: "0.9rem" }}
                        />
                      </ListItemIcon>
                    </ListItemButton>
                  </ListItem>

                  {secondaryMenuItems.map(({ text, icon }) => (
                    <ListItem
                      key={text}
                      disablePadding
                      sx={{ display: "block" }}
                    >
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
                        <ListItemIcon
                          sx={{
                            color: "#fff",
                            minWidth: 0,
                            justifyContent: "center",
                          }}
                        >
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
        </Drawer>
      )}

      {isLaptop && !watch && (
        <Drawer
          disableScrollLock
          container={container}
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              overflowX: "hidden",
              border: "none",
              zIndex: 0,
              bgcolor: theme.palette.primary.main,
            },
          }}
        >
          <Box className="drawer-content" sx={{ flex: 1 }}>
            <Toolbar
              sx={{
                minHeight: "var(--toolbar-height)",
                "@media (min-width:600px)": {
                  minHeight: "var(--toolbar-height)",
                },
              }}
            >
              <IconButton
                disableRipple
                size="medium"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
                sx={{ pl: !isMobile ? 1.5 : 3 }}
              >
                <MenuIcon sx={{ color: "#f1f1f1" }} />
              </IconButton>

              <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
                <Typography
                  variant="h6"
                  noWrap
                  component="div"
                  sx={{ padding: "10px" }}
                >
                  VTube
                </Typography>
              </Link>
            </Toolbar>

            <List sx={{ color: "#fff" }}>
              {mainMenuItems.map(({ text, path, icon, iconOutlined }) => {
                const isSelected = location.pathname === path;
                return (
                  <ListItem key={text} disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                      disableRipple
                      component={Link}
                      to={path}
                      selected={isSelected}
                      sx={baseItemButtonStyles()}
                    >
                      <ListItemIcon sx={iconStyles}>
                        {iconOutlined && !isSelected ? iconOutlined : icon}
                      </ListItemIcon>
                      <Typography sx={{ marginLeft: 2, fontSize: "0.9rem" }}>
                        {text}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", my: 1 }} />

            <List sx={{ color: "#fff" }}>
              <ListItem disablePadding>
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
                  <ListItemIcon sx={iconStyles}>
                    <ArrowForwardIosOutlinedIcon sx={{ fontSize: "0.9rem" }} />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>

              {secondaryMenuItems.map(({ text, icon }) => (
                <ListItem key={text} disablePadding sx={{ display: "block" }}>
                  <ListItemButton
                    disableRipple
                    sx={baseItemButtonStyles()}
                  >
                    <ListItemIcon sx={iconStyles}>{icon}</ListItemIcon>
                    <Typography sx={{ marginLeft: 2, fontSize: "0.9rem" }}>
                      {text}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}

      <Drawer
        variant="temporary"
        open={watch && open}
        onClose={() => setOpen(false)}
        ModalProps={{
          keepMounted: true,
          disableScrollLock: true,
        }}
        container={container}
        sx={{
          "& .MuiDrawer-paper": {
            willChange: "transform",
            width: drawerWidth,
            bgcolor: theme.palette.primary.main,
            overflowX: "hidden",
            border: "none",
            zIndex: 0,
          },
        }}
      >
        <Box className="drawer-content" sx={{ flex: 1 }}>
          <Toolbar
            sx={{
              minHeight: "var(--toolbar-height)",
              "@media (min-width:600px)": {
                minHeight: "var(--toolbar-height)",
              },
            }}
          >
            <IconButton
              className="jon"
              disableRipple
              size="medium"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ pl: isMobile ? 3 : 2, mr: 1 }}
            >
              <MenuIcon sx={{ color: "#f1f1f1" }} />
            </IconButton>
            <Link to="/" style={{ textDecoration: "none", color: "#fff" }}>
              <Typography sx={{ padding: "10px" }} variant="h6" noWrap>
                VTube
              </Typography>
            </Link>
          </Toolbar>

          <List sx={{ color: "#fff", mx: "4px" }}>
            {mainMenuItems.map(({ text, path, icon, iconOutlined }) => {
              const isSelected = location.pathname === path;
              return (
                <ListItem key={text} disablePadding sx={{ display: "block" }}>
                  <ListItemButton
                    disableRipple
                    component={Link}
                    to={path}
                    selected={isSelected}
                    sx={baseItemButtonStyles()}
                  >
                    <ListItemIcon sx={iconStyles}>
                      {iconOutlined && !isSelected ? iconOutlined : icon}
                    </ListItemIcon>
                    <Typography sx={{ ml: 2, fontSize: "0.9rem" }}>
                      {text}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", my: 1 }} />

          <List sx={{ color: "#fff" }}>
            <ListItem disablePadding sx={{ display: "block" }}>
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
                <ListItemIcon
                  sx={{
                    color: "#fff",
                    minWidth: 0,
                    justifyContent: "center",
                  }}
                >
                  <ArrowForwardIosOutlinedIcon sx={{ fontSize: "0.9rem" }} />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>

            {secondaryMenuItems.map(({ text, icon }) => (
              <ListItem key={text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  disableRipple
                  sx={baseItemButtonStyles()}
                >
                  <ListItemIcon sx={iconStyles}>{icon}</ListItemIcon>
                  <Typography sx={{ ml: 2, fontSize: "0.9rem" }}>
                    {text}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}

const baseItemButtonStyles = () => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  borderRadius: "10px",
  paddingX: 2,
  paddingY: 1,
  marginX: 1,
  gap: "0",
  transition: "background-color 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
  },
});

const iconStyles = {
  color: "#fff",
  minWidth: 0,
  justifyContent: "center",
};

Header.propTypes = {
  windowProp: PropTypes.func,
  watch: PropTypes.bool,
  search: PropTypes.bool,
  home: PropTypes.bool,
  userProfile: PropTypes.bool,
};

export default React.memo(Header);