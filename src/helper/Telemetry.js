import { sendTelemetry } from "../apis/sendTelemetry";

let cpn = null;
let stArray = [];
let etArray = [];
let volumeArray = [];
let mutedArray = [];
let lastTelemetryPosition = 0;

export class HoverTelemetryTracker {
  constructor() {
    this.hoverStartTime = null;
    this.segmentStartTime = 0;
    this.isTracking = false;
    this.telemetryTimer = null;
    this.previousVolume = 100;
  }

  startHover(video) {
    this.hoverStartTime = Date.now();
    this.segmentStartTime = video.currentTime;
    this.currentSegmentStart = video.currentTime;
    this.isTracking = true;
    cpn = getNewCpn();

    lastTelemetryPosition = this.segmentStartTime;
    console.log(
      "Hover started - Segment begins at:",
      this.currentSegmentStart
    );
  }

  endHover(video) {
    if (!this.isTracking || !this.hoverStartTime) {
      console.log("No active hover to end");
      return null;
    }

    const videoCurrentTime = parseFloat(video.currentTime.toFixed(3));
    this.closeCurrentSegment(videoCurrentTime, video);

    const finalCmt = parseFloat(video.currentTime.toFixed(3));
    const telemetryData = {
      cmt: finalCmt,
      st: stArray.join(","),
      et: etArray.join(","),
      debug: {
        segments: stArray.length,
        finalPosition: videoCurrentTime,
      },
    };

    console.log("Hover telemetry - Segments tracked:", {
      st: telemetryData.st,
      et: telemetryData.et,
      cmt: telemetryData.cmt,
      totalSegments: stArray.length,
    });

    this.reset();
    return telemetryData;
  }

  closeCurrentSegment(endTime, video) {
    const segmentStart = parseFloat(this.currentSegmentStart.toFixed(3));
    const segmentEnd = parseFloat(endTime.toFixed(3));

      stArray.push(segmentStart);
      etArray.push(segmentEnd);

      console.log("close initial array pushed", {
        st: segmentStart,
        et: segmentEnd,
      });
      const isMuted = video.muted ? 1 : 0;
      const volumeValue = Math.round(video.volume * 100);

      volumeArray.push(volumeValue);
      mutedArray.push(isMuted);

      console.log("Segment closed:", {
        from: segmentStart,
        to: segmentEnd,
        duration: (segmentEnd - segmentStart).toFixed(3) + "s",
      });
    
  }
  handleMuteToggle(video, fromTime) {
    console.log("video.muted =", video.muted);

    if (video.muted || video.volume === 0) {
      this.trackMuteStatusChange(video, 1, fromTime);
    } else {
      this.trackMuteStatusChange(video, 0, fromTime);
    }
  }

  trackSeek(video, fromTime, toTime) {
    const seekFrom = parseFloat(fromTime.toFixed(3));
    const seekTo = parseFloat(toTime.toFixed(3));

    console.log("SEEK detected:", {
      from: seekFrom,
      to: seekTo,
      currentSegmentStart: this.currentSegmentStart,
      direction: seekTo > seekFrom ? "FORWARD" : "BACKWARD",
    });

    const segmentStart = parseFloat(this.currentSegmentStart.toFixed(3));
    const segmentEnd = seekFrom;

    if (segmentEnd > segmentStart) {
      stArray.push(segmentStart);
      etArray.push(segmentEnd);
      console.log("track array pushed", { st: segmentStart, et: segmentEnd });
      const isMuted = video.muted || video.volume === 0 ? 1 : 0;
      const volumeValue = Math.round(video.volume * 100);

      volumeArray.push(volumeValue);
      mutedArray.push(isMuted);

      console.log("Segment closed by seek:", {
        from: segmentStart,
        to: segmentEnd,
        duration: (segmentEnd - segmentStart).toFixed(3) + "s",
      });
    }

    
    this.currentSegmentStart = seekTo;
    lastTelemetryPosition = seekTo;

    if (this.telemetryTimer) {
      this.telemetryTimer.markInteraction();
    }

    console.log("New segment started at:", seekTo, {
      current_stArray: stArray.join(","),
      current_etArray: etArray.join(","),
    });
  }

trackMuteStatusChange(video, muteStatus, fromTime) {
  const currentTime = parseFloat(video.currentTime.toFixed(3));
  
  this.closeCurrentSegment(fromTime, video);
  
  this.currentSegmentStart = currentTime;
  
  const volumeValue = Math.round(video.volume * 100);
  
  console.log("Volume change creates segment break:", {
    closedAt: fromTime,
    newSegmentFrom: currentTime,
    volume: volumeValue,
    muted: muteStatus
  });
  
  lastTelemetryPosition = currentTime;
  
  if (this.telemetryTimer) {
    this.telemetryTimer.markInteraction();
  }
}

  reset() {
    this.hoverStartTime = null;
    this.segmentStartTime = 0;
    this.currentSegmentStart = 0;
    this.isTracking = false;
    this.previousVolume = 100;

    if (this.telemetryTimer) {
      this.telemetryTimer.stop();
      this.telemetryTimer = null;
    }

    lastTelemetryPosition = 0;
  }
}

class YouTubeTelemetryTimer {
  constructor(video, videoId, tracker) {
    this.video = video;
    this.videoId = videoId;
    this.tracker = tracker; 
    this.timer = null;
    this.lastInteractionTime = 0;
    this.isBackgroundTab = false;
    this.baseInterval = 10000;
    this.currentInterval = this.baseInterval;
    this.isStopped = false;

    this.setupVisibilityTracking();
  }

  calculateNextInterval() {
    const now = Date.now();
    const timeSinceInteraction = now - this.lastInteractionTime;

    if (timeSinceInteraction < 5000) {
      return 5000;
    }

    if (this.isBackgroundTab) {
      return 60000;
    }

    if (this.video.paused) {
      return 30000;
    }

    if (this.hasSlowConnection()) {
      return 5000;
    }

    return this.baseInterval;
  }

  hasSlowConnection() {
    if ("connection" in navigator) {
      const conn = navigator.connection;
      return conn.effectiveType === "slow-2g" || conn.effectiveType === "2g";
    }
    return false;
  }

  setupVisibilityTracking() {
    document.addEventListener("visibilitychange", () => {
      this.isBackgroundTab = document.hidden;
      console.log(
        `Tab ${this.isBackgroundTab ? "hidden" : "visible"} - adjusting telemetry`
      );
      this.rescheduleTimer();
    });
  }

  markInteraction() {
    this.lastInteractionTime = Date.now();
    console.log("User interaction - scheduling faster telemetry");
    this.rescheduleTimer();
  }

  start() {
    console.log("Starting YouTube-style telemetry timer");
    this.isStopped = false;
    this.scheduleNext();
  }

  scheduleNext() {
    if (this.isStopped) {
      console.log("Timer is stopped, not scheduling next heartbeat");
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.currentInterval = this.calculateNextInterval();

    console.log(
      `Next telemetry in ${this.currentInterval / 1000}s (${this.getReasonForInterval()})`
    );

    this.timer = setTimeout(() => {
      if (this.isStopped) {
        console.log("Timer stopped during timeout, skipping heartbeat");
        return;
      }

      this.sendHeartbeat();
      this.scheduleNext();
    }, this.currentInterval);
  }

  getReasonForInterval() {
    const timeSinceInteraction = Date.now() - this.lastInteractionTime;

    if (timeSinceInteraction < 5000) return "recent interaction";
    if (this.isBackgroundTab) return "background tab";
    if (this.video.paused) return "video paused";
    if (this.hasSlowConnection()) return "slow connection";
    return "normal viewing";
  }

  sendHeartbeat() {
    const currentTime = parseFloat(this.video.currentTime.toFixed(3));
    const isMuted = this.video.muted || this.video.volume === 0 ? 1 : 0;
    const duration = parseFloat(this.video.duration.toFixed(3));

  
    if (this.tracker && this.tracker.isTracking) {
      console.log(
        "Heartbeat during hover - closing segment at:",
        currentTime
      );

    
      const segmentStart = parseFloat(
        this.tracker.currentSegmentStart.toFixed(3)
      );
      const segmentEnd = currentTime;

      if (segmentEnd > segmentStart) {
        stArray.push(segmentStart);
        etArray.push(segmentEnd);

        const volumeValue = Math.round(this.video.volume * 100);

        volumeArray.push(volumeValue);
        mutedArray.push(isMuted);

        console.log("Heartbeat segment closed:", {
          from: segmentStart,
          to: segmentEnd,
          duration: (segmentEnd - segmentStart).toFixed(3) + "s",
        });
      }

    
      this.tracker.currentSegmentStart = currentTime;
    }

    const telemetryData = {
      ns: "yt",
      el: "home",
      docid: this.videoId,
      cmt: currentTime,
      st: stArray.length > 0 ? stArray.join(",") : currentTime.toFixed(3),
      et: etArray.length > 0 ? etArray.join(",") : currentTime.toFixed(3),
      volume:
        volumeArray.length > 0
          ? volumeArray.join(",")
          : Math.round(this.video.volume * 100),
      len: duration,
      state: this.video.paused ? "paused" : "playing",
      muted: mutedArray.length > 0 ? mutedArray.join(",") : isMuted,
      cpn,
      heartbeat: 1,
      interval: this.currentInterval,
      reason: this.getReasonForInterval(),
      source: "home",
    };

    console.log(`Heartbeat telemetry (${this.getReasonForInterval()}):`, {
      st: telemetryData.st,
      et: telemetryData.et,
      cmt: telemetryData.cmt,
      segments: stArray.length,
    });

    sendTelemetry([telemetryData]);

    lastTelemetryPosition = currentTime;

   
    stArray = [];
    etArray = [];
    volumeArray = [];
    mutedArray = [];
  }

  rescheduleTimer() {
    this.scheduleNext();
  }

  stop() {
    console.log("Stopping telemetry timer");
    this.isStopped = true;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

export function startTelemetry(video, videoId, tracker) {
  console.log("Starting telemetry for video:", videoId);
  initializeTelemetryArrays();

 
  const timer = new YouTubeTelemetryTimer(video, videoId, tracker);
  tracker.telemetryTimer = timer;
  setupVideoInteractionListeners(video, timer);
  timer.start();

  return timer;
}
function setupVideoInteractionListeners(video, timer) {
  const markInteraction = () => timer.markInteraction();

  video.addEventListener("seeking", markInteraction);
  video.addEventListener("volumechange", markInteraction);
  video.addEventListener("play", markInteraction);
  video.addEventListener("pause", markInteraction);
}

export function sendYouTubeStyleTelemetry(videoId, video, hoverData) {
  const stValues = hoverData.st || "0"; 
  const etValues = hoverData.et || "0"; 
  const cmt = parseFloat(hoverData.cmt.toFixed(3));
  const isMuted = video.muted || video.volume === 0 ? 1 : 0;
  const volumeValue = Math.round(video.volume * 100);

  const duration = parseFloat(video.duration.toFixed(3));

  const telemetryPayload = {
    ns: "yt",
    el: "home",
    docid: videoId,
    cmt,
    st: stValues,
    et: etValues, 
    volume: volumeArray.length > 0 ? volumeArray.join(",") : volumeValue,
    state: video.paused ? "paused" : "playing",
    muted: mutedArray.length > 0 ? mutedArray.join(",") : isMuted,
    len: duration,
    cpn,
    timestamp: Date.now(),
    source: "home",
  };

  sendTelemetry([telemetryPayload]);

  
  stArray = [];
  etArray = [];
  volumeArray = [];
  mutedArray = [];

  setTimeout(() => {
    const finalPayload = {
      ...telemetryPayload,
      st: cmt.toFixed(3),
      et: cmt.toFixed(3),
      volume: volumeValue,
      muted: isMuted,
      cmt: cmt,
      final: 1,
    };
    console.log("Sending final telemetry:", finalPayload);
    sendTelemetry([finalPayload]);
  }, 50);
}
export function getNewCpn(length = 12) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/[+/=]/g, "")
    .substring(0, length);
}

function getSessionId() {
  let sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
}

export function initializeTelemetryArrays() {
  stArray = [];
  etArray = [];
  volumeArray = [];
  mutedArray = [];
}

export function setupVideoTelemetryEvents(video, tracker) {
  let seekFromTime = null;
}
