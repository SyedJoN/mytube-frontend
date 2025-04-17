import React from "react";
import Box from "@mui/material/Box";
import MyEmojiPicker from "./EmojiPicker";
import ClickAwayListener from '@mui/material/ClickAwayListener';

const EmojiPickerWrapper = React.memo(({ setActiveEmojiPickerId, onEmojiSelect, id }) => (
  <ClickAwayListener onClickAway={() => setActiveEmojiPickerId(null)}>
     <Box sx={{ position: "absolute", left: "10px", zIndex: 100 }}>
    <MyEmojiPicker onEmojiSelect={(emoji) => onEmojiSelect(emoji, id)} />
  </Box>
  </ClickAwayListener>
 
));

export default EmojiPickerWrapper;
