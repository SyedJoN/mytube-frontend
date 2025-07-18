import { sendTelemetry } from "../apis/sendTelemetry";

let telemetryInterval = null;
let hoverStartTime = null;
let isTelemetryActive = false;
// Generate or retrieve a persistent anonymous ID
function getOrCreateAnonId() {
  let anonId = localStorage.getItem("anonId");
  if (!anonId) {
    anonId = crypto.randomUUID();
    localStorage.setItem("anonId", anonId);
  }
  return anonId;
}

// Generate or retrieve a session-scoped ID
function getSessionId() {
  let sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
}

// Optional: Save currentTime in localStorage for hover resume later
function saveLastHoverTime(videoId, currentTime) {
  localStorage.setItem(`hoverTime_${videoId}`, currentTime.toFixed(2));
}

// Optional: Load saved hover time if exists
export function getSavedHoverTime(videoId) {
  const time = localStorage.getItem(`hoverTime_${videoId}`);
  return time ? parseFloat(time) : 0;
}


function getCurrentVideoTelemetryData(videoId, videoElement) {
  const currentTime = parseFloat(videoElement.currentTime.toFixed(2));
  const duration = parseFloat(videoElement.duration.toFixed(2));
  const lact = Date.now() - hoverStartTime;


  saveLastHoverTime(videoId, currentTime);

  return {
    videoId,
    currentTime,
    duration,
    state: videoElement.paused ? "paused" : "playing",
    muted: videoElement.muted,
    fullscreen: !!document.fullscreenElement,
    autoplay: videoElement.autoplay || false,
    sessionId: getSessionId(),
    anonId: getOrCreateAnonId(),
    timestamp: Date.now(),
    userId: window?.user?._id || null,
    lact,
  };
}


export function startTelemetry(videoId, videoElement) {
  if (telemetryInterval || isTelemetryActive || videoElement) return;
  isTelemetryActive = true;
  hoverStartTime = Date.now();

  telemetryInterval = setInterval(() => {
    const data = getCurrentVideoTelemetryData(videoId, videoElement);
    sendTelemetry(data);
  }, 5000);
}


export function stopTelemetry() {
  if (telemetryInterval) {
    clearInterval(telemetryInterval);
    telemetryInterval = null;
  }
  isTelemetryActive = false;
  hoverStartTime = null;
}
