import React, { useState } from "react";
import CardHeader from "@mui/material/CardHeader";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import { getColor } from "../utils/getColor";
import formatDate from "../utils/dayjs";
import { Typography } from "@mui/material";

function Description({ data, subscriberCount }) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = (e) => {
    e.stopPropagation();
    setExpanded((prev)=> !prev);
  }

  return (
    <Card
      sx={{
        backgroundColor: "rgba(255,255,255,0.1)",
        marginTop: 2,
        borderRadius: "8px",
        padding: "8px 12px",
        transition: "all 0.3s ease-in-out",
        maxHeight: expanded ? "none" : "120px",
        overflow: "hidden",
      }}
      onClick={() => setExpanded(true)}
    >
      <CardContent sx={{ padding: "8px 0" }}>
        {/* Views and Date */}
        <Typography variant="body2" color="rgb(255,255,255)" fontWeight={500}>
          {data.data.views} {data.data.views === 1 ? "view" : "views"} •{" "}
          {formatDate(data.data.createdAt)}
        </Typography>

        {/* Expandable Description */}
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
      </CardContent>

      <CardHeader
        sx={{
          display: expanded ? "flex" : "none", // Hide when collapsed
          padding: 0,
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
      {expanded ? (
        <span
          role="button"
          style={{
            display: "inline-block",
            paddingTop: "20px",
            color: "rgb(255,255,255)",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
          onClick={(e) => {
            handleToggle(e)
          } }
        >
          Show less
        </span>
      ) : null}
    </Card>
  );
}

export default Description;
