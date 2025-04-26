import * as React from "react";
import { useState } from "react";
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
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useTheme } from "@mui/material/styles";
import Search from "../Search";
import { Link } from "@tanstack/react-router";
import AccountMenu from "../AccountMenu";
import { useLocation } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

function Header({ open, onClose, watch, search, home, ...props }) {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.down("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const drawerWidth = "var(--drawer-width)";
  const miniDrawerWidth = "var(--mini-drawer-width)"; // Collapsed drawer width
  const location = useLocation();
  const [searchMenu, setSearchMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { window } = props;
  const navigate = useNavigate();

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: `/search/${searchQuery}` });
    }
  };

  React.useEffect(()=> {
   if (!isMobile) {
    setSearchMenu(false)
   }
  }, [isMobile])

  return (
    <Box>
      <CssBaseline />

      <AppBar position="fixed" sx={{ boxShadow: "none" }}>
        {!searchMenu ? 
           <Toolbar
           sx={{
             gap: "10px",
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
           <IconButton
             size="medium"
             edge="start"
             color="inherit"
             aria-label="menu"
             onClick={onClose}
             sx={{
               width: "40px",
               height: "40px",
               m: 0,
               zIndex: 999999,
               borderRadius: "50px",
               "&:hover": {
                 background: "rgba(255,255,255,0.1)",
               },
             }}
           >
             <MenuIcon />
           </IconButton>
           <Link style={{ color: "#fff", textDecoration: "none" }} to="/">
             <Typography
               sx={{ padding: "10px" }}
               variant="h6"
               noWrap
               component="div"
             >
               VTube
             </Typography>
           </Link>
           {!isMobile ? (
             <Search
               handleSearch={handleSearch}
               searchQuery={searchQuery || ""} // Ensure it's always a string
               setSearchQuery={setSearchQuery}
             />
           ) : (
             <IconButton
              onClick={()=> setSearchMenu(true)}
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
             sx={{
               padding: "10px",
               borderRadius: "50px",
               backgroundColor: "hsla(0,0%,100%,.08)",
               marginLeft: "10px",
               marginRight: "auto",
               "&:hover": {
                 backgroundColor: "hsl(0,0%,18.82%)",
               },
             }}
           >
             <MicOutlinedIcon sx={{ color: "#fff" }} />
           </IconButton>
           <AccountMenu />
         </Toolbar>
         :
         <Search
         setSearchMenu={setSearchMenu}
         isMobile={isMobile} 
         handleSearch={handleSearch}
         searchQuery={searchQuery || ""} // Ensure it's always a string
         setSearchQuery={setSearchQuery}
         />
        }
     
      </AppBar>

      {(home || search) && !isTablet && (
        <Drawer
          container={container}
          variant="permanent"
          open={open}
          sx={{
            "& .MuiDrawer-paper": {
              width: open ? drawerWidth : miniDrawerWidth,
              overflowX: "hidden",
              border: "none",
              zIndex: 0,
              bgcolor: theme.palette.primary.main,
            },
          }}
        >
          <Toolbar
            sx={{
              minHeight: "var(--toolbar-height)",
              "@media (min-width:600px)": {
                minHeight: "var(--toolbar-height)", // 👈 override default
              },
            }}
          >
            <IconButton
              size="medium"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onClose}
              sx={{ pl: 2, mr: 1 }}
            >
              <MenuIcon sx={{ color: "#f1f1f1" }} />
            </IconButton>
            <Link style={{ color: "#fff", textDecoration: "none" }} to="/">
              <Typography
                sx={{ padding: "10px" }}
                variant="h6"
                noWrap
                component="div"
              >
                VTube Permanent
              </Typography>
            </Link>
          </Toolbar>

          <List sx={{ color: "#fff" }}>
            {["Home", "Shorts", "Subscriptions", !open ? "You" : null]
              .filter(Boolean)
              .map((text, index) => {
                const paths = ["/", "/shorts", "/subscriptions", "/profile"];
                const route = paths[index];
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
                      to={route}
                      selected={location.pathname === route}
                      sx={{
                        display: "flex",
                        flexDirection: open ? "row" : "column",
                        alignItems: "center",
                        justifyContent: open ? "flex-start" : "center", // ✅ Fix for icons when collapsed
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
                          backgroundColor: open
                            ? "rgba(255, 255, 255, 0.1)"
                            : "",
                          "&:hover": {
                            backgroundColor: open
                              ? "rgba(255, 255, 255, 0.2)"
                              : "rgba(255, 255, 255, 0.1)",
                          },
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
                          location.pathname === route ? (
                            <HomeIcon sx={{ fontSize: "1.5rem" }} />
                          ) : (
                            <HomeOutlinedIcon sx={{ fontSize: "1.5rem" }} />
                          )
                        ) : index === 1 ? (
                          <PlayArrowOutlinedIcon sx={{ fontSize: "1.5rem" }} />
                        ) : index === 2 ? (
                          <SubscriptionsOutlinedIcon
                            sx={{ fontSize: "1.5rem" }}
                          />
                        ) : !open ? (
                          <AccountCircleOutlinedIcon
                            sx={{ fontSize: "1.5rem" }}
                          />
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
                );
              })}
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
      )}

      {isLaptop && (
        <Drawer
          container={container}
          variant="temporary"
          open={open}
          onClose={isLaptop ? onClose : undefined}
          transitionDuration={200}
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
          <Toolbar
            sx={{
              minHeight: "var(--toolbar-height)",
              "@media (min-width:600px)": {
                minHeight: "var(--toolbar-height)", // 👈 override default
              },
            }}
          >
            <IconButton
              size="medium"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onClose}
              sx={{ pl: !isMobile ? 2 : 3 }}
            >
              <MenuIcon sx={{ color: "#f1f1f1" }} />
            </IconButton>
            <Link style={{ color: "#fff", textDecoration: "none" }} to="/">
              <Typography
                sx={{ padding: "10px" }}
                variant="h6"
                noWrap
                component="div"
              >
                VTube
              </Typography>
            </Link>
          </Toolbar>

          <List sx={{ mx: "4px", color: "#fff" }}>
            {["Home", "Shorts", "Subscriptions"]
              .filter(Boolean)
              .map((text, index) => {
                const paths = ["/", "/shorts", "/subscriptions", "/profile"];
                const route = paths[index];
                return (
                  <ListItem key={text} disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                      to={route}
                      selected={location.pathname === route}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start", // ✅ Fix for icons when collapsed
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
                          location.pathname === route ? (
                            <HomeIcon sx={{ fontSize: "1.5rem" }} />
                          ) : (
                            <HomeOutlinedIcon sx={{ fontSize: "1.5rem" }} />
                          )
                        ) : index === 1 ? (
                          <PlayArrowOutlinedIcon sx={{ fontSize: "1.5rem" }} />
                        ) : index === 2 ? (
                          <SubscriptionsOutlinedIcon
                            sx={{ fontSize: "1.5rem" }}
                          />
                        ) : null}
                      </ListItemIcon>
                      <Typography
                        sx={{
                          marginLeft: 2,
                          fontSize: "0.9rem",
                          mt: 0,
                        }}
                      >
                        {text}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })}
          </List>

          <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", my: 1 }} />

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
        </Drawer>
      )}

      {watch && (
        <Drawer
          container={container}
          variant="temporary"
          open={open}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              bgcolor: theme.palette.primary.main,
            },
          }}
        >
          <Toolbar
            sx={{
              minHeight: "var(--toolbar-height)",
              "@media (min-width:600px)": {
                minHeight: "var(--toolbar-height)",
              },
            }}
          >
            <IconButton
              size="medium"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={onClose}
              sx={{ pl: 2, mr: 1 }}
            >
              <MenuIcon sx={{ color: "#f1f1f1" }} />
            </IconButton>
            <Link style={{ color: "#fff", textDecoration: "none" }} to="/">
              <Typography
                sx={{ padding: "10px" }}
                variant="h6"
                noWrap
                component="div"
              >
                VTube
              </Typography>
            </Link>
          </Toolbar>

          <List sx={{ color: "#fff" }}>
            {["Home", "Shorts", "Subscriptions"]
              .filter(Boolean)
              .map((text, index) => {
                const paths = ["/", "/shorts", "/subscriptions"];
                const route = paths[index];
                return (
                  <ListItem key={text} disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                      component={Link}
                      to={route}
                      selected={location.pathname === route}
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        borderRadius: "10px",
                        paddingX: 2,
                        paddingY: 1,
                        marginX: 1,
                        gap: 0,
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
                          <SubscriptionsOutlinedIcon
                            sx={{ fontSize: "1.5rem" }}
                          />
                        ) : null}
                      </ListItemIcon>
                      <Typography
                        sx={{
                          marginLeft: 2,
                          fontSize: "0.9rem",
                          textDecoration: "none",
                          color: "#f1f1f1",
                          mt: 0,
                        }}
                      >
                        {text}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                );
              })}
          </List>

          <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.2)", my: 1 }} />

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
                      flexDirection: "row",
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
      )}
    </Box>
  );
}

Header.propTypes = {
  window: PropTypes.func,
};

export default React.memo(Header);
