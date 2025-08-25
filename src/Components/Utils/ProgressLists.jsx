import React, { useEffect, useCallback, useState } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { WebVTT } from "vtt.js";
import formatDuration from "../../utils/formatDuration";
import useRefReducer from "./useRefReducer";

import throttle from "lodash/throttle";
import { UserInteractionContext } from "../../Contexts/RootContexts";
import useStateReducer from "./useStateReducer";

var thumbWidth = 13;

export const ProgressLists = ({
  videoRef,
  isMini,
  showSettings,
  vttUrl,
  playsInline,
  tracker,
  updateState: updateVideoState,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { isUserInteracted, setIsUserInteracted } = React.useContext(
    UserInteractionContext
  );

  const { state, updateState } = useStateReducer({
    progress: 0,
    bufferedVal: 0,
    hoverTime: 0,
    cueMap: [],
    hoveredCue: null,
    hoverX: 0,
    isProgressEntered: false,
    hoveredProgress: 0,
    BarWidth: 0,
    isSeeking: false,
    playerWidth: 528,
    playerHeight: 297,
    left: 0,
  });
  const { thumbRef, prevVideoStateRef, sliderRef, rafId } = useRefReducer({
    thumbRef: state.progress || null,
    prevVideoStateRef: null,
    sliderRef: null,
    rafId: null,
  });

  const ariaValueNow = videoRef.current
    ? Math.round(videoRef.current.currentTime)
    : 0;
  const ariaValueMax = videoRef.current
    ? Math.round(videoRef.current.duration)
    : 0;

  const progressUpdate = useCallback(() => {
    const video = videoRef.current;

    if (!video || isNaN(video.duration) || video.duration === 0) return;

    const value = (video.currentTime / video.duration) * 100;
    updateState({
      progress: value,
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const events = ["loadeddata", "progress", "seek", "timeupdate"];

    events.forEach((event) => video.addEventListener(event, progressUpdate));
    return () => {
      events.forEach((event) =>
        video.removeEventListener(event, progressUpdate)
      );
    };
  }, [progressUpdate]);

  useEffect(() => {
    const slider = sliderRef.current;
    const video = videoRef.current;
    if (!slider || !video) return;

    const updateSizes = () => {
      if (!slider) return;
      const rect = slider.getBoundingClientRect();
      const { width, height } = videoRef.current.getBoundingClientRect();

      updateState({
        BarWidth: rect.width,
        playerWidth: width,
        playerHeight: height,
      });
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

        updateState({ bufferedVal: bufferProgress });
      } else {
        updateState({ bufferedVal: 0 });
      }
    } catch (e) {
      console.warn("Buffered read error", e);
      updateState({ bufferedVal: 0 });
    }
  }, []);

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
  }, [throttledUpdate]);

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

        updateState({
          cueMap: cues,
        });
      })
      .catch((err) => {
        console.error("Error loading or parsing VTT:", err);
      });
  }, [vttUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!playsInline || !video) return;
    if (!state.isSeeking) {
      rafId.current = requestAnimationFrame(() => {
        if (thumbRef.current) {
          const x = (progress / 100) * state.BarWidth;
          thumbRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
        }
      });
    }

    return () => cancelAnimationFrame(rafId.current);
  }, [state.progress, state.isSeeking, state.BarWidth, playsInline]);

  const handleMouseMove = (e) => {
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;

    const progress = Math.min(Math.max((offsetX / rect.width) * 100, 0), 100);

    const timeOnHover = (offsetX / rect.width) * videoRef.current.duration;
    const foundCue = state.cueMap.find(
      (cue) => timeOnHover >= cue.startTime && timeOnHover <= cue.endTime
    );

    updateState({
      hoveredProgress: progress,
      hoverTime: timeOnHover,
      hoverX: offsetX,
      hoveredCue: foundCue || null,
    });
  };
  const handleMouseLeave = () => {
    updateState({ hoveredCue: null });
  };

  const handleInlineSeekMove = (e) => {
    if (!sliderRef.current || !videoRef.current || !thumbRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newProgress = Math.min(
      Math.max((offsetX / rect.width) * 100, 0),
      100
    );

    requestAnimationFrame(
      () =>
        thumbRef.current &&
        (thumbRef.current.style.transform = `translate3d(${(newProgress / 100) * state.BarWidth}px, 0, 0)`)
    );

    const progress = Math.min(Math.max((offsetX / rect.width) * 100, 0), 100);

    const timeOnHover = (offsetX / rect.width) * videoRef.current.duration;
    const foundCue = state.cueMap.find(
      (cue) => timeOnHover >= cue.startTime && timeOnHover <= cue.endTime
    );

    updateState({
      isSeeking: true,
      hoverX: offsetX,
      hoveredProgress: progress,
      hoverTime: timeOnHover,
      hoveredCue: foundCue || null,
    });
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
    updateState({
      progress: newProgress,
    });
    // videoRef.current.currentTime = newTime;

    const timeOnHover = (offsetX / rect.width) * videoRef.current.duration;
    const foundCue = state.cueMap.find(
      (cue) => timeOnHover >= cue.startTime && timeOnHover <= cue.endTime
    );

    updateState({
      isSeeking: true,
      hoverX: offsetX,
      hoveredProgress: state.progress,
      hoverTime: timeOnHover,
      hoveredCue: foundCue || null,
    });
  };
  const handleInlineSeekEnd = (e) => {
    const video = videoRef.current;
    if (!video) return;
    handleClickSeek(e);
    updateState({
      isSeeking: false,
      hoveredCue: null,
    });

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
      handleClickSeek(e);
    }
    updateState({
      isSeeking: false,
      hoveredCue: null,
    });
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
    updateState({
      progress: newProgress,
    });
    const newTime = (newProgress * videoRef.current?.duration) / 100;

    videoRef.current.currentTime = newTime;
    if (!playsInline) {
      videoRef.current?.pause();
      updateVideoState({ showIcon: false, isPlaying: false });
    }

    if (!isUserInteracted) {
      setIsUserInteracted(true);
    }
    if (tracker && isFinite(videoRef.current.currentTime)) {
      tracker.trackSeek(videoRef.current, fromTime, newTime);
    }
  };
  const isHoverDefault = playsInline && !state.isSeeking;
  const isHoverSeeking = playsInline && state.isSeeking;
  const isWatchDefault = !playsInline && !state.isSeeking;
  const isWatchSeeking = !playsInline && state.isSeeking;

  const customFrameWidth = isHoverDefault
    ? 168
    : isHoverSeeking
      ? state.playerWidth
      : isWatchSeeking
        ? state.playerWidth
        : 240;

  const customFrameHeight = isHoverDefault
    ? 93
    : isHoverSeeking
      ? state.playerHeight
      : isWatchSeeking
        ? state.playerHeight
        : 135;

  const previewStyle = getBackgroundPosition(state.hoveredCue?.text);

  const previewWidth = parseInt(previewStyle.width, 10) || 0;
  const half = previewWidth / 2;
  const clampedLeft = Math.max(
    0,
    Math.min(state.hoverX - half, state.BarWidth - previewWidth)
  );

  function getBackgroundPosition(cueText, previewWidth = customFrameWidth) {
    if (typeof cueText !== "string") return {};
    const [urlPart = "", frag = ""] = cueText.split("#");
    if (typeof frag !== "string" || !frag.startsWith("xywh=")) return {};
    const nums = frag.slice(5).split(",").map(Number);
    if (nums.length !== 4 || nums.some(Number.isNaN)) return {};

    const [x, y, w, h] = nums;

    const scale = previewWidth / w;
    const previewHeight = h * scale;
    return {
      width: `${previewWidth}px`,
      height: `${previewHeight}px`,
      backgroundImage: `url(${urlPart})`,
      backgroundPosition: `-${x * scale}px -${y * scale}px`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${10 * w * scale}px auto`,
      border: state.isSeeking ? "none" : "2px solid #fff",
      borderRadius: state.isSeeking ? 0 : "8px",
    };
  }

  function getBackgroundPositionDefault(cueText, previewWidth = 240) {
    if (typeof cueText !== "string") return {};
    const [urlPart = "", frag = ""] = cueText.split("#");
    if (typeof frag !== "string" || !frag.startsWith("xywh=")) return {};
    const nums = frag.slice(5).split(",").map(Number);
    if (nums.length !== 4 || nums.some(Number.isNaN)) return {};

    const [x, y, w, h] = nums;

    const scale = previewWidth / w;
    const previewHeight = h * scale;

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

  const previewStyle_default = getBackgroundPositionDefault(
    state.hoveredCue?.text
  );

  const previewWidth_default = parseInt(previewStyle_default.width, 10) || 0;
  const half_default = previewWidth_default / 2;
  const clampedLeft_default = Math.max(
    0,
    Math.min(state.hoverX - half_default, state.BarWidth - previewWidth_default)
  );

  useEffect(() => {
    if (videoRef.current) {
      const rect = videoRef.current.getBoundingClientRect();
      console.log(rect?.left);

      updateState({
        left: rect.left,
      }); // px from viewport left
    }
  }, [vttUrl]);

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
              ? "-3px"
              : playsInline
                ? "-2px"
                : "48px",
        width: "100%",
        height: isMini ? "10px" : playsInline ? "6px" : "5px",
      }}
    >
      <Box
        onMouseMove={state.isSeeking ? undefined : handleMouseMove}
        onMouseLeave={state.isSeeking ? undefined : handleMouseLeave}
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
          className={`${!state.hoveredCue || showSettings || isMini ? "hide" : "MuiPopper-root "}`}
          sx={{
            zIndex: isWatchSeeking ? -1 : "",
            position: "absolute",
            bottom: isHoverSeeking ? "2px" : isWatchSeeking ? "-46px" : "45px",
            left: isWatchSeeking ? `${state.left}px` : `${clampedLeft}px`,
            pointerEvents: "none",
            ...previewStyle,
          }}
        >
          <Box
            className={`${isWatchSeeking ? "hide" : ""}`}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 1,
              position: "absolute",
              bottom: isHoverSeeking ? "40px" : "-45px",
              background: isHoverSeeking ? "rgba(0, 0, 0, 0.5)" : "transparent",
              borderRadius: "50px",
              height: "24px",
              width: "52px",
              left: "50%",
              pointerEvents: "none",
              transform: isHoverSeeking
                ? "translate(-50%, 0%)"
                : "translate(-50%, -50%)",
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                textAlign: "center",
                fontWeight: "600",
                textShadow: "1px 0px 16px rgba(0, 0, 0, 1)",
              }}
              fontSize={isHoverSeeking ? "0.75rem" : "0.95rem"}
            >
              {formatDuration(state.hoverTime)}
            </Typography>
          </Box>
        </Box>
        <Box
          className={`${!state.hoveredCue || showSettings || playsInline || isMini ? "hide" : "MuiPopper-root defaultVtt"}`}
          sx={{
            zIndex: 10,
            position: "absolute",
            bottom: "45px",
            left: `${clampedLeft_default}px`,
            pointerEvents: "none",
            ...previewStyle_default,
          }}
        >
          <Box
            className={`${isWatchSeeking ? "" : ""}`}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 1,
              position: "absolute",
              bottom: isHoverSeeking ? "40px" : "-45px",
              background: isHoverSeeking ? "rgba(0, 0, 0, 0.5)" : "transparent",
              borderRadius: "50px",
              height: "24px",
              width: "52px",
              left: "50%",
              pointerEvents: "none",
              transform: isHoverSeeking
                ? "translate(-50%, 0%)"
                : "translate(-50%, -50%)",
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                textAlign: "center",
                fontWeight: "600",
                textShadow: "1px 0px 16px rgba(0, 0, 0, 1)",
              }}
              fontSize={isHoverSeeking ? "0.75rem" : "0.95rem"}
            >
              {formatDuration(state.hoverTime)}
            </Typography>
          </Box>
        </Box>

        <Box
          className="progress-list"
          sx={{
            position: "relative",
            transform:
              state.isProgressEntered && !playsInline && isMini
                ? "scaleY(1.5)"
                : state.isProgressEntered && !playsInline && !isMini
                  ? "scaleY(1.2)"
                  : "scaleY(.6)",
            height: "100%",
            background: isMini ? "rgb(51,51,51)" : "rgba(255,255,255,0.2)",
            transition: "transform .3s cubic-bezier(1, 0, 0.4, 0.4)",
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
              transform: `scaleX(${state.progress / 100})`,
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
              opacity: state.hoveredCue && !isMini ? 1 : 0,
              width: "100%",
              height: "100%",
              transform: `scaleX(${state.hoveredProgress / 100})`,
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
              transform: `scaleX(${state.bufferedVal})`,
              transformOrigin: "0 0",
              borderRadius: "3px",
              zIndex: 1,
              transition: "width 0.1s",
            }}
          />
        </Box>

        <Box
          onMouseDown={isMini ? undefined : handleSeekStart}
          ref={thumbRef}
          className={`thumb-container ${isMini ? "hide" : ""}`}
          sx={{
            position: "absolute",
            left: `-${thumbWidth / 2}px`,
            top: "-4px",
            transform: `translateX(${(state.progress / 100) * state.BarWidth}px)`,
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
                ? state.isProgressEntered || state.isSeeking
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
          onMouseDown={isMini ? undefined : handleSeekStart}
          onMouseMove={() => updateState({ isProgressEntered: true })}
          onMouseLeave={() => updateState({ isProgressEntered: false })}
          className="progress-offset"
          sx={{
            position: "absolute",
            width: "100%",
            height: "16px",
            bottom: 0,
            zIndex: 250,
          }}
        ></Box>
      </Box>
    </Box>
  );
};

export default React.memo(ProgressLists, (prevProps, nextProps) => {
  const compareKeys = ["vttUrl", "isMini", "playsInline"];
  return compareKeys.every((key) => prevProps[key] === nextProps[key]);
});
