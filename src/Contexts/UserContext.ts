// src/Contexts/UserContext.ts
import { createContext, useContext } from "react";

export type UserContextType = {
  data?: any;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContext.Provider");
  }
  return context;
}
