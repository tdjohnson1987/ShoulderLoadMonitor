// InternalSensorVM.ts

import { useCallback, useState } from "react";
import { AngleData, SensorReading, SensorType } from "../Models/SensorData";
import { internalSensorService } from "../components/services/InternalSensorService";
import { ComplementaryFilter } from "../components/utils/ComplementaryFilter";
import { EWMAFilter } from "../components/utils/EWMAFilter";

export const useRecordingViewModel = () => {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [angleHistory, setAngleHistory] = useState<AngleData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [sensorType, setSensorType] = useState(SensorType.INTERNAL);

  // filters + timestamp are kept per recording session
  const [ewma] = useState(() => new EWMAFilter(0.1));
  const [comp] = useState(() => new ComplementaryFilter(0.98));
  const [lastTimestamp, setLastTimestamp] = useState<number | null>(null);

  const startInternalRecording = useCallback(() => {
    setReadings([]);
    setAngleHistory([]);
    setIsRecording(true);
    setLastTimestamp(null);

    internalSensorService.start(100, (newReading: SensorReading) => {
      setReadings((current) => [...current, newReading]);

      // --- angle calculation for internal sensor ---
      const accelAngleDeg =
        (Math.atan2(
          newReading.accelerometerY,
          newReading.accelerometerZ
        ) *
          180) /
        Math.PI;

      let dt = 0.01;
      if (lastTimestamp != null) {
        dt = (newReading.timestamp - lastTimestamp) / 1000;
      }
      setLastTimestamp(newReading.timestamp);

      const algorithm1Angle = ewma.update(accelAngleDeg);
      const algorithm2Angle = comp.update(
        accelAngleDeg,
        newReading.gyroscopeX, // or -gyroscopeX if sign is wrong
        dt > 0 ? dt : 0.01
      );

      setAngleHistory((prev) =>
        [...prev, { timestamp: newReading.timestamp, algorithm1Angle, algorithm2Angle }].slice(
          -500
        )
      );
    });
  }, [comp, ewma, lastTimestamp]);

  const stopRecording = useCallback(() => {
    internalSensorService.stop();
    setIsRecording(false);
  }, []);

  return {
    readings,
    angleHistory,
    isRecording,
    sensorType,
    setSensorType,
    startInternalRecording,
    stopRecording,
  };
};
