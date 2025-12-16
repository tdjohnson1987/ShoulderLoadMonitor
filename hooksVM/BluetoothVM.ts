// ../BluetoothVM.ts

import { BluetoothSensorService } from "../components/services/BluetoothSensorService";
import { AngleCalculator } from "../components/utils/AngleCalculator";
import { ComplementaryFilter } from "../components/utils/ComplementaryFilter";
import { EWMAFilter } from "../components/utils/EWMAFilter";
import {
  AngleData,
  RecordingState,
  SensorReading,
} from "../Models/SensorData";

// Define the shape of the data the View will consume (View State)
export interface ScanViewState {
  status: string;
  isConnected: boolean;
  recordingState: RecordingState;
  latestReading: SensorReading | null;
  accelString: string;
  gyroString: string;
  error: string | null;
  isLoading: boolean;

  accelHistory: { x: number; y: number; z: number }[];
  gyroHistory: { x: number; y: number; z: number }[];

  angleHistory: AngleData[]; // Algorithm 1 & 2 outputs over time
}

export class BluetoothScanViewModel {
  private service: BluetoothSensorService;
  private setViewState: React.Dispatch<React.SetStateAction<ScanViewState>>;
  private currentReading: Partial<SensorReading> = {};

  private ewmaFilter = new EWMAFilter(0.1); // Algorithm 1 – smooth angle
  private compFilter = new ComplementaryFilter(0.98); // Algorithm 2 – fusion

  private lastTimestamp: number | null = null;

  public initialState: ScanViewState = {
    status: "Initializing Bluetooth...",
    isConnected: false,
    isLoading: true,
    recordingState: RecordingState.IDLE,
    latestReading: null,
    accelString: "X: N/A, Y: N/A, Z: N/A",
    gyroString: "X: N/A, Y: N/A, Z: N/A",
    error: null,
    accelHistory: [],
    gyroHistory: [],
    angleHistory: [],
  };

  constructor(
    setViewState: React.Dispatch<React.SetStateAction<ScanViewState>>
  ) {
    this.service = new BluetoothSensorService();
    this.setViewState = setViewState;
  }

  // --- Core Data Handler ---
  private handleSensorData = (reading: Partial<SensorReading>) => {
    // 1. Accumulate the latest data into currentReading
    this.currentReading = { ...this.currentReading, ...reading };

    const {
      accelerometerX,
      accelerometerY,
      accelerometerZ,
      gyroscopeX,
      gyroscopeY,
      gyroscopeZ,
      timestamp,
    } = this.currentReading;

    this.setViewState((prev) => {
      // --- Raw histories for graphs ---
      const newAccelHistory =
        accelerometerX !== undefined &&
        accelerometerY !== undefined &&
        accelerometerZ !== undefined
          ? [
              ...prev.accelHistory,
              { x: accelerometerX, y: accelerometerY, z: accelerometerZ },
            ].slice(-100)
          : prev.accelHistory;

      const newGyroHistory =
        gyroscopeX !== undefined &&
        gyroscopeY !== undefined &&
        gyroscopeZ !== undefined
          ? [
              ...prev.gyroHistory,
              { x: gyroscopeX, y: gyroscopeY, z: gyroscopeZ },
            ].slice(-100)
          : prev.gyroHistory;

      // --- Text values ---
      const accelStr =
        accelerometerX !== undefined &&
        accelerometerY !== undefined &&
        accelerometerZ !== undefined
          ? `X: ${accelerometerX.toFixed(2)}, Y: ${accelerometerY.toFixed(
              2
            )}, Z: ${accelerometerZ.toFixed(2)}`
          : prev.accelString;

      const gyroStr =
        gyroscopeX !== undefined &&
        gyroscopeY !== undefined &&
        gyroscopeZ !== undefined
          ? `X: ${gyroscopeX.toFixed(2)}, Y: ${gyroscopeY.toFixed(
              2
            )}, Z: ${gyroscopeZ.toFixed(2)}`
          : prev.gyroString;

      // --- Angle calculation (Algorithms 1 & 2) ---
      let newAngleHistory = prev.angleHistory;

      if (
        accelerometerX !== undefined &&
        accelerometerY !== undefined &&
        accelerometerZ !== undefined &&
        gyroscopeX !== undefined &&
        gyroscopeY !== undefined &&
        gyroscopeZ !== undefined &&
        timestamp !== undefined
      ) {
        // delta time in seconds
        let dt = 0.01;
        if (this.lastTimestamp != null) {
          dt = (timestamp - this.lastTimestamp) / 1000;
        }
        this.lastTimestamp = timestamp;

        // Orientation via Madgwick (roll, pitch, yaw in degrees)
        const { roll, pitch, yaw } =
          AngleCalculator.calculateAnglesWithMadgwick(
            accelerometerX,
            accelerometerY,
            accelerometerZ,
            gyroscopeX,
            gyroscopeY,
            gyroscopeZ,
            dt
          );

        // Choose plane: pitch as upper arm angle (sagittal), roll as lateral
        const accelAngleDeg = pitch;

        // Algorithm 1: EWMA on Madgwick angle
        const algorithm1Angle = this.ewmaFilter.update(accelAngleDeg);

        // Algorithm 2: complementary filter (accel angle + gyro rate)
        // Use gyro axis aligned with that plane (e.g. gyroscopeY?)
        const gyroRateDegPerSec = gyroscopeY; // ensure this is in deg/s
        const algorithm2Angle = this.compFilter.update(
          accelAngleDeg,
          gyroRateDegPerSec,
          dt
        );

        const angleSample: AngleData = {
          timestamp,
          algorithm1Angle,
          algorithm2Angle,
        };

        newAngleHistory = [...prev.angleHistory, angleSample].slice(-500);
      }

      return {
        ...prev,
        accelHistory: newAccelHistory,
        gyroHistory: newGyroHistory,
        accelString: accelStr,
        gyroString: gyroStr,
        angleHistory: newAngleHistory,
        latestReading: this.currentReading as SensorReading,
      };
    });
  };

  // --- Public Methods ---
  public startScanning() {
    this.setViewState((prev) => ({
      ...prev,
      isLoading: true,
      status: "Scanning for device...",
    }));

    this.service
      .scanAndConnect(this.handleSensorData)
      .then(() => {
        this.setViewState((prev) => ({
          ...prev,
          status: "✅ Connected! Streaming IMU Data.",
          isConnected: true,
          isLoading: false,
        }));
      })
      .catch((err) => {
        this.setViewState((prev) => ({
          ...prev,
          status: `❌ Connection Failed: ${err.message}`,
          isConnected: false,
          isLoading: false,
          error: err.message,
        }));
      });
  }

  public setRecordingState(state: RecordingState) {
    this.setViewState((prev) => ({ ...prev, recordingState: state }));
  }

  public cleanup() {
    this.service.cleanup();
  }
}
