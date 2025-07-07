import { createContext, useContext } from "react";

export type DrawerContextType = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export function useDrawerContext(): DrawerContextType {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawerContext must be used within a DrawerContext.Provider");
  }
  return context;
}
