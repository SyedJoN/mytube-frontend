import { sendTelemetry } from "../apis/sendTelemetry";

let cpn = null;
let stArray = [];
let etArray = [];
let volumeArray = [];
let mutedArray = [];

const engagementThreshold = 5000;

export class HoverTelemetryTracker {
  constructor() {
    this.hoverStartTime = null;
    this.segmentStartTime = 0;
    this.isTracking = false;
    this.telemetryTimer = null;
    this.previousVolume = 100;
    this.totalCommittedTime = 0;
    this.sessionCommittedTime = 0;
    this.isEngaged = false;
    this.lastMouseActivity = 0;
    this.engagementStartTime = null;
    this.video = null;
    this.engagementCheckTimer = null;
  }

  setPreviousEngagement(refetchedTime) {
    this.totalCommittedTime = refetchedTime || 0;
    this.hasHistory = refetchedTime > 0;
  }

  startHover(video, refetchedTime = 0) {
    this.video = video;
    this.hoverStartTime = Date.now();
    this.segmentStartTime = video.currentTime;
    this.currentSegmentStart = video.currentTime;
    this.isTracking = true;
    this.sessionCommittedTime = 0;
    this.hasHistory = false;
    this.isEngaged = false;
    this.engagementStartTime = null;

    cpn = getNewCpn();

    this.setPreviousEngagement(refetchedTime);

    console.log("Starting hover");
    if (this.hasHistory) {
      this.isEngaged = true;
      this.engagementStartTime = Date.now();
    } else {
      this.startEngagementTimer();
    }
  }

  startEngagementTimer() {
    if (this.engagementCheckTimer) {
      clearTimeout(this.engagementCheckTimer);
    }

    this.engagementCheckTimer = setTimeout(() => {
      if (this.isTracking && !this.isEngaged && !this.hasHistory) {
        this.isEngaged = true;
        this.engagementStartTime = Date.now();
      }
    }, engagementThreshold);
  }

  onUserInteraction() {
    this.lastMouseActivity = Date.now();

    if (this.hasHistory && !this.isEngaged) {
      this.isEngaged = true;
      this.engagementStartTime = Date.now();
    }
  }

  calculateCommittedTime(video) {
    let sessionCommitted = 0;

    if (!etArray.length || !stArray.length) {
      return 0;
    }
    if (etArray[etArray.length - 1] < etArray[0])
      return etArray[etArray.length - 1];

    if (this.hasHistory) {
      const videoPlayedDuration = video.currentTime - this.segmentStartTime;
      sessionCommitted = Math.max(0, videoPlayedDuration);
      this.sessionCommittedTime = sessionCommitted;
    } else if (this.isEngaged) {
      const totalVideoWatched = video.currentTime - this.segmentStartTime;
      sessionCommitted = Math.max(0, totalVideoWatched);
      this.sessionCommittedTime = sessionCommitted;
    }

    const totalCommitted = this.totalCommittedTime + this.sessionCommittedTime;
    console.log("Total CMT calculation:", {
      hasHistory: this.hasHistory,
      previousCMT: this.totalCommittedTime,
      sessionCMT: this.sessionCommittedTime,
      totalCMT: totalCommitted,
      isEngaged: this.isEngaged,
    });

    return Number(totalCommitted) || 0;
  }

  endHover(video, isSubscribed) {
    console.log("ending hover");

    if (!this.isTracking || !this.hoverStartTime) {
      console.log("No active hover to end");
      return null;
    }

    const videoCurrentTime = parseFloat(video.currentTime.toFixed(3));
    this.closeCurrentSegment(videoCurrentTime, video);

    const finalCmt = this.calculateCommittedTime(video) || 0;

    const telemetryData = {
      cmt:
        parseFloat(finalCmt.toFixed(3)) === 0
          ? 0
          : parseFloat(finalCmt.toFixed(3)),
      st: stArray.join(","),
      et: etArray.join(","),
      subscribed: isSubscribed ? 1 : 0,
      debug: {
        segments: stArray.length,
        finalPosition: videoCurrentTime,
        wasEngaged: this.isEngaged,
        sessionCommitted: this.sessionCommittedTime,
        totalCommitted: finalCmt,
        hoverDuration: (Date.now() - this.hoverStartTime) / 1000,
      },
    };

    console.log("Hover telemetry - YouTube-style tracking:", {
      st: telemetryData.st,
      et: telemetryData.et,
      cmt: telemetryData.cmt,
      wasEngaged: this.isEngaged,
      sessionCommittedTime: this.sessionCommittedTime,
      totalCommittedTime: finalCmt,
    });

    this.reset();

    return telemetryData;
  }

  closeCurrentSegment(endTime, video) {
    const startValue =
      typeof this.currentSegmentStart === "number" &&
      !isNaN(this.currentSegmentStart)
        ? this.currentSegmentStart
        : video?.currentTime || 0;

    const segmentStart = parseFloat(startValue.toFixed(3));
    const segmentEnd = parseFloat(endTime.toFixed(3));
    const volumeValue = Math.round((video?.volume ?? 1) * 100);
    const isMuted = video.muted ? 1 : 0;

    stArray.push(segmentStart);
    etArray.push(segmentEnd);

    console.log("close initial array pushed", {
      st: segmentStart,
      et: segmentEnd,
      fallbackUsed: startValue !== this.currentSegmentStart,
    });

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

    if (video.muted) {
      this.trackMuteStatusChange(video, 1, fromTime);
    } else {
      this.trackMuteStatusChange(video, 0, fromTime);
    }
  }

  trackSeek(video, fromTime, toTime) {
    this.onUserInteraction();

    if (!this.isEngaged) {
      this.isEngaged = true;
      this.engagementStartTime = Date.now();
      console.log(
        "🎯 SEEK detected - user immediately engaged (bypassing 3s rule)"
      );

      if (this.engagementCheckTimer) {
        clearTimeout(this.engagementCheckTimer);
        this.engagementCheckTimer = null;
      }
    }

    const seekFrom = parseFloat(fromTime.toFixed(3));
    const seekTo = parseFloat(toTime.toFixed(3));
    this.closeCurrentSegment(seekFrom, video);
    this.currentSegmentStart = seekTo;
    console.log("SEEK detected:", {
      from: seekFrom,
      to: seekTo,
      currentSegmentStart: this.currentSegmentStart,
      direction: seekTo > seekFrom ? "FORWARD" : "BACKWARD",
    });

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
      muted: muteStatus,
    });

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
    this.isEngaged = false;
    this.sessionCommittedTime = 0;
    this.engagementStartTime = null;
    this.lastMouseActivity = 0;
    this.hasHistory = false;
    this.video = null;

    if (this.engagementCheckTimer) {
      clearTimeout(this.engagementCheckTimer);
      this.engagementCheckTimer = null;
    }

    if (this.telemetryTimer) {
      this.telemetryTimer.stop();
      this.telemetryTimer = null;
    }
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

    if (timeSinceInteraction < 5000) return 5000;
    if (this.isBackgroundTab) return 60000;
    if (this.video.paused) return 30000;
    if (this.hasSlowConnection()) return 5000;

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
    if (this.tracker) {
      this.tracker.onUserInteraction();
    }
    console.log("User interaction - scheduling faster telemetry");
    this.rescheduleTimer();
  }

  start(setTimeStamp) {
    console.log("Starting YouTube-style telemetry timer");
    this.isStopped = false;
    this.scheduleNext(setTimeStamp);
  }

  scheduleNext(setTimeStamp) {
    if (this.isStopped) return;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.currentInterval = this.calculateNextInterval();

    this.timer = setTimeout(() => {
      if (this.isStopped) return;
      this.sendHeartbeat(setTimeStamp);
      this.scheduleNext();
    }, this.currentInterval);
  }

  sendHeartbeat(setTimeStamp) {
    const currentTime = parseFloat(this.video.currentTime.toFixed(3));
    const isMuted = this.video.muted ? 1 : 0 || this.video.volume === 0 ? 1 : 0;
    const duration = parseFloat(this.video.duration.toFixed(3));

    if (this.tracker && this.tracker.isTracking) {
      const segmentStart = parseFloat(
        this.tracker.currentSegmentStart.toFixed(3)
      );
      const segmentEnd = currentTime;

      if (segmentEnd > segmentStart) {
        stArray.push(segmentStart);
        etArray.push(segmentEnd);
        volumeArray.push(Math.round(this.video.volume * 100));
        mutedArray.push(isMuted);

        console.log("Heartbeat segment:", {
          from: segmentStart,
          to: segmentEnd,
          duration: (segmentEnd - segmentStart).toFixed(3) + "s",
        });
      }

      this.tracker.currentSegmentStart = currentTime;
    }

    const committedTime = this.tracker
      ? this.tracker.calculateCommittedTime(this.video)
      : currentTime;
    const cmtValue =
      parseFloat(committedTime?.toFixed(3)) === 0
        ? 0
        : parseFloat(committedTime.toFixed(3));

    const telemetryData = {
      ns: "yt",
      el: "home",
      docid: this.videoId,
      cmt: cmtValue,
      st:
        stArray.length > 0
          ? stArray.join(",")
          : currentTime === 0
            ? 0
            : parseFloat(currentTime.toFixed(3)),
      et:
        etArray.length > 0
          ? etArray.join(",")
          : currentTime === 0
            ? 0
            : parseFloat(currentTime.toFixed(3)),
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
      feature: "home",
      engaged: this.tracker ? this.tracker.isEngaged : false,
      debug: {
        segmentsInHeartbeat: stArray.length,
        isEngaged: this.tracker ? this.tracker.isEngaged : false,
        sessionCMT: this.tracker ? this.tracker.sessionCommittedTime : 0,
      },
    };

    console.log(
      `💓 Heartbeat telemetry - CMT: ${cmtValue}s (engaged: ${this.tracker?.isEngaged || false})`
    );
    sendTelemetry([telemetryData], setTimeStamp);

    stArray = [];
    etArray = [];
    volumeArray = [];
    mutedArray = [];
  }

  rescheduleTimer() {
    this.scheduleNext();
  }

  stop() {
    this.isStopped = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

export function startTelemetry(video, videoId, tracker, setTimeStamp) {
  console.log("Starting telemetry for video:", videoId);
  initializeTelemetryArrays();

  const timer = new YouTubeTelemetryTimer(
    video,
    videoId,
    tracker,
    setTimeStamp
  );
  tracker.telemetryTimer = timer;
  timer.start(setTimeStamp);
}

export function sendYouTubeStyleTelemetry(
  videoId,
  video,
  hoverData,
  setTimeStamp,
) {
  const cmt =
    parseFloat(hoverData.cmt.toFixed(3)) === 0
      ? 0
      : parseFloat(hoverData.cmt.toFixed(3));
  const stValues = hoverData.st <= 0.009 ? 0 : hoverData.st || "0";
  const etValues = hoverData.et || "0";
  const subscribed = hoverData.subscribed;
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
      subscribed,
      volume: volumeArray.length > 0 ? volumeArray.join(",") : volumeValue,
      state: video.paused ? "paused" : "playing",
      muted: mutedArray.length > 0 ? mutedArray.join(",") : isMuted,
      len: duration,
      cpn,
      timestamp: Date.now(),
      feature: "home",
      engaged: hoverData.debug?.wasEngaged || false,
    };
    sendTelemetry([telemetryPayload], setTimeStamp);

    stArray = [];
    etArray = [];
    volumeArray = [];
    mutedArray = [];

    setTimeout(() => {
      const finalPayload = {
        ...telemetryPayload,
        st: cmt === 0 ? 0 : cmt,
        et: cmt === 0 ? 0 : cmt,
        volume: volumeValue,
        muted: isMuted,
        cmt: cmt,
        final: 1,
      };

      sendTelemetry([finalPayload], setTimeStamp);
    }, 50);
  }
function getNewCpn(length = 12) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/[+/=]/g, "")
    .substring(0, length);
}

export function initializeTelemetryArrays() {
  stArray = [];
  etArray = [];
  volumeArray = [];
  mutedArray = [];
}
