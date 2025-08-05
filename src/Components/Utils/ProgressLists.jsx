import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { WebVTT } from "vtt.js";
import formatDuration from "../../utils/formatDuration";
import { useLocation } from "@tanstack/react-router";
import { transform } from "lodash";
import { sendTelemetry } from "../../apis/sendTelemetry";

import { flushSync } from "react-dom";
import throttle from "lodash/throttle";

export const ProgressLists = ({
  videoRef,
  userId,
  progress,
  setProgress,
  bufferedVal,
  setBufferedVal,
  videoId,
  isMini,
  isTheatre,
  hoverVideoRef,
  showSettings,
  vttUrl,
  playsInline,
  tracker,
}) => {
  var thumbWidth = 13;
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isDesktop = useMediaQuery(theme.breakpoints.down("xl"));
  const [hoverTime, setHoverTime] = useState(0);
  const [cueMap, setCueMap] = useState([]);
  const [hoveredCue, setHoveredCue] = useState(null);
  const [hoverX, setHoverX] = useState(0);
  const [isProgressEntered, setIsProgressEnter] = useState(false);
  const [hoveredProgress, setHoveredProgress] = useState(0);
  const [BarWidth, setBarWidth] = useState(0);

  const sliderRef = useRef(null);

  const ariaValueNow = videoRef.current
    ? Math.round(videoRef.current.currentTime)
    : 0;
  const ariaValueMax = videoRef.current
    ? Math.round(videoRef.current.duration)
    : 0;

  useEffect(() => {
    const slider = sliderRef.current;
    const video = videoRef.current;
    if (!slider || !video) return;

    const updateSizes = () => {
      if (!slider) return;
      const rect = slider.getBoundingClientRect();
      setBarWidth(rect.width);
    };

    updateSizes();

    const observer = new ResizeObserver(updateSizes);
    observer.observe(slider);
    observer.observe(video);

    window.addEventListener("resize", updateSizes);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSizes);
    };
  }, []);
const updateBuffered = useCallback(() => {
  const video = videoRef?.current;
  if (!video) return;
  
  try {
    if (video?.buffered?.length > 0 && video?.duration > 0) {
      const currentTime = video.currentTime;
      let bufferedEnd = 0;
      
      for (let i = 0; i < video.buffered.length; i++) {
        if (
          video.buffered.start(i) <= currentTime &&
          video.buffered.end(i) > currentTime
        ) {
          bufferedEnd = video.buffered.end(i);
          break;
        }
      }
      
      const bufferProgress = bufferedEnd / video.duration;
      setBufferedVal(bufferProgress);
    } else {
      setBufferedVal(0);
    }
  } catch (e) {
    console.warn("Buffered read error", e);
    setBufferedVal(0);
  }
}, [videoRef, setBufferedVal]);

const throttledUpdate = useCallback(
  throttle(updateBuffered, 200),
  [updateBuffered]
);

useEffect(() => {
  const video = videoRef?.current;
  if (!video) return;
  
  const events = ["loadeddata", "progress", "seek"];
  
  events.forEach((event) => {
    video.addEventListener(event, throttledUpdate);
  });
  
  throttledUpdate();
  
  return () => {
    events.forEach((event) => {
      video.removeEventListener(event, throttledUpdate);
    });
  };
}, [videoRef, throttledUpdate]);
  useEffect(() => {
    if (!vttUrl) return;

    fetch(vttUrl)
      .then((res) => res.text())
      .then((vttText) => {
        const cleanedVtt = vttText.replace(/align:middle/g, "align:center");

        const parser = new WebVTT.Parser(window, WebVTT.StringDecoder());
        const cues = [];

        parser.oncue = (cue) => {
          cues.push(cue);
        };

        parser.parse(cleanedVtt);
        parser.flush();

        setCueMap(cues);
      })
      .catch((err) => {
        console.error("Error loading or parsing VTT:", err);
      });
  }, [vttUrl]);

  const handleMouseMove = (e) => {
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    setHoverX(offsetX);

    const progress = Math.min(Math.max((offsetX / rect.width) * 100, 0), 100);
    setHoveredProgress(progress);

    const timeOnHover = (offsetX / rect.width) * videoRef.current.duration;
    setHoverTime(timeOnHover);
    const foundCue = cueMap.find(
      (cue) => timeOnHover >= cue.startTime && timeOnHover <= cue.endTime
    );

    setHoveredCue(foundCue || null);
  };
  const handleMouseLeave = () => {
    setHoveredCue(null);
  };
  const handleSeekMove = (e) => {
    if (!sliderRef.current || !videoRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newProgress = Math.min(
      Math.max((offsetX / rect.width) * 100, 0),
      100
    );

    const newTime = (videoRef.current?.duration * newProgress) / 100;
    videoRef.current.currentTime = newTime;
    setProgress(newProgress);
  };
  const handleSeekEnd = () => {
    window.removeEventListener("mousemove", handleSeekMove);
    window.removeEventListener("mouseup", handleSeekEnd);
  };

  const handleSeekStart = (e) => {
    e.preventDefault();
    window.addEventListener("mousemove", handleSeekMove);
    window.addEventListener("mouseup", handleSeekEnd);
  };

  const handleClickSeek = (e) => {
    if (!sliderRef?.current || !videoRef?.current) return;

    const fromTime = videoRef.current.currentTime;

    const rect = sliderRef.current?.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newProgress = Math.min(
      Math.max((offsetX / rect.width) * 100, 0),
      100
    );
    const newTime = (videoRef.current?.duration * newProgress) / 100;

    videoRef.current.currentTime = newTime;
    setProgress(newProgress);

    if (!userId) return;

    const hoverVideo = hoverVideoRef?.current;
    if (!hoverVideo) return;

    if (playsInline && tracker) {
      hoverVideo.currentTime = newTime;

      tracker.trackSeek(hoverVideo, fromTime, newTime);
    }
  };
  const previewStyle = getBackgroundPosition(hoveredCue?.text);

  const previewWidth = parseInt(previewStyle.width, 10) || 0;
  const half = previewWidth / 2;
  const clampedLeft = Math.max(
    0,
    Math.min(hoverX - half, BarWidth - previewWidth)
  );
  function getBackgroundPosition(
    cueText,
    previewWidth = playsInline ? 168 : 240,
    previewHeight = playsInline ? 93 : 135
  ) {
    if (typeof cueText !== "string") return {};
    const [urlPart = "", frag = ""] = cueText.split("#");
    if (typeof frag !== "string" || !frag.startsWith("xywh=")) return {};
    const nums = frag.slice(5).split(",").map(Number);
    if (nums.length !== 4 || nums.some(Number.isNaN)) return {};

    const [x, y, w, h] = nums;

    const scale = previewWidth / w;
    return {
      width: `${previewWidth}px`,
      height: `${previewHeight}px`,
      backgroundImage: `url(${urlPart})`,
      backgroundPosition: `-${x * scale}px -${y * scale}px`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${10 * w * scale}px auto`,
      border: "2px solid #fff",
      borderRadius: "8px",
    };
  }
  return (
    <Box
      className={`progress-bar-container control`}
      sx={{
        position: "absolute",
        display: "block",
        left: isMini ? "-12px" : "0",
        bottom:
          isMobile && !isMini && !playsInline
            ? "36px"
            : isMini
              ? "-2px"
              : playsInline
                ? "-2px"
                : "48px",
        width: "100%",
        height: isMini ? "10px" : playsInline ? "6px" : "5px",
      }}
    >
      <Box
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClickSeek}
        ref={sliderRef}
        component={"div"}
        role="slider"
        aria-valuemin={0}
        aria-valuenow={ariaValueNow}
        aria-valuemax={ariaValueMax}
        className="progress-bar"
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          touchAction: "none",
          cursor: "pointer",
        }}
      >
        <Box
          className={`${!hoveredCue || showSettings ? "hide" : "MuiPopper-root "}`}
          sx={{
            position: "absolute",
            bottom: "40px",
            left: `${clampedLeft}px`,
            pointerEvents: "none",
            ...previewStyle,
          }}
        >
          {" "}
          <Box
            sx={{
              display: "block",
              opacity: hoveredCue ? 1 : 0,
              position: "absolute",
              bottom: "-40px",
              left: "50%",
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                textAlign: "center",
                fontWeight: "600",
                textShadow: "1px 0px 16px rgba(0, 0, 0, 0.5)",
              }}
              fontSize={"0.85rem"}
            >
              {formatDuration(hoverTime)}
            </Typography>
          </Box>
        </Box>
        <Box
          className="progress-list"
          sx={{
            position: "relative",
            transform:
              isProgressEntered && !playsInline ? "scaleY(1.2)" : "scaleY(.6)",
            height: "100%",
            background: isMini ? "rgb(51,51,51)" : "rgba(255,255,255,0.2)",
            transition: "transform .1s cubic-bezier(0.4, 0, 1, 1)",
          }}
        >
          <div
            className="play-progress"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transform: `scaleX(${progress / 100})`,
              transformOrigin: "0 0",
              zIndex: 3,
            }}
          ></div>
          <div
            className="hover-progress"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              opacity: hoveredCue ? 1 : 0,
              width: "100%",
              height: "100%",
              transform: `scaleX(${hoveredProgress / 100})`,
              transformOrigin: "0 0",
              zIndex: 2,
            }}
          ></div>
          <div
            className={`load-progress ${isMini ? "hide" : ""}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "100%",
              transform: `scaleX(${bufferedVal})`,
              transformOrigin: "0 0",
              borderRadius: "3px",
              zIndex: 1,
              transition: "width 0.1s",
            }}
          />
        </Box>

        <Box
          onMouseDown={handleSeekStart}
          className={`thumb-container ${isMini ? "hide" : ""}`}
          sx={{
            position: "absolute",
            left: `-${thumbWidth / 2}px`,
            top: "-4px",
            transform: `translateX(${(progress / 100) * BarWidth}px)`,
            zIndex: 260,
            transition: "transform .1s cubic-bezier(0.4, 0, 1, 1)",
            pointerEvents: "none",
          }}
        >
          <div
            className="custom-thumb"
            style={{
              width: `${thumbWidth}px`,
              height: `${thumbWidth}px`,
              transform: playsInline
                ? isProgressEntered
                  ? "scale(1)"
                  : "scale(0)"
                : "scale(1)",
              borderRadius: "50px",
              zIndex: 253,
              transition:
                "all .1s cubic-bezier(.4,0,1,1), -webkit-transform .1s cubic-bezier(.4,0,1,1)",
            }}
          ></div>
        </Box>

        <Box
          onMouseDown={handleSeekStart}
          onMouseMove={() => setIsProgressEnter(true)}
          onMouseLeave={() => setIsProgressEnter(false)}
          className="progress-offset"
          sx={{
            position: "absolute",
            width: "100%",
            height: "16px",
            bottom: 0,
            userSelect: "none",
            zIndex: 250,
          }}
        ></Box>
      </Box>
    </Box>
  );
};

export default ProgressLists;
