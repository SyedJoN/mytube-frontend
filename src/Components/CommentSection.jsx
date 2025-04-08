import React, { useState } from "react";
import AddComment from "./AddComment";
import Comments from "./Comments";
import { useQuery } from "@tanstack/react-query";
import { getVideoComments } from "../apis/commentFn";
import Box from "@mui/material/Box";

function CommentSection({ videoId, data }) {
  const [activeOptionsId, setActiveOptionsId] = useState(null);
  const [activeEmojiPickerId, setActiveEmojiPickerId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const {
    data: commentsData,
    isLoading: isCommentLoading,
    isError: isCommentError,
    error: commentError,
  } = useQuery({
    queryKey: ["commentsData", videoId],
    queryFn: () => getVideoComments(videoId),
    enabled: !!videoId, // ✅ Fetch only if videoId exists
  });

  return (
    <>
      <AddComment
        videoId={videoId}
        data={data}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        activeEmojiPickerId={activeEmojiPickerId}
        setActiveEmojiPickerId={setActiveEmojiPickerId}
      />

      <Box>
        {commentsData?.map((comments) => (
          <Comments
            videoId={videoId}
            key={comments._id}
            data={comments}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            activeEmojiPickerId={activeEmojiPickerId}
            setActiveEmojiPickerId={setActiveEmojiPickerId}
            activeOptionsId={activeOptionsId}
            setActiveOptionsId={setActiveOptionsId}
          />
        ))}
      </Box>
    </>
  );
}

export default React.memo(CommentSection);
