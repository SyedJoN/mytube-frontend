import { sendTelemetry } from "../apis/sendTelemetry";


let stArray = [];
let etArray = [];
let volumeArray = [];
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
    this.isTracking = true;
    
  
    lastTelemetryPosition = this.segmentStartTime;
    console.log("Initial position:", lastTelemetryPosition);
  }

  endHover(video) {
    if (!this.isTracking || !this.hoverStartTime) {
      console.log(" No active hover to end");
      return null;
    }
    console.log("⏹️ Hover ended");

    if (this.telemetryTimer) {
      this.telemetryTimer.stop();
      this.telemetryTimer = null;
    }

    const videoCurrentTime = parseFloat(video.currentTime.toFixed(3));
    
  
    const telemetryData = {
      cmt: videoCurrentTime,
      st: lastTelemetryPosition,  
      et: videoCurrentTime,       
      debug: {
        lastTelemetryPosition,
        continuousSequence: true
      },
    };
    
   
    lastTelemetryPosition = videoCurrentTime;
    
    console.log("📊 Hover telemetry calculated:", {
      st: telemetryData.st,
      et: telemetryData.et,
      cmt: telemetryData.cmt,
      sequence: "continuous"
    });
    
    this.reset();
    return telemetryData;
  }

  
  handleVolumeToggle(video) {
    const currentTime = parseFloat(video.currentTime.toFixed(3));
    
    if (video.muted || video.volume === 0) {
     
      video.muted = false;
      video.volume = 1.0; 
      this.trackVolumeChange(video, 1.0);
      
      console.log("🔊 Volume icon clicked - UNMUTE:", {
        from: 0,
        to: 100,
        time: currentTime
      });
    } else {
    
      this.previousVolume = Math.round(video.volume * 100); // Store current volume
      video.muted = true;
      video.volume = 0;
      this.trackVolumeChange(video, 0);
      
      console.log("🔇 Volume icon clicked - MUTE:", {
        from: this.previousVolume,
        to: 0,
        time: currentTime
      });
    }
  }

  trackSeek(video, fromTime, toTime) {

    const seekFrom = parseFloat(lastTelemetryPosition.toFixed(3)); 
    const seekTo = parseFloat(toTime.toFixed(3));
    const currentVolume = Math.round(video.volume * 100);

    console.log("🔍 SEEK DEBUG:", {
      providedFromTime: fromTime,
      lastTelemetryPosition: lastTelemetryPosition, 
      usingAsFrom: seekFrom,
      seekTo: seekTo
    });

    stArray.push(seekFrom);  // ✅ Use lastTelemetryPosition
    etArray.push(seekTo);    // ✅ Use actual seek destination
    volumeArray.push(currentVolume);

    if (this.telemetryTimer) {
      this.telemetryTimer.markInteraction();
    }

    // ✅ Update global timeline position
    lastTelemetryPosition = seekTo;

 
  }

  trackVolumeChange(video, newVolume) {
    const currentTime = parseFloat(video.currentTime.toFixed(3));
    const volumeValue = Math.round(newVolume * 100);

    stArray.push(currentTime);
    etArray.push(currentTime);
    volumeArray.push(volumeValue);

    // ✅ Update global timeline position
    lastTelemetryPosition = currentTime;

    if (this.telemetryTimer) {
      this.telemetryTimer.markInteraction();
    }


  }

  reset() {
    this.hoverStartTime = null;
    this.segmentStartTime = 0;
    this.isTracking = false;
    this.previousVolume = 100;

    if (this.telemetryTimer) {
      this.telemetryTimer.stop();
      this.telemetryTimer = null;
    }
    
    // ✅ Reset timeline when session ends
    lastTelemetryPosition = 0;
  }
}

// ✅ YouTube-style Telemetry Timer Class
class YouTubeTelemetryTimer {
  constructor(video, userId, videoId) {
    this.video = video;
    this.userId = userId;
    this.videoId = videoId;
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
      console.log(`📱 Tab ${this.isBackgroundTab ? "hidden" : "visible"} - adjusting telemetry`);
      this.rescheduleTimer();
    });
  }

  markInteraction() {
    this.lastInteractionTime = Date.now();
    console.log("👆 User interaction - scheduling faster telemetry");
    this.rescheduleTimer();
  }

  start() {
    console.log("🚀 Starting YouTube-style telemetry timer");
    this.isStopped = false;
    this.scheduleNext();
  }

  scheduleNext() {
    if (this.isStopped) {
      console.log("⏹️ Timer is stopped, not scheduling next heartbeat");
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.currentInterval = this.calculateNextInterval();

    console.log(`⏰ Next telemetry in ${this.currentInterval / 1000}s (${this.getReasonForInterval()})`);

    this.timer = setTimeout(() => {
      if (this.isStopped) {
        console.log("⏹️ Timer stopped during timeout, skipping heartbeat");
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
    
    
    const telemetryData = {
      ns: "yt",
      el: "home",
      docid: this.videoId,
      cmt: currentTime,
      st: stArray.length > 0 ? stArray.join(",") : lastTelemetryPosition.toFixed(3),
      et: etArray.length > 0 ? etArray.join(",") : currentTime.toFixed(3),
      volume: volumeArray.length > 0 ? volumeArray.join(",") : Math.round(this.video.volume * 100),
      len: this.video.duration,
      state: this.video.paused ? "paused" : "playing",
      muted: this.video.muted ? 1 : 0,
      cpn: this.getSessionId(),
      userId: this.userId,
      heartbeat: 1,
      interval: this.currentInterval,
      reason: this.getReasonForInterval(),
      source: "home",
    };

    console.log(`💓 Heartbeat telemetry (${this.getReasonForInterval()}):`, {
      st: telemetryData.st,
      et: telemetryData.et,
      cmt: telemetryData.cmt,
      sequence: `${lastTelemetryPosition} → ${currentTime}`
    });

    sendTelemetry([telemetryData]);
    

    lastTelemetryPosition = currentTime;
    
    
  }

  rescheduleTimer() {
    this.scheduleNext();
  }

  stop() {
    console.log("⏹️ Stopping telemetry timer");
    this.isStopped = true;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.getItem("sessionId", sessionId);
    }
    return sessionId;
  }
}

export function startTelemetry(video, userId, videoId, tracker) {
  console.log("🎬 Starting telemetry for video:", videoId);
  initializeTelemetryArrays();

  const timer = new YouTubeTelemetryTimer(video, userId, videoId);
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

export function sendYouTubeStyleTelemetry(userId, videoId, video, hoverData) {
  const st = parseFloat(hoverData.st.toFixed(3));
  const et = parseFloat(hoverData.et.toFixed(3));
  const cmt = parseFloat(hoverData.cmt.toFixed(3));
  

  stArray.push(st);
  etArray.push(et);
  volumeArray.push(Math.round(video.volume * 100));

  console.log("📥 Final telemetry with correct sequence:", {
    st: stArray.join(","),
    et: etArray.join(","),
    volume: volumeArray.join(","),
    cmt: cmt,
    sequenceType: "hover-end"
  });

  const telemetryPayload = {
    ns: "yt",
    el: "home",
    docid: videoId,
    cmt,
    st: stArray.join(","),
    et: etArray.join(","),
    volume: volumeArray.join(","),
    state: video.paused ? "paused" : "playing",
    muted: video.muted ? 1 : 0,
    len: video.duration,
    cpn: getSessionId(),
    userId: userId,
    timestamp: Date.now(),
    source: "home",
  };

  sendTelemetry([telemetryPayload]);

  // ✅ Clear arrays after sending
  stArray = [];
  etArray = [];
  volumeArray = [];

  setTimeout(() => {
    const finalPayload = {
      ...telemetryPayload,
      st: cmt.toFixed(3),
      et: cmt.toFixed(3),
      cmt: cmt,
      final: 1,
    };
    console.log("📤 Sending final telemetry:", finalPayload);
    sendTelemetry([finalPayload]);
  }, 50);
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
}

export function setupVideoTelemetryEvents(video, tracker) {
  let previousVolume = video.volume;
  let seekFromTime = null;

  video.addEventListener("seeking", () => {
    seekFromTime = video.currentTime;
    console.log("🎯 Seeking started from:", seekFromTime);
  });

  video.addEventListener("seeked", () => {
    if (seekFromTime !== null) {
      const seekToTime = video.currentTime;

      console.log("🎯 Seek completed:", {
        from: seekFromTime,
        to: seekToTime,
        direction: seekToTime > seekFromTime ? "forward" : "backward",
      });

      tracker.trackSeek(video, seekFromTime, seekToTime);
      console.log("⏭️ Seek added to arrays, telemetry will send on heartbeat");
      seekFromTime = null;
    }
  });

  video.addEventListener("volumechange", () => {
    const newVolume = video.volume;
    if (newVolume !== previousVolume) {
      tracker.trackVolumeChange(video, newVolume);
      console.log("🔊 Volume change added to arrays, telemetry will send on heartbeat");
      previousVolume = newVolume;
    }
  });

  console.log("✅ Video telemetry events setup complete");
}