import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toggleVideoLike } from "../apis/likeFn";
import { toggleVideoDislike } from "../apis/dislikeFn";
import SignInAlert from "./SignInAlert";
import Signin from "./Signin";
import { Box, Button, ButtonGroup, Tooltip, Divider } from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";

export const LikeDislikeButtons = React.memo(
  ({
    isAuthenticated,
    videoId,
    initialLikes,
    initialIsLiked,
    initialIsDisliked,
    activeAlertId,
    setActiveAlertId,
  }) => {
    const likeAlertId = `like-alert-${videoId}`;
    const dislikeAlertId = `dislike-alert-${videoId}`;

    const isLikeAlertOpen = activeAlertId === likeAlertId;
    const isDislikeAlertOpen = activeAlertId === dislikeAlertId;

    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isDisliked, setIsDisliked] = useState(initialIsDisliked);
    const [likeCount, setLikeCount] = useState(initialLikes);
    const [isSignIn, setIsSignIn] = useState(false);

    const { mutate: likeMutate } = useMutation({
      mutationFn: () => toggleVideoLike(videoId),
      onMutate: () => {
        setIsLiked((prev) => !prev);
        setLikeCount((prev) => prev + (isLiked ? -1 : 1));
        if (isDisliked) setIsDisliked(false);
      },
    });

    const { mutate: dislikeMutate } = useMutation({
      mutationFn: () => toggleVideoDislike(videoId),
      onMutate: () => {
        setIsDisliked((prev) => !prev);
        if (isLiked) {
          setIsLiked(false);
          setLikeCount((prev) => Math.max(prev - 1, 0));
        }
      },
    });

    const handleLikeBtn = () => {
      if (isAuthenticated) {
        likeMutate();
      } else {
        setActiveAlertId(isLikeAlertOpen ? null : likeAlertId);
      }
    };

    const handleDislikeBtn = () => {
      if (isAuthenticated) {
        dislikeMutate();
      } else {
        setActiveAlertId(isDislikeAlertOpen ? null : dislikeAlertId);
      }
    };

    const handleCloseAlert = () => {
     setActiveAlertId(null);
    };

    return (
      <>
        {isSignIn && (
          <Box sx={{ zIndex: 9999, position: "fixed", top: 0, left: 0 }}>
            <Signin open={isSignIn} onClose={() => setIsSignIn(false)} />
          </Box>
        )}
        <Box
          sx={{
            position: "relative",
            height: "36px",
            display: "inline-flex",
            alignItems: "center",
            borderRadius: "50px",
            color: "rgba(255,255,255,0.2)",
            bgcolor: "rgba(255,255,255,0.1)",
            "& svg": {
              m: 1,
            },
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Button
              disableRipple
              onClick={handleLikeBtn}
              sx={{
                paddingX: "8px",
                paddingY: 0,
                outline: "none",
                height: "34px",
                borderRadius: "50px 0 0 50px",
                "&:hover": {
                  background: "rgba(255,255,255,0.2)",
                },
              }}
            >
              {isLiked ? (
                <Tooltip title="Unlike">
                  <ThumbUpAltIcon
                    sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="I like this">
                  <ThumbUpOffAltIcon
                    sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                  />
                </Tooltip>
              )}
              <span style={{ color: "rgb(255,255,255)", paddingRight: "8px" }}>
                {likeCount}
              </span>
            </Button>
            <SignInAlert
              title="Like this video?"
              desc="Sign in to make your opinion count"
              isOpen={isLikeAlertOpen}
              setIsOpen={handleCloseAlert}
              onConfirm={() => setIsSignIn(true)}
              handleClose={handleCloseAlert}
              leftVal="0px"
            />
          </Box>

          <Divider
            sx={{ bgcolor: "rgba(255, 255, 255, 0.42)" }}
            orientation="vertical"
            variant="middle"
            flexItem
          />
          <Box sx={{ position: "relative" }}>
            <Button
              disableRipple
              onClick={handleDislikeBtn}
              sx={{
                paddingX: "8px",
                paddingY: 0,
                outline: "none",
                height: "34px",
                borderRadius: "0 50px 50px 0",
                "&:hover": {
                  background: "rgba(255,255,255,0.2)",
                },
              }}
            >
              {isDisliked ? (
                <Tooltip title="Remove dislike">
                  <ThumbDownAltIcon
                    sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="I dislike this">
                  <ThumbDownOffAltIcon
                    sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                  />
                </Tooltip>
              )}
            </Button>
            <SignInAlert
              title="Don’t like this video?"
              desc="Sign in to make your opinion count"
              isOpen={isDislikeAlertOpen}
              setIsOpen={handleCloseAlert}
              onConfirm={() => setIsSignIn(true)}
              handleClose={handleCloseAlert}
              leftVal="0px"
            />
          </Box>
        </Box>
      </>
    );
  }
);
