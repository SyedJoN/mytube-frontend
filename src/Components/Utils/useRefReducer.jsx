import { useRef } from "react";
import { VideoTelemetryTimer } from "../../helper/watchTelemetry";

export default function useRefReducer() {
  return {
    containerRef: useRef(null),
    videoRef: useRef(null),
    videoPauseStatus: useRef(null),
    prevVolumeRef: useRef(null),
    prevVolRef: useRef(0),
    exitingPiPViaOurUIButtonRef: useRef(false),
    timeoutRef: useRef(null),
    fullScreenTitleRef: useRef(null),
    isInside: useRef(null),
    prevVideoRef: useRef(null),
    playIconRef: useRef(null),
    volumeIconRef: useRef(null),
    pressTimer: useRef(null),
    clickTimeout: useRef(null),
    clickCount: useRef(null),
    animateTimeoutRef: useRef(null),
    captureCanvasRef: useRef(null),
    prevHoverStateRef: useRef(null),
    holdTimer: useRef(null),
    trackerRef: useRef(new VideoTelemetryTimer()),
    isHolding: useRef(null),
    glowCanvasRef: useRef(null),
    prevSpeedRef: useRef(null),
    prevSliderSpeedRef: useRef(null),
  };
}
