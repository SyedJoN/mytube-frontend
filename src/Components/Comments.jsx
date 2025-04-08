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
import MyEmojiPicker from "./EmojiPicker";

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
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
const LazyEmojiPicker = lazy(() => import("emoji-picker-react"));
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { toggleCommentLike } from "../apis/likeFn";
import CircularProgress from "@mui/material/CircularProgress";
import { toggleCommentDislike } from "../apis/dislikeFn";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EmojiPickerWrapper from "./EmojiPickerWrapper";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import formatDate from "../utils/dayjs";
import { addComment } from "../apis/commentFn";
import { useClickAway } from "react-use";
import { getColor } from "../utils/getColor";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CommentReplies from "./CommentReplies";


import AddIcon from "@mui/icons-material/Add";
import SlideshowOutlinedIcon from "@mui/icons-material/SlideshowOutlined";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";

const Comments = ({
  videoId,
  data,
  showEmojiPicker,
  setShowEmojiPicker,
  activeEmojiPickerId,
  setActiveEmojiPickerId,
  activeOptionsId,
  setActiveOptionsId
}) => {
  const queryClient = useQueryClient();

  const context = useContext(OpenContext);
  let { data: dataContext } = context;
  const [replies, setReplies] = useState({}); // Stores reply text for each comment
  const [showReplies, setShowReplies] = useState(null);
  const [addReply, setAddReply] = useState(null);
  const [isEmojiButtonClicked, setIsEmojiButtonClicked] = useState(false);

  const [isLike, setIsLike] = useState({
    isLiked: data.LikedBy?.includes(dataContext?.data?._id) || false,
    likeCount: data.likesCount || 0,
  });
  const [isDislike, setIsDislike] = useState({
    isDisliked: data.DislikedBy?.includes(dataContext?.data?._id) || false,
  });


  const handleToggleOptions = () => {
    setActiveOptionsId((prev) => (prev === data._id ? null : data._id));
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
      setActiveEmojiPickerId(null);
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
    setShowReplies(commentId);
   
  };

  const emojiPickerRef = useRef(null);
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
    onError: () => {
      console.error("dislike error");
    },
  });

  const toggleEmojiPicker = useCallback((id) => {
    setIsEmojiButtonClicked(true);
    setActiveEmojiPickerId((prev) => (prev === id ? null : id));
    setShowEmojiPicker(false);
  }, []);

  const handleCancelReplyButton = useCallback((id) => {
    setAddReply(null);
    setActiveEmojiPickerId(null);
    setReplies((prev) => ({
      ...prev,
      [id]: "",
    }));
  }, []);

  const toggleLike = (id) => {
    toggleLikeMutation(id);
  };

  const toggleDislike = (id) => {
    toggleDislikeMutation(id);
  };

  const handleEmojiClick = useCallback((emojiObject, id) => {
    setReplies((prev) => ({
      ...prev,
      [id]: (prev[id] || "") + emojiObject,
    }));
  }, []);

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
                      value={replies[data._id] || ""}
                      onChange={(e) =>
                        setReplies((prev) => ({
                          ...prev,
                          [data._id]: e.target.value,
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
                    onClick={() => toggleEmojiPicker(data._id)}
                    sx={{ color: "#fff" }}
                  >
                    <SentimentSatisfiedAltIcon />
                  </IconButton>
                  {activeEmojiPickerId === data._id && !showEmojiPicker && (
                    <EmojiPickerWrapper
                      onEmojiSelect={handleEmojiClick}
                      id={data._id}
                    />
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
                    onClick={() => handleAddComment(data._id)}
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
              <CommentReplies
                videoId={videoId}
                key={reply._id}
                data={data}
                dataContext={dataContext}
                reply={reply}
                toggleEmojiPicker={toggleEmojiPicker}
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                activeEmojiPickerId={activeEmojiPickerId}
                setActiveEmojiPickerId={setActiveEmojiPickerId}
                activeOptionsId={activeOptionsId}
                setActiveOptionsId={setActiveOptionsId}
              />
            ))}
        </>
      }
      action={
        <Box sx={{position: "relative"}}>
        <IconButton onClick={handleToggleOptions} aria-label="settings">
          <MoreVertIcon sx={{ color: "#fff" }} />
        </IconButton>
        {activeOptionsId === data._id && 
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
          <EditOutlinedIcon sx={{color: "#f1f1f1"}} />
           <Typography variant="body2" marginLeft="10px" color="#f1f1f1">
             Edit
           </Typography>
         </MenuItem>
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
           <DeleteOutlinedIcon sx={{color: "#f1f1f1"}} />
           <Typography variant="body2" marginLeft="10px" color="#f1f1f1">
             Delete
           </Typography>
         </MenuItem>
      
       </Box>
        }
          
         </Box>
      }
      
    />
   
 
  );
};

export default React.memo(Comments);
