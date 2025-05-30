import React, { useEffect, useState, useRef, act } from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  CardHeader,
  useTheme,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import CloseIcon from "@mui/icons-material/Close";
import formatDuration from "../../utils/formatDuration";
import RepeatIcon from "@mui/icons-material/Repeat";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import handleMouseDown from "../../helper/intertactionHelper";
import Interaction from "../Utils/Interaction";
import { fetchPlaylistById } from "../../apis/playlistFn";
import { FastAverageColor } from "fast-average-color";
import {
  UserInteractionContext,
  useUserInteraction,
} from "../../routes/__root";

const PlaylistContainer = ({ playlistId, playlistData, videoId }) => {
  const imgRef = useRef(null);
  const [bgColor, setBgColor] = useState("rgba(0,0,0,0.6)");
  const [primaryColor, setPrimaryColor] = useState("#f1f1f1");
  const [secondaryColor, setSecondaryColor] = useState("#aaa");
  const fac = new FastAverageColor();
  const [collapsePlaylist, setCollapsePlayList] = useState(false);
  const { setIsUserInteracted } = useUserInteraction();

  const videos = playlistData?.data?.videos || [];
  const activeIndex = videos.findIndex((video) => video._id === videoId);

  useEffect(() => {
    console.log("test viidoes", videos);
  }, []);
  const handleImageLoad = () => {
    if (imgRef.current) {
      fac
        .getColorAsync(imgRef.current)
        .then((color) => {
          console.log("Full color object:", color);
          console.log("color.rgba:", color.rgba);
          setBgColor(color.rgba);
          const [r, g, b] = color.value;
          const primaryColor = `rgb(
          ${Math.max(0, Math.min(255, r * 2))},
          ${Math.max(0, Math.min(255, g * 2))},
          ${Math.max(0, Math.min(255, b * 2))}
        )`;
          const secondaryColor = `rgb(
          ${Math.max(0, Math.min(255, r * 0.2))},
          ${Math.max(0, Math.min(255, g * 0.2))},
          ${Math.max(0, Math.min(255, b * 0.2))}
        )`;

          setPrimaryColor(primaryColor);
          setSecondaryColor(secondaryColor);
          console.log("Text color:", textColor);
        })
        .catch((err) => console.log("Color extraction error:", err));
    }
  };
  const activeVideo = videos.find((video) => video._id === videoId);
  const activeVideoTitle = activeVideo?.title || "";

  return (
    <Box
      component={"playlist-container"}
      sx={{
        mb: 3,
        display: "flex",
        flexDirection: "column",
        maxHeight: "703px",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {collapsePlaylist ? (
        <Box
          id="title-container-collapsed"
          sx={{
            background: bgColor,
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              overflow: "visible",
            }}
          >
            <Box sx={{ maxWidth: "100%" }} variant="body2" color="#f1f1f1">
              <Typography
                sx={{
                  color: primaryColor,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: "1",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                variant="body2"
                fontWeight={"bold"}
              >
                Next: {videos[activeIndex + 1]?.title || "End of playlist"}
              </Typography>
              <Typography variant="caption" color={secondaryColor}>
                {activeVideoTitle} - {activeIndex + 1}/{videos.length}
              </Typography>
            </Box>

            <Box>
              <IconButton
                onClick={() => setCollapsePlayList(false)}
                disableRipple
                sx={{ padding: 0 }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e);
                }}
              >
                <KeyboardArrowDownIcon
                  sx={{ fontSize: "2rem", color: "#aaa" }}
                />
                <Interaction id="interaction" circle={true} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          id="title-container"
          sx={{
            background: "#1f1f1f",
            padding: "12px 6px 0 16px",
            borderRadius: "8px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              overflow: "visible",
            }}
          >
            <Box
              sx={{ maxWidth: "100%", minWidth: 0 }}
              variant="body2"
              color="#f1f1f1"
            >
              <Typography
                sx={{
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: "1",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                variant="body1"
                fontWeight={"bold"}
              >
                {activeVideoTitle}
              </Typography>
              <Typography variant="caption" color="#aaa">
                {playlistData?.data?.owner?.fullName} - {activeIndex + 1}/
                {videos.length}
              </Typography>
            </Box>

            <Box>
              <IconButton
                onClick={() => setCollapsePlayList(true)}
                disableRipple
                sx={{ padding: 0 }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e);
                }}
              >
                <CloseIcon sx={{ fontSize: "2rem", color: "#aaa" }} />
                <Interaction id="interaction" circle={true} />
              </IconButton>
            </Box>
          </Box>

          <Box
            id="options"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginLeft: "-8px",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                disableRipple
                sx={{
                  borderRadius: "50px",
                  width: "36px",
                  height: "36px",
                  padding: 0,
                  "&:hover": {
                    background: "rgba(255,255,255,0.2)",
                  },
                  "&:active": {
                    background: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                <RepeatIcon sx={{ color: "#f1f1f1" }} />
              </IconButton>
              <IconButton
                disableRipple
                sx={{
                  borderRadius: "50px",
                  width: "36px",
                  height: "36px",
                  padding: 0,
                  "&:hover": {
                    background: "rgba(255,255,255,0.2)",
                  },
                  "&:active": {
                    background: "rgba(255,255,255,0.3)",
                  },
                }}
              >
                <ShuffleIcon sx={{ color: "#f1f1f1" }} />
              </IconButton>
            </Box>
            <Box>
              <IconButton
                disableRipple
                className="no-ripple"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e);
                }}
                sx={{
                  width: "30px",
                  height: "30px",
                  padding: 0,
                  borderRadius: "50px",
                  marginLeft: "-8px",
                }}
                aria-label="settings"
              >
                <MoreVertIcon sx={{ color: "#fff" }} />

                <Interaction id="interaction" circle={true} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}
      {!collapsePlaylist && (
        <Box
          id="list-container"
          sx={{
            overflowX: "hidden",
            overflowY: "auto",
          }}
        >
          {playlistData?.data?.videos?.map((video, index) => (
            <Box
              onClick={() => setIsUserInteracted(true)}
              key={video._id}
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                padding: "4px 8px 4px 0",
                background: videoId === video._id ? bgColor : "none",

                "&:hover .hover-overlay": {
                  opacity: 1,
                },
                "&:hover": {
                  background:
                    videoId === video._id ? bgColor : "rgba(255,255,255,0.1)",
                },
                ":first-of-type": {
                  paddingTop: "8px",
                },
              }}
              id="list-item"
            >
              <Link
                to="/watch"
                search={{ v: video._id, list: playlistId, index: index + 1 }}
                style={{
                  display: "block",
                  flexGrow: 1,
                  textDecoration: "none",
                  minWidth: 0,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <IconButton sx={{ padding: "0" }}>
                    {videoId === video._id ? (
                      <ArrowRightIcon sx={{ color: "#f1f1f1" }} />
                    ) : (
                      <Typography
                        component="div"
                        variant="caption"
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          height: "1em",
                          width: "24px",
                          color: "#aaa",
                        }}
                      >
                        {index + 1}
                      </Typography>
                    )}
                  </IconButton>

                  <Box
                    sx={{
                      display: "flex",
                      flex: "none",
                      width: "100px",
                      height: "56px",
                      borderRadius: "12px",
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",

                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <CardMedia
                        sx={{
                          borderRadius: "8px",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          userSelect: "none",
                        }}
                        component="img"
                        draggable="false"
                        image={video?.thumbnail}
                        crossOrigin="anonymous"
                        ref={imgRef}
                        onLoad={handleImageLoad}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          position: "absolute",
                          bottom: "0",
                          right: "0",
                          margin: "4px",
                          width: "35px",
                          height: "20px",
                          backgroundColor: "rgba(0,0,0,0.6)",
                          borderRadius: "6px",
                          userSelect: "none",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="#f1f1f1"
                          fontSize="0.75rem"
                          lineHeight="0"
                        >
                          {formatDuration(video?.duration)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      minWidth: 0,
                      padding: "0 8px",
                      paddingBottom: "0!important",
                    }}
                  >
                    <CardHeader
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "flex-start",
                        padding: 0,
                        "& .MuiCardHeader-content": {
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                          minWidth: 0,
                        },
                        "& .css-1ro85z9-MuiTypography-root": {
                          lineHeight: 0.5,
                        },
                      }}
                      title={
                        <Tooltip
                          disableInteractive
                          title={video.title}
                          placement="bottom"
                          slotProps={{
                            popper: {
                              modifiers: [
                                {
                                  name: "offset",
                                  options: {
                                    offset: [0, -20],
                                  },
                                },
                              ],
                            },
                            tooltip: {
                              sx: {
                                whiteSpace: "nowrap",
                                backgroundColor: "#1f1f1f",
                                maxWidth: 700,
                                color: "#f1f1f1",
                                fontSize: "0.75rem",
                                border: "1px solid #f1f1f1",
                                borderRadius: "0",
                                padding: "4px",
                              },
                            },
                          }}
                        >
                          <Typography
                            variant="h8"
                            color={
                              videoId === video._id ? primaryColor : "#f1f1f1"
                            }
                            sx={{
                              display: "-webkit-box",
                              fontSize: "0.85rem",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 2, // Ensures 2 lines max
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontWeight: 600,
                              lineHeight: 1.5,
                              userSelect: "none",
                              maxWidth: "100%",
                            }}
                          >
                            {video.title}
                          </Typography>
                        </Tooltip>
                      }
                      subheader={
                        <>
                          <Tooltip
                            disableInteractive
                            title={video.owner?.username}
                            placement="top-start"
                          >
                            <Typography
                              sx={{
                                display: "inline-block",
                                verticalAlign: "top",
                                textDecoration: "none",
                                userSelect: "none",
                              }}
                              fontSize="0.75rem"
                              color={
                                video._id === videoId
                                  ? secondaryColor
                                  : "#f1f1f1"
                              }
                            >
                              {video.owner?.username}
                            </Typography>
                          </Tooltip>
                        </>
                      }
                    />
                  </CardContent>
                </Box>
              </Link>
              <IconButton
                id="menu"
                disableRipple
                className="hover-overlay"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e);
                }}
                sx={{
                  maxWidth: "30px",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: 0,
                  opacity: 0,
                }}
                aria-label="settings"
              >
                <MoreVertIcon sx={{ color: "#fff", borderRadius: "50px" }} />

                <Interaction id="interaction" circle={true} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PlaylistContainer;
