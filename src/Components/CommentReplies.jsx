import React, {
  useState,
  useRef,
  lazy,
  Suspense,
  useCallback,
} from "react";

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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
const LazyEmojiPicker = lazy(() => import("emoji-picker-react"));
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { toggleCommentLike } from "../apis/likeFn";
import { toggleCommentDislike } from "../apis/dislikeFn";
import EmojiPickerWrapper from "./EmojiPickerWrapper";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import formatDate from "../utils/dayjs";
import { getColor } from "../utils/getColor";
import { useClickAway } from "react-use";

;

function CommentReplies({
  data,
  reply,
  dataContext,
  toggleEmojiPicker,
  showEmojiPicker,
  setShowEmojiPicker,
  activeEmojiPickerId,
  setActiveEmojiPickerId

}) {
  const queryClient = useQueryClient();
  const emojiPickerRef = useRef(null);
  const [isEmojiButtonClicked, setIsEmojiButtonClicked] = useState(false);
  const [addReply, setAddReply] = useState(null);
  const [replies, setReplies] = useState({});
   

  const [isLike, setIsLike] = useState({
    isLiked: reply.LikedBy?.includes(dataContext?.data?._id) || false,
    likeCount: reply.likesCount || 0,
  });
  const [isDislike, setIsDislike] = useState({
    isDisliked: reply.DislikedBy?.includes(dataContext?.data?._id) || false,
  });

  useClickAway(emojiPickerRef, () => {
    if (!isEmojiButtonClicked) {
      setShowEmojiPicker(false);
      setActiveEmojiPickerId(null);
    }
    setIsEmojiButtonClicked(false);
  });


  //  const toggleEmojiPicker = useCallback((id) => {
  //     setIsEmojiButtonClicked(true);
  //     setActiveEmojiPickerId((prev) => (prev === id ? null : id));
  //     setShowEmojiPicker(false);
  //   }, []);

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
            <Typography variant="body2" color="white" whiteSpace="pre-wrap">
              {reply.content}
            </Typography>

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
                          borderBottom: "2px solid rgb(255,255,255) !important",
                        },
                      }}
                    />
                  </FormControl>
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
                          [reply._id]:
                            (prev[reply._id] || "") + emoji,
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
          <IconButton aria-label="settings">
            <MoreVertIcon sx={{ color: "#fff" }} />
          </IconButton>
        }
      />
    </>
  );
}

export default React.memo(CommentReplies);
