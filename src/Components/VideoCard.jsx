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
    <Card
      sx={{
        position: "relative",
        width: open ? 300 : 350,
        transition: "0.3s ease-in-out",
        padding: 0,
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: "10px",
        boxShadow: "none",
        backgroundColor: "transparent",
      }}
    >
      <CardMedia
        sx={{ borderRadius: "10px" }}
        component="img"
        height="194"
        image={thumbnail}
      />

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
                  {views} {views === 1 ? "view" : "views"} &bull; {createdAt}
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
  );
}
