import React from "react";
import Box from "@mui/material/Box";
import MyEmojiPicker from "./EmojiPicker";

const EmojiPickerWrapper = React.memo(({ onEmojiSelect, id }) => (
  <Box sx={{ position: "absolute", left: "10px", zIndex: 100 }}>
    <MyEmojiPicker onEmojiSelect={(emoji) => onEmojiSelect(emoji, id)} />
  </Box>
));

export default EmojiPickerWrapper;
