import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import { Box } from "@mui/material";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsIcon from "@mui/icons-material/Directions";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import MicOutlinedIcon from "@mui/icons-material/MicOutlined";

export default function Search({
  device,
  isMobileScreen,
  handleSearch,
  searchQuery,
  setSearchQuery,
  setSearchMenu,
}) {
  return (
    <>
      <Paper
        onSubmit={handleSearch}
        component="form"
        sx={{
          display: !isMobileScreen && device === "windows" ? "flex" : "none",
          flex: 1,
          minWidth: 0,
          p: "0px 4px",
          alignItems: "center",
          ml: "40px",
          borderRadius: 100,
          border: "1px solid hsl(0,0%,18.82%)",
          backgroundColor: "#0f0f0f",
        }}
      >
        <InputBase
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ ml: 1, flex: 1, color: "rgba(255,255,255,1)" }}
          placeholder="Search"
          inputProps={{ "aria-label": "search" }}
        />
        <IconButton
          type="submit"
          sx={{
            borderRadius: "0 50px 50px 0",
            px: "25px",
            right: "-4px",
            color: "#fff",
            backgroundColor: "hsla(0,0%,100%,.08)",
            "&:hover": {
              backgroundColor: "hsla(0,0%,100%,.08)",
            },
          }}
          aria-label="search"
        >
          <SearchIcon />
        </IconButton>
      </Paper>

      <Box
        sx={{
          display: device === "mobile" || isMobileScreen ? "flex" : "none",
          height: "var(--header-height)",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8px",
        }}
      >
        <IconButton
          onClick={() => setSearchMenu(false)}
          type="button"
          sx={{
            borderRadius: "50px",
            padding: device === "mobile" ? 0 : "",
            color: "#fff",
            marginRight: device === "mobile" ? 0 : "32px",
            backgroundColor: "none",
            "&:hover": {
              backgroundColor: "hsla(0,0%,100%,.08)",
            },
          }}
          aria-label="search"
        >
          <ArrowBackOutlinedIcon />
        </IconButton>
        <Paper
          onSubmit={handleSearch}
          component="form"
          sx={{
            p: "0px 4px",
            display: "flex",
            alignItems: "center",
            width: 600,
            height: device === "mobile" ? 30 : 40,
            ml: "auto",
            mx: device === "mobile" ? "12px" : "",
            borderRadius: 100,
            border: device === "mobile" ? "none" : "1px solid hsl(0,0%,18.82%)",
            backgroundColor: device === "mobile"
              ? "rgba(255,255,255,0.2)"
              : "transparent",
          }}
        >
          <InputBase
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ ml: 1, flex: 1, color: "rgba(255,255,255,1)" }}
            placeholder="Search"
            inputProps={{ "aria-label": "search" }}
          />
          <IconButton
            type="submit"
            sx={{
              borderRadius: "0 50px 50px 0",
              px: device === "mobile" ? "10px" : "25px",
              right: "-4px",
              color: "#fff",
              backgroundColor: device === "mobile"
                ? "transparent"
                : "hsla(0,0%,100%,.08)",
              "&:hover": {
                backgroundColor: device === "mobile"
                  ? "transparent"
                  : "hsla(0,0%,100%,.08)",
              },
            }}
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
        </Paper>

        <IconButton
          sx={{
            padding: "10px",
            borderRadius: "50px",
            backgroundColor: device === "mobile"
              ? "rgba(255,255,255,0.2)"
              : "transparent",
            width: 30,
            height: 30,
            marginLeft: device === "mobile" ? 0 : "10px",
            marginRight: "auto",
            "&:hover": {
              backgroundColor: "hsl(0,0%,18.82%)",
            },
          }}
        >
          <MicOutlinedIcon sx={{ color: "#fff" }} />
        </IconButton>
      </Box>
    </>
  );
}
