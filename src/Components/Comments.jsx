import React, {
  useState,
  useRef,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { OpenContext } from "../routes/__root";

import {
  CardHeader,
  Avatar,
  ButtonGroup,
  Button,
  IconButton,
  Box,
  Typography,
  FormControl,
  MenuItem,
  Input,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OutlinedFlagOutlinedIcon from "@mui/icons-material/OutlinedFlagOutlined";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PersonIcon from "@mui/icons-material/Person";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { toggleCommentLike } from "../apis/likeFn";
import CircularProgress from "@mui/material/CircularProgress";
import { toggleCommentDislike } from "../apis/dislikeFn";
import SignInAlert from "./SignInAlert";
import Signin from "./Signin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EmojiPickerWrapper from "./EmojiPickerWrapper";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import formatDate from "../utils/formatDate";
import { addComment, updateComment, deleteComment } from "../apis/commentFn";
import { getColor } from "../utils/getColor";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CommentReplies from "./CommentReplies";
import { useClickAway } from "react-use";
import SimpleSnackbar from "./Snackbar";
import AlertDialog from "./Dialog";
import { useSnackbar } from "../Contexts/SnackbarContext";

const Comments = ({
  isAuthenticated,
  videoId,
  comment,
  showEmojiPicker,
  setShowEmojiPicker,
  activeEmojiPickerId,
  setActiveEmojiPickerId,
  activeOptionsId,
  setActiveOptionsId,
  activeAlertId,
  setActiveAlertId,
}) => {
  const queryClient = useQueryClient();
  const emojiPickerRef = useRef(null);
  const currentAlertId = `comments-${comment._id}`;
  const paperOpen = activeAlertId === currentAlertId;
  const likeAlertId = `comment-like-${comment._id}`;
  const dislikeAlertId = `comment-dislike-${comment._id}`;
  const isLikeAlertOpen = activeAlertId === likeAlertId;
  const isDislikeAlertOpen = activeAlertId === dislikeAlertId;
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const context = useContext(OpenContext);
  let { data: userData } = context;
  const userId = userData?.data?._id;
  const [replies, setReplies] = useState({});
  const [subReplies, setSubReplies] = useState({});
  const [showReplies, setShowReplies] = useState(null);
  const [addReply, setAddReply] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  
      const { showMessage } = useSnackbar();

  const [isLike, setIsLike] = useState({
    isLiked: comment?.LikedBy?.includes(userData?.data?._id) || false,
    likeCount: comment?.likesCount || 0,
  });
  const [isDislike, setIsDislike] = useState({
    isDisliked: comment?.DislikedBy?.includes(userData?.data?._id) || false,
  });

  const handleToggleOptions = () => {
    setActiveOptionsId((prev) => (prev === comment._id ? null : comment._id));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: ({ videoId, content, parentCommentId }) =>
      addComment(videoId, { content, parentCommentId }),

    onSuccess: ({ data }) => {
      setReplies((prev) => ({
        ...prev,
        [data.parentCommentId]: "",
      }));
      setAddReply(false);
      activeEmojiPickerId && setActiveEmojiPickerId(null);
      queryClient.refetchQueries(["commentsData", videoId]);
    },
    onError: (error) => {
      console.error(error);
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
      showMessage("Comment deleted");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleCloseAlert = () => {
    setActiveAlertId(null);
  };

  const handleReplyClick = (e, commentId) => {
    e.stopPropagation();
    if (isAuthenticated) {
      setAddReply(commentId);
    } else {
      setActiveAlertId(paperOpen ? null : currentAlertId);
    }
  };
  const handleAddComment = (commentId) => {
    mutate({
      videoId,
      content: subReplies[commentId],
      parentCommentId: commentId,
    });
    setShowReplies(commentId);
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
  const { mutate: toggleLikeMutation } = useMutation({
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
      console.error("error");
    },
  });

  const { mutate: toggleDislikeMutation } = useMutation({
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
    onError: () => {
      console.error("dislike error");
    },
  });

  const toggleEmojiPicker = useCallback(
    (e, id) => {
      e.stopPropagation();
      setActiveEmojiPickerId((prev) => (prev === id ? null : id));
      setShowEmojiPicker(false);
    },
    [activeEmojiPickerId]
  );

  useEffect(() => {
    console.log(activeEmojiPickerId);
  }, [activeEmojiPickerId]);
  const handleCancelReplyButton = useCallback((id) => {
    setAddReply(null);
    setActiveEmojiPickerId(null);
    setReplies((prev) => ({
      ...prev,
      [id]: "",
    }));
  }, []);

  const toggleLike = (id) => {
    if (isAuthenticated) {
      toggleLikeMutation(id);
    } else {
      setActiveAlertId(isLikeAlertOpen ? null : likeAlertId);
    }
  };

  const toggleDislike = (id) => {
    if (isAuthenticated) {
      toggleDislikeMutation(id);
    } else {
      setActiveAlertId(isDislikeAlertOpen ? null : dislikeAlertId);
    }
  };

  const handleEmojiClick = useCallback((emojiObject, id) => {
    setReplies((prev) => ({
      ...prev,
      [id]: (prev[id] || "") + emojiObject,
    }));
  }, []);

  //   useClickAway(emojiPickerRef, () => {

  //     setShowEmojiPicker(false);
  //     setActiveEmojiPickerId(null);
  // });

  return (
    <>
      {isSignIn && (
        <Box sx={{ zIndex: 9999, position: "fixed", top: 0, left: 0 }}>
          <Signin open={isSignIn} onClose={() => setIsSignIn(false)} />
        </Box>
      )}
      <CardHeader
        sx={{
          marginTop: 3,
          alignItems: "flex-start",
          alignSelf: "flex-end",
          padding: 0,
        }}
        avatar={
          <Avatar
            src={comment.owner?.avatar || null}
            sx={{ bgcolor: getColor(comment.owner?.fullName || "") }}
          >
            {comment.owner?.fullName
              ? comment.owner.fullName.charAt(0).toUpperCase()
              : "?"}
          </Avatar>
        }
        title={
          <Typography variant="body2" color="white">
            @{comment.owner?.username || "anonymous"}
            <span
              style={{ paddingLeft: "6px", fontSize: "0.8rem", color: "#aaa" }}
            >
              {formatDate(comment.createdAt)}
              {comment.isEdited && " (edited)"}
            </span>
          </Typography>
        }
        subheader={
          <>
            {isEditable === comment._id ? (
              <>
                <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                  <Input
                    multiline
                    value={replies[comment._id] || ""}
                    onChange={(e) =>
                      setReplies((prev) => ({
                        ...prev,
                        [comment._id]: e.target.value,
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
                  <Box ref={emojiPickerRef} sx={{ position: "relative" }}>
                    <IconButton
                      onClick={(e) => {
                        // Stop the event from propagating
                        toggleEmojiPicker(e, comment._id); // Toggle the emoji picker
                      }}
                      sx={{ color: "#fff" }}
                    >
                      <SentimentSatisfiedAltIcon />
                    </IconButton>
                    {activeEmojiPickerId === comment._id &&
                      !showEmojiPicker && (
                        <EmojiPickerWrapper
                          setActiveEmojiPickerId={setActiveEmojiPickerId}
                          onEmojiSelect={handleEmojiClick}
                          id={comment._id}
                        />
                      )}
                  </Box>

                  <Box sx={{ display: "flex", gap: "8px" }}>
                    <Button
                      onClick={() => setIsEditable(null)}
                      variant="outlined"
                      sx={{
                        color: "white",
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
                      onClick={() => handleUpdateComment(comment._id)}
                      disabled={!replies[comment._id]}
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
                {comment.content}
              </Typography>
            )}
            <ButtonGroup
              sx={{ alignItems: "center", marginTop: 0.5, marginLeft: "-8px" }}
            >
              <Box sx={{ position: "relative" }}>
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
                        onClick={() => toggleLike(comment._id)}
                        sx={{
                          cursor: "pointer",
                          color: "#f1f1f1",
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
                        onClick={() => toggleLike(comment._id)}
                        sx={{
                          cursor: "pointer",
                          color: "#fff",
                          fontSize: "1.3rem",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
                <SignInAlert
                  title="Like this video?"
                  desc="Sign in to make your opinion count"
                  isOpen={isLikeAlertOpen}
                  setIsOpen={handleCloseAlert}
                  setActiveAlertId={setActiveAlertId}
                  onConfirm={() => setIsSignIn(true)}
                  handleClose={handleCloseAlert}
                  leftVal="0px"
                />
              </Box>
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
              <Box sx={{ position: "relative" }}>
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
                        onClick={() => toggleDislike(comment._id)}
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
                        onClick={() => toggleDislike(comment._id)}
                        sx={{
                          cursor: "pointer",
                          color: "#fff",
                          fontSize: "1.3rem",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                )}
                <SignInAlert
                  title="Don’t like this video?"
                  desc="Sign in to make your opinion count"
                  isOpen={isDislikeAlertOpen}
                  setIsOpen={handleCloseAlert}
                  setActiveAlertId={setActiveAlertId}
                  onConfirm={() => setIsSignIn(true)}
                  handleClose={handleCloseAlert}
                  leftVal="0px"
                />
              </Box>
              <Box sx={{ position: "relative", padding: 0, marginLeft: "8px" }}>
                <Button
                  onClick={(e) => handleReplyClick(e, comment._id)}
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
                />
              </Box>
            </ButtonGroup>
            {addReply === comment._id && (
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
                        value={subReplies[comment._id] || ""}
                        onChange={(e) =>
                          setSubReplies((prev) => ({
                            ...prev,
                            [comment._id]: e.target.value,
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
                  <Box
                    ref={emojiPickerRef}
                    sx={{ position: "relative", marginLeft: "36px" }}
                  >
                    <IconButton
                      onClick={(e) => toggleEmojiPicker(e, comment._id)}
                      sx={{ color: "#fff" }}
                    >
                      <SentimentSatisfiedAltIcon />
                    </IconButton>
                    {activeEmojiPickerId === comment._id &&
                      !showEmojiPicker && (
                        <EmojiPickerWrapper
                          setActiveEmojiPickerId={setActiveEmojiPickerId}
                          onEmojiSelect={handleEmojiClick}
                          id={comment._id}
                        />
                      )}
                  </Box>

                  <Box sx={{ display: "flex", gap: "8px" }}>
                    <Button
                      onClick={() => handleCancelReplyButton(comment._id)}
                      variant="outlined"
                      sx={{
                        color: "white",
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
                      onClick={() => handleAddComment(comment._id)}
                      disabled={!subReplies[comment._id]}
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
            {comment.replies.length > 0 && (
              <Box>
                <Button
                  onClick={() =>
                    setShowReplies((prev) =>
                      prev === comment._id ? null : comment._id
                    )
                  }
                  sx={{
                    color: "#3ea6ff",
                    textTransform: "none",
                    borderRadius: "50px",

                    "&:hover": {
                      background: "#263850",
                    },
                  }}
                >
                  {" "}
                  {showReplies === comment._id ? (
                    <KeyboardArrowUpIcon
                      sx={{
                        color: "#3ea6ff",
                      }}
                    />
                  ) : (
                    <KeyboardArrowDownIcon sx={{ color: "#3ea6ff" }} />
                  )}
                  {comment.replies.length}{" "}
                  {comment.replies.length === 1 ? "reply" : "replies"}
                </Button>
              </Box>
            )}
            {comment.replies?.length > 0 &&
              showReplies === comment._id &&
              comment.replies?.map((reply) => (
                <CommentReplies
                  isAuthenticated={isAuthenticated}
                  videoId={videoId}
                  key={reply._id}
                  comment={comment}
                  userData={userData}
                  reply={reply}
                  toggleEmojiPicker={toggleEmojiPicker}
                  showEmojiPicker={showEmojiPicker}
                  activeEmojiPickerId={activeEmojiPickerId}
                  setActiveEmojiPickerId={setActiveEmojiPickerId}
                  activeOptionsId={activeOptionsId}
                  setActiveOptionsId={setActiveOptionsId}
                  activeAlertId={activeAlertId}
                  setActiveAlertId={setActiveAlertId}
                />
              ))}
          </>
        }
        action={
          <Box
            sx={{
              display: userId === comment.owner._id ? "block" : "none",
              position: "relative",
            }}
          >
            <IconButton onClick={handleToggleOptions} aria-label="settings">
              <MoreVertIcon sx={{ color: "#fff" }} />
            </IconButton>
            {activeOptionsId === comment._id &&
              userId === comment.owner._id && (
                <Box
                  id="create-menu"
                  sx={{
                    position: "absolute",
                    top: "35px",
                    right: isTablet ? "0" : "-93px",
                    borderRadius: "12px",
                    backgroundColor: "#282828",
                    zIndex: 2,
                    paddingY: 1,
                  }}
                >
                  <MenuItem
                    onClick={() => handleEditBtn(comment._id, comment.content)}
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
                    <Typography
                      variant="body2"
                      marginLeft="10px"
                      color="#f1f1f1"
                    >
                      Edit
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleDeleteComment(comment._id)}
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
                    <Typography
                      variant="body2"
                      marginLeft="10px"
                      color="#f1f1f1"
                    >
                      Delete
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

          </Box>
        }
      />
    </>
  );
};

export default React.memo(Comments);
