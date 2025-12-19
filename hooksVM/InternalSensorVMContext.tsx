import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { SensorReading } from '../Models/SensorData';
import { ExportService } from "../components/services/ExportService"; // Dubbelkolla sökvägen
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
  exportCurrentData: () => Promise<void>; // Lagt till i interfacet
}

const InternalSensorContext = createContext<InternalSensorContextType | undefined>(undefined);

export const InternalSensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);

  // --- BERÄKNINGSLOGIK ---
  // Vi beräknar filter för ALLA mätningar här för exporten, 
  // men returnerar de sista 500 för graf-prestanda
  const allProcessedData = useMemo(() => {
    if (readings.length === 0) return []; // Returnera tom array, inte objekt!

    const ewma = new EWMAFilter(0.05);
    const comp = new ComplementaryFilter(0.95);
    let lastTs = readings[0].timestamp;

    return readings.map((r) => {
      const accelAngle = Math.atan2(r.accelerometerY, r.accelerometerZ) * (180 / Math.PI);
      const gyroRateDeg = r.gyroscopeX * (180 / Math.PI);
      const dt = (r.timestamp - lastTs) / 1000;
      lastTs = r.timestamp;

      return {
        val1: ewma.update(accelAngle),
        val2: comp.update(accelAngle, gyroRateDeg, dt > 0 ? dt : 0.01)
      };
    });
  }, [readings]);

  // Graferna vill bara ha de senaste 500 punkterna
  const graphData = useMemo(() => {
    if (allProcessedData.length === 0) {
      return { algo1: [], algo2: [] };
    }
    
    const slice = allProcessedData.slice(-500);
    return {
      algo1: slice.map(d => ({ x: d.val1, y: -999, z: -999 })),
      algo2: slice.map(d => ({ x: -999, y: d.val2, z: -999 }))
    };
  }, [allProcessedData]);

  // --- ACTIONS ---
  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    internalSensorService.stop();
  }, []);

  const startInternalRecording = useCallback(() => {
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

  const exportCurrentData = useCallback(async () => {
    if (readings.length === 0) return;

    const reportData = readings.map((r, index) => {
      // Nu vet TS att allProcessedData är en array och kan indexeras
      const processed = (allProcessedData as any[])[index];
      
      return {
        timestamp: r.timestamp,
        ewma_angle: processed?.val1 ?? 0,
        comp_angle: processed?.val2 ?? 0
      };
    });

    const csv = ExportService.convertToCSV(reportData);
    await ExportService.saveAndShare(csv, `shoulder_log_${Date.now()}.csv`);
  }, [readings, allProcessedData]);

  return (
    <InternalSensorContext.Provider value={{ 
      readings, 
      isRecording, 
      algo1Series: graphData.algo1, 
      algo2Series: graphData.algo2,
      startInternalRecording, 
      stopRecording,
      exportCurrentData // Exponera funktionen
    }}>
      {children}
    </InternalSensorContext.Provider>
  );
};

export const useInternalSensorVM = () => {
  const context = useContext(InternalSensorContext);
  if (!context) throw new Error('useInternalSensorVM must be used within InternalSensorProvider');
  return context;
};