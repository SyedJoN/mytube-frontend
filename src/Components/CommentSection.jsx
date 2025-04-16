import React, { useState } from "react";
import AddComment from "./AddComment";
import Comments from "./Comments";
import { useQuery } from "@tanstack/react-query";
import { getVideoComments } from "../apis/commentFn";
import Box from "@mui/material/Box";

function CommentSection({
  videoId,
  isAuthenticated,
  activeAlertId,
  setActiveAlertId,
}) {
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
        isAuthenticated={isAuthenticated}
        videoId={videoId}
        commentsData={commentsData}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        activeEmojiPickerId={activeEmojiPickerId}
        setActiveEmojiPickerId={setActiveEmojiPickerId}
        activeAlertId={activeAlertId}
        setActiveAlertId={setActiveAlertId}
      />

      <Box>
        {commentsData?.map((comment) => (
          <Comments
            isAuthenticated={isAuthenticated}
            videoId={videoId}
            key={comment._id}
            comment={comment}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            activeEmojiPickerId={activeEmojiPickerId}
            setActiveEmojiPickerId={setActiveEmojiPickerId}
            activeOptionsId={activeOptionsId}
            setActiveOptionsId={setActiveOptionsId}
            activeAlertId={activeAlertId}
            setActiveAlertId={setActiveAlertId}
          />
        ))}
      </Box>
    </>
  );
}

export default React.memo(CommentSection);
