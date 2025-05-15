import React, { useState } from "react";
import CardHeader from "@mui/material/CardHeader";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import { getColor } from "../utils/getColor";
import formatDate from "../utils/formatDate";
import { Typography } from "@mui/material";
import Interaction from "./Interaction";

function Description({ data, subscriberCount }) {
  const [expanded, setExpanded] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const handleRipple = (e) => {
    setIsPressed(false);
    e.currentTarget.classList.remove("down");
  };
  const handleRippleDown = (e) => {
    setIsPressed(true);
    e.currentTarget.classList.add("down");
  };

  return (
    <Card
      sx={{
        position: "relative",
        backgroundColor: "rgba(255,255,255,0.1)",
        marginTop: 2,
        borderRadius: "8px",
        padding: "8px 12px",
        paddingBottom: expanded ? "32px" : "8px",
        maxHeight: expanded ? "none" : "120px",
        overflow: "hidden",
      }}
      onClick={() => setExpanded(true)}
    >
      <CardContent sx={{ padding: "8px 0" }}>
        <Typography variant="body2" color="rgb(255,255,255)" fontWeight={500}>
          {data.data.views} {data.data.views === 1 ? "view" : "views"} •{" "}
          {formatDate(data.data.createdAt)}
        </Typography>

        <Typography variant="body2" color="rgb(255,255,255)">
          {expanded
            ? data.data.description || ""
            : `${data.data.description?.slice(0, 100) || ""}... `}

          <span
            role="button"
            style={{ cursor: "pointer" }}
            onClick={() => setExpanded(true)}
          >
            {!expanded ? "more" : ""}
          </span>
        </Typography>
        {expanded && (
          <Typography
            onClick={() => setExpanded(false)}
            variant="body2"
            color="rgb(255,255,255)"
            fontWeight={500}
          >
            <span
              role="button"
              style={{
                position: "absolute",
                bottom: "8px",
                zIndex: "999",
                cursor: "pointer",
                color: "#fff",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
              }}
            >
              Show less
            </span>
          </Typography>
        )}
      </CardContent>

      <CardHeader
        sx={{
          display: expanded ? "flex" : "none", // Hide when collapsed
          padding: "8px 0",
          "& .MuiCardHeader-content": { overflow: "hidden", minWidth: 0 },
        }}
        avatar={
          <Avatar
            src={data.data.owner.avatar || null}
            sx={{ bgcolor: getColor(data?.data?.owner?.fullName) }}
          >
            {data.data.owner.fullName?.charAt(0).toUpperCase() || "?"}
          </Avatar>
        }
        title={
          <Typography variant="body1" color="rgb(255,255,255)">
            {data.data.owner.fullName}
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="#aaa" fontSize="0.8rem">
            {subscriberCount}{" "}
            {subscriberCount === 1 ? "subscriber" : "subscribers"}
          </Typography>
        }
      />

     {!expanded && <Interaction id="display-interaction" /> } 
    </Card>
  );
}

export default Description;
