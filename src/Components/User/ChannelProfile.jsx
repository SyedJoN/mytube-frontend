import React, { useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getUserChannelProfile } from "../../apis/userFn";
import { OpenContext } from "../../routes/__root";
import { getColor } from "../../utils/getColor";
import {
  Avatar,
  CardHeader,
  Typography,
  Box,
  Divider,
  Container,
} from "@mui/material";
import { SubscribeButton } from "../SubscribeButton";
import Grid from "@mui/material/Grid";
import formatDate from "../../utils/formatDate";
import AlertDialog from "../Dialog";
import StatsDialog from "../StatsDialog";
import BasicTabs from "../Tabs";
import VideoCard from "../VideoCard";

const ChannelProfile = ({ username }) => {
  const context = useContext(OpenContext);
  let { data: dataContext, open } = context;
  const isAuthenticated = dataContext || null;
  const [showMore, setShowMore] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const userNameStyles = {
    color: "#f1f1f1",
    fontWeight: "bold",
  };
  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery({
    queryKey: ["channelProfile", username],
    queryFn: () => getUserChannelProfile(username),
    enabled: true,
  });

  const channelId = userData?.data?._id;
  const [subscriberCount, setSubscriberCount] = useState(
    userData?.data?.subscribersCount ?? 0
  );
  const [activeAlertId, setActiveAlertId] = useState(null);

  useEffect(() => {
    console.log("userData", userData);
  }, [userData]);
  const channelName = userData?.data.fullName;

  useEffect(() => {
    const newCount = userData?.data?.subscribersCount ?? 0;
    if (subscriberCount !== newCount) {
      setSubscriberCount(newCount);
    }
  }, [userData]);

  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setTranslateY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [translateY]);

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
          display: "block",
        }}
      >
        <Box id="wrapper" sx={{ marginTop: "var(--toolbar-height)"}}>
          <Box
            id="header"
            sx={{
              position: "fixed",
              width: "100%",
              top: 0,
              left: open ? "var(--drawer-width)" : "0",
              zIndex: 1000,
              transform: `translate3d(0px, -${translateY}px, 0px)`,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Box sx={{ paddingX: `calc(50% - 642px)` }}>
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
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingX: `calc(50% - 642px)`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: 2,
                    position: "relative",
                  }}
                >
                  <CardHeader
                    sx={{
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
                          userData?.data?.avatar ? userData?.data?.avatar : null
                        }
                        sx={{
                          bgcolor: getColor(userData?.data?.fullName),
                          width: "150px",
                          height: "150px",
                        }}
                      >
                        {userData?.fullName
                          ? userData?.data?.fullName.charAt(0).toUpperCase()
                          : "?"}
                      </Avatar>
                    }
                    title={
                      <Typography variant="h2" color="#f1f1f1">
                        {userData?.data?.fullName}
                      </Typography>
                    }
                    // action={
                    //   <IconButton aria-label="settings">
                    //     <MoreVertIcon sx={{ color: "#fff" }} />
                    //   </IconButton>
                    // }
                    subheader={
                      <>
                        <Typography
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
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
                        <SubscribeButton
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
                      </>
                    }
                  />
                </Box>
              </Box>
            </Box>
            <Box sx={{ position: "relative", marginY: "20px" }}>
              <BasicTabs userData={userData} />
            </Box>
          </Box>
        </Box>
        <Box sx={{ marginTop: "400px" }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              paddingX: `calc(50% - 642px)`,
            }}
          >
            {userData?.data?.videos?.map((video) => (
              <VideoCard
                key={video._id}
                profile={true}
                thumbnail={video.thumbnail}
                title={video.title}
                open={open}
                views={video.views}
                duration={video.duration}
                createdAt={formatDate(video.createdAt)}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ChannelProfile;
