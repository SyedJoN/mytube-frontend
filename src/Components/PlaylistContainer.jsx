import React, { useEffect, useState, useRef } from "react";
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
import { Link } from "@tanstack/react-router";
import CloseIcon from "@mui/icons-material/Close";
import formatDuration from "../utils/formatDuration";
import RepeatIcon from "@mui/icons-material/Repeat";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import handleMouseDown from "../helper/intertactionHelper";
import Interaction from "./Interaction";
import { fetchPlaylistById } from "../apis/playlistFn";
import { FastAverageColor } from "fast-average-color";

const PlaylistContainer = ({ playlistId, playlistData, videoId }) => {
  const imgRef = useRef(null);
  const [bgColor, setBgColor] = useState("rgba(0,0,0,0.6)");
  const fac = new FastAverageColor();
  const theme = useTheme();
  const isCustomWidth = useMediaQuery("(max-width:1014px)");

  console.log("data playlist", playlistData);
  const handleImageLoad = () => {
    if (imgRef.current) {
      fac
        .getColorAsync(imgRef.current)
        .then((color) => {
          setBgColor(color.rgba);
        })
        .catch((err) => console.log("Color extraction error:", err));
    }
  };

  const videos = playlistData?.data?.videos || [];

  const activeIndex = videos.findIndex((video) => video._id === videoId);

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
        border: "1px solid rgba(255, 255, 255, 0.18)",
        borderRadius: "8px",
        overflow: "hidden"
      }}
    >
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
          <Box sx={{maxWidth: "100%"}} variant="body2" color="#f1f1f1">
            <Typography
              sx={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: "1",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              variant="h6"
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
      <Box
        id="list-container"
        sx={{
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {playlistData?.data?.videos?.map((video, index) => (
          <Box
            key={video._id}
            sx={{
              position: "relative",
              display: "flex",
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
              to="/watch/$videoId"
              params={{ videoId: video._id }}
              search={{ list: playlistId }}
              style={{ textDecoration: "none" }}
            >
              <Box sx={{ display: "flex" }}>
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
                <Card
                  sx={{
                    position: "relative",
                    transition: "0.3s ease-in-out",
                    padding: 0,
                    cursor: "pointer",
                    overflow: "visible",
                    borderRadius: "8px",
                    boxShadow: "none",
                    display: "flex",
                    backgroundColor: "transparent",
                  }}
                >
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
                          title={"Bong Diarrhea - Star Trek:Borg"}
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
                            color="#f1f1f1"
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
                              width: "208px",
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
                            title={"Jon"}
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
                              color="#aaa"
                            >
                              {video.owner?.username}
                            </Typography>
                          </Tooltip>
                        </>
                      }
                    />
                  </CardContent>
                </Card>

                <IconButton
                  id="menu"
                  disableRipple
                  className="hover-overlay"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleMouseDown(e);
                  }}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    flexBasis: 0,
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
            </Link>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default PlaylistContainer;
