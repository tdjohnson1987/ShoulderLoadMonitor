import { useCallback, useState } from 'react';
import { SensorReading, SensorType } from '../Models/SensorData';
import { internalSensorService } from '../components/services/InternalSensorService';

export const useRecordingViewModel = () => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [sensorType, setSensorType] = useState<SensorType>(SensorType.INTERNAL);

  const startInternalRecording = useCallback(() => {
    // Töm tidigare mätningar om du vill börja om på ny kula
    setReadings([]);
    setIsRecording(true);

    // Starta hårdvaran via din Service
    internalSensorService.start(100, (newReading) => {
      setReadings(current => [...current, newReading]);
    });
  }, []);

  const stopRecording = useCallback(() => {
    internalSensorService.stop();
    setIsRecording(false);
    
    // Här kan du senare lägga till logik för att spara 
    // ner 'readings' till en databas eller fil
  }, []);

  return {
    readings,
    isRecording, // Nu finns denna tillgänglig för din View!
    sensorType,
    setSensorType,
    startInternalRecording,
    stopRecording
  };
};