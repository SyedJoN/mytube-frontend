import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
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
import { Box } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTheme } from "@mui/material/styles";
import formatDuration from "../utils/formatDuration";



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

export default function VideoCard({
  thumbnail,
  title,
  avatar,
  fullName,
  views,
  duration,
  createdAt,
  open,
}) {
  const [expanded, setExpanded] = React.useState(false);
  const theme = useTheme();
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  const colors = [red, blue, green, purple, orange, deepOrange, pink];

  const getColor = (name) => {
    if (!name) return red[500];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index][500];
  };

  return (
    <>
      {avatar ? (
        <Card
          sx={{
            position: "relative",
            width: open ? 300 : 345,
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
              avatar={
                <Avatar
                  src={avatar ? avatar : null}
                  sx={{ bgcolor: getColor(fullName) }}
                >
                  {fullName ? fullName.charAt(0).toUpperCase() : "?"}
                </Avatar>
              }
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
                    fontSize: "0.95rem",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2, // Ensures 2 lines max
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontWeight: 600,
                  }}
                >
                  {title}
                </Typography>
              }
              subheader={
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
              }
            />
          </CardContent>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              bottom: "100px",
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
        </Card>
      ) : (
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
              padding: 0,
              minWidth: 0
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
                  variant="h3"
                  color="#f1f1f1"
                  sx={{
                    display: "-webkit-box",
                    fontSize: "0.85rem",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2, // Ensures 2 lines max
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    paddingRight: "36px",
                    fontWeight: 600,
                    lineHeight: 1.5
                  }}
                >
                  {title}
                </Typography>
              }
              
              subheader={
                <>
            
                    <Typography
                      fontSize="0.75rem"
                      color="#aaa"
                      sx={{
                        marginTop: "2px",
                        
                      }}
                    >
                      {fullName}
                    </Typography>
                 

                  <Typography fontSize="0.75rem" color="#aaa">
                    <span>
                      {views} {views === 1 ? "view" : "views"} &bull;{" "}
                      {createdAt}
                    </span>
                  </Typography>
                  
                </>
              }
            action={
          <IconButton
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
         
            }
            /> 
        
         
          </CardContent>
        </Card>
      )}
    </>
  );
}
