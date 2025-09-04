import React, {createContext} from "react";

type DeviceContextType = {
    device?: string;
    setDevice: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const DeviceContext = createContext<DeviceContextType | undefined>(undefined);