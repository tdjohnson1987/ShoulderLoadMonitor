// ../SensorData.ts

/** Represents a single sensor reading with timestamp */
export interface SensorReading {
  timestamp: number;
  accelerometerX: number;
  accelerometerY: number;
  accelerometerZ: number;
  gyroscopeX: number;
  gyroscopeY: number;
  gyroscopeZ: number;
  sampleIndex?: number; // Optional tracking index
}

/** Processed angle data from algorithms */
export interface AngleData {
  timestamp: number;
  algorithm1Angle: number; // EWMA filtered angle from accelerometer
  algorithm2Angle: number; // Complementary filter angle (accel + gyro)
}

/** Recording session metadata and data */
export interface Recording {
  id: string;
  startTime: number;
  endTime?: number;
  sensorType: 'internal' | 'bluetooth';
  deviceName?: string;
  rawData: SensorReading[];
  processedData: AngleData[];
  duration?: number;
}

/** Bluetooth device information */
export interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
  isConnected: boolean;
}

/** Sensor type enumeration */
export enum SensorType {
  INTERNAL = 'internal',
  BLUETOOTH = 'bluetooth',
}

/** Recording state */
export enum RecordingState {
  IDLE = 'idle',
  RECORDING = 'recording',
  PAUSED = 'pausing',
  STOPPED = 'stopped',
}

// ============= HELPER FUNCTIONS =============

/**
 * Factory function to create a SensorReading from partial data
 * Ensures all required fields are present
 */
export function createSensorReading(data: {
  timestamp: number;
  accelerometerX: number;
  accelerometerY: number;
  accelerometerZ: number;
  gyroscopeX: number;
  gyroscopeY: number;
  gyroscopeZ: number;
  sampleIndex?: number;
}): SensorReading {
  return {
    timestamp: data.timestamp,
    accelerometerX: data.accelerometerX,
    accelerometerY: data.accelerometerY,
    accelerometerZ: data.accelerometerZ,
    gyroscopeX: data.gyroscopeX,
    gyroscopeY: data.gyroscopeY,
    gyroscopeZ: data.gyroscopeZ,
    sampleIndex: data.sampleIndex,
  };
}

/**
 * Check if a partial reading has all required fields
 */
export function isCompleteSensorReading(
  data: Partial<SensorReading>
): data is SensorReading {
  return (
    data.timestamp !== undefined &&
    data.accelerometerX !== undefined &&
    data.accelerometerY !== undefined &&
    data.accelerometerZ !== undefined &&
    data.gyroscopeX !== undefined &&
    data.gyroscopeY !== undefined &&
    data.gyroscopeZ !== undefined
  );
}

/**
 * Calculate recording duration in seconds
 */
export function getRecordingDuration(recording: Recording): number {
  if (!recording.endTime) return 0;
  return (recording.endTime - recording.startTime) / 1000; // ms to seconds
}

/**
 * Calculate average sample rate (Hz)
 */
export function calculateSampleRate(readings: SensorReading[]): number {
  if (readings.length < 2) return 0;
  const firstTimestamp = readings[0].timestamp;
  const lastTimestamp = readings[readings.length - 1].timestamp;
  const durationSeconds = (lastTimestamp - firstTimestamp) / 1000;
  return durationSeconds > 0 ? readings.length / durationSeconds : 0;
}
