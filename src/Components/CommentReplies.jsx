import React, { useState, useRef, lazy, Suspense, useCallback } from "react";

import {
  CardHeader,
  Avatar,
  ButtonGroup,
  Button,
  IconButton,
  Box,
  Typography,
  FormControl,
  Input,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { addComment, updateComment, deleteComment } from "../apis/commentFn";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OutlinedFlagOutlinedIcon from "@mui/icons-material/OutlinedFlagOutlined";
import Signin from "./Signin";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PersonIcon from "@mui/icons-material/Person";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
const LazyEmojiPicker = lazy(() => import("emoji-picker-react"));
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { toggleCommentLike } from "../apis/likeFn";
import { toggleCommentDislike } from "../apis/dislikeFn";
import EmojiPickerWrapper from "./EmojiPickerWrapper";
import CircularProgress from "@mui/material/CircularProgress";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";

import formatDate from "../utils/dayjs";
import { getColor } from "../utils/getColor";
import { useClickAway } from "react-use";
import SimpleSnackbar from "./Snackbar";
import AlertDialog from "./Dialog";
import SignInAlert from "./SignInAlert";

function CommentReplies({
  isAuthenticated,
  videoId,
  comment,
  reply,
  userData,
  toggleEmojiPicker,
  showEmojiPicker,
  activeEmojiPickerId,
  setActiveEmojiPickerId,
  activeOptionsId,
  setActiveOptionsId,
  activeAlertId,
  setActiveAlertId,
}) {

  const currentAlertId = `replies-${reply._id}`;
  const paperOpen = activeAlertId === currentAlertId;
  const queryClient = useQueryClient();
  const emojiPickerRefs = useRef({});
  const userId = userData?.data?._id;
  const [addReply, setAddReply] = useState(null);
  const [replies, setReplies] = useState({});
  const [isSignIn, setIsSignIn] = useState(false);

  const [subReplies, setSubReplies] = useState({});
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(null);
  const [isLike, setIsLike] = useState({
    isLiked: reply.LikedBy?.includes(userData?.data?._id) || false,
    likeCount: reply.likesCount || 0,
  });
  const [isDislike, setIsDislike] = useState({
    isDisliked: reply.DislikedBy?.includes(userData?.data?._id) || false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ videoId, content, parentCommentId }) =>
      addComment(videoId, { content, parentCommentId }),

    onSuccess: ({ data }) => {
      setSubReplies((prev) => ({
        ...prev,
        [data.parentCommentId]: "",
      }));
      setAddReply(false);
      queryClient.refetchQueries(["commentsData", videoId]);
    },
    onError: (error) => {
      console.error(
        "Error adding comment:",
        error.response ? error.response.data : error.message
      );
    },
  });

  const { mutate: mutateUpdate, isPending: isMutatePending } = useMutation({
    mutationFn: ({ videoId, commentId, content }) =>
      updateComment(videoId, { commentId, content }),

    onSuccess: () => {
      activeEmojiPickerId && setActiveEmojiPickerId(null);
      queryClient.refetchQueries(["commentsData", videoId]);
      setIsEditable(null);
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const { mutate: mutateDelete, isPending: isDeletePending } = useMutation({
    mutationFn: ({ videoId, commentId, content }) =>
      deleteComment(videoId, { commentId, content }),

    onSuccess: () => {
      activeEmojiPickerId && setActiveEmojiPickerId(null);
      queryClient.refetchQueries(["commentsData", videoId]);
      setSnackbarMessage("Comment deleted");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleAddComment = (commentId, replyId) => {
    mutate({
      videoId,
      content: subReplies[replyId],
      parentCommentId: commentId,
    });
  };

  const handleUpdateComment = (commentId) => {
    mutateUpdate({
      videoId,
      commentId,
      content: replies[commentId],
    });
  };

  const handleDeleteComment = (commentId) => {
    setDeleteTargetId(commentId);
    setDialogOpen(true);
    setActiveOptionsId(null);
  };

  const handleEditBtn = (commentId, content) => {
    setActiveOptionsId(null);
    setIsEditable(commentId);
    setReplies((prev) => ({
      ...prev,
      [commentId]: content,
    }));
  };

  const handleCancelReplyButton = useCallback((id) => {
    setAddReply(null);
    setActiveEmojiPickerId(null);
    setSubReplies((prev) => ({
      ...prev,
      [id]: "",
    }));
  }, []);

  const {
    mutate: toggleLikeMutation,
    isLoading: isLikeLoading,
    isPending: isLikePending,
  } = useMutation({
    mutationFn: (commentId) => toggleCommentLike(commentId),
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
    onError: () => {
      console.error("error", error);
    },
  });

  const {
    mutate: toggleDislikeMutation,
    isLoading: isDisLikeLoading,
    isPending: isDisLikePending,
  } = useMutation({
    mutationFn: (commentId) => toggleCommentDislike(commentId),
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
      queryClient.invalidateQueries(["commentsData", videoId]);
    },
    onError: () => {
      console.error("dislike error", error);
    },
  });

  const toggleLike = (id) => {
    toggleLikeMutation(id);
  };

  const toggleDislike = (id) => {
    toggleDislikeMutation(id);
  };

  const handleToggleOptions = () => {
    setActiveOptionsId((prev) => (prev === reply._id ? null : reply._id));
  };
  const handleCloseAlert = () => {
    if (paperOpen) setActiveAlertId(null);
  };
  const handleReplyClick = (e, reply) => {
    e.stopPropagation();
    if (isAuthenticated) {
      setAddReply(reply._id);
    } else {
      setActiveAlertId(paperOpen ? null : currentAlertId);
    }
  }

  return (
    <>
      {isSignIn && (
        <Box sx={{ zIndex: 9999, position: "fixed", top: 0, left: 0 }}>
          <Signin open={isSignIn} onClose={() => setIsSignIn(false)} />
        </Box>
      )}
      <CardHeader
        sx={{
          alignItems: "flex-start",
          alignSelf: "flex-end",
          padding: 0,
        }}
        avatar={
          <Avatar
            src={reply.owner?.avatar || null}
            sx={{
              bgcolor: getColor(reply.owner?.fullName || ""),
              width: "30px",
              height: "30px",
            }}
          >
            {comment.owner?.fullName
              ? reply.owner.fullName.charAt(0).toUpperCase()
              : "?"}
          </Avatar>
        }
        title={
          <Typography variant="body2" color="#f1f1f1">
            @{reply.owner?.username || "anonymous"}
            <span
              style={{
                paddingLeft: "6px",
                fontSize: "0.8rem",
                color: "#aaa",
              }}
            >
              {formatDate(reply.createdAt)}
              {reply.isEdited && " (edited)"}
            </span>
          </Typography>
        }
        subheader={
          <>
            {isEditable === reply._id ? (
              <>
                <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                  <Input
                    multiline
                    value={replies[reply._id] || ""}
                    onChange={(e) =>
                      setReplies((prev) => ({
                        ...prev,
                        [reply._id]: e.target.value,
                      }))
                    }
                    sx={{
                      fontSize: "0.875rem",
                      "& textarea": {
                        color: "rgb(255,255,255) !important",
                      },
                      "&::before": {
                        borderBottom: "1px solid #717171 !important",
                      },
                      "&::after": {
                        borderBottom: "2px solid rgb(255,255,255) !important",
                      },
                    }}
                  />
                </FormControl>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#fff",
                    marginTop: "6px",
                  }}
                >
                  <Box
                    ref={(el) => (emojiPickerRefs.current[reply._id] = el)}
                    sx={{ position: "relative" }}
                  >
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEmojiPicker(reply._id);
                      }}
                      sx={{ color: "#fff" }}
                    >
                      <SentimentSatisfiedAltIcon />
                    </IconButton>
                    {activeEmojiPickerId === reply._id && !showEmojiPicker && (
                      <EmojiPickerWrapper
                        onEmojiSelect={(emoji) =>
                          setReplies((prev) => ({
                            ...prev,
                            [reply._id]: (prev[reply._id] || "") + emoji,
                          }))
                        }
                        id={reply._id}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: "flex", gap: "8px" }}>
                    <Button
                      onClick={() => setIsEditable(null)}
                      variant="outlined"
                      sx={{
                        color: "#f1f1f1",
                        textTransform: "capitalize",
                        transition: "none",
                        borderRadius: "50px",
                        "&:hover": {
                          background: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleUpdateComment(reply._id)}
                      disabled={!replies[reply._id]}
                      variant="outlined"
                      sx={{
                        color: "#0f0f0f",
                        fontWeight: "550",
                        borderRadius: "50px",
                        textTransform: "capitalize",
                        paddingY: 1,
                        background: "#3ea6ff",
                        "&:hover": {
                          background: "#65b8ff",
                        },
                        "&.Mui-disabled": {
                          background: "rgba(255, 255, 255, 0.1) !important",
                          color: "rgba(255, 255, 255, 0.4) !important",
                        },
                      }}
                    >
                      Update
                    </Button>
                  </Box>
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="#f1f1f1" whiteSpace="pre-wrap">
                {reply.content}
              </Typography>
            )}
            <ButtonGroup
              sx={{ alignItems: "center", marginTop: 0.5, marginLeft: "-8px" }}
            >
              {isLike.isLiked ? (
                <Tooltip title="Unlike">
                  <IconButton
                    sx={{
                      padding: 0,
                      width: "32px",
                      height: "32px",
                      "&:hover": {
                        background: "rgba(255,255,255,0.2)",
                      },
                    }}
                  >
                    <ThumbUpAltIcon
                      onClick={() => toggleLike(reply._id)}
                      sx={{
                        cursor: "pointer",
                        color: "#fff",
                        fontSize: "1.3rem",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Like">
                  <IconButton
                    sx={{
                      padding: 0,
                      width: "32px",
                      height: "32px",
                      "&:hover": {
                        background: "rgba(255,255,255,0.2)",
                      },
                    }}
                  >
                    <ThumbUpOffAltIcon
                      onClick={() => toggleLike(reply._id)}
                      sx={{
                        cursor: "pointer",
                        color: "#fff",
                        fontSize: "1.3rem",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              )}

              {isLike.likeCount && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#aaa",
                    paddingRight: "8px",
                  }}
                >
                  {isLike.likeCount}
                </span>
              )}
              {isDislike.isDisliked ? (
                <Tooltip title="Remove dislike">
                  <IconButton
                    sx={{
                      padding: 0,
                      width: "32px",
                      height: "32px",
                      "&:hover": {
                        background: "rgba(255,255,255,0.2)",
                      },
                    }}
                  >
                    <ThumbDownAltIcon
                      onClick={() => toggleDislike(reply._id)}
                      sx={{
                        cursor: "pointer",
                        color: "#fff",
                        fontSize: "1.3rem",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Dislike">
                  <IconButton
                    sx={{
                      padding: 0,
                      width: "32px",
                      height: "32px",
                      "&:hover": {
                        background: "rgba(255,255,255,0.2)",
                      },
                    }}
                  >
                    <ThumbDownOffAltIcon
                      onClick={() => toggleDislike(reply._id)}
                      sx={{
                        cursor: "pointer",
                        color: "#fff",
                        fontSize: "1.3rem",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              )}
              <Box sx={{ position: "relative", padding: 0, marginLeft: "8px" }}>
                <Button
                  onClick={(e) => {

                    handleReplyClick(e, reply);
                    setSubReplies((prev) => ({
                      ...prev,
                      [reply._id]: `@${reply.owner.username} `, // Pre-fill with mention
                    }));
                  }
                   
                  }
                  sx={{
                    fontSize: "0.75rem",
                    color: "#fff",
                    textTransform: "none",
                    padding: "6px 12px",
                    transition: "none",
                    "&:hover": {
                      background: "rgba(255,255,255,0.2)",
                      borderRadius: "50px",
                    },
                  }}
                >
                  Reply
                </Button>
                   <SignInAlert
                                  height="140"
                                  title="Sign in to continue"
                                  isOpen={paperOpen}
                                  handleClose={handleCloseAlert}
                                  setActiveAlertId={setActiveAlertId}
                                  onConfirm={() => setIsSignIn(true)}
                                  leftVal="128px"
                                />
              </Box>
            </ButtonGroup>
            {addReply === reply._id && (
              <>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    src={userData?.data?.avatar ? userData?.data?.avatar : null}
                    sx={{
                      bgcolor: userData
                        ? getColor(userData?.data?.fullName)
                        : "rgba(168, 199, 250 , 1)",
                      overflow: "hidden",
                      width: "30px",
                      height: "30px",
                    }}
                  >
                    {userData?.data?.fullName ? (
                      userData?.data?.fullName.charAt(0).toUpperCase()
                    ) : (
                      <PersonIcon
                        sx={{
                          color: "rgb(38, 121, 254)",
                        }}
                      />
                    )}
                  </Avatar>
                  {isPending ? (
                    <CircularProgress
                      sx={{
                        mx: "auto",
                        textAlign: "center",
                        color: "rgba(168, 199, 250 , 1)",
                      }}
                      size={30}
                    />
                  ) : (
                    <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                      <Input
                        multiline
                        value={subReplies[reply._id] || ""} // Use reply._id as the key
                        onChange={(e) =>
                          setSubReplies((prev) => ({
                            ...prev,
                            [reply._id]: e.target.value, // Only update this specific reply
                          }))
                        }
                        sx={{
                          fontSize: "0.875rem",
                          "& textarea": {
                            color: "rgb(255,255,255) !important",
                          },
                          "&::before": {
                            borderBottom: "1px solid #717171 !important",
                          },
                          "&::after": {
                            borderBottom:
                              "2px solid rgb(255,255,255) !important",
                          },
                        }}
                      />
                    </FormControl>
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#fff",
                    marginTop: "6px",
                  }}
                >
                  <Box sx={{ position: "relative", marginLeft: "36px" }}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEmojiPicker(reply._id);
                      }}
                      sx={{ color: "#fff" }}
                    >
                      <SentimentSatisfiedAltIcon />
                    </IconButton>
                    {activeEmojiPickerId === reply._id && !showEmojiPicker && (
                      <EmojiPickerWrapper
                        onEmojiSelect={(emoji) =>
                          setSubReplies((prev) => ({
                            ...prev,
                            [reply._id]: (prev[reply._id] || "") + emoji,
                          }))
                        }
                      />
                    )}
                  </Box>

                  <Box sx={{ display: "flex", gap: "8px" }}>
                    <Button
                      onClick={() => handleCancelReplyButton(reply._id)}
                      variant="outlined"
                      sx={{
                        color: "#f1f1f1",
                        textTransform: "capitalize",
                        transition: "none",
                        borderRadius: "50px",
                        "&:hover": {
                          background: "rgba(255,255,255,0.1)",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleAddComment(comment._id, reply._id)}
                      disabled={!subReplies[reply._id]}
                      variant="outlined"
                      sx={{
                        color: "#0f0f0f",
                        fontWeight: "550",
                        borderRadius: "50px",
                        textTransform: "capitalize",
                        paddingY: 1,
                        background: "#3ea6ff",
                        "&:hover": {
                          background: "#65b8ff",
                        },
                        "&.Mui-disabled": {
                          background: "rgba(255, 255, 255, 0.1) !important",
                          color: "rgba(255, 255, 255, 0.4) !important",
                        },
                      }}
                    >
                      Reply
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </>
        }
        action={
          <Box sx={{ position: "relative" }}>
            <IconButton onClick={handleToggleOptions} aria-label="settings">
              <MoreVertIcon sx={{ color: "#fff" }} />
            </IconButton>
            {activeOptionsId === reply._id && userId === reply.owner._id && (
              <Box
                id="create-menu"
                sx={{
                  position: "absolute",
                  top: "35px",
                  right: "-93px",
                  borderRadius: "12px",
                  backgroundColor: "#282828",
                  zIndex: 2,
                  paddingY: 1,
                }}
              >
                <MenuItem
                  onClick={() => handleEditBtn(reply._id, reply.content)}
                  sx={{
                    paddingTop: 1,
                    paddingLeft: "16px",
                    paddingRight: "36px",
                    gap: "3px",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <EditOutlinedIcon sx={{ color: "#f1f1f1" }} />
                  <Typography variant="body2" marginLeft="10px" color="#f1f1f1">
                    Edit
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => handleDeleteComment(reply._id)}
                  sx={{
                    paddingTop: 1,
                    paddingLeft: "16px",
                    paddingRight: "36px",
                    gap: "3px",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <DeleteOutlinedIcon sx={{ color: "#f1f1f1" }} />
                  <Typography variant="body2" marginLeft="10px" color="#f1f1f1">
                    Delete
                  </Typography>
                </MenuItem>
              </Box>
            )}

            {activeOptionsId === reply._id && userId !== reply.owner._id && (
              <Box
                id="create-menu"
                sx={{
                  position: "absolute",
                  top: "35px",
                  right: "-93px",
                  borderRadius: "12px",
                  backgroundColor: "#282828",
                  zIndex: 2,
                  paddingY: 1,
                }}
              >
                <MenuItem
                  sx={{
                    paddingTop: 1,
                    paddingLeft: "16px",
                    paddingRight: "36px",
                    gap: "3px",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <OutlinedFlagOutlinedIcon sx={{ color: "#f1f1f1" }} />
                  <Typography variant="body2" marginLeft="10px" color="#f1f1f1">
                    Report
                  </Typography>
                </MenuItem>
              </Box>
            )}
            <AlertDialog
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              title="Delete comment"
              desc="Delete your comment permanently?"
              buttonTxt="Delete"
              onConfirm={() =>
                mutateDelete({
                  videoId,
                  commentId: deleteTargetId,
                  content: replies[deleteTargetId],
                })
              }
            />

            <SimpleSnackbar
              open={snackbarOpen}
              setOpen={setSnackbarOpen}
              message={snackbarMessage}
            />
          </Box>
        }
      />
    </>
  );
}

export default React.memo(CommentReplies);
