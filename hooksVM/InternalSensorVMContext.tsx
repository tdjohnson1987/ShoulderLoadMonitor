// hooksVM/InternalSensorVMContext.tsx
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
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
  
  // Ref för att kontrollera callbacken
  const isRecordingRef = useRef(false);

  const stopRecording = useCallback(() => {
    console.log("STOP anropad");
    isRecordingRef.current = false; 
    setIsRecording(false);
    internalSensorService.stop(); // Se till att denna faktiskt kör .remove() på alla lyssnare
  }, []);

  const startInternalRecording = useCallback(() => {
    // 1. Säkerhetsställ att vi dödar eventuella gamla lyssnare först
    internalSensorService.stop();
    
    // 2. Nollställ data
    setReadings([]);
    
    // 3. Aktivera spärrar
    isRecordingRef.current = true;
    setIsRecording(true);

    // 4. Starta
    internalSensorService.start(100, (newReading) => {
      if (isRecordingRef.current) {
        setReadings(current => [...current, newReading]);
      }
    });
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