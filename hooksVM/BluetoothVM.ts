// ../BluetoothVM.ts

import { BluetoothSensorService } from '../components/services/BluetoothSensorService';
import { RecordingState, SensorReading } from '../Models/SensorData';
// import { SensorData } from '../Models/SensorData'; // <-- Import SensorReading model 
                                                      // and POTENTIALLY MOVE DECODING FUNCTIONS HERE

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
}

export class BluetoothScanViewModel {
  private service: BluetoothSensorService;
  private setViewState: React.Dispatch<React.SetStateAction<ScanViewState>>; 
  private currentReading: Partial<SensorReading> = {}; 

  public initialState: ScanViewState = {
    status: 'Initializing Bluetooth...',
    isConnected: false,
    isLoading: true,
    recordingState: RecordingState.IDLE,
    latestReading: null,
    accelString: 'X: N/A, Y: N/A, Z: N/A',
    gyroString: 'X: N/A, Y: N/A, Z: N/A',
    error: null,
    accelHistory: [],
    gyroHistory: [],
  };

  
  constructor(setViewState: React.Dispatch<React.SetStateAction<ScanViewState>>) {
    // NOTE: The path for BluetoothSensorService may need correction based on your project structure.
    this.service = new BluetoothSensorService();
    this.setViewState = setViewState;
  }

  // --- Core Data Handler ---
  private handleSensorData = (reading: Partial<SensorReading>) => {
    // 1. Accumulate the latest data
    this.currentReading = { ...this.currentReading, ...reading };

    const { accelerometerX, accelerometerY, accelerometerZ, gyroscopeX, gyroscopeY, gyroscopeZ } = this.currentReading;

    this.setViewState(prev => {
      const newAccelHistory = (accelerometerX !== undefined && accelerometerY !== undefined && accelerometerZ !== undefined)
        ? [...prev.accelHistory, { x: accelerometerX, y: accelerometerY, z: accelerometerZ }].slice(-100)
        : prev.accelHistory;

      const newGyroHistory = (gyroscopeX !== undefined && gyroscopeY !== undefined && gyroscopeZ !== undefined)
        ? [...prev.gyroHistory, { x: gyroscopeX, y: gyroscopeY, z: gyroscopeZ }].slice(-100)
        : prev.gyroHistory;

      const accelStr = (accelerometerX !== undefined && accelerometerY !== undefined && accelerometerZ !== undefined)
        ? `X: ${accelerometerX.toFixed(2)}, Y: ${accelerometerY.toFixed(2)}, Z: ${accelerometerZ.toFixed(2)}`
        : prev.accelString;

      const gyroStr = (gyroscopeX !== undefined && gyroscopeY !== undefined && gyroscopeZ !== undefined)
        ? `X: ${gyroscopeX.toFixed(2)}, Y: ${gyroscopeY.toFixed(2)}, Z: ${gyroscopeZ.toFixed(2)}`
        : prev.gyroString;

      return {
        ...prev,
        accelHistory: newAccelHistory,
        gyroHistory: newGyroHistory,
        accelString: accelStr,
        gyroString: gyroStr,
        latestReading: this.currentReading as SensorReading,
      };
    });
  };

  // --- Public Methods ---
  public startScanning() {
    this.setViewState(prev => ({ 
      ...prev, 
      isLoading: true,
      status: 'Scanning for device...'
    }));

    this.service.scanAndConnect(this.handleSensorData) 
    .then(() => {
      this.setViewState(prev => ({
        ...prev,
        status: '✅ Connected! Streaming IMU Data.', 
        isConnected: true,
        isLoading: false,
      }));
    })
    .catch(err => {
      this.setViewState(prev => ({
        ...prev,
        status: `❌ Connection Failed: ${err.message}`,
        isConnected: false,
        isLoading: false,
        error: err.message,
      }));
    });
  }

  public setRecordingState(state: RecordingState) {
  this.setViewState(prev => ({ ...prev, recordingState: state }));
}
  public cleanup() {
    this.service.cleanup();
  }
}