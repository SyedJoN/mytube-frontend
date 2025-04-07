import React, {
  useRef,
  useState,
  lazy,
  Suspense,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { Box, Typography } from "@mui/material";
import CardHeader from "@mui/material/CardHeader";
import EmojiPickerWrapper from "./EmojiPickerWrapper";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
const LazyEmojiPicker = lazy(() => import("emoji-picker-react"));
import { useClickAway } from "react-use";

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
  data,
  activeEmojiPickerId,
  setActiveEmojiPickerId,
  showEmojiPicker,
  setShowEmojiPicker

}) {
  const emojiPickerRef = useRef(null);
  const [addComment, setAddComment] = useState(false);
  const [comment, setComment] = useState("");
  const [isEmojiButtonClicked, setIsEmojiButtonClicked] = useState(false);
  const MemoizedLazyEmojiPicker = React.memo(LazyEmojiPicker);

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

  const toggleEmojiPicker = () => {
    setIsEmojiButtonClicked(true);
    setShowEmojiPicker((prev) => !prev);
    setActiveEmojiPickerId(null);

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

  useClickAway(emojiPickerRef, () => {
    if (!isEmojiButtonClicked) {
      // Only close if emoji button was not clicked
      setShowEmojiPicker(false);
      setActiveEmojiPickerId(null); // Reset active emoji picker ID
    }
    setIsEmojiButtonClicked(false); // Reset the button click state
  });

  return (
    <Box marginTop="12px">
      <Typography variant="h3" color="rgb(255,255,255)">
        1,962 Comments
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
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
              src={data?.data?.owner?.avatar ? data?.data?.owner?.avatar : null}
              sx={{ bgcolor: getColor(data?.data?.owner?.fullName) }}
            >
              {data?.data?.owner?.fullName
                ? data?.data?.owner?.fullName.charAt(0).toUpperCase()
                : "?"}
            </Avatar>
          }
        ></CardHeader>
        <FormControl fullWidth sx={{ m: 1 }} variant="standard">
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
            onClick={() => setAddComment(true)}
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
        {addComment && (
          <Box sx={{ position: "relative", marginLeft: "48px" }}>
            <IconButton onClick={toggleEmojiPicker} sx={{ color: "#fff" }}>
              <SentimentSatisfiedAltIcon />
            </IconButton>
            {showEmojiPicker && !activeEmojiPickerId && (
              <Box
                ref={emojiPickerRef}
                sx={{ position: "absolute", left: "10px", zIndex: 100 }}
              >
               
                <EmojiPickerWrapper
                      onEmojiSelect={handleEmojiClick}
                      id={data._id}
                    />
           
              </Box>
            )}
          </Box>
        )}

        {addComment && (
          <Box sx={{ display: "flex", gap: "8px" }}>
            <Button
              onClick={handleCancelButton}
              variant="outlined"
              sx={{
                color: "rgb(255,255,255)",
                borderRadius: "50px",
                textTransform: "capitalize",
                paddingY: 1,
                "&:hover": {
                  background: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
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
  );
}

export default React.memo(AddComment);
