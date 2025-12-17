// hooksVM/InternalSensorVMContext.tsx
import React, { createContext, useCallback, useContext, useState } from 'react';
import { SensorReading } from '../Models/SensorData';
import { internalSensorService } from '../components/services/InternalSensorService';

interface InternalSensorContextType {
  readings: SensorReading[];
  isRecording: boolean;
  startInternalRecording: () => void;
  stopRecording: () => void;
}

const InternalSensorContext = createContext<InternalSensorContextType | undefined>(undefined);

export const InternalSensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const startInternalRecording = useCallback(() => {
    setReadings([]);
    setIsRecording(true);
    internalSensorService.start(100, (newReading) => {
      setReadings(current => [...current, newReading]);
    });
  }, []);

  const stopRecording = useCallback(() => {
    internalSensorService.stop();
    setIsRecording(false);
  }, []);

  return (
    <InternalSensorContext.Provider value={{ readings, isRecording, startInternalRecording, stopRecording }}>
      {children}
    </InternalSensorContext.Provider>
  );
};

export const useInternalSensorVM = () => {
  const context = useContext(InternalSensorContext);
  if (!context) throw new Error("useInternalSensorVM must be used within an InternalSensorProvider");
  return context;
};