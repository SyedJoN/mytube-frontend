import React, { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
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
    dataContext,
    isAuthenticated,
    data,
    videoId,
    activeAlertId,
    setActiveAlertId,
  }) => {
      const queryClient = useQueryClient();
    
    const likeAlertId = `like-alert-${videoId}`;
    const dislikeAlertId = `dislike-alert-${videoId}`;

    const isLikeAlertOpen = activeAlertId === likeAlertId;
    const isDislikeAlertOpen = activeAlertId === dislikeAlertId;

   const [isLike, setIsLike] = useState({
       isLiked: data?.data?.likedBy.includes(dataContext?.data?._id) || false,
       likeCount: data?.data.likesCount || 0,
     });
     const [isDislike, setIsDislike] = useState({
       isDisliked:data?.data?.disLikedBy.includes(dataContext?.data?._id) || false,
     });
    const [isSignIn, setIsSignIn] = useState(false);

     useEffect(() => {
        if (data?.data) {
          setIsLike({
            isLiked: data.data.likedBy.includes(dataContext?.data?._id) || false,
            likeCount: data.data.likesCount || 0,
          });
          setIsDislike({
            isDisliked: data.data.disLikedBy.includes(dataContext?.data?._id) || false,
          });
        }
      }, [data?.data, dataContext?.data?._id]); 

    const { mutate: likeMutate } = useMutation({
      mutationFn: () => toggleVideoLike(videoId),
      onMutate: () => {
        setIsLike((prev) => ({
          isLiked: !prev.isLiked,
          likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
        }));
        setIsDislike((prev) => {
          if (prev.isDisliked) {
            return {
              ...prev,
              isDisliked: false,
            };
          }
          return prev;
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["video", videoId]);
      },
    });

    const { mutate: dislikeMutate } = useMutation({
      mutationFn: () => toggleVideoDislike(videoId),
      onMutate: () => {
        setIsDislike((prev) => ({
          isDisliked: !prev.isDisliked,
        }));
        setIsLike((prev) => {
          if (prev.isLiked) {
            return {
              ...prev,
              isLiked: false,
              likeCount: Math.max(prev.likeCount - 1, 0),
            };
          }
          return prev;
        });
    
      },
      onSuccess: () => {
        queryClient.invalidateQueries(["video", videoId]);
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
              {isLike.isLiked ? (
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
                {isLike.likeCount}
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
              {isDislike.isDisliked ? (
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
