import React, { createContext } from "react";

type DrawerContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type UserInteractionContextType = {
  isUserInteracted: boolean;
  setIsUserInteracted: React.Dispatch<React.SetStateAction<boolean>>;
};

type UserContextType = {
  data?: any;
};


type VideoProgressMap = {
  [videoId: string]: number;
};
type TimeStampContextType = {
  fromHome: boolean;
  setFromHome: React.Dispatch<React.SetStateAction<boolean>>;
  timeStampMap: VideoProgressMap;
  setTimeStamp: (videoId: string, time: number) => void;
  getTimeStamp: (videoId: string) => number;
};

export const TimeStampContext = createContext<TimeStampContextType | undefined>(undefined);
export const DrawerContext = createContext<DrawerContextType | undefined>(undefined);
export const UserContext = createContext<UserContextType | undefined>(undefined);
export const UserInteractionContext = createContext<UserInteractionContextType | undefined>(undefined);
