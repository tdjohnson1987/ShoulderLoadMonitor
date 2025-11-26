// src/models/SensorData.ts

/** * Represents a single sensor reading with timestamp */
export interface SensorReading {
  timestamp: number;
  accelerometerX: number;
  accelerometerY: number;
  accelerometerZ: number;
  gyroscopeX?: number;
  gyroscopeY?: number;
  gyroscopeZ?: number;
}

/** * Processed angle data from algorithms */
export interface AngleData {
  timestamp: number;
  algorithm1Angle: number; // EWMA filtered angle from accelerometer
  algorithm2Angle: number; // Complementary filter angle (accel + gyro)
}

/** * Recording session metadata and data */
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

/** * Bluetooth device information */
export interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
  isConnected: boolean;
}

/** * Sensor type enumeration */
export enum SensorType {
  INTERNAL = 'internal',
  BLUETOOTH = 'bluetooth',
}

/** * Recording state */
export enum RecordingState {
  IDLE = 'idle',
  RECORDING = 'recording',
  PAUSED = 'pausing',
  STOPPED = 'stopped',
}