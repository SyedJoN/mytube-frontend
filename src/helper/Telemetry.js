import { useEffect } from "react";
import { sendTelemetry } from "../apis/sendTelemetry";
import { throttle } from "lodash";

const BATCH_TIME = 10000;
const BATCH_LIMIT = 5;

let telemetryInterval = null;
let lastInteraction = null;
let lastVideoTime = null;
let isTelemetryActive = false;
let batchQueue = [];
let stArray = [];
let etArray = [];

export function pushTime(et) {
  stArray.push(lastVideoTime ?? 0);
  etArray.push(et);
}
function getOrCreateAnonId() {
  let anonId = localStorage.getItem("anonId");
  if (!anonId) {
    anonId = crypto.randomUUID();
    localStorage.setItem("anonId", anonId);
  }
  return anonId;
}

function getSessionId() {
  let sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
}

function saveLastHoverTime(videoId, currentTime) {
  sessionStorage.setItem(`hoverTime_${videoId}`, currentTime.toFixed(2));
}

export function getSavedHoverTime(videoId) {
  const time = sessionStorage.getItem(`hoverTime_${videoId}`);
  return time ? parseFloat(time) : 0;
}


export function sendFinalTelemetryData(
  userId,
  videoId,
  videoElement,
  refetchedTime = 0,
  seeked = 0,
  final = 0,
  source = "home"
) {
  const currentTime = parseFloat(videoElement.currentTime.toFixed(3));
  const duration = parseFloat(videoElement.duration.toFixed(3));
  const lact = Date.now() - lastInteraction;
  const referrer = document.referrer || "direct";

  if (userId === null) {
    saveLastHoverTime(videoId, currentTime);
    return null;
  }

  const telemetry = {
    videoId,
    currentTime: refetchedTime === 0 ? (lastVideoTime ?? 0) : refetchedTime, // et
    duration,
    st: [refetchedTime === 0 ? (lastVideoTime ?? 0) : refetchedTime],
    et: [currentTime],
    state: videoElement.paused ? "paused" : "playing",
    muted: videoElement.muted,
    fullscreen: !!document.fullscreenElement,
    autoplay: videoElement.autoplay || false,
    sessionId: getSessionId(),
    anonId: !userId && getOrCreateAnonId(),
    timestamp: Date.now(),
    userId: userId || null,
    referrer,
    seeked,
    lact,
    final,
    source,
  };

  sendTelemetry([telemetry]);

  if (Math.abs(telemetry.st - telemetry.et) > 10) {
    const cmt = telemetry.et[0];
    const finalTelemetry = {
      videoId,
      currentTime: cmt,
      duration,
      st: telemetry.et,
      et: telemetry.et,
      state: videoElement.paused ? "paused" : "playing",
      muted: videoElement.muted,
      fullscreen: !!document.fullscreenElement,
      autoplay: videoElement.autoplay || false,
      sessionId: getSessionId(),
      anonId: !userId && getOrCreateAnonId(),
      timestamp: Date.now(),
      userId: userId || null,
      referrer,
      seeked,
      lact,
      final: 1,
      source,
    };
    sendTelemetry([finalTelemetry]);
  } else {
    const finalTelemetry = {
      videoId,
      currentTime: 0,
      duration,
      st: [0],
      et: [0],
      state: videoElement.paused ? "paused" : "playing",
      muted: videoElement.muted,
      fullscreen: !!document.fullscreenElement,
      autoplay: videoElement.autoplay || false,
      sessionId: getSessionId(),
      anonId: !userId && getOrCreateAnonId(),
      timestamp: Date.now(),
      userId: userId || null,
      referrer,
      seeked,
      lact,
      final: 1,
      source,
    };
    sendTelemetry([finalTelemetry]);
  }
  lastVideoTime = currentTime; // update for next interval
  console.log(telemetry.st[0] - telemetry.et[0]);
  console.log("st", telemetry.st[0]);
  console.log("et", telemetry.et[0]);
}
export function getCurrentVideoTelemetryData(
  userId,
  videoId,
  videoElement,
  refetchedTime = 0,
  seeked = 0,
  final = 0,
  source = "home"
) {
  const currentTime = parseFloat(videoElement.currentTime.toFixed(3));
  const duration = parseFloat(videoElement.duration.toFixed(3));
  const lact = Date.now() - lastInteraction;
  const referrer = document.referrer || "direct";

  if (userId === null) {
    saveLastHoverTime(videoId, currentTime);
    return null;
  }
  console.log(refetchedTime);
  // stArray.push(refetchedTime ?? 0);
  // etArray.push(currentTime);

  const telemetry = {
    videoId,
    currentTime: refetchedTime === 0 ? (lastVideoTime ?? 0) : refetchedTime, // et
    duration,
    st: [refetchedTime === 0 ? (lastVideoTime ?? 0) : refetchedTime],
    et: [currentTime],
    state: videoElement.paused ? "paused" : "playing",
    muted: videoElement.muted,
    fullscreen: !!document.fullscreenElement,
    autoplay: videoElement.autoplay || false,
    sessionId: getSessionId(),
    anonId: !userId && getOrCreateAnonId(),
    timestamp: Date.now(),
    userId: userId || null,
    referrer,
    seeked,
    lact,
    final,
    source,
  };

  lastVideoTime = currentTime; // update for next interval

  return telemetry;
}

export function startTelemetry(
  userId,
  videoId,
  videoElement,
  refetchedTime = 0
) {
  console.log("🚀 Attempt to start telemetry", {
    telemetryInterval,
    isTelemetryActive,
    videoElementExists: !!videoElement,
  });

  if (telemetryInterval || isTelemetryActive || !videoElement) {
    console.log("⛔ Telemetry not started due to existing state");
    return;
  }

  isTelemetryActive = true;
  lastInteraction = Date.now();
  console.log("✅ Telemetry started");
  console.log("readyState", videoElement.readyState);
  console.log("currentTime", videoElement.currentTime);

  telemetryInterval = setInterval(() => {
    console.log("interval");
    const data = getCurrentVideoTelemetryData(
      userId,
      videoId,
      videoElement,
      refetchedTime
    );
    batchQueue.push(data);

    if (batchQueue.length >= BATCH_LIMIT) {
      flushTelemetryQueue();
    }
  }, BATCH_TIME);
}

export function stopTelemetry() {
  clearInterval(telemetryInterval);
  telemetryInterval = null;
  isTelemetryActive = false;
  lastInteraction = null;
  lastVideoTime = null;
  stArray = [];
  etArray = [];
  console.log("Stopped telemetry");

  flushTelemetryQueue();
}

export async function flushTelemetryQueue() {
  if (batchQueue.length === 0) return;

  const dataToSend = [...batchQueue];
  batchQueue = [];
  try {
    await sendTelemetry(dataToSend);
    console.log("Telemetry flushed successfully:", dataToSend);
  } catch (err) {
    console.error("Failed to flush telemetry", err);
    batchQueue = [...dataToSend, ...batchQueue];
  }
}

const updateInteraction = () => (lastInteraction = Date.now());

window.addEventListener("mousemove", throttle(updateInteraction, 1000));
window.addEventListener("keydown", updateInteraction);
window.addEventListener("click", updateInteraction);
window.addEventListener("touchstart", updateInteraction);
