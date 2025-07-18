import React, { useState, useCallback } from "react";
import { TimeStampContext } from "./RootContexts";

export const TimeStampProvider = ({ children }) => {
  const [fromHome, setFromHome] = useState(false);

  const [timeStampMap, setTimeStampMap] = useState<{
    [videoId: string]: number;
  }>({});

  const setTimeStamp = useCallback((videoId: string, time: number) => {
    setTimeStampMap((prev) => ({ ...prev, [videoId]: time }));
  }, []);

  const getTimeStamp = useCallback(
    (videoId: string) => {
      return timeStampMap[videoId] || 0;
    },
    [timeStampMap]
  );

  React.useEffect(() => {
    console.log("TimeStampMap updated:", timeStampMap);
  }, [timeStampMap]);

  return (
    <TimeStampContext.Provider
      value={{ fromHome, setFromHome, timeStampMap, setTimeStamp, getTimeStamp }}
    >
      {children}
    </TimeStampContext.Provider>
  );
};
