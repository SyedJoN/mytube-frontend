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
import {
  UserContext,
  UserInteractionContext,
} from "../../Contexts/RootContexts";

export const ProgressLists = ({
  videoRef,
  progress,
  bufferedVal,
  isMini,
  showSettings,
  vttUrl,
  playsInline,
  tracker,
  setBufferedVal,
  setProgress,
  updateState,
}) => {
  var thumbWidth = 13;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isUserInteracted, setIsUserInteracted } = React.useContext(
    UserInteractionContext
  );

  const [hoverTime, setHoverTime] = useState(0);
  const [cueMap, setCueMap] = useState([]);
  const [hoveredCue, setHoveredCue] = useState(null);
  const [hoverX, setHoverX] = useState(0);
  const [isProgressEntered, setIsProgressEnter] = useState(false);
  const [hoveredProgress, setHoveredProgress] = useState(0);
  const [BarWidth, setBarWidth] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const thumbRef = useRef(progress || null);
  const prevVideoStateRef = useRef(null);

  const sliderRef = useRef(null);
  const rafId = useRef(null);

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
  }, [videoRef]);

  const throttledUpdate = useCallback(throttle(updateBuffered, 200), [
    updateBuffered,
  ]);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!playsInline || !video) return;
    if (!isSeeking) {
      rafId.current = requestAnimationFrame(() => {
        if (thumbRef.current) {
          const x = (progress / 100) * BarWidth;
          thumbRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
        }
      });
    }

    return () => cancelAnimationFrame(rafId.current);
  }, [progress, isSeeking, BarWidth]);

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

  const handleInlineSeekMove = (e) => {
    if (!sliderRef.current || !videoRef.current || !thumbRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newProgress = Math.min(
      Math.max((offsetX / rect.width) * 100, 0),
      100
    );

    setIsSeeking(true);

    requestAnimationFrame(
      () =>
        thumbRef.current &&
        (thumbRef.current.style.transform = `translate3d(${(newProgress / 100) * BarWidth}px, 0, 0)`)
    );

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
  const handleSeekMove = (e) => {
    if (!sliderRef.current || !videoRef.current || !thumbRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newProgress = Math.min(
      Math.max((offsetX / rect.width) * 100, 0),
      100
    );

    const newTime = (videoRef.current?.duration * newProgress) / 100;
    setProgress(newProgress);
    videoRef.current.currentTime = newTime;
  };
  const handleInlineSeekEnd = (e) => {
    const video = videoRef.current;
    if (!video) return;
    handleClickSeek(e);
    setIsSeeking(false);
    setHoveredCue(null);

    window.removeEventListener("mousemove", handleInlineSeekMove);
    window.removeEventListener("mouseup", handleInlineSeekEnd);
  };
  const handleSeekEnd = (e) => {
    const video = videoRef.current;
    if (!video) return;
    if (prevVideoStateRef.current === "play") {
      requestAnimationFrame(() =>
        video.play()?.catch((err) => console.log(err))
      );
    }

    window.removeEventListener("mousemove", handleSeekMove);
    window.removeEventListener("mouseup", handleSeekEnd);
  };

  const handleSeekStart = (e) => {
    console.log("true");
    e.preventDefault();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      prevVideoStateRef.current = "paused";
    } else {
      prevVideoStateRef.current = "play";
    }

    window.addEventListener(
      "mousemove",
      playsInline ? handleInlineSeekMove : handleSeekMove
    );
    window.addEventListener(
      "mouseup",
      playsInline ? handleInlineSeekEnd : handleSeekEnd
    );
  };
  const handleInlineClickSeek = (e) => {
    if (!sliderRef?.current || !videoRef?.current) return;

    const fromTime = videoRef.current.currentTime;

    const rect = sliderRef.current?.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newProgress = Math.min(
      Math.max((offsetX / rect.width) * 100, 0),
      100
    );

    const newTime = (newProgress * videoRef.current?.duration) / 100;

    if (tracker && isFinite(videoRef.current.currentTime)) {
      tracker.trackSeek(videoRef.current, fromTime, newTime);
    }
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
    setProgress(newProgress);
    const newTime = (newProgress * videoRef.current?.duration) / 100;

    videoRef.current.currentTime = newTime;
    if (!playsInline) {
      videoRef.current?.pause();
      updateState({ showIcon: false, isPlaying: false });
    }

    if (!isUserInteracted) {
      setIsUserInteracted(true);
    }
    if (tracker && isFinite(videoRef.current.currentTime)) {
      tracker.trackSeek(videoRef.current, fromTime, newTime);
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
    previewWidth = playsInline && !isSeeking ? 168 : isSeeking ? 528 : 240,
    previewHeight = playsInline && !isSeeking ? 93 : isSeeking ? 297 : 135
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
      border: isSeeking ? "none" : "2px solid #fff",
      borderRadius: isSeeking ? 0 : "8px",
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
        onMouseMove={isSeeking ? undefined : handleMouseMove}
        onMouseLeave={isSeeking ? undefined : handleMouseLeave}
        onMouseDown={playsInline ? handleInlineClickSeek : handleClickSeek}
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
            bottom: isSeeking ? "2px" : "45px",
            left: `${clampedLeft}px`,
            pointerEvents: "none",
            ...previewStyle,
          }}
        >
          {" "}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 1,
              position: "absolute",
              bottom: isSeeking ? "40px" : "-45px",
              background: isSeeking ? "rgba(0, 0, 0, 0.5)" : "transparent",
              borderRadius: "50px",
              height: "24px",
              width: "52px",
              left: "50%",
              pointerEvents: "none",
              transform: isSeeking ? "translate(-50%, 0%)" : "translate(-50%, -50%)",
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                textAlign: "center",
                fontWeight: "600",
                textShadow: "1px 0px 16px rgba(0, 0, 0, 1)",
              }}
              fontSize={isSeeking ? "0.75rem" : "0.95rem"}
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
          ref={thumbRef}
          className={`thumb-container ${isMini ? "hide" : ""}`}
          sx={{
            position: "absolute",
            left: `-${thumbWidth / 2}px`,
            top: "-4px",
            transform: `translateX(${(progress / 100) * BarWidth}px)`,
            zIndex: 260,
            transition: "none",
            pointerEvents: "none",
          }}
        >
          <div
            className="custom-thumb"
            style={{
              width: `${thumbWidth}px`,
              height: `${thumbWidth}px`,
              transform: playsInline
                ? isProgressEntered || isSeeking
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
