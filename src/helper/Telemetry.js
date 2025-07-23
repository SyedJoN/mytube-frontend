import { useEffect } from "react";
import { sendTelemetry } from "../apis/sendTelemetry";

const BATCH_TIME = 5000;
const BATCH_LIMIT = 5;

let telemetryInterval = null;
let hoverStartTime = null;
let lastRefetchSecond = 0;
let isTelemetryActive = false;
let batchQueue = [];

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


export function getCurrentVideoTelemetryData(userId, videoId, videoElement, seeked = 0, final = 0, source) {
  let currentTime = parseFloat(videoElement.currentTime.toFixed(3));
  const duration = parseFloat(videoElement.duration.toFixed(3));
  const lact = Date.now() - hoverStartTime;

  
  if (userId === null) {
    saveLastHoverTime(videoId, currentTime);
    return null;
  }

  return {
    videoId,
    currentTime,
    duration,
    state: videoElement.paused ? "paused" : "playing",
    muted: videoElement.muted,
    fullscreen: !!document.fullscreenElement,
    autoplay: videoElement.autoplay || false,
    sessionId: getSessionId(),
    anonId: !userId && getOrCreateAnonId(),
    timestamp: Date.now(),
    userId: userId || null,
    seeked,
    lact,
    final,
    source
  };
}

export function startTelemetry(userId, videoId, videoElement) {
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
  hoverStartTime = Date.now();
  console.log("✅ Telemetry started");
  console.log("readyState", videoElement.readyState);
  console.log("currentTime", videoElement.currentTime);

  telemetryInterval = setInterval(() => {
    console.log("interval");
    const data = getCurrentVideoTelemetryData(userId, videoId, videoElement);
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
  hoverStartTime = null;
  console.log("Stopped telemetry");
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
