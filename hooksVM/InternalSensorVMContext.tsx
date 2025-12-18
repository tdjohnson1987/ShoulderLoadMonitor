import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { SensorReading } from '../Models/SensorData';
import { internalSensorService } from '../components/services/InternalSensorService';
import { ComplementaryFilter } from "../components/utils/ComplementaryFilter";
import { EWMAFilter } from "../components/utils/EWMAFilter";

interface InternalSensorContextType {
  readings: SensorReading[];
  isRecording: boolean;
  algo1Series: { x: number; y: number; z: number }[];
  algo2Series: { x: number; y: number; z: number }[];
  startInternalRecording: () => void;
  stopRecording: () => void;
}

const InternalSensorContext = createContext<InternalSensorContextType | undefined>(undefined);

export const InternalSensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  // Används för att omedelbart stoppa inflödet av data i callbacken
  const isRecordingRef = useRef(false);

  // --- BERÄKNINGSLOGIK (MVVM: Logik i VM) ---
  const processedData = useMemo(() => {
    if (readings.length === 0) return { algo1: [], algo2: [] };

    const ewma = new EWMAFilter(0.1);
    const comp = new ComplementaryFilter(0.98);
    let lastTs = readings[0].timestamp;

    // Prestanda-fix: Beräkna endast de senaste 500 punkterna för grafen
    const dataToProcess = readings.slice(-500);
    const s1: { x: number; y: number; z: number }[] = [];
    const s2: { x: number; y: number; z: number }[] = [];

    dataToProcess.forEach((r) => {
      // 1. Beräkna rå-vinkel (Tilt)
      const accelAngle = Math.atan2(r.accelerometerY, r.accelerometerZ) * (180 / Math.PI);
      
      // 2. Beräkna tidsskillnad
      const dt = (r.timestamp - lastTs) / 1000;
      lastTs = r.timestamp;

      // 3. Kör filter
      const val1 = ewma.update(accelAngle);
      const val2 = comp.update(accelAngle, r.gyroscopeX, dt > 0 ? dt : 0.01);

      // 4. Mappa till graf-format (X=Röd, Y=Grön, Z=Blå)
      // Vi sätter de oanvända axlarna till -999 så de hamnar utanför grafens vy
      s1.push({ x: val1, y: -999, z: -999 }); 
      s2.push({ x: -999, y: val2, z: -999 });
    });

    return { algo1: s1, algo2: s2 };
  }, [readings]);

  // --- ACTIONS ---
  const stopRecording = useCallback(() => {
    console.log("VM: Stoppar inspelning");
    isRecordingRef.current = false;
    setIsRecording(false);
    internalSensorService.stop();
  }, []);

  const startInternalRecording = useCallback(() => {
    console.log("VM: Startar inspelning");
    // Rensa gamla lyssnare först för att undvika dubbla mätningar
    internalSensorService.stop();
    
    setReadings([]);
    isRecordingRef.current = true;
    setIsRecording(true);

    internalSensorService.start(100, (newReading) => {
      if (isRecordingRef.current) {
        setReadings(current => [...current, newReading]);
      }
    });
  }, []);

  return (
    <InternalSensorContext.Provider value={{ 
      readings, 
      isRecording, 
      algo1Series: processedData.algo1, 
      algo2Series: processedData.algo2,
      startInternalRecording, 
      stopRecording 
    }}>
      {children}
    </InternalSensorContext.Provider>
  );
};

// Custom hook för att använda contexten
export const useInternalSensorVM = () => {
  const context = useContext(InternalSensorContext);
  if (context === undefined) {
    throw new Error('useInternalSensorVM must be used within an InternalSensorProvider');
  }
  return context;
};