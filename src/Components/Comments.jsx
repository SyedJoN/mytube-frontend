import React, {
  useState,
  useRef,
  lazy,
  Suspense,
  useContext,
  useEffect,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import formatDate from "../utils/dayjs";
import { useClickAway } from "react-use";

import {
  deepPurple,
  indigo,
  blue,
  teal,
  green,
  amber,
  orange,
  red,
} from "@mui/material/colors";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CommentReplies from "./CommentReplies";

const Comments = ({
  videoId,
  data,
  activeEmojiPickerId,
  setActiveEmojiPickerId,
  showEmojiPicker,
  setShowEmojiPicker,
}) => {

  const context = useContext(OpenContext);
  let { data: dataContext } = context;
  const [replies, setReplies] = useState({}); // Stores reply text for each comment
  const [showReplies, setShowReplies] = useState(null);
  const [addReply, setAddReply] = useState(null);
  const [isLike, setIsLike] = useState({
    isLiked: data.LikedBy?.includes(dataContext?.data?._id) || false,
    likeCount: data.likesCount || 0, 
  });
  const [isDislike, setIsDislike] = useState({
    isDisliked: data.DislikedBy?.includes(dataContext?.data?._id) || false,
  }
  );
  const emojiPickerRef = useRef(null);
  const queryClient = useQueryClient();
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
  
    onSuccess: () => {
      queryClient.invalidateQueries(["commentsData", videoId]);
    },
    onError: () => {
      console.error("error");
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
      console.error("dislike error");
    },
  });

  const toggleEmojiPicker = (id) => {
    setActiveEmojiPickerId((prev) => (prev === id ? null : id));
    setShowEmojiPicker(false);
  };

  const handleCancelReplyButton = (id) => {
    setAddReply(null);
    setActiveEmojiPickerId(null);
    setReplies((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  const toggleLike = (id) => {

    toggleLikeMutation(id);
  };

  const toggleDislike = (id) => {

    toggleDislikeMutation(id);
  };


  function getColor(name = "") {
    const colors = [
      deepPurple[500],
      indigo[500],
      blue[500],
      teal[500],
      green[500],
      amber[500],
      orange[500],
      red[500],
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length] || blue[500];
  }

  const handleEmojiClick = (emojiObject, id) => {
    setReplies((prev) => ({
      ...prev,
      [id]: (prev[id] || "") + emojiObject.emoji,
    }));
  };
  useClickAway(emojiPickerRef, () => setActiveEmojiPickerId(null));

  return (
    <CardHeader
      sx={{
        marginTop: 3,
        alignItems: "flex-start",
        alignSelf: "flex-end",
        padding: 0,
      }}
      avatar={
        <Avatar
          src={data.owner?.avatar || null}
          sx={{ bgcolor: getColor(data.owner?.fullName || "") }}
        >
          {data.owner?.fullName
            ? data.owner.fullName.charAt(0).toUpperCase()
            : "?"}
        </Avatar>
      }
      title={
        <Typography variant="body2" color="white">
          @{data.owner?.username || "anonymous"}
          <span
            style={{ paddingLeft: "6px", fontSize: "0.8rem", color: "#aaa" }}
          >
            {formatDate(data.createdAt)}
            {data.isEdited && " (edited)"}
          </span>
        </Typography>
      }
      subheader={
        <>
          <Typography variant="body2" color="white" whiteSpace="pre-wrap">
            {data.content}
          </Typography>

          <ButtonGroup sx={{ alignItems: "center", marginTop: 0.5 }}>
            {isLike.isLiked ? (
              <ThumbUpAltIcon
                onClick={() => toggleLike(data._id)}
                sx={{
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: "1.3rem",
                }}
              />
            ) : (
              <ThumbUpOffAltIcon
                onClick={() => toggleLike(data._id)}
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
                onClick={() => toggleDislike(data._id)}
                sx={{
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: "1.3rem",
                }}
              />
            ) : (
              <ThumbDownOffAltIcon
                onClick={() => toggleDislike(data._id)}
                sx={{
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: "1.3rem",
                }}
              />
            )}
            <Button
              onClick={() => setAddReply(data._id)}
              sx={{ fontSize: "0.75rem", color: "#fff", textTransform: "none" }}
            >
              Reply
            </Button>
          </ButtonGroup>
          {addReply === data._id && (
            <>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={data.owner?.avatar || null}
                  sx={{
                    bgcolor: getColor(data.owner?.fullName || ""),
                    width: "30px",
                    height: "30px",
                  }}
                >
                  {data.owner?.fullName?.charAt(0).toUpperCase() || "?"}
                </Avatar>
                <FormControl fullWidth sx={{ m: 1 }} variant="standard">
                  <Input
                    multiline
                    value={replies[data._id] || ""} // Use reply._id as the key
                    onChange={(e) =>
                      setReplies((prev) => ({
                        ...prev,
                        [data._id]: e.target.value, // Only update this specific reply
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
                    onClick={() => toggleEmojiPicker(data._id)}
                    sx={{ color: "#fff" }}
                  >
                    <SentimentSatisfiedAltIcon />
                  </IconButton>
                  {activeEmojiPickerId === data._id && !showEmojiPicker && (
                    <Box
                      ref={emojiPickerRef}
                      sx={{ position: "absolute", left: "10px", zIndex: 100 }}
                    >
                      <Suspense fallback={<div>Loading emojis...</div>}>
                        <LazyEmojiPicker
                          onEmojiClick={(emojiObject) =>
                            handleEmojiClick(emojiObject, data._id)
                          }
                        />
                      </Suspense>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: "flex", gap: "8px" }}>
                  <Button
                    onClick={() => handleCancelReplyButton(data._id)}
                    variant="outlined"
                    sx={{ color: "white", textTransform: "capitalize" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={!replies[data._id]}
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
          {data.replies.length > 0 && (
            <Box>
              <Button
                onClick={() =>
                  setShowReplies((prev) =>
                    prev === data._id ? null : data._id
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
                {showReplies === data._id ? (
                  <KeyboardArrowUpIcon
                    sx={{
                      color: "#3ea6ff",
                    }}
                  />
                ) : (
                  <KeyboardArrowDownIcon sx={{ color: "#3ea6ff" }} />
                )}
                {data.replies.length}{" "}
                {data.replies.length === 1 ? "reply" : "replies"}
              </Button>
            </Box>
          )}
          {data.replies?.length > 0 &&
           showReplies === data._id &&
            data.replies?.map((reply) => (
            
             <CommentReplies key={reply._id} data={data} dataContext={dataContext} reply={reply} addReply={addReply} setAddReply={setAddReply} replies={replies} setReplies={setReplies} activeEmojiPickerId={activeEmojiPickerId} setActiveEmojiPickerId={setActiveEmojiPickerId} toggleEmojiPicker={toggleEmojiPicker} showEmojiPicker={showEmojiPicker} handleCancelReplyButton={handleCancelReplyButton}/>
             
            ))}
        </>
      }
      action={
        <IconButton aria-label="settings">
          <MoreVertIcon sx={{ color: "#fff" }} />
        </IconButton>
      }
    />
  );
};

export default Comments;
