import { useEffect, useRef } from "react";
import { useLocation } from "@tanstack/react-router";
import { addToWatchHistory, BASE_URL } from "../../apis/userFn";

const getVideoIdFromSearch = (searchString) => {
  const params = new URLSearchParams(searchString);
  return params.get("v");
};

export const useTrackWatchHistory = ({ timeStamp, viewCounted }) => {
  const location = useLocation();
  const videoId = getVideoIdFromSearch(location.search);

  const prevVideoIdRef = useRef(videoId);
  const prevPathRef = useRef(location.pathname);

  // 🔁 Video ID switch detection
  useEffect(() => {
    const prevId = prevVideoIdRef.current;

    const isVideoChanged = prevId && videoId && videoId !== prevId;

    if (isVideoChanged && viewCounted) {
      console.log("🔁 Video switch effect", {
        prevId,
        current: videoId,
        viewCounted,
        currentTS: timeStamp,
      });

      addToWatchHistory({ videoId: prevId, duration: timeStamp }).catch(
        console.error
      );
    }

    prevVideoIdRef.current = videoId;
  }, [videoId, timeStamp, viewCounted]);

  useEffect(() => {
    const prevPath = prevPathRef.current;
    const currentPath = location.pathname;

    const navigatedAwayFromWatch =
      prevPath?.includes("/watch") && !currentPath?.includes("/watch");

    if (navigatedAwayFromWatch && viewCounted && videoId) {
      console.log("🚪 Navigated away, sending history:", {
        videoId,
        duration: timeStamp,
      });

      addToWatchHistory({ videoId, duration: timeStamp }).catch(console.error);
    }

    prevPathRef.current = currentPath;
  }, [location.pathname, videoId, viewCounted, timeStamp]);

  // 🚪 Handle tab close or refresh (sendBeacon)
  useEffect(() => {
    const handleUnload = () => {
      if (!viewCounted || !videoId) return;

      const data = {
        videoId,
        duration: timeStamp,
      };

      try {
        const blob = new Blob([JSON.stringify(data)], {
          type: "application/json",
        });

        navigator.sendBeacon(`${BASE_URL}/history`, blob);
        console.log("📡 Sent via beacon:", data);
      } catch (err) {
        console.error("❌ sendBeacon failed:", err);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [viewCounted, videoId, timeStamp]);
};
