import React, {
  useRef,
  useState,
  lazy,
  Suspense,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { Box, Typography } from "@mui/material";
import CardHeader from "@mui/material/CardHeader";
import EmojiPickerWrapper from "./EmojiPickerWrapper";
import SignInAlert from "./SignInAlert";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import Avatar from "@mui/material/Avatar";
import { addComment } from "../apis/commentFn";
import { OpenContext } from "../routes/__root";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import PersonIcon from "@mui/icons-material/Person";
import FormControl from "@mui/material/FormControl";
const LazyEmojiPicker = lazy(() => import("emoji-picker-react"));
import { useClickAway } from "react-use";
import Signin from "./Signin";

import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import TextField from "@mui/material/TextField";
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
import IconButton from "@mui/material/IconButton";

const preloadEmojiPicker = () => {
  import("emoji-picker-react");
};
function AddComment({
  isAuthenticated,
  videoId,
  commentsData,
  activeEmojiPickerId,
  setActiveEmojiPickerId,
  showEmojiPicker,
  setShowEmojiPicker,
  activeAlertId,
  setActiveAlertId,
}) {
  const currentAlertId = `addComment-${videoId}`;
  const paperOpen = activeAlertId === currentAlertId;
  const queryClient = useQueryClient();
  const context = useContext(OpenContext);
  let { data: userData } = context;

  const emojiPickerRef = useRef(null);
  const [addCommentBox, setAddComment] = useState(false);
  const [comment, setComment] = useState("");
  const [isSignIn, setIsSignIn] = useState(false);

  const colorPalette = useMemo(
    () => [
      deepPurple[500],
      indigo[500],
      blue[500],
      teal[500],
      green[500],
      amber[500],
      orange[500],
      red[500],
    ],
    []
  );

  const { mutate, isPending } = useMutation({
    mutationFn: ({ videoId, content }) => addComment(videoId, { content }),

    onSuccess: () => {
      setComment("");
      setAddComment(false);
      queryClient.refetchQueries(["commentsData", videoId]);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleCloseAlert = () => {
    if (paperOpen) setActiveAlertId(null);
  };

  const toggleEmojiPicker = () => {
    if (showEmojiPicker === null) {
      setShowEmojiPicker(true)
    } else {
      setShowEmojiPicker((prev) => !prev);
      setActiveEmojiPickerId(null);

    }
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
    if (isAuthenticated) {
      setAddComment(true);
    } else {
      setActiveAlertId(paperOpen ? null : currentAlertId);
    }
  };

  const handleAddComment = (comment) => {
    mutate({ videoId, content: comment });
    setShowEmojiPicker(false);
  };

  const handleInputChange = (e) => {
    setComment(e.target.value);
  };

  const handleEmojiClick = useCallback((emojiData) => {
    setComment((prev) => prev + emojiData);
  }, []);

  const handleCancelButton = () => {
    setAddComment(false);
    setComment("");
    setShowEmojiPicker(false);
  };
  function getColor(name = "") {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index] || blue[500]; // Default to blue if something goes wrong
  }

  return (
    <>
      {isSignIn && (
        <Box sx={{ zIndex: 9999, position: "fixed", top: 0, left: 0 }}>
          <Signin open={isSignIn} onClose={() => setIsSignIn(false)} />
        </Box>
      )}
      <Box marginTop="24px">
        <Typography variant="h6" color="rgb(255,255,255)" fontWeight={600}>
          {commentsData?.length} Comments
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", marginTop: "-6px" }}>
          <CardHeader
            sx={{
              alignItems: "flex-start",
              alignSelf: "flex-end",
              padding: 0,
              "& .MuiCardHeader-content": {
                overflow: "hidden",
                minWidth: 0,
              },
              "& .css-1r9wl67-MuiCardHeader-avatar": {
                marginRight: "12px",
              },
            }}
            avatar={
              <Avatar
                src={userData?.data?.avatar ? userData?.data?.avatar : null}
                sx={{
                  bgcolor: userData
                    ? getColor(userData?.data?.fullName)
                    : "rgba(168, 199, 250 , 1)",
                  overflow: "hidden",
                }}
              >
                {userData?.data?.fullName ? (
                  userData?.data?.fullName.charAt(0).toUpperCase()
                ) : (
                  <PersonIcon
                    sx={{
                      color: "rgb(38, 121, 254)",
                      width: "35px",
                      height: "35px",
                    }}
                  />
                )}
              </Avatar>
            }
          ></CardHeader>
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
            <FormControl
              sx={{ position: "relative", m: 1 }}
              fullWidth
              variant="standard"
            >
              <InputLabel
                disabled={comment !== ""}
                shrink
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "1.1rem",
                  transform: "translate(0, 23.5px) scale(0.75)",
                }}
                htmlFor="standard-adornment-amount"
              >
                Add a comment...
              </InputLabel>
              <Input
                multiline
                value={comment}
                onChange={handleInputChange}
                onClick={(e) => handleInputClick(e)}
                id="standard-adornment-amount"
                sx={{
                  "&::before": {
                    borderBottom: "1px solid #717171 !important",
                  },
                  "&::after": {
                    borderBottom: "2px solid rgb(255,255,255) !important",
                  },
                  "& textarea": {
                    color: "rgb(255,255,255) !important",
                  },
                  "&input:-webkit-autofill": {
                    WebkitBoxShadow: "0 0 0px 1000px #0f0f0f inset",
                    WebkitTextFillColor: "#fff !important",
                  },
                  "& input:-webkit-autofill:hover": {
                    WebkitTextFillColor: "#fff !important",
                  },
                }}
              />
              <SignInAlert
                height="140"
                title="Sign in to continue"
                isOpen={paperOpen}
                handleClose={handleCloseAlert}
                setActiveAlertId={setActiveAlertId}
                onConfirm={() => setIsSignIn(true)}
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
          {addCommentBox && (
            <Box
              ref={emojiPickerRef}
              sx={{ position: "relative", marginLeft: "48px" }}
            >
              <IconButton onClick={toggleEmojiPicker} sx={{ color: "#fff" }}>
                <SentimentSatisfiedAltIcon />
              </IconButton>
              {showEmojiPicker && !activeEmojiPickerId && (
                <Box sx={{ position: "absolute", left: "10px", zIndex: 100 }}>
                  <EmojiPickerWrapper  setActiveEmojiPickerId={setShowEmojiPicker} onEmojiSelect={handleEmojiClick} />
                </Box>
              )}
            </Box>
          )}

          {addCommentBox && (
            <Box sx={{ display: "flex", gap: "8px" }}>
              <Button
                onClick={handleCancelButton}
                variant="outlined"
                sx={{
                  color: "rgb(255,255,255)",
                  borderRadius: "50px",
                  textTransform: "capitalize",
                  paddingY: 1,
                  transition: "none",
                  "&:hover": {
                    background: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAddComment(comment)}
                disabled={comment === ""}
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
                Comment
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

export default React.memo(AddComment);
