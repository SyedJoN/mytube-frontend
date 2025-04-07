import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toggleVideoLike } from "../apis/likeFn";
import { toggleVideoDislike } from "../apis/dislikeFn";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";

export const LikeDislikeButtons = React.memo(({ videoId, initialLikes, initialIsLiked, initialIsDisliked }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isDisliked, setIsDisliked] = useState(initialIsDisliked);
  const [likeCount, setLikeCount] = useState(initialLikes);

  const { mutate: likeMutate } = useMutation({
    mutationFn: () => toggleVideoLike(videoId),
    onMutate: () => {
      setIsLiked(prev => !prev);
      setLikeCount(prev => prev + (isLiked ? -1 : 1));
      if (isDisliked) setIsDisliked(false);
    }
  });

  const { mutate: dislikeMutate } = useMutation({
    mutationFn: () => toggleVideoDislike(videoId),
    onMutate: () => {
      setIsDisliked(prev => !prev);
      if (isLiked) {
        setIsLiked(false);
        setLikeCount(prev => Math.max(prev - 1, 0));
      }
    }
  });

  return (
    <ButtonGroup
    disableElevation
    variant="contained"
    color="rgba(255,255,255,0.1)"
    aria-label="Basic button group"
    sx={{
      background: "rgba(255,255,255,0.1)",
      borderRadius: "50px",
      fontSize: "0.8rem",
      textTransform: "capitalize",
      color: "#0f0f0f",
      fontWeight: "600",
      marginLeft: 2,
    }}>
      <Button 
      disableRipple
      sx={{
        paddingX: "12px",

        "&.MuiButtonGroup-firstButton": {
          borderRight: "1px solid rgba(255,255,255,0.2)",
          marginY: 1,
          paddingY: 0,
        },
      }}
      onClick={likeMutate}>
        {isLiked ? <ThumbUpAltIcon   sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}/> : <ThumbUpOffAltIcon  sx={{ color: "rgb(255,255,255)", marginRight: "8px" }}/>}
        <span style={{ color: "rgb(255,255,255)" }}>
        {likeCount}
                  </span>
       
      </Button>
      <Button
       disableRipple
       onClick={dislikeMutate}
       sx={{
         paddingX: "12px",
         paddingY: 0,
         marginY: 1,
       }}
      >
        {isDisliked ? <ThumbDownAltIcon   sx={{ color: "rgb(255,255,255)", marginRight: "8px" }} /> : <ThumbDownOffAltIcon   sx={{ color: "rgb(255,255,255)", marginRight: "8px" }} />}
      </Button>
    </ButtonGroup>
  );
});