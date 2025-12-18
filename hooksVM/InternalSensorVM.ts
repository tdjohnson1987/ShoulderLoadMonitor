import { useCallback, useRef, useState } from 'react';
import { SensorReading, SensorType } from '../Models/SensorData';
import { internalSensorService } from '../components/services/InternalSensorService';

export const useInternalViewModel = () => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [sensorType, setSensorType] = useState(SensorType.INTERNAL);

  // Ref fungerar som en omedelbar synkron strömbrytare
  const isRecordingRef = useRef(false);

  const stopRecording = useCallback(() => {
    console.log("STOP: Stoppar nu");
    isRecordingRef.current = false; // Stoppar callback-flödet omedelbart
    setIsRecording(false);
    internalSensorService.stop(); // Stoppar hårdvaran
  }, []);

  const startInternalRecording = useCallback(() => {
    console.log("START: Rensar gamla lyssnare och startar ny");
    
    // Säkerhetsåtgärd: Stoppa alltid en eventuell körande session först
    internalSensorService.stop();
    
    setReadings([]);
    isRecordingRef.current = true;
    setIsRecording(true);

    internalSensorService.start(100, (newReading) => {
      // Denna check är kritisk för "direkt" stopp
      if (isRecordingRef.current) {
        setReadings(current => [...current, newReading]);
      }
    });
  }, []); // Tom array här är viktig! Vi vill inte skappa om denna funktion i onödan.

  return {
    readings,
    isRecording,
    sensorType,
    setSensorType,
    startInternalRecording,
    stopRecording,
  };
};