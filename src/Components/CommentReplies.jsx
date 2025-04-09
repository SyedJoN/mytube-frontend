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
} from "@mui/material";
import { addComment, updateComment, deleteComment } from "../apis/commentFn";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
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

function CommentReplies({
  videoId,
  data,
  reply,
  dataContext,
  toggleEmojiPicker,
  showEmojiPicker,
  setShowEmojiPicker,
  activeEmojiPickerId,
  setActiveEmojiPickerId,
  activeOptionsId,
  setActiveOptionsId,
}) {
  const queryClient = useQueryClient();
  const emojiPickerRef = useRef(null);

  const [isEmojiButtonClicked, setIsEmojiButtonClicked] = useState(false);
  const [addReply, setAddReply] = useState(null);
  const [replies, setReplies] = useState({});
const [isEditable, setIsEditable] = useState(null);
  const [isLike, setIsLike] = useState({
    isLiked: reply.LikedBy?.includes(dataContext?.data?._id) || false,
    likeCount: reply.likesCount || 0,
  });
  const [isDislike, setIsDislike] = useState({
    isDisliked: reply.DislikedBy?.includes(dataContext?.data?._id) || false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ videoId, content, parentCommentId }) =>
      addComment(videoId, { content, parentCommentId }),

    onSuccess: ({ data }) => {
      setReplies((prev) => ({
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
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleAddComment = (commentId) => {
    mutate({
      videoId,
      content: replies[commentId],
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
    mutateDelete({
      videoId,
      commentId,
      content: replies[commentId],
    });
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

  useClickAway(emojiPickerRef, () => {
    if (!isEmojiButtonClicked) {
      setShowEmojiPicker(false);
      setActiveEmojiPickerId(null);
    }
    setIsEmojiButtonClicked(false);
  });

  const handleToggleOptions = () => {
    setActiveOptionsId((prev) => (prev === reply._id ? null : reply._id));
  };

  const handleCancelReplyButton = useCallback((id) => {
    setAddReply(null);
    setActiveEmojiPickerId(null);
    setReplies((prev) => ({
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

  return (
    <>
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
            {data.owner?.fullName
              ? reply.owner.fullName.charAt(0).toUpperCase()
              : "?"}
          </Avatar>
        }
        title={
          <Typography variant="body2" color="white">
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
                  <Box sx={{ position: "relative" }}>
                    <IconButton
                      onClick={() => toggleEmojiPicker(reply._id)}
                      sx={{ color: "#fff" }}
                    >
                      <SentimentSatisfiedAltIcon />
                    </IconButton>
                    {activeEmojiPickerId === reply._id && !showEmojiPicker && (
                      <EmojiPickerWrapper
                        onEmojiSelect={handleEmojiClick}
                        id={reply._id}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: "flex", gap: "8px" }}>
                    <Button
                      onClick={() => setIsEditable(null)}
                      variant="outlined"
                      sx={{ color: "white", textTransform: "capitalize" }}
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
              <Typography variant="body2" color="white" whiteSpace="pre-wrap">
                {reply.content}
              </Typography>
            )}
            <ButtonGroup sx={{ alignItems: "center", marginTop: 0.5 }}>
              {isLike.isLiked ? (
                <ThumbUpAltIcon
                  onClick={() => toggleLike(reply._id)}
                  sx={{
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: "1.3rem",
                  }}
                />
              ) : (
                <ThumbUpOffAltIcon
                  onClick={() => toggleLike(reply._id)}
                  sx={{
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: "1.3rem",
                  }}
                />
              )}

              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#aaa",
                  paddingLeft: "6px",
                  paddingRight: "16px",
                }}
              >
                {isLike.likeCount || "0"}
              </span>
              {isDislike.isDisliked ? (
                <ThumbDownAltIcon
                  onClick={() => toggleDislike(reply._id)}
                  sx={{
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: "1.3rem",
                  }}
                />
              ) : (
                <ThumbDownOffAltIcon
                  onClick={() => toggleDislike(reply._id)}
                  sx={{
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: "1.3rem",
                  }}
                />
              )}

              <Button
                onClick={() => {
                  setAddReply(reply._id);
                  setReplies((prev) => ({
                    ...prev,
                    [reply._id]: `@${reply.owner.username} `, // Pre-fill with mention
                  }));
                }}
                sx={{
                  fontSize: "0.75rem",
                  color: "#fff",
                  textTransform: "none",
                }}
              >
                Reply
              </Button>
            </ButtonGroup>
            {addReply === reply._id && (
              <>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    src={reply.owner?.avatar || null}
                    sx={{
                      bgcolor: getColor(reply.owner?.fullName || ""),
                      width: "30px",
                      height: "30px",
                    }}
                  >
                    {reply.owner?.fullName?.charAt(0).toUpperCase() || "?"}
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
                        value={replies[reply._id] || ""} // Use reply._id as the key
                        onChange={(e) =>
                          setReplies((prev) => ({
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
                      onClick={() => toggleEmojiPicker(reply._id)}
                      sx={{ color: "#fff" }}
                    >
                      <SentimentSatisfiedAltIcon />
                    </IconButton>
                    {activeEmojiPickerId === reply._id && !showEmojiPicker && (
                      <Box
                        ref={emojiPickerRef}
                        sx={{
                          position: "absolute",
                          left: "10px",
                          zIndex: 100,
                        }}
                      >
                        <EmojiPickerWrapper
                          onEmojiSelect={(emoji) =>
                            setReplies((prev) => ({
                              ...prev,
                              [reply._id]: (prev[reply._id] || "") + emoji,
                            }))
                          }
                          id={reply._id}
                        />
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", gap: "8px" }}>
                    <Button
                      onClick={() => handleCancelReplyButton(reply._id)}
                      variant="outlined"
                      sx={{
                        color: "white",
                        textTransform: "capitalize",
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleAddComment(reply._id)}
                      disabled={!reply}
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
            {activeOptionsId === reply._id && (
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
          </Box>
        }
      />
    </>
  );
}

export default React.memo(CommentReplies);
