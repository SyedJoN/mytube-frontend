import { createContext, useContext } from "react";

export type UserInteractionContextType = {
  isUserInteracted: boolean;
  setIsUserInteracted: React.Dispatch<React.SetStateAction<boolean>>;
};

export const UserInteractionContext = createContext<UserInteractionContextType | undefined>(undefined);

export function useUserInteractionContext(): UserInteractionContextType {
  const context = useContext(UserInteractionContext);
  if (!context) {
    throw new Error("useUserInteractionContext must be used within a UserInteractionContext.Provider");
  }
  return context;
}
