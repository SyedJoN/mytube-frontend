import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
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
  Alert,
  Snackbar,
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
    const isCustomWidth = useMediaQuery("(max-width:1014px)");

    const likeAlertId = `like-alert-${videoId}`;
    const dislikeAlertId = `dislike-alert-${videoId}`;
    const isLikeAlertOpen = activeAlertId === likeAlertId;
    const isDislikeAlertOpen = activeAlertId === dislikeAlertId;

    const [isSignIn, setIsSignIn] = useState(false);
    const [error, setError] = useState(null);

    const [localState, setLocalState] = useState({
      isLiked: false,
      isDisliked: false,
      likesCount: 0,
    });

    const hasMountedRef = useRef(false);

    useEffect(() => {
      if (!hasMountedRef.current && data?.data && userId) {
        const serverIsLiked =
          Array.isArray(data.data.likedBy) &&
          data.data.likedBy.includes(userId);
        const serverIsDisliked =
          Array.isArray(data.data.dislikedBy) &&
          data.data.dislikedBy.includes(userId);
        const serverLikesCount = data.data.likesCount ?? 0;

        setLocalState({
          isLiked: serverIsLiked,
          isDisliked: serverIsDisliked,
          likesCount: serverLikesCount,
        });

        hasMountedRef.current = true;
      }
    }, [data?.data, userId]);

    /** ========== MUTATIONS ========== */

    // LIKE MUTATION
    const likeMutation = useMutation({
      mutationFn: () => toggleVideoLike(videoId),
      onMutate: () => {
        setLocalState((prev) => {
          const newIsLiked = !prev.isLiked;
          const newLikesCount = newIsLiked
            ? prev.likesCount + 1
            : prev.likesCount - 1;

          return {
            isLiked: newIsLiked,
            isDisliked: newIsLiked ? false : prev.isDisliked,
            likesCount: newLikesCount,
          };
        });

        queryClient.setQueryData(["video", videoId], (old) => {
          if (!old?.data) return old;

          const currentData = old.data;
          const alreadyLiked = currentData.likedBy?.includes(userId) || false;
          const newIsLiked = !alreadyLiked;
          const newLikesCount = newIsLiked
            ? currentData.likesCount + 1
            : currentData.likesCount - 1;

          return {
            ...old,
            data: {
              ...currentData,
              likesCount: newLikesCount,
              likedBy: newIsLiked
                ? [
                    ...(currentData.likedBy?.filter((id) => id !== userId) ||
                      []),
                    userId,
                  ]
                : currentData.likedBy?.filter((id) => id !== userId) || [],
              dislikedBy: newIsLiked
                ? currentData.dislikedBy?.filter((id) => id !== userId) || []
                : currentData.dislikedBy || [],
            },
          };
        });
      },

      onError: () => {
        setError("Failed to update like. Please check your connection.");
      },
    });

    // DISLIKE MUTATION
    const dislikeMutation = useMutation({
      mutationFn: () => toggleVideoDislike(videoId),

      onMutate: () => {
        setLocalState((prev) => {
          const newIsDisliked = !prev.isDisliked;
          const newLikesCount =
            prev.isLiked && newIsDisliked
              ? prev.likesCount - 1
              : prev.likesCount;

          return {
            isLiked: newIsDisliked ? false : prev.isLiked,
            isDisliked: newIsDisliked,
            likesCount: newLikesCount,
          };
        });

        queryClient.setQueryData(["video", videoId], (old) => {
          if (!old?.data) return old;

          const currentData = old.data;
          const alreadyDisliked =
            currentData.dislikedBy?.includes(userId) || false;
          const alreadyLiked = currentData.likedBy?.includes(userId) || false;
          const newIsDisliked = !alreadyDisliked;
          const newLikesCount =
            alreadyLiked && newIsDisliked
              ? currentData.likesCount - 1
              : currentData.likesCount;

          return {
            ...old,
            data: {
              ...currentData,
              likesCount: newLikesCount,
              dislikedBy: newIsDisliked
                ? [
                    ...(currentData.dislikedBy?.filter((id) => id !== userId) ||
                      []),
                    userId,
                  ]
                : currentData.dislikedBy?.filter((id) => id !== userId) || [],
              likedBy: newIsDisliked
                ? currentData.likedBy?.filter((id) => id !== userId) || []
                : currentData.likedBy || [],
            },
          };
        });
      },

      onError: () => {
        setError("Failed to update dislike. Please check your connection.");
      },
    });

    /** ========== HANDLERS ========== */
    const handleLikeClick = useCallback(() => {
      if (!isAuthenticated) {
        setActiveAlertId(isLikeAlertOpen ? null : likeAlertId);
        return;
      }

      setError(null);
      likeMutation.mutate();
    }, [
      isAuthenticated,
      isLikeAlertOpen,
      likeAlertId,
      setActiveAlertId,
      likeMutation,
    ]);

    const handleDislikeClick = useCallback(() => {
      if (!isAuthenticated) {
        setActiveAlertId(isDislikeAlertOpen ? null : dislikeAlertId);
        return;
      }

      setError(null);
      dislikeMutation.mutate();
    }, [
      isAuthenticated,
      isDislikeAlertOpen,
      dislikeAlertId,
      setActiveAlertId,
      dislikeMutation,
    ]);

    const handleCloseAlert = useCallback(() => {
      setActiveAlertId(null);
    }, [setActiveAlertId]);

    const handleCloseError = useCallback(() => {
      setError(null);
    }, []);

    return (
      <>
        {/* Error notification */}
        <Snackbar
          open={!!error}
          autoHideDuration={3000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseError}
            severity="warning"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>

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
                title={localState.isLiked ? "Unlike" : "I like this"}
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
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {localState.isLiked ? (
                    <ThumbUpAltIcon sx={{ color: "white", mr: "8px" }} />
                  ) : (
                    <ThumbUpOffAltIcon sx={{ color: "white", mr: "8px" }} />
                  )}
                  <span style={{ color: "white", paddingRight: "8px" }}>
                    {localState.likesCount}
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
                leftVal={isMobile ? "0px" : isCustomWidth ? "-150px" : "168px"}
                width={isMobile ? "150px" : "250px"}
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
                title={
                  localState.isDisliked ? "Remove dislike" : "I dislike this"
                }
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
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {localState.isDisliked ? (
                    <ThumbDownAltIcon sx={{ color: "white", mr: "8px" }} />
                  ) : (
                    <ThumbDownOffAltIcon sx={{ color: "white", mr: "8px" }} />
                  )}
                </Button>
              </Tooltip>
              <SignInAlert
                title="Don't like this video?"
                desc="Sign in to make your opinion count"
                isOpen={isDislikeAlertOpen}
                setIsOpen={handleCloseAlert}
                onConfirm={() => setIsSignIn(true)}
                handleClose={handleCloseAlert}
                leftVal={isTablet && !isMobile ? "-168px" : "0px"}
                width={isMobile ? "150px" : "250px"}
                setActiveAlertId={setActiveAlertId}
              />
            </Box>
          </Box>
        </Box>
      </>
    );
  }
);
