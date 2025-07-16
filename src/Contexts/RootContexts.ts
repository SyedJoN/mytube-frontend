import { createContext } from "react";

export type DrawerContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type UserInteractionContextType = {
  isUserInteracted: boolean;
  setIsUserInteracted: React.Dispatch<React.SetStateAction<boolean>>;
};

export type UserContextType = {
  data?: any;
};

export const DrawerContext = createContext<DrawerContextType | undefined>(undefined);
export const UserContext = createContext<UserContextType | undefined>(undefined);
export const UserInteractionContext = createContext<UserInteractionContextType | undefined>(undefined);
