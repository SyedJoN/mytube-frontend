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

export const startTelemetry = (videoElement) => {
  telemetryInterval = setInterval(() => {
    const cmt = videoElement.currentTime.toFixed(2);
    const len = videoElement.duration.toFixed(2);
    const lact = (Date.now() - hoverStartTime).toFixed(0);
    const videoId = videoElement.dataset.videoId;

    const data = {
      videoId,
      currentTime: parseFloat(cmt),
      duration: parseFloat(len),
      state: videoElement.paused ? "paused" : "playing",
      muted: videoElement.muted,
      fullscreen: !!document.fullscreenElement,
      autoplay: videoElement.autoplay || false,
      sessionId: getSessionId(), // ← ✅ HERE
      anonId: getOrCreateAnonId(), // ← ✅ HERE
      timestamp: Date.now(),
      userId: window?.user?._id || null, // if user is logged in
    };

    sendTelemetry(data);
  }, 5000); // every 5 seconds
};
