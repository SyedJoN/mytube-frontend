import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import PlaylistPlayOutlinedIcon from "@mui/icons-material/PlaylistPlayOutlined";
import { MenuItem } from "@mui/material";
import OutlinedFlagOutlinedIcon from "@mui/icons-material/OutlinedFlagOutlined";
import { FastAverageColor } from "fast-average-color";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import {
  red,
  blue,
  green,
  purple,
  orange,
  deepOrange,
  pink,
} from "@mui/material/colors";
import Tooltip from "@mui/material/Tooltip";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Box, useMediaQuery, Paper } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTheme } from "@mui/material/styles";
import formatDuration from "../utils/formatDuration";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: "rotate(0deg)",
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: "rotate(180deg)",
      },
    },
  ],
}));

function VideoCard({
  videoId,
  owner,
  thumbnail,
  title,
  description,
  avatar,
  fullName,
  views,
  duration,
  videoCount,
  createdAt,
  open,
  fontSize,
  home,
  search,
  video,
  profile,
  playlist,
  activeOptionsId,
  setActiveOptionsId,
  ...props
}) {
  const [expanded, setExpanded] = React.useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const imgRef = React.useRef(null);
  const [bgColor, setBgColor] = React.useState("rgba(0,0,0,0.6)"); // default fallback
  const fac = new FastAverageColor();
  const colors = [red, blue, green, purple, orange, deepOrange, pink];

  const getColor = (name) => {
    if (!name) return red[500];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index][500];
  };

  const handleImageLoad = () => {
    if (imgRef.current) {
      fac
        .getColorAsync(imgRef.current)
        .then((color) => {
          console.log("Extracted Color:", color.rgba);
          setBgColor(color.rgba);
        })
        .catch((err) => console.log("Color extraction error:", err));
    }
  };
  const handleToggleOptions = (id) => {
    setActiveOptionsId((prev) => (prev === id ? null : id));
  };
  const handleCardClick = () => {
    navigate({
      to: `/watch/${videoId}`,
    });

    console.log("videoID", videoId);
  };

  const handleChannelClick = () => {
    navigate({
      to: `/@${owner}`,
    });
  };
  return (
    <>
      {home ? (
        <Card
          sx={{
            position: "relative",
            transition: "0.3s ease-in-out",
            padding: 0,
            cursor: "pointer",
            overflow: "hidden",
            borderRadius: "10px",
            boxShadow: "none",
            width: "100%",
            display: "block",
            backgroundColor: "transparent",
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "block",
              width: "100%",

              ":before": {
                display: "block",
                overflow: "hidden",
                width: "100%",
                paddingTop: "56.25%",
                content: "''",
              },
            }}
          >
            <Box
              onClick={handleCardClick}
              height="100%"
              position="absolute"
              top="0"
              left="0"
            >
              <CardMedia
                sx={{
                  borderRadius: "10px",
                  flexGrow: "1!important",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  aspectRatio: "16/9",
                }}
                component="img"
                image={thumbnail}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                bottom: "8px",
                right: "8px",
                width: "35px",
                height: "20px",
                backgroundColor: "rgba(0,0,0,0.6)",
                borderRadius: "5px",
              }}
            >
              <Typography
                variant="body2"
                color="#f1f1f1"
                fontSize="0.75rem"
                lineHeight="0"
              >
                {formatDuration(duration)}
              </Typography>
            </Box>
          </Box>

          <CardContent
            sx={{
              position: "relative",
              backgroundColor: theme.palette.primary.main,
              padding: 0,
              paddingTop: "10px",
            }}
          >
            <Box sx={{ display: "flex" }}>
              {avatar && (
                <Avatar
                  onClick={handleChannelClick}
                  src={avatar ? avatar : null}
                  sx={{ bgcolor: getColor(fullName), marginRight: "16px" }}
                >
                  {fullName ? fullName.charAt(0).toUpperCase() : "?"}
                </Avatar>
              )}

              <Box sx={{ overflowX: "hidden", paddingRight: "24px" }}>
                <Typography
                  onClick={handleCardClick}
                  variant="body2"
                  color="#f1f1f1"
                  sx={{
                    display: "-webkit-box",
                    fontSize: "0.85rem",
                    WebkitBoxOrient: "vertical",
                    maxWidth: "300px",
                    overflow: "hidden",
                    WebkitLineClamp: 2, // Clamp text to 2 lines
                    textOverflow: "ellipsis",
                    fontWeight: 600,
                    height: "auto", // Ensure height is dynamic
                    maxHeight: "3.5em", // Define max height based on line-clamp
                  }}
                >
                  {title}
                </Typography>
                {fullName && (
                  <>
                    <Tooltip
                      title={fullName}
                      placement="top-start"
                      slotProps={{
                        popper: {
                          disablePortal: true,
                        },
                      }}
                    >
                      <Typography
                        onClick={handleChannelClick}
                        variant="body2"
                        color="#aaa"
                        sx={{
                          "&:hover": {
                            color: "#ccc",
                          },
                        }}
                      >
                        {fullName}
                      </Typography>
                    </Tooltip>

                    <Typography variant="body2" color="#aaa">
                      <span>
                        {views} {views === 1 ? "view" : "views"} &bull;{" "}
                        {createdAt}
                      </span>
                    </Typography>
                  </>
                )}
              </Box>
            </Box>

            <IconButton
              sx={{ position: "absolute", right: "-12px", top: "4px" }}
              aria-label="settings"
            >
              <MoreVertIcon sx={{ color: "#fff" }} />
            </IconButton>
          </CardContent>
        </Card>
      ) : video ? (
        <Card
          sx={{
            position: "relative",
            transition: "0.3s ease-in-out",
            padding: 0,
            cursor: "pointer",
            overflow: "hidden",
            borderRadius: "10px",
            boxShadow: "none",
            display: "flex",
            backgroundColor: "transparent",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flex: "none",
              maxWidth: "500px",
              width: "168px",
              paddingRight: 1,
            }}
          >
            <Box
              width="100%"
              sx={{
                position: "relative",
                display: "block",
                paddingTop: "56.25%",
                height: "0",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  top: "50%",
                  left: "0%",
                  transform: "translateY(-50%)",
                }}
              >
                <CardMedia
                  sx={{
                    borderRadius: "8px",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  component="img"
                  image={thumbnail}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    bottom: "4px",
                    right: "4px",
                    width: "35px",
                    height: "20px",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: "6px",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="#f1f1f1"
                    fontSize="0.75rem"
                    lineHeight="0"
                  >
                    {formatDuration(duration)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <CardContent
            sx={{
              backgroundColor: theme.palette.primary.main,
              display: "flex",
              flexDirection: "column",
              padding: "0!important",
              minWidth: 0,
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
              }}
              title={
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
                    paddingRight: "24px",
                    fontWeight: 600,
                    lineHeight: 1.5,
                  }}
                >
                  {title}
                </Typography>
              }
              subheader={
                <>
                  <Tooltip title={fullName} placement="top-start">
                    <Link
                      style={{
                        textDecoration: "none"
                      }}
                      to={`/@${owner}`}
                    >
                      <Typography
                        fontSize="0.75rem"
                        color="#aaa"
                        sx={{
                          marginTop: "2px",
                        }}
                      >
                        {fullName}
                      </Typography>
                    </Link>
                  </Tooltip>
                  <Typography fontSize="0.75rem" color="#aaa">
                    <span>
                      {views} {views === 1 ? "view" : "views"} &bull;{" "}
                      {createdAt}
                    </span>
                  </Typography>
                </>
              }
              action={
                <>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleOptions(videoId);
                    }}
                    sx={{
                      position: "absolute",
                      width: "36px",
                      height: "36px",
                      right: "-12px",
                      top: "-6px",
                    }}
                    aria-label="settings"
                  >
                    <MoreVertIcon sx={{ color: "#fff" }} />
                  </IconButton>
                  {activeOptionsId === videoId && (
                    <Box
                      id="create-menu"
                      sx={{
                        position: "absolute",
                        top: "35px",
                        right: "0",
                        borderRadius: "12px",
                        backgroundColor: "#282828",
                        zIndex: 2,
                        paddingY: 1,
                      }}
                    >
                      <MenuItem
                        sx={{
                          paddingTop: 1,
                          paddingLeft: "16px",
                          paddingRight: "36px",
                          gap: "3px",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                          },
                        }}
                      >
                        <OutlinedFlagOutlinedIcon sx={{ color: "#f1f1f1" }} />
                        <Typography
                          variant="body2"
                          marginLeft="10px"
                          color="#f1f1f1"
                        >
                          Report
                        </Typography>
                      </MenuItem>
                    </Box>
                  )}
                </>
              }
            />
          </CardContent>
        </Card>
      ) : search ? (
        <Card
          sx={{
            marginTop: 1,
            position: "relative",
            transition: "0.3s ease-in-out",
            padding: 0,
            cursor: "pointer",
            overflow: "hidden",
            borderRadius: "10px",
            boxShadow: "none",
            display: "flex",
            backgroundColor: "transparent",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flex: "none",
              maxWidth: "500px",
              width: "350px",
              paddingRight: 2,
            }}
          >
            <Box
              width="100%"
              sx={{
                position: "relative",
                display: "block",
                paddingTop: "56.25%",
                height: "0",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  top: "50%",
                  left: "0%",
                  transform: "translateY(-48%)",
                }}
              >
                <CardMedia
                  sx={{
                    borderRadius: "8px",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  component="img"
                  image={thumbnail}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    bottom: "4px",
                    right: "4px",
                    width: "35px",
                    height: "20px",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: "6px",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="#f1f1f1"
                    fontSize="0.75rem"
                    lineHeight="0"
                  >
                    {formatDuration(duration)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <CardContent
            sx={{
              flex: 1,
              backgroundColor: theme.palette.primary.main,
              display: "flex",
              flexDirection: "column",
              padding: 0,
              minWidth: 0,
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
              }}
              title={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h3"
                    color="#f1f1f1"
                    sx={{
                      display: "-webkit-box",
                      fontSize: "1.2rem",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2, // Ensures 2 lines max
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "normal",
                      maxHeight: "5.2rem",
                      fontWeight: 500,
                      color: "rgb(255,255,255)",
                      lineHeight: 1.5,
                      marginRight: 2,
                    }}
                  >
                    {title}
                  </Typography>
                  <IconButton sx={{ padding: 0 }} aria-label="settings">
                    <MoreVertIcon sx={{ color: "#fff" }} />
                  </IconButton>
                </Box>
              }
              subheader={
                <>
                  <Typography fontSize="0.75rem" color="#aaa">
                    <span>
                      {views} {views === 1 ? "view" : "views"} &bull;{" "}
                      {createdAt}
                    </span>
                  </Typography>
                  <Box
                    sx={{ display: "flex", alignItems: "center", marginY: 1 }}
                  >
                    <Avatar
                      src={avatar ? avatar : null}
                      sx={{
                        bgcolor: getColor(fullName),
                        width: "25px",
                        height: "25px",
                        marginRight: 1,
                      }}
                    >
                      {fullName ? fullName.charAt(0).toUpperCase() : "?"}
                    </Avatar>
                    <Typography
                      fontSize="0.75rem"
                      color="#aaa"
                      sx={{
                        marginTop: "2px",
                      }}
                    >
                      {fullName}
                    </Typography>
                  </Box>

                  <Typography
                    fontSize="0.75rem"
                    color="#aaa"
                    sx={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "normal",
                      fontWeight: 500,
                      marginTop: "2px",
                    }}
                  >
                    {description}
                  </Typography>
                </>
              }
            />
          </CardContent>
        </Card>
      ) : profile ? (
        <Card
          onClick={handleCardClick}
          sx={{
            position: "relative",
            transition: "0.3s ease-in-out",
            padding: 0,
            cursor: "pointer",
            overflow: "hidden",
            borderRadius: "10px",
            boxShadow: "none",
            display: "block",
            paddingTop: "",
            backgroundColor: "transparent",
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "block",
              width: "100%",
              ":before": {
                display: "block",
                overflow: "hidden",
                width: "100%",
                paddingTop: "56.25%",
                content: "''",
              },
            }}
          >
            <Box height="100%" position="absolute" top="0" left="0">
              <CardMedia
                sx={{
                  borderRadius: "10px",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  aspectRatio: "16/9",
                }}
                component="img"
                image={thumbnail}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                bottom: "4px",
                right: "8px",
                width: "35px",
                height: "20px",
                backgroundColor: "rgba(0,0,0,0.6)",
                borderRadius: "5px",
              }}
            >
              <Typography
                variant="body2"
                color="#f1f1f1"
                fontSize="0.75rem"
                lineHeight="0"
              >
                {formatDuration(duration)}
              </Typography>
            </Box>
          </Box>

          <CardContent
            sx={{
              backgroundColor: theme.palette.primary.main,
              padding: 0,
              paddingTop: "10px",
            }}
          >
            <CardHeader
              sx={{
                alignItems: "flex-start",
                padding: 0,
                "& .MuiCardHeader-content": {
                  overflow: "hidden", // Prevents content overflow
                  minWidth: 0, // Ensures proper flex behavior
                },
              }}
              action={
                <IconButton aria-label="settings">
                  <MoreVertIcon sx={{ color: "#fff" }} />
                </IconButton>
              }
              title={
                <Typography
                  variant="body2"
                  color="#f1f1f1"
                  sx={{
                    display: "-webkit-box",
                    fontSize: "0.85rem",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    WebkitLineClamp: 2, // Ensures 2 lines max
                    textOverflow: "ellipsis",
                    fontWeight: 600,
                  }}
                >
                  {title}
                </Typography>
              }
              subheader={
                <Typography variant="body2" color="#aaa">
                  <span>
                    {views} {views === 1 ? "view" : "views"} &bull; {createdAt}
                  </span>
                </Typography>
              }
            />
          </CardContent>
        </Card>
      ) : (
        playlist && (
          <Box
            sx={{
              position: "relative",
              display: "block",
              width: "100%",
              height: "100%",
            }}
          >
            <Card
              sx={{
                position: "relative",
                transition: "0.3s ease-in-out",
                padding: 0,
                cursor: "pointer",
                overflow: "visible!important",
                borderRadius: "12px",
                boxShadow: "none",
                display: "block",
                paddingTop: "",
                backgroundColor: "transparent",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  display: "block",
                  width: "100%",
                  background: "none",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    height: "100%",
                    left: "12px",
                    right: "12px",
                    top: "-8px",
                    backgroundColor: bgColor,
                    borderRadius: "12px",
                    opacity: "50%",
                  }}
                ></Box>
                <Box
                  sx={{
                    position: "absolute",
                    height: "100%",
                    left: "8px",
                    right: "8px",
                    top: "-4px",
                    borderTop: "1px solid #0f0f0f",
                    marginTop: "-1px",
                    backgroundColor: bgColor,
                    borderRadius: "12px",
                  }}
                ></Box>

                <Box
                  sx={{
                    position: "relative",
                    display: "block",
                    overflow: "hidden",
                    borderTop: "1px solid #0f0f0f",
                    marginTop: "-1px",
                    width: "100%",
                    paddingTop: "56.25%",
                    borderRadius: "12px",
                    backgroundColor: "transparent",
                    "&:hover .hover-overlay": {
                      opacity: 1, // Show overlay and text on hover
                    },
                  }}
                >
                  <Box height="100%" position="absolute" top="0" left="0">
                    <CardMedia
                      sx={{
                        borderRadius: "12px",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        aspectRatio: "16/9",
                      }}
                      crossOrigin="anonymous"
                      component="img"
                      image={thumbnail}
                      ref={imgRef}
                      onLoad={handleImageLoad}
                    />
                  </Box>

                  <Box
                    className="hover-overlay"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0, 0, 0, 0.5)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: 0,
                      color: "#fff",
                      fontWeight: "400",
                      fontSize: "1rem",
                    }}
                  >
                    <PlayArrowIcon sx={{ marginRight: 1 }} />
                    Play All
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      position: "absolute",
                      bottom: "4px",
                      right: "4px",
                      width: "75px",
                      height: "20px",
                      backgroundColor: "rgba(0,0,0,0.3)",
                      borderRadius: "5px",
                    }}
                  >
                    <Typography
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      variant="body2"
                      color="#f1f1f1"
                      fontSize="0.75rem"
                      lineHeight="0"
                    >
                      <PlaylistPlayOutlinedIcon /> {videoCount}{" "}
                      {videoCount === 1 ? "video" : "videos"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <CardContent
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  padding: 0,
                  paddingTop: "10px",
                }}
              >
                <CardHeader
                  sx={{
                    alignItems: "flex-start",
                    padding: 0,
                    "& .MuiCardHeader-content": {
                      overflow: "hidden", // Prevents content overflow
                      minWidth: 0, // Ensures proper flex behavior
                    },
                  }}
                  title={
                    <Typography
                      variant="body2"
                      color="#f1f1f1"
                      sx={{
                        display: "-webkit-box",
                        fontSize: "0.85rem",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        WebkitLineClamp: 2, // Ensures 2 lines max
                        textOverflow: "ellipsis",
                        fontWeight: 600,
                      }}
                    >
                      {title}
                    </Typography>
                  }
                  subheader={
                    <Typography variant="body2" color="#aaa">
                      <span>view full playlist</span>
                    </Typography>
                  }
                />
              </CardContent>
            </Card>
          </Box>
        )
      )}
    </>
  );
}

export default React.memo(VideoCard);
