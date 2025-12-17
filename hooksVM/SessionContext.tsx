// hooksVM/SessionContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { SensorType } from '../Models/SensorData';

interface SessionContextType {
  activeSource: SensorType;
  setActiveSource: (source: SensorType) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSource, setActiveSource] = useState<SensorType>(SensorType.INTERNAL);

  return (
    <SessionContext.Provider value={{ activeSource, setActiveSource }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within a SessionProvider");
  return context;
};