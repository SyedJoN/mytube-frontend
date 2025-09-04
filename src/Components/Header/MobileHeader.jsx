import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import {
  Box,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTheme } from "@mui/material/styles";
import Search from "../Search/Search";
import { Link } from "@tanstack/react-router";
import AccountMenu from "../Menus/AccountMenu";
import { useLocation } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { throttle } from "lodash";
import CustomSlide from "./Slide";
import { DrawerContext, UserContext } from "../../Contexts/RootContexts";
import { useFullscreen } from "../Utils/useFullScreen";
import { usePlayerSetting } from "../../helper/usePlayerSettings";
import { DeviceContext } from "../../Contexts/DeviceContext";

function MobileHeader({ ...props }) {
  const location = useLocation();
  const theme = useTheme();
  const isFullscreen = useFullscreen();
  const context = React.useContext(DrawerContext);
  const userContext = React.useContext(UserContext);
  const { data: dataContext } = userContext ?? {};
  const { device } = React.useContext(DeviceContext);
  const isAuthenticated = dataContext || null;

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchMenu, setSearchMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [opacity, setOpacity] = useState(1);
  const navigate = useNavigate();

   const handleScroll = useCallback(() => {
  
      const scrollY = Math.max(0, window.scrollY);
      const maxScroll = 31;
      const stepsArray = [0, 0.3, 0.6, 1];
      const stepSize = maxScroll / stepsArray.length;
      const stepIndex = Math.min(
        stepsArray.length - 1,
        Math.floor(scrollY / stepSize)
      );
  
      setOpacity(stepsArray[stepIndex]);
    }, []);

      React.useEffect(() => {

    const throttledHandleScroll = throttle(handleScroll, 100);
    window.addEventListener("scroll", throttledHandleScroll);
    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, []);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate({ to: `/search/${searchQuery}` });
      }
    },
    [searchQuery, navigate]
  );

  React.useEffect(() => {
    if (!isMobile) {
      setSearchMenu(false);
    }
  }, [isMobile]);

  return (
    <>
      <CssBaseline />

      <AppBar
        data-fullscreen={isFullscreen}
        id="header"
        position="fixed"
        sx={{
          boxShadow: "none",
          background: "none",
        }}
      >
        <Toolbar
          sx={{
            display: !searchMenu ? "block" : "none",

            paddingLeft: "8px",
            paddingRight: "8px",
            minHeight: "var(--header-height)",
          }}
        >
          <Box
            className="header-content"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: "var(--header-height)",
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              className="start"
            >
              <Link
                style={{
                  display: "inline-block",
                  verticalAlign: "middle",
                  color: "#fff",
                  textDecoration: "none",
                  paddingLeft: "8px",
                  flexGrow: 1,
                }}
                to="/"
              >
                <Typography variant="h6" noWrap component="div">
                  VTube
                </Typography>
              </Link>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              className="end"
            >
              <IconButton
                disableRipple
                onClick={() => setSearchMenu(true)}
                type="button"
                sx={{
                  borderRadius: "50px",
                  color: "#fff",
                  backgroundColor: "none",
                  "&:hover": {
                    backgroundColor: "hsla(0,0%,100%,.08)",
                  },
                }}
                aria-label="search"
              >
                <SearchIcon />
              </IconButton>

              <IconButton
                disableRipple
                sx={{
                  display: "inline-flex",
                  padding: "4px",
                  borderRadius: "50px",
                  backgroundColor: "transparent",
                  marginLeft: 1,
                  marginRight: "0",
                }}
              >
                <MoreVertIcon sx={{ color: "#fff" }} />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
        <Box
          sx={{
            display: searchMenu ? "block" : "none",
          }}
        >
          <Search
            setSearchMenu={setSearchMenu}
            isMobileScreen={isMobile}
            device={device}
            handleSearch={handleSearch}
            searchQuery={searchQuery || ""}
            setSearchQuery={setSearchQuery}
          />
        </Box>
        <Box
          sx={{
            background: "#0f0f0f",
            opacity: opacity,
            position: "absolute",
            zIndex: -1,
            inset: 0,
          }}
          id="background"
        ></Box>
      </AppBar>
    </>
  );
}

export default MobileHeader;
