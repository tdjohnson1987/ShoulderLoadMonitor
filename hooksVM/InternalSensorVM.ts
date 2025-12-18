import { useCallback, useRef, useState } from 'react';
import { SensorReading, SensorType } from '../Models/SensorData';
import { internalSensorService } from '../components/services/InternalSensorService';

export const useInternalViewModel = () => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [angleHistory, setAngleHistory] = useState<AngleData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [sensorType, setSensorType] = useState(SensorType.INTERNAL);

  // filters + timestamp are kept per recording session
  const [ewma] = useState(() => new EWMAFilter(0.1));
  const [comp] = useState(() => new ComplementaryFilter(0.98));
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);

  // Denna ref fungerar som en omedelbar "hård" strömbrytare
  const isRecordingRef = useRef(false);

  const startInternalRecording = useCallback(() => {
    console.log("start recording:");
    setReadings([]);
    isRecordingRef.current = true; // Sätt ref till true direkt
    setIsRecording(true);
    setLastTimestamp(null);

    internalSensorService.start(100, (newReading) => {
      // VIKTIGT: Om vi har klickat stop, strunta i att uppdatera statet
      if (isRecordingRef.current) {
        setReadings(current => [...current, newReading]);
      }
    });
  }, [comp, ewma, lastTimestamp]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false; // Denna rad stoppar inflödet INSTANT
    setIsRecording(false);
    internalSensorService.stop();
  }, []);

  return {
    readings,
    isRecording,
    sensorType,
    setSensorType,
    startInternalRecording,
    stopRecording,
  };
};
