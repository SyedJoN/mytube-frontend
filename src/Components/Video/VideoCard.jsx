import * as React from "react";
import LazyLoad from "react-lazyload";
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
import formatDuration from "../../utils/formatDuration";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import Interaction from "../Utils/Interaction";
import handleMouseDown from "../../helper/intertactionHelper";
import { fetchVideoById } from "../../apis/videoFn";
import { useQuery } from "@tanstack/react-query";
import useHoverPreview from "../Utils/useHoverPreview";
import { UserInteractionContext } from "../../routes/__root";

const tooltipStyles = {
  whiteSpace: "nowrap",
  backgroundColor: "rgba(26,25,25,255)",
  maxWidth: 700,
  color: "#f1f1f1",
  fontSize: "0.75rem",
  border: "1px solid #f1f1f1",
  borderRadius: "0",
  padding: "4px",
};

const linkStyles = { textDecoration: "none" };

const viewStyles = {
  display: "inline-block",
  verticalAlign: "top",
  textDecoration: "none",
  userSelect: "none",
};

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
  previewUrl,
  title,
  description,
  avatar,
  fullName,
  views,
  duration,
  videoCount,
  createdAt,
  fontSize,
  home,
  search,
  video,
  profile,
  playlist,
  playlistId,
  activeOptionsId,
  setActiveOptionsId,
  ...props
}) {
  const navigate = useNavigate();
  const interactionRef = React.useRef(null);
 const context = React.useContext(UserInteractionContext);
 const {setIsUserInteracted} = context;
  const videoRef = React.useRef(null);
  const theme = useTheme();
  const imgRef = React.useRef(null);
  const [bgColor, setBgColor] = React.useState("rgba(0,0,0,0.6)");
  const fac = new FastAverageColor();
  const colors = [red, blue, green, purple, orange, deepOrange, pink];
  const playlistVideoId = playlist?.videos?.map((video) => {
    return video._id;
  });
  const searchParams = React.useMemo(() => ({ v: videoId }), [videoId]);

  const {
    isHoverPlay,
    isVideoPlaying,
    setIsVideoPlaying,
    onMouseEnter,
    onMouseLeave,
  } = useHoverPreview({
    delay: 300,
  });

  React.useEffect(() => {
    const video = videoRef.current;
    let playTimeout;

    if (!video) return;

    if (isHoverPlay) {
      playTimeout = setTimeout(() => {
        if (video.paused) {
          video.play().catch((err) => {
            if (err.name !== "AbortError") {
              console.error("Video play error:", err);
            }
          });
        }
      }, 100);
    } else {
      clearTimeout(playTimeout);
      if (!video.paused) {
        video.pause();
      }
    }

    return () => clearTimeout(playTimeout);
  }, [isHoverPlay]);

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

  const handleChannelClick = () => {
    navigate({
      to: `/@${owner}`,
    });
  };

  const handleDragEnd = () => {
    if (interactionRef.current) {
      interactionRef.current.classList.remove("down");
      interactionRef.current.classList.add("animate");
    }
  };
  return (
    <>
      {home ? (
        <Card
          onClick={() => setIsUserInteracted(true)}
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
              paddingTop: "56.25%",
            }}
          >
            <Link to="/watch" search={searchParams}>
              <Box height="100%" position="absolute" top="0" left="0">
                <CardMedia
                  sx={{
                    borderRadius: "10px",
                    flexGrow: "1!important",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    aspectRatio: "16/9",
                  }}
                  loading="lazy"
                  component="img"
                  image={thumbnail}
                />
              </Box>
            </Link>
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
                <Link to="/watch" search={{ searchParams }}>
                  <Tooltip
                    disableInteractive
                    disableFocusListener
                    disableTouchListener
                    title={title}
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
                        sx: { tooltipStyles },
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="#f1f1f1"
                      sx={{
                        display: "-webkit-box",
                        fontSize: "0.85rem",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        WebkitLineClamp: 2,
                        textOverflow: "ellipsis",
                        fontWeight: 600,
                        height: "auto",
                        maxHeight: "3.5em",
                      }}
                    >
                      {title}
                    </Typography>
                  </Tooltip>
                </Link>

                {fullName && (
                  <>
                    <Link to={`/@${owner}`}>
                      <Tooltip
                        disableInteractive
                        disableFocusListener
                        disableTouchListener
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
                            display: "inline-block",
                            "&:hover": {
                              color: "#fff",
                            },
                          }}
                        >
                          {fullName}
                        </Typography>
                      </Tooltip>
                    </Link>
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
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={() => setIsUserInteracted(true)}
          onMouseDown={(e) => {
            handleMouseDown(e);
            e.stopPropagation();
          }}
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
              maxWidth: "500px",
              width: "168px",
              aspectRatio: "16/9",
              paddingRight: 1,
            }}
          >
            <Box
              width="100%"
              sx={{
                position: "relative",
                display: "block",
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
                <Link
                  to="/watch"
                  search={searchParams}
                  style={linkStyles}
                  onDragEnd={handleDragEnd}
                >
                  <LazyLoad height={200} once offset={100}>
                    <CardMedia
                      loading="lazy"
                      sx={{
                        borderRadius: "8px",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        userSelect: "none",
                        opacity: isHoverPlay && isVideoPlaying ? 0 : 1,
                        transition: "opacity 0.3s ease",
                      }}
                      component="img"
                      draggable="false"
                      image={thumbnail}
                    />

                    <video
                      loop
                      playsInline
                      ref={videoRef}
                      muted
                      onPlaying={() => setIsVideoPlaying(true)}
                      id="video-player"
                      key={previewUrl}
                      className={`hover-interaction ${isHoverPlay ? "" : "hide"}`}
                      crossOrigin="anonymous"
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        left: 0,
                        top: 0,
                        objectFit: "cover",
                        borderRadius: "8px",
                        opacity: isHoverPlay ? 1 : 0,
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      {previewUrl && (
                        <source src={previewUrl} type="video/mp4" />
                      )}
                    </video>
                  </LazyLoad>

                  <Box
                    className={`${isHoverPlay && isVideoPlaying ? "hidden" : ""}`}
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
                      {formatDuration(duration)}
                    </Typography>
                  </Box>
                </Link>
              </Box>
            </Box>
          </Box>

          <CardContent
            sx={{
              backgroundColor: theme.palette.primary.main,
              display: "flex",
              flexDirection: "column",
              padding: "0!important",
              paddingRight: "24px!important",
              minWidth: 0,
              flex: 1,
            }}
          >
            <Link
              to="/watch"
              search={{ searchParams }}
              style={{ ...linkStyles, flex: 1 }}
              onDragEnd={() => {
                if (interactionRef.current) {
                  interactionRef.current.classList.remove("down");
                  interactionRef.current.classList.add("animate");
                }
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
                    disableFocusListener
                    disableTouchListener
                    title={title}
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
                        sx: { tooltipStyles },
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
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 600,
                        lineHeight: 1.5,
                        userSelect: "none",
                      }}
                    >
                      {title}
                    </Typography>
                  </Tooltip>
                }
                subheader={
                  <>
                    <Tooltip
                      disableInteractive
                      disableFocusListener
                      disableTouchListener
                      title={fullName}
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
                        {fullName}
                      </Typography>
                    </Tooltip>
                    <Typography fontSize="0.75rem" color="#aaa">
                      <span style={viewStyles}>
                        {views} {views === 1 ? "view" : "views"} &bull;{" "}
                        {createdAt}
                      </span>
                    </Typography>
                  </>
                }
              />
            </Link>
          </CardContent>

          <>
            <IconButton
              disableRipple
              className="no-ripple"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e);
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleOptions(videoId);
              }}
              sx={{
                position: "absolute",
                padding: 0,
                right: "-8px",
                top: "0",
                zIndex: "999",
              }}
              aria-label="settings"
            >
              <MoreVertIcon sx={{ color: "#fff", borderRadius: "50px" }} />

              <Interaction id="interaction" circle={true} />
            </IconButton>
            {activeOptionsId === videoId && (
              <Box
                id="create-menu"
                sx={{
                  position: "absolute",
                  top: "28px",
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
                  <Typography variant="body2" marginLeft="10px" color="#f1f1f1">
                    Report
                  </Typography>
                </MenuItem>
              </Box>
            )}
          </>
          <Interaction ref={interactionRef} id="video-interaction" />
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
              minWidth: "250px",
              maxWidth: "500px",
              width: {
                xl: "350px",
                lg: "300px",
                md: "250px",
                sm: "250px",
              },
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
                      fontSize: "1.2rem!important",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
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
          onMouseDown={(e) => {
            handleMouseDown(e);
            e.stopPropagation();
          }}
          sx={{
            position: "relative",
            transition: "0.3s ease-in-out",
            padding: 0,
            cursor: "pointer",
            overflow: "visible",
            borderRadius: "10px",
            boxShadow: "none",
            display: "block",
            paddingTop: "",
            backgroundColor: "transparent",
          }}
        >
          <Link
            to="/watch"
            search={{ searchParams }}
            style={linkStyles}
            onDragEnd={() => {
              if (interactionRef.current) {
                interactionRef.current.classList.remove("down");
                interactionRef.current.classList.add("animate");
              }
            }}
          >
            <Box
              sx={{
                position: "relative",
                display: "block",
                width: "100%",
                paddingTop: "56.25%",
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
          </Link>
          <Box sx={{ position: "relative", display: "flex" }}>
            <CardContent
              sx={{
                backgroundColor: theme.palette.primary.main,
                padding: 0,
                paddingRight: "24px",
                paddingTop: "10px",
              }}
            >
              <Link
                to="/watch"
                search={{ searchParams }}
                style={linkStyles}
                onDragEnd={() => {
                  if (interactionRef.current) {
                    interactionRef.current.classList.remove("down");
                    interactionRef.current.classList.add("animate");
                  }
                }}
              >
                <CardHeader
                  sx={{
                    alignItems: "flex-start",
                    padding: 0,
                    "& .MuiCardHeader-content": {
                      overflow: "hidden",
                      minWidth: 0,
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
                        WebkitLineClamp: 2,
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
                        {views} {views === 1 ? "view" : "views"} &bull;{" "}
                        {createdAt}
                      </span>
                    </Typography>
                  }
                />
              </Link>
            </CardContent>
            <IconButton
              sx={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                position: "absolute",
                padding: 0,
                right: "-13px",
              }}
              disableRipple
              className="no-ripple"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e);
              }}
              aria-label="settings"
            >
              <MoreVertIcon sx={{ color: "#fff" }} />
              <Interaction id="interaction" circle={true} />
            </IconButton>
          </Box>
          <Interaction ref={interactionRef} id="video-interaction" />
        </Card>
      ) : (
        playlist && (
          <Box
            onClick={() => setIsUserInteracted(true)}
            sx={{
              position: "relative",
              display: "block",
              width: "210px",
              height: "100%",
            }}
          >
            <Card
              onMouseDown={(e) => {
                handleMouseDown(e);
                e.stopPropagation();
              }}
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
              <Link
                to="/watch"
                search={{ v: playlistVideoId[0], list: playlistId }}
                style={linkStyles}
                onDragEnd={() => {
                  if (interactionRef.current) {
                    interactionRef.current.classList.remove("down");
                    interactionRef.current.classList.add("animate");
                  }
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
                        opacity: 1,
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
                          userSelect: "none",
                        }}
                        crossOrigin="anonymous"
                        ref={imgRef}
                        component="img"
                        image={thumbnail}
                        onLoad={handleImageLoad}
                        draggable={false}
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
                        userSelect: "none",
                        pointerEvents: "none",
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
                        bottom: "0",
                        right: "0",
                        margin: "4px",
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
              </Link>
              <CardContent
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  padding: 0,
                  paddingTop: "10px",
                }}
              >
                <Link
                  to="/watch"
                  search={{ searchParams }}
                  style={linkStyles}
                  onDragEnd={() => {
                    if (interactionRef.current) {
                      interactionRef.current.classList.remove("down");
                      interactionRef.current.classList.add("animate");
                    }
                  }}
                >
                  <CardHeader
                    sx={{
                      alignItems: "flex-start",
                      padding: 0,
                      "& .MuiCardHeader-content": {
                        overflow: "hidden",
                        minWidth: 0,
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
                          WebkitLineClamp: 2, 
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
                </Link>
              </CardContent>
              <Interaction ref={interactionRef} id="playlist-interaction" />
            </Card>
          </Box>
        )
      )}
    </>
  );
}

export default React.memo(VideoCard);
