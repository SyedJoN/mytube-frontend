import React, { useState, useEffect, useContext } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toggleVideoLike } from "../../apis/likeFn";
import { toggleVideoDislike } from "../../apis/dislikeFn";
import SignInAlert from "../Dialogs/SignInAlert";
import Signin from "../Auth/Signin";
import {
  Box,
  Button,
  ButtonGroup,
  Tooltip,
  Divider,
  useTheme,
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
    const context = useContext(UserContext);
    const isTablet = useMediaQuery("(max-width:959px)");
    const isMobile = useMediaQuery("(max-width:526px)");
    const likeAlertId = `like-alert-${videoId}`;
    const dislikeAlertId = `dislike-alert-${videoId}`;
    const { data: dataContext } = context ?? {};
    const isLikeAlertOpen = activeAlertId === likeAlertId;
    const isDislikeAlertOpen = activeAlertId === dislikeAlertId;

    const [isLike, setIsLike] = useState({
      isLiked: data?.data?.likedBy.includes(dataContext?._id) || false,
      likeCount: data?.data.likesCount || 0,
    });
    const [isDislike, setIsDislike] = useState({
      isDisliked: data?.data?.disLikedBy.includes(dataContext?._id) || false,
    });
    const [isSignIn, setIsSignIn] = useState(false);

    useEffect(() => {
      if (data?.data) {
        setIsLike({
          isLiked: data.data.likedBy.includes(dataContext?._id) || false,
          likeCount: data.data.likesCount || 0,
        });
        setIsDislike({
          isDisliked: data.data.disLikedBy.includes(dataContext?._id) || false,
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
            flexBasis: 0,
            mt: 1,
          }}
        >
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
              <Tooltip
                disableInteractive
                disableFocusListener
                disableTouchListener
                title={isLike.isLiked ? "Unlike" : "I like this"}
              >
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
                    <ThumbUpAltIcon
                      sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                    />
                  ) : (
                    <ThumbUpOffAltIcon
                      sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                    />
                  )}
                  <span
                    style={{ color: "rgb(255,255,255)", paddingRight: "8px" }}
                  >
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
            <Box sx={{ position: "relative" }}>
              <Tooltip
                disableInteractive
                disableFocusListener
                disableTouchListener
                title={
                  isDislike.isDisliked ? "Remove dislike" : "I dislike this"
                }
              >
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
                    <ThumbDownAltIcon
                      sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                    />
                  ) : (
                    <ThumbDownOffAltIcon
                      sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}
                    />
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
