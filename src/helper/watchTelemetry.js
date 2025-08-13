import { sendTelemetry } from "../apis/sendTelemetry";

let cpn = null;
let stArray = [];
let etArray = [];
let volumeArray = [];
let mutedArray = [];
let limit = 0;

export function initializeTelemetryArrays() {
  stArray = [];
  etArray = [];
  volumeArray = [];
  mutedArray = [];
}
export function getNewCpn(length = 12) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/[+/=]/g, "")
    .substring(0, length);
}

export class VideoTelemetryTimer {
  constructor() {
    this.segmentStartTime = 0;
    this.video = null;
    this.currentInterval = null;
    this.baseInterval = 40000;
    this.isStopped = true;
    this.count = 0;
    this.telemetryTimer = null;
  }

  closeCurrentSegment(video, endTime, trackState = false) {
    const startValue =
      typeof this.currentSegmentStart === "number" &&
      !isNaN(this.currentSegmentStart)
        ? this.currentSegmentStart
        : 0;

    const segmentStart = parseFloat(startValue.toFixed(3));
    const segmentEnd = parseFloat(endTime.toFixed(3));
    const volume = Math.round(video.volume * 100);
    const isMuted = video.muted ? 1 : 0;
    console.log({
      segmentEnd: segmentEnd,
      segmentStart: segmentStart,
    });
    if (trackState && Math.abs(segmentEnd - segmentStart) < 1) return;
    if (Math.abs(segmentEnd - segmentStart) < 0) return;

    stArray.push(segmentStart);
    etArray.push(segmentEnd);
    volumeArray.push(volume);
    mutedArray.push(isMuted);

    console.log("Arrays pushed", {
      stArray: segmentStart,
      etArray: segmentEnd,
      volumeArray: volume,
      mutedArray: isMuted,
    });
  }
  trackVideoState(video, fromTime, setTimeStamp) {
     if (video.paused) {
      limit = 0;
      this.scheduleNext(setTimeStamp, true);
      return;
    }
    const currentTime = video.currentTime;
    this.closeCurrentSegment(video, fromTime, 1);

    this.currentSegmentStart = currentTime;
   
    console.log("Video Status Tracked", {
      status: video.paused ? "paused" : "playing",
      fromTime: fromTime,
      currentTime: currentTime,
    });
  }
  trackMuteStatus(video, isMuted, fromTime) {
    const currentTime = video.currentTime;
    const volume = Math.round(video.volume * 100);

    this.closeCurrentSegment(video, fromTime);
    this.currentSegmentStart = currentTime;

    console.log("Muted Status Tracked", {
      stArray: this.currentSegmentStart,
      etArray: fromTime,
      volumeArray: volume,
      mutedArray: isMuted,
    });
  }
  trackSeek(video, seekFrom, seekTo) {
    this.closeCurrentSegment(video, seekFrom);
    this.currentSegmentStart = seekTo;

    console.log("Seek tracked from", {
      from: seekFrom,
      to: seekTo,
    });
  }
  handleMuteToggle(video, fromTime) {
    if (video.muted || video.volume === 0) {
      this.trackMuteStatus(video, 1, fromTime);
    } else {
      this.trackMuteStatus(video, 0, fromTime);
    }
  }
  start(video, videoId, setTimeStamp, refetchedTime) {
    (this.videoId = videoId), (this.video = video);
    this.currentSegmentStart = this.video.currentTime;
    console.log("Starting telemetry...");
    cpn = getNewCpn();
    this.isStopped = false;
    this.scheduleNext(setTimeStamp);
  }
  end(video, isSubscribed) {
    console.log("ending telemetry...");

    const videoCurrentTime = parseFloat(video.currentTime.toFixed(3));
    this.closeCurrentSegment(video, videoCurrentTime);

    const finalCmt = videoCurrentTime;

    const telemetryData = {
      cmt:
        parseFloat(finalCmt.toFixed(3)) === 0
          ? 0
          : parseFloat(finalCmt.toFixed(3)),
      st: stArray.join(","),
      et: etArray.join(","),
      subscribed: isSubscribed ? 1 : 0,
    };

    this.reset();

    return telemetryData;
  }

  scheduleNext(setTimeStamp, final = false) {
    if (this.isStopped) return;

    if (this.telemetryTimer) {
      clearTimeout(this.telemetryTimer);
      this.telemetryTimer = null;
    }
    this.currentInterval = this.calculateNextInterval();

    this.telemetryTimer = setTimeout(() => {
      this.sendHeartbeat(setTimeStamp);
      this.count++;
      console.log("limit", limit);
      if (final && limit === 1) {
        console.log("returned due to limit reached!");
        limit = 0;
        return;
      }
      limit++;
      this.scheduleNext(setTimeStamp, final);
    }, this.currentInterval);
  }

  calculateNextInterval() {
    if (this.count < 3) return 10000;
    return this.baseInterval;
  }
  sendHeartbeat(setTimeStamp) {
    if (this.isStopped) return;
    const currentTime = parseFloat(this.video?.currentTime.toFixed(3));
    const duration = parseFloat(this.video?.duration.toFixed(3));
    const isMuted = this.video?.muted
      ? 1
      : 0 || this.video?.volume === 0
        ? 1
        : 0;
    const volume = Math.round(this.video?.volume * 100);

    const segmentStart = parseFloat(this.currentSegmentStart.toFixed(3));
    const segmentEnd = currentTime;

    stArray.push(segmentStart);
    etArray.push(segmentEnd);
    volumeArray.push(volume);
    mutedArray.push(isMuted);

    this.currentSegmentStart = currentTime;

    const telemetryData = {
      ns: "yt",
      el: "watch",
      docid: this.videoId,
      cmt: currentTime,
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
      volume: volumeArray.length > 0 ? volumeArray.join(",") : volume,
      len: duration,
      state: this.video?.paused ? "paused" : "playing",
      muted: mutedArray.length > 0 ? mutedArray.join(",") : isMuted,
      cpn,
      interval: this.currentInterval,
      feature: "watch",
      debug: {
        segmentsInHeartbeat: stArray.length,
        isEngaged: this.tracker ? this.tracker.isEngaged : false,
        sessionCMT: this.tracker ? this.tracker.sessionCommittedTime : 0,
      },
    };
    sendTelemetry([telemetryData], setTimeStamp);

  initializeTelemetryArrays();
  }

  reschedule() {
    this.scheduleNext();
  }
  // pause(fromTime) {
  //   this.isStopped = true;
  //   if (this.timer) {
  //     clearInterval(this.timer);
  //     this.timer = null;
  //   }
  //   this.isPaused = true;
  //   this.currentSegmentStart = fromTime;

  //   this.timer = setTimeout(() => {
  //     this.sendHeartbeat();
  //   }, this.currentInterval);

  //   this.timer = setTimeout(() => {
  //     this.sendHeartbeat();
  //   }, this.currentInterval);
  // }
  stop() {
    this.isStopped = true;
    if (this.telemetryTimer) {
      clearInterval(this.telemetryTimer);
      this.telemetryTimer = null;
    }
  }

  reset() {
    this.currentSegmentStart = 0;
    this.count = 0;
    this.isStopped = true;
    this.video = null;
    this.currentInterval = null;
    this.telemetryTimer = null;

    clearTimeout(this.telemetryTimer);

    stArray = [];
    etArray = [];
    volumeArray = [];
    mutedArray = [];
  }
}
export function sendYouTubeStyleTelemetry(
  videoId,
  video,
  hoverData,
  setTimeStamp
) {
  const cmt =
    parseFloat(hoverData.cmt.toFixed(3)) === 0
      ? 0
      : parseFloat(hoverData.cmt.toFixed(3));

  const subscribed = hoverData.subscribed;
  const isMuted = video.muted || video.volume === 0 ? 1 : 0;
  const volumeValue = Math.round(video.volume * 100);
  const duration = parseFloat(video.duration.toFixed(3));

  const finalPayload = {
    ns: "yt",
    el: "home",
    docid: videoId,
    cmt: cmt,
    st: cmt === 0 ? 0 : cmt,
    et: cmt === 0 ? 0 : cmt,
    subscribed,
    volume: volumeArray.length > 0 ? volumeArray.join(",") : volumeValue,
    state: video.paused ? "paused" : "playing",
    muted: mutedArray.length > 0 ? mutedArray.join(",") : isMuted,
    len: duration,
    cpn,
    final: 1,
    timestamp: Date.now(),
    feature: "home",
    engaged: hoverData.debug?.wasEngaged || false,
  };

  sendTelemetry([finalPayload], setTimeStamp);
}
