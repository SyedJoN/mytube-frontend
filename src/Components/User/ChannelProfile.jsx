import React, { useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getUserChannelProfile } from "../../apis/userFn";
import { getColor } from "../../utils/getColor";
import { Avatar, CardHeader, Typography, Box } from "@mui/material";
import { OpenContext } from "../../routes/__root";
import { SubscribeButton } from "../SubscribeButton";
import Grid from "@mui/material/Grid2";
import AlertDialog from "../Dialog";
import StatsDialog from "../StatsDialog";

const ChannelProfile = ({ username }) => {
  const context = useContext(OpenContext);

  let { data: dataContext } = context;
  const isAuthenticated = dataContext || null;
  const [showMore, setShowMore] = useState(false);
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
      
      <Grid
        container
        spacing={0}
        sx={{ flexWrap: "noWrap", justifyContent: "center", marginTop: "70px" }}
      >
        <Grid size={{ xs: 12, md: 8 }} sx={{ paddingX: "calc(50% - 100vw)" }}>
          <Box sx={{ position: "relative" }}>
            <Box sx={{ height: 0, paddingTop: "15.3%" }}>
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
                    src={userData?.data?.avatar ? userData?.data?.avatar : null}
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
                        {subscriberCount === 1 ? "subscriber" : "subscribers"}
                      </span>
                      <span style={{ margin: "0 4px" }}>•</span>
                      <span>
                        {userData?.data?.videos?.length}{" "}
                        {userData?.data?.videos?.length === 1
                          ? "video"
                          : "videos"}
                      </span>
                    </Typography>
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
                    <SubscribeButton
                      isAuthenticated={isAuthenticated}
                      channelName={channelName}
                      channelId={channelId}
                      userData={userData}
                      initialSubscribed={userData?.data?.isSubscribedTo}
                      initialSubscribers={userData?.data?.subscribersCount}
                      marginLeftVal="0"
                    />
                  </>
                }
              />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

export default ChannelProfile;
