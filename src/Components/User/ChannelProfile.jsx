import React, { useContext, useState, useEffect, useRef } from "react";
import { DrawerContext, UserContext } from "../../routes/__root";
import { getColor } from "../../utils/getColor";
import { Outlet, useLocation, useParams } from "@tanstack/react-router";

import {
  Avatar,
  CardHeader,
  Typography,
  Box,
  Divider,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { SubscribeButton } from "../Subscribe/SubscribeButton";
import StatsDialog from "../Dialogs/StatsDialog";
import BasicTabs from "../Tabs/Tabs";
import ManageButtons from "./ManageButtons";
import UserVideos from "./UserVideos";
import { useMemo } from "react";
import { debounce, throttle } from "lodash";

const ChannelProfile = ({ username, userData }) => {
  const location = useLocation();
  const headerRef = useRef(null);
  const theme = useTheme();
  const isXs = useMediaQuery("(max-width:315.95px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const userPlaylists = userData?.data?.playlists.length;
  const [padding, setPadding] = useState(0);

  useEffect(() => {
    if (!headerRef.current) return;
    const handleResize = () => {
      setPadding(headerRef.current.offsetHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const tabPaths = [
    "Videos",
    userPlaylists > 0 ? "Playlists" : null,
    "Posts",
  ].filter(Boolean);

  const components = [
    UserVideos,
    userPlaylists > 0 ? StatsDialog : null,
    StatsDialog,
  ].filter(Boolean);

  const currentTabIndex = tabPaths.findIndex((path) =>
    location.pathname.includes(path.toLowerCase())
  );

  const ComponentToRender =
    currentTabIndex === -1 ? components[0] : components[currentTabIndex];
  const drawerContext = useContext(DrawerContext);
  const userContext = useContext(UserContext);
  let { open } = drawerContext ?? {};
  let { data: dataContext } = userContext ?? {};
  const isAuthenticated = dataContext || null;
  const [showMore, setShowMore] = useState(false);
  const userNameStyles = {
    color: "#f1f1f1",
    fontWeight: "bold",
  };

  const channelId = userData?.data?._id;
  const [subscriberCount, setSubscriberCount] = useState(
    userData?.data?.subscribersCount ?? 0
  );
  const [activeAlertId, setActiveAlertId] = useState(null);

  const channelName = userData?.data.fullName;

  useEffect(() => {
    const newCount = userData?.data?.subscribersCount ?? 0;
    if (subscriberCount !== newCount) {
      setSubscriberCount(newCount);
    }
  }, [userData]);

  const scrollYRef = useRef(0);
  useEffect(() => {
    const headerEl = headerRef.current;

    let ticking = false;

    const onScroll = () => {
      const collapseHeight = headerEl.offsetHeight - 45 || 0; // YouTube uses ~48px collapse
      if (!ticking) {
        const currentScrollY =
          document.body.style.position === "fixed"
            ? scrollYRef.current
            : window.scrollY;
        window.requestAnimationFrame(() => {
          const y = Math.min(currentScrollY, collapseHeight);

          headerEl.style.transform = `translate3d(0, ${-y}px, 0)`;
          headerEl.style.transitionDuration = "0ms";
          ticking = false;
        });
        ticking = true;
      }
    };
    if (open) {
      scrollYRef.current = window.scrollY;
    }
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  const headerStyles = useMemo(
    () => ({
      position: "fixed",
      background: "#0f0f0f",
      top: 0,
      marginTop: "var(--toolbar-height)",
      left: isDesktop
        ? open
          ? "var(--drawer-width)"
          : "var(--mini-drawer-width)"
        : isMobile
          ? "0"
          : isTablet
            ? "0"
            : "72px",
      right: 0,
      zIndex: 500,
    }),
    [open, isMobile, isTablet, isDesktop]
  );

  return (
    <>
      {" "}
      <StatsDialog
        title={userData?.data?.fullName}
        buttonTxt="Share"
        dialogOpen={showMore}
        setDialogOpen={setShowMore}
        username={username}
        userData={userData}
      />
      <Box
        sx={{
          flex: 1,
          flexBasis: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box id="header-wrapper" sx={{ width: "100%", height: "100%" }}>
          <Box ref={headerRef} id="header" sx={headerStyles}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Container fixed>
                <Box
                  sx={{
                    position: "relative",
                    height: 0,
                    paddingTop: "15.3%",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      left: "0",
                      top: "0",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Box
                      component="img"
                      sx={{
                        borderRadius: "16px",
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                      src={userData?.data?.coverImage || null}
                    ></Box>
                  </Box>
                </Box>
              </Container>
              <Container
                fixed
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 2,
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    position: "relative",
                    flex: 1,
                  }}
                >
                  <CardHeader
                    sx={{
                      flexGrow: 1,
                      alignItems: "center",
                      padding: 0,
                      "& .MuiCardHeader-content": {
                        overflow: "hidden",
                        minWidth: 0,
                      },
                      "& .css-1r9wl67-MuiCardHeader-avatar": {
                        marginRight: "12px",
                      },
                    }}
                    avatar={
                      <Avatar
                        src={
                          userData?.data?.avatar?.url
                            ? userData?.data?.avatar?.url
                            : null
                        }
                        sx={{
                          bgcolor: getColor(userData?.data?.fullName),
                          width: { xs: 70, sm: 120, md: 150 },
                          height: { xs: 70, sm: 120, md: 150 },
                        }}
                      >
                        {userData?.fullName
                          ? userData?.data?.fullName.charAt(0).toUpperCase()
                          : "?"}
                      </Avatar>
                    }
                    title={
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography
                          variant="h2"
                          color="#f1f1f1"
                          sx={{
                            fontSize: {
                              xs: "1.4rem",
                              sm: "1.8rem",
                            },
                          }}
                        >
                          {userData?.data?.fullName}
                        </Typography>

                        {isTablet ? (
                          <>
                            <Typography
                              sx={{
                                display: "flex",
                                flexDirection: isXs ? "column" : "row",
                                alignItems: isXs ? "start" : "center",
                                whiteSpace: "nowrap",
                                mt: 1,
                                fontSize: {
                                  xs: "0.8rem",
                                  sm: "0.95rem",
                                },
                              }}
                              variant="body2"
                              color="#aaa"
                              fontSize="0.85rem"
                            >
                              <span style={userNameStyles}>
                                @{userData?.data?.username}
                                {!isXs && (
                                  <span style={{ margin: "0 4px" }}>•</span>
                                )}
                              </span>
                              <Box sx={{ display: isXs ? "flex" : "block" }}>
                                <span>
                                  {subscriberCount}{" "}
                                  {subscriberCount === 1
                                    ? "subscriber"
                                    : "subscribers"}
                                </span>
                                <span style={{ margin: "0 4px" }}>•</span>
                                <span>
                                  {userData?.data?.videos?.length}{" "}
                                  {userData?.data?.videos?.length === 1
                                    ? "video"
                                    : "videos"}
                                </span>
                              </Box>
                            </Typography>
                            {!isXs ? (
                              <Typography
                                variant="body2"
                                sx={{ color: "#aaa", my: 1 }}
                              >
                                More about this channel{" "}
                                <span
                                  onClick={() => setShowMore(true)}
                                  role="button"
                                  style={{
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    color: "rgb(255,255,255)",
                                  }}
                                >
                                  ...more
                                </span>
                              </Typography>
                            ) : null}
                          </>
                        ) : null}
                      </Box>
                    }
                    // action={
                    //   <IconButton aria-label="settings">
                    //     <MoreVertIcon sx={{ color: "#fff" }} />
                    //   </IconButton>
                    // }

                    subheader={
                      !isTablet ? (
                        <>
                          <Typography
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mt: 1,
                            }}
                            variant="body2"
                            color="#aaa"
                            fontSize="0.85rem"
                          >
                            <span style={userNameStyles}>
                              @{userData?.data?.username}
                              <span style={{ margin: "0 4px" }}>•</span>
                            </span>
                            <span>
                              {subscriberCount}{" "}
                              {subscriberCount === 1
                                ? "subscriber"
                                : "subscribers"}
                            </span>
                            <span style={{ margin: "0 4px" }}>•</span>
                            <span>
                              {userData?.data?.videos?.length}{" "}
                              {userData?.data?.videos?.length === 1
                                ? "video"
                                : "videos"}
                            </span>
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#aaa", my: 1 }}
                          >
                            More about this channel{" "}
                            <span
                              onClick={() => setShowMore(true)}
                              role="button"
                              style={{
                                fontWeight: "500",
                                cursor: "pointer",
                                color: "rgb(255,255,255)",
                              }}
                            >
                              ...more
                            </span>
                          </Typography>
                          {userData?.data?.username !==
                          dataContext?.data?.username ? (
                            <SubscribeButton
                              channelProfile={true}
                              isAuthenticated={isAuthenticated}
                              channelName={channelName}
                              channelId={channelId}
                              userData={userData}
                              initialSubscribed={userData?.data?.isSubscribedTo}
                              initialSubscribers={
                                userData?.data?.subscribersCount
                              }
                              activeAlertId={activeAlertId}
                              setActiveAlertId={setActiveAlertId}
                              marginLeftVal="0"
                            />
                          ) : (
                            <ManageButtons />
                          )}
                        </>
                      ) : null
                    }
                  />
                </Box>
              </Container>
              {isTablet &&
              userData?.data?.username === dataContext?.data?.username ? (
                <Container maxWidth="100%">
                  <ManageButtons />
                </Container>
              ) : isTablet &&
                userData?.data?.username !== dataContext?.data?.username ? (
                <Container maxWidth="100%">
                  <SubscribeButton
                    channelProfile={true}
                    isAuthenticated={isAuthenticated}
                    channelName={channelName}
                    channelId={channelId}
                    userData={userData}
                    initialSubscribed={userData?.data?.isSubscribedTo}
                    initialSubscribers={userData?.data?.subscribersCount}
                    activeAlertId={activeAlertId}
                    setActiveAlertId={setActiveAlertId}
                    marginLeftVal="0"
                  />
                </Container>
              ) : null}
            </Box>
            {isXs && (
              <Container fixed>
                <Typography variant="body2" sx={{ color: "#aaa", my: 1 }}>
                  More about this channel{" "}
                  <span
                    onClick={() => setShowMore(true)}
                    role="button"
                    style={{
                      fontWeight: "500",
                      cursor: "pointer",
                      color: "rgb(255,255,255)",
                    }}
                  >
                    ...more
                  </span>
                </Typography>
              </Container>
            )}
            <Box
              sx={{
                position: "relative",
                borderBottom: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <BasicTabs username={username} tabPaths={tabPaths} />
            </Box>
          </Box>

          <Box
            sx={{
              position: "relative",
              paddingTop: `${padding}px`,
              zIndex: 0,
            }}
          ></Box>
        </Box>
        {/* <Container fixed sx={{ marginTop: "20px" }}>
          <Grid container spacing={2}>
            {userData?.data?.videos?.map((video) => (
              <Grid
                key={video._id}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                  lg: 3,
                  xl: 3,
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <VideoCard
                    profile={true}
                    thumbnail={video.thumbnail}
                    title={video.title}
                    open={open}
                    views={video.views}
                    duration={video.duration}
                    createdAt={formatDate(video.createdAt)}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container> */}

        <Container fixed sx={{ marginTop: "20px" }}>
          {currentTabIndex === -1 ? <ComponentToRender /> : <Outlet />}
        </Container>
      </Box>
    </>
  );
};

export default ChannelProfile;
