import React, { useState, forwardRef, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MorphingIcon } from "../Utils/IconMorph";
import { Box, IconButton, Tooltip, Typography, CardMedia } from "@mui/material";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import formatDuration from "../../utils/formatDuration";

const VideoControls = forwardRef(
  (
    {
      playlistId,
      bufferedPercent,
      filteredVideos,
      progress,
      setProgress,
      isPlaying,
      togglePlayPause,
      playlistVideos,
      index,
      isUserInteracted,
    },
    videoRef
  ) => {
    const navigate = useNavigate();
    var thumbWidth = 13;
    const sliderRef = useRef(null);
    const volumeSliderRef = useRef(null);
    const prevVolumeRef = useRef(null);
    
    const [volume, setVolume] = useState(40);
    const [BarWidth, setBarWidth] = useState(0);
    const [videoWidth, setVideoWidth] = useState(0);
    const [volumeMuted, setVolumeMuted] = useState(false);
    const handleSeekMove = (e) => {
      if (!sliderRef.current || !videoRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newProgress = Math.min(
        Math.max((offsetX / rect.width) * 100, 0),
        100
      );

      const newTime = (videoRef.current?.duration * newProgress) / 100;
      videoRef.current.currentTime = newTime;
      setProgress(newProgress);
    };

    const handleSeekEnd = () => {
      window.removeEventListener("mousemove", handleSeekMove);
      window.removeEventListener("mouseup", handleSeekEnd);
    };

    const handleSeekStart = (e) => {
      e.preventDefault();
      window.addEventListener("mousemove", handleSeekMove);
      window.addEventListener("mouseup", handleSeekEnd);
    };

    const handleClickSeek = (e) => {
      if (!sliderRef.current || !videoRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newProgress = Math.min(
        Math.max((offsetX / rect.width) * 100, 0),
        100
      );

      const newTime = (videoRef.current?.duration * newProgress) / 100;
      videoRef.current.currentTime = newTime;
      setProgress(newProgress);
    };

    const handleNext = () => {
      if (!videoRef.current) return;
      navigate({
        to: "/watch",
        search: {
          v: filteredVideos[0]?._id,
        },
      });
    };
    const handleNextPlaylist = () => {
      if (index >= playlistVideos.length - 1) return;
      navigate({
        to: "/watch",
        search: {
          v: playlistVideos[index + 1]._id,
          list: playlistId,
          index: index + 2,
        },
      });
    };
    // const handlePrev = () => {
    //   if (!videoRef.current) return;
    //   videoRef.current.currentTime -= 5;
    //   videoRef.current.play();
    // };

    const handlePrevPlaylist = () => {
      if (index <= 0) return;
      navigate({
        to: "/watch",
        search: {
          v: playlistVideos[index - 1]._id,
          list: playlistId,
          index: index,
        },
      });
    };
    useEffect(() => {
      if (!sliderRef.current || !videoRef.current) return;

      const updateSizes = () => {
        const rect = sliderRef.current.getBoundingClientRect();
        setBarWidth(rect.width);
        setVideoWidth(videoRef.current.offsetWidth - 24);
      };

      updateSizes(); 

      const observer = new ResizeObserver(updateSizes);
      observer.observe(sliderRef.current);
      observer.observe(videoRef.current);

      window.addEventListener("resize", updateSizes);

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", updateSizes);
      };
    }, []);

    // Volume

    const handleVolumeMove = (e) => {
      if (!volumeSliderRef.current || !videoRef.current) return;
      setShowVolumePanel(true);

      const rect = volumeSliderRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newVolume = Math.min(Math.max(offsetX / rect.width, 0), 1); // volume range: 0 to 1

      videoRef.current.volume = newVolume;
      setVolume(Math.ceil(newVolume * 40));
    };

    const handleVolumeEnd = () => {
      window.removeEventListener("mousemove", handleVolumeMove);
      window.removeEventListener("mouseup", handleVolumeEnd);
    };

    const handleVolumeStart = (e) => {
      e.preventDefault();
      window.addEventListener("mousemove", handleVolumeMove);
      window.addEventListener("mouseup", handleVolumeEnd);
    };

    const handleVolumeClick = (e) => {
      if (!volumeSliderRef.current || !videoRef.current) return;

      const rect = volumeSliderRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newVolume = Math.min(Math.max(offsetX / rect.width, 0), 1);

      videoRef.current.volume = newVolume;
      setVolume(Math.ceil(newVolume * 40));
    };

    const handleVolumeHover = (e) => {
      setShowVolumePanel(true);
      console.log(e.clientX);
    };

   const handleVolumeToggle = () => {
  const video = videoRef.current;
  if (!video) return;

  if (!volumeMuted) {
 
    prevVolumeRef.current = video.volume;
    video.volume = 0;
    setVolume(0);
    setVolumeMuted(true);
  } else {
  
    const restoreVolume = prevVolumeRef.current > 0 ? prevVolumeRef.current : 1;
    video.volume = restoreVolume;
    setVolume(Math.ceil(restoreVolume * 40)); 
    setVolumeMuted(false);
  }
};

    const [showVolumePanel, setShowVolumePanel] = useState(false);
    return (
      <>
        <div
          className="video-controls"
          style={{
            position: "absolute",
            opacity: !isUserInteracted || showVolumePanel || !isPlaying ? 1 : 0,
            width: `${videoWidth}px`,
            transition: "opacity .25s cubic-bezier(0,0,.2,1)",
            bottom: 0,
            height: "48px",
            paddingTop: "3px",
            textAlign: "left",
            left: "12px",
            borderRadius: "3px",
            zIndex: 59,
          }}
        >
          <div
            sx={{
              opacity: !isPlaying ? 1 : 0,
            }}
            className="controls-background-overlay"
          ></div>
          <Box sx={{ display: "flex", height: "100%" }}>
            {playlistId && index > 0 && (
              <IconButton
                disableRipple
                onClick={handlePrevPlaylist}
                sx={{ color: "#f1f1f1" }}
              >
                <SkipPreviousIcon sx={{ width: "1.25em", height: "1.25em" }} />
              </IconButton>
            )}
            <IconButton
              disableRipple
              onClick={togglePlayPause}
              sx={{ color: "#f1f1f1", padding: 0 }}
            >
              <MorphingIcon isPlaying={isPlaying} />
            </IconButton>
            <Tooltip
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [60, 0],
                      },
                    },
                  ],
                },
                tooltip: {
                  sx: {
                    whiteSpace: "nowrap",
                    backgroundColor: "rgba(26,25,25,255)",
                    fontSize: "0.75rem",
                    borderRadius: "16px",
                    padding: "0",
                  },
                },
              }}
              sx={{ padding: "0!important", margin: "0!important" }}
              title={
                <Box
                  sx={{
                    position: "relative",
                    width: 240,
                    padding: "0 2px 2px 2px",
                  }}
                >
                  <Box sx={{ padding: "3px" }}>
                    <Typography
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        textAlign: "center",
                        margin: 0,
                      }}
                      color="#aaa"
                      variant="caption"
                    >
                      NEXT(SHIFT+N)
                    </Typography>
                    <Typography
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        whiteSpace: "break-spaces",
                        textOverflow: "ellipsis",
                        textAlign: "center",
                        margin: 0,
                      }}
                      variant="caption"
                    >
                      {playlistVideos[index + 1]?.title ||
                        filteredVideos[0]?.title}
                    </Typography>
                  </Box>
                  <CardMedia
                    sx={{
                      borderRadius: "16px 16px",
                      flexGrow: "1!important",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      aspectRatio: "16/9",
                    }}
                    component="img"
                    image={
                      playlistVideos[index + 1]?.thumbnail ||
                      filteredVideos[0]?.thumbnail
                    }
                  />
                </Box>
              }
              placement="top"
            >
              <IconButton
                disableRipple
                onClick={
                  playlistId && index < playlistVideos.length - 1
                    ? handleNextPlaylist
                    : handleNext
                }
                sx={{ color: "#f1f1f1" }}
              >
                <SkipNextIcon sx={{ width: "1.25em", height: "1.25em" }} />
              </IconButton>
            </Tooltip>
            <Box
              onMouseEnter={handleVolumeHover}
              onMouseLeave={() => setShowVolumePanel(false)}
              component={"div"}
              className="volume-container"
              sx={{ display: "flex" }}
            >
              <IconButton
              onClick={handleVolumeToggle}

                disableRipple
                sx={{
                  color: "#f1f1f1",
                }}
              >
                {volumeMuted ? 
                <VolumeOffIcon  sx={{ width: "1em", height: "1em" }}/> :
                 <VolumeUpIcon sx={{ width: "1em", height: "1em" }} />
                }
               
              </IconButton>

              <Box
                ref={volumeSliderRef}
                onMouseDown={handleVolumeClick}
                className="volume-panel"
                sx={{
                  width: showVolumePanel ? "52px" : 0,
                  marginRight: showVolumePanel ? "3px" : 0,
                  transition: "width 0.3s ease-in-out, margin 0.3s ease-in-out",
                  height: "100%",
                  outline: 0,
                }}
                component={"div"}
                role="slider"
                aria-valuemin="0"
                aria-valuemax="1"
                aria-valuenow={Math.ceil(videoRef.current?.volume)}
              >
                <Box
                  className="volume-slider"
                  sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    minHeight: "29px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    onMouseDown={handleVolumeStart}
                    className="volume-slider-thumb"
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: `${volume}px`,
                      marginTop: "-6px",
                      width: "12px",
                      height: "12px",
                      background: "#f1f1f1",
                      borderRadius: "50px",
                      cursor: "pointer",
                    }}
                  ></Box>
                </Box>
              </Box>
            </Box>

            <IconButton disableRipple sx={{ cursor: "default" }}>
              <Typography sx={{ color: "#f1f1f1" }} fontSize={"0.85rem"}>
                {formatDuration(progress || 0)} /{" "}
                {formatDuration(videoRef?.current?.duration || 0)}
              </Typography>
            </IconButton>
          </Box>
          <Box
            className="progress-bar-container"
            sx={{
              position: "absolute",
              display: "block",
              bottom: "47px",
              width: "100%",
              height: "5px",
            }}
          >
            <Box
              onClick={handleClickSeek}
              ref={sliderRef}
              component={"div"}
              role="slider"
              aria-valuemin={0}
              aria-valuenow={
                videoRef.current ? Math.ceil(videoRef.current.currentTime) : 0
              }
              aria-valuemax={
                videoRef.current ? Math.ceil(videoRef.current.duration) : 0
              }
              className="progress-bar"
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                touchAction: "none",
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: "-9px",
                  left: 0,
                  height: "15px",
                  width: "100%",
                }}
              ></Box>
              <Box
                className="progress-list"
                sx={{
                  position: "relative",
                  height: "100%",
                  transform: "scaleY(.6)",
                  background: "rgba(255,255,255,0.2)",
                  transition:
                    "transform .1s cubic-bezier(0.4, 0, 1, 1), -webkit-transform .1s cubic-bezier(.4,0,1,1)",
                }}
              >
                <div
                  className="load-progress"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    transform: `scaleX(${progress / 100})`,
                    transformOrigin: "0 0",
                    borderRadius: "4px",
                    zIndex: 2,
                  }}
                ></div>
                <div
                  className="buffered-bar"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${bufferedPercent}%`,
                    backgroundColor: "#888",
                    borderRadius: "3px",
                    zIndex: 1,
                    transition: "width 0.1s",
                  }}
                />
              </Box>
              <Box
                onMouseDown={handleSeekStart}
                className="thumb-container"
                sx={{
                  position: "absolute",
                  left: `-${thumbWidth / 2}px`,
                  top: "-4px",
                  transform: `translateX(${(progress / 100) * BarWidth}px)`,
                }}
              >
                <div
                  className="custom-thumb"
                  style={{
                    width: `${thumbWidth}px`,
                    height: `${thumbWidth}px`,
                    borderRadius: "50px",
                    zIndex: 253,
                    transition:
                      "transform .1s cubic-bezier(.4,0,1,1),-webkit-transform .1s cubic-bezier(.4,0,1,1)",
                  }}
                ></div>
              </Box>
            </Box>
          </Box>
        </div>
      </>
    );
  }
);

export default React.memo(VideoControls);
