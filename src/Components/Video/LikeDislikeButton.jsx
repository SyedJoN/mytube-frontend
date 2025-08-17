import React, { useState, useEffect, useContext } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toggleVideoLike } from "../../apis/likeFn";
import { toggleVideoDislike } from "../../apis/dislikeFn";
import SignInAlert from "../Dialogs/SignInAlert";
import Signin from "../Auth/Signin";
import {
  Box,
  Button,
  Tooltip,
  Divider,
  useMediaQuery,
} from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { UserContext } from "../../Contexts/RootContexts";

export const LikeDislikeButtons = React.memo(
  ({ isAuthenticated, data, videoId, activeAlertId, setActiveAlertId }) => {
    const queryClient = useQueryClient();
    const { data: dataContext } = useContext(UserContext) ?? {};
    const userId = dataContext?.data?._id;

    const isTablet = useMediaQuery("(max-width:959px)");
    const isMobile = useMediaQuery("(max-width:526px)");

    const likeAlertId = `like-alert-${videoId}`;
    const dislikeAlertId = `dislike-alert-${videoId}`;
    const isLikeAlertOpen = activeAlertId === likeAlertId;
    const isDislikeAlertOpen = activeAlertId === dislikeAlertId;

    const [isSignIn, setIsSignIn] = useState(false);

    // Local derived state
    const [isLike, setIsLike] = useState({
      isLiked: data?.data?.likedBy.includes(userId) || false,
      likeCount: data?.data?.likesCount || 0,
    });
    const [isDislike, setIsDislike] = useState({
      isDisliked: data?.data?.disLikedBy.includes(userId) || false,
    });

    useEffect(() => {
      if (data?.data) {
        setIsLike({
          isLiked: data.data.likedBy.includes(userId) || false,
          likeCount: data.data.likesCount || 0,
        });
        setIsDislike({
          isDisliked: data.data.disLikedBy.includes(userId) || false,
        });
      }
    }, [data?.data, userId]);

    /** ========== MUTATIONS ========== */

    const likeMutation = useMutation({
      mutationFn: () => toggleVideoLike(videoId),
      onMutate: async () => {
        await queryClient.cancelQueries(["video", videoId]);
        const prevData = queryClient.getQueryData(["video", videoId]);

        // Optimistic update
        queryClient.setQueryData(["video", videoId], (old) => {
          if (!old?.data) return old;
          const alreadyLiked = old.data.likedBy.includes(userId);
          return {
            ...old,
            data: {
              ...old.data,
              likesCount: alreadyLiked
                ? old.data.likesCount - 1
                : old.data.likesCount + 1,
              likedBy: alreadyLiked
                ? old.data.likedBy.filter((id) => id !== userId)
                : [...old.data.likedBy, userId],
              disLikedBy: old.data.disLikedBy.filter((id) => id !== userId),
            },
          };
        });

        return { prevData };
      },
      onError: (_, __, context) => {
        queryClient.setQueryData(["video", videoId], context.prevData);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["video", videoId]);
      },
    });

    const dislikeMutation = useMutation({
      mutationFn: () => toggleVideoDislike(videoId),
      onMutate: async () => {
        await queryClient.cancelQueries(["video", videoId]);
        const prevData = queryClient.getQueryData(["video", videoId]);

        queryClient.setQueryData(["video", videoId], (old) => {
          if (!old?.data) return old;
          const alreadyDisliked = old.data.disLikedBy.includes(userId);
          return {
            ...old,
            data: {
              ...old.data,
              disLikedBy: alreadyDisliked
                ? old.data.disLikedBy.filter((id) => id !== userId)
                : [...old.data.disLikedBy, userId],
              likedBy: old.data.likedBy.filter((id) => id !== userId),
              likesCount: old.data.likedBy.includes(userId)
                ? old.data.likesCount - 1
                : old.data.likesCount,
            },
          };
        });

        return { prevData };
      },
      onError: (_, __, context) => {
        queryClient.setQueryData(["video", videoId], context.prevData);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["video", videoId]);
      },
    });

    /** ========== HANDLERS ========== */
    const handleLikeClick = () => {
      if (!isAuthenticated) {
        setActiveAlertId(isLikeAlertOpen ? null : likeAlertId);
        return;
      }
      likeMutation.mutate();
    };

    const handleDislikeClick = () => {
      if (!isAuthenticated) {
        setActiveAlertId(isDislikeAlertOpen ? null : dislikeAlertId);
        return;
      }
      dislikeMutation.mutate();
    };

    const handleCloseAlert = () => {
      setActiveAlertId(null);
    };

    /** ========== RENDER ========== */
    return (
      <>
        {isSignIn && (
          <Box sx={{ zIndex: 9999, position: "fixed", top: 0, left: 0 }}>
            <Signin open={isSignIn} onClose={() => setIsSignIn(false)} />
          </Box>
        )}
        <Box sx={{ flexBasis: 0, mt: 1 }}>
          <Box
            sx={{
              position: "relative",
              height: "36px",
              display: "inline-flex",
              alignItems: "center",
              borderRadius: "50px",
              color: "rgba(255,255,255,0.2)",
              bgcolor: "rgba(255,255,255,0.1)",
              "& svg": { m: 1 },
            }}
          >
            {/* LIKE BUTTON */}
            <Box sx={{ position: "relative" }}>
              <Tooltip
                disableInteractive
                disableFocusListener
                disableTouchListener
                title={isLike.isLiked ? "Unlike" : "I like this"}
              >
                <Button
                  disableRipple
                  onClick={handleLikeClick}
                  sx={{
                    px: "8px",
                    py: 0,
                    outline: "none",
                    height: "34px",
                    borderRadius: "50px 0 0 50px",
                    "&:hover": { background: "rgba(255,255,255,0.2)" },
                  }}
                >
                  {isLike.isLiked ? (
                    <ThumbUpAltIcon sx={{ color: "white", mr: "8px" }} />
                  ) : (
                    <ThumbUpOffAltIcon sx={{ color: "white", mr: "8px" }} />
                  )}
                  <span style={{ color: "white", paddingRight: "8px" }}>
                    {isLike.likeCount}
                  </span>
                </Button>
              </Tooltip>
              <SignInAlert
                title="Like this video?"
                desc="Sign in to make your opinion count"
                isOpen={isLikeAlertOpen}
                setIsOpen={handleCloseAlert}
                onConfirm={() => setIsSignIn(true)}
                handleClose={handleCloseAlert}
                leftVal={isTablet && !isMobile ? "-168px" : "0px"}
                setActiveAlertId={setActiveAlertId}
              />
            </Box>

            <Divider
              sx={{ bgcolor: "rgba(255, 255, 255, 0.42)" }}
              orientation="vertical"
              variant="middle"
              flexItem
            />

            {/* DISLIKE BUTTON */}
            <Box sx={{ position: "relative" }}>
              <Tooltip
                disableInteractive
                disableFocusListener
                disableTouchListener
                title={isDislike.isDisliked ? "Remove dislike" : "I dislike this"}
              >
                <Button
                  disableRipple
                  onClick={handleDislikeClick}
                  sx={{
                    px: "8px",
                    py: 0,
                    outline: "none",
                    height: "34px",
                    borderRadius: "0 50px 50px 0",
                    "&:hover": { background: "rgba(255,255,255,0.2)" },
                  }}
                >
                  {isDislike.isDisliked ? (
                    <ThumbDownAltIcon sx={{ color: "white", mr: "8px" }} />
                  ) : (
                    <ThumbDownOffAltIcon sx={{ color: "white", mr: "8px" }} />
                  )}
                </Button>
              </Tooltip>
              <SignInAlert
                title="Don’t like this video?"
                desc="Sign in to make your opinion count"
                isOpen={isDislikeAlertOpen}
                setIsOpen={handleCloseAlert}
                onConfirm={() => setIsSignIn(true)}
                handleClose={handleCloseAlert}
                leftVal={isTablet && !isMobile ? "-168px" : "0px"}
                setActiveAlertId={setActiveAlertId}
              />
            </Box>
          </Box>
        </Box>
      </>
    );
  }
);
