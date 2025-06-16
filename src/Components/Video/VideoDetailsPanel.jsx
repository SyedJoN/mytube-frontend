import React from "react";
import Description from "./VideoDescription";
import { LikeDislikeButtons } from "./LikeDislikeButton";
import { SubscribeButton } from "../Subscribe/SubscribeButton";
import { Avatar, Box, CardHeader, Tooltip, Typography } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { getColor } from "../../utils/getColor";

const VideoDetailsPanel = ({
  videoId,
  data,
  dataContext,
  userData,
  user,
  isAuthenticated,
  channelId,
  channelName,
  subscriberCount,
  owner,
  activeAlertId,
  setActiveAlertId,
}) => {
  return (
    <>
      {data?.data?.owner?.avatar && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: {
              xs: "0",
              sm: "24",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              marginTop: 1,
              position: "relative",
              minWidth: "calc(50% - 6px)",
            }}
          >
            <CardHeader
              sx={{
                alignItems: "flex-start",
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
                <Link
                  style={{
                    textDecoration: "none",
                  }}
                  to={`/@${owner}`}
                >
                  <Avatar
                    src={
                      data?.data?.owner?.avatar
                        ? data?.data?.owner?.avatar
                        : null
                    }
                    sx={{
                      bgcolor: getColor(data?.data?.owner?.fullName),
                      cursor: "pointer",
                    }}
                  >
                    {data?.data?.owner?.fullName
                      ? data?.data?.owner?.fullName.charAt(0).toUpperCase()
                      : "?"}
                  </Avatar>
                </Link>
              }
              title={
                <Tooltip
                  title={data?.data?.owner?.fullName}
                  placement="top-start"
                >
                  <Link
                    style={{
                      textDecoration: "none",
                    }}
                    to={`/@${owner}`}
                  >
                    <Typography
                      variant="p"
                      color="#f1f1f1"
                      sx={{ cursor: "pointer" }}
                    >
                      {data?.data?.owner?.fullName}
                    </Typography>
                  </Link>
                </Tooltip>
              }
              subheader={
                <>
                  <Typography variant="body2" color="#aaa" fontSize="0.8rem">
                    <span>
                      {subscriberCount}{" "}
                      {subscriberCount === 1 ? "subscriber" : "subscribers"}
                    </span>
                  </Typography>
                </>
              }
            />

            <SubscribeButton
              isAuthenticated={isAuthenticated}
              channelName={channelName}
              channelId={channelId}
              userData={userData}
              initialSubscribed={userData?.data?.isSubscribedTo}
              initialSubscribers={userData?.data?.subscribersCount}
              user={user}
              activeAlertId={activeAlertId}
              setActiveAlertId={setActiveAlertId}
            />
          </Box>
          <LikeDislikeButtons
            dataContext={dataContext}
            isAuthenticated={isAuthenticated}
            data={data}
            videoId={videoId}
            activeAlertId={activeAlertId}
            setActiveAlertId={setActiveAlertId}
          />
        </Box>
      )}

      {data?.data?.description && (
        <Description
          data={data}
          subscriberCount={userData?.data?.subscribersCount}
          owner={owner}
        />
      )}
    </>
  );
};

export default VideoDetailsPanel;
