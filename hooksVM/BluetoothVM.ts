// src/viewmodels/BluetoothVM.ts

import { BluetoothSensorService } from '../components/services/BluetoothSensorService';
import { RecordingState, SensorReading } from '../Models/SensorData';

// Define the shape of the data the View will consume (View State)
interface ScanViewState {
  status: string;
  isConnected: boolean;
  recordingState: RecordingState; 
  latestReading: SensorReading | null; 
  accelString: string; 
  gyroString: string;  
  error: string | null;
  isLoading: boolean; // Property added in previous step
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
  };

  constructor(setViewState: React.Dispatch<React.SetStateAction<ScanViewState>>) {
    // NOTE: The path for BluetoothSensorService may need correction based on your project structure.
    this.service = new BluetoothSensorService();
    this.setViewState = setViewState;
  }

  // --- Core Data Handler ---
  private handleSensorData = (reading: Partial<SensorReading>) => {
    // 1. Accumulate the latest data (since accel and gyro come separately)
    this.currentReading = { 
      ...this.currentReading, 
      ...reading 
    };
    
    // 2. Format the data for the UI
    const { 
      accelerometerX, accelerometerY, accelerometerZ, 
      gyroscopeX, gyroscopeY, gyroscopeZ 
    } = this.currentReading;
    
    // Check if ALL required Accel data exists before formatting
    const accelReady = accelerometerX !== undefined && accelerometerY !== undefined && accelerometerZ !== undefined;

    const accelStr = accelReady 
      ? `X: ${accelerometerX!.toFixed(2)}, Y: ${accelerometerY!.toFixed(2)}, Z: ${accelerometerZ!.toFixed(2)}` 
      : this.initialState.accelString;
      
    // Check if ALL required Gyro data exists before formatting
    const gyroReady = gyroscopeX !== undefined && gyroscopeY !== undefined && gyroscopeZ !== undefined;
    
    // Ensure all gyroscope properties are checked for undefined before using toFixed
    const gyroStr = gyroReady
      ? `X: ${gyroscopeX!.toFixed(2)}, Y: ${gyroscopeY!.toFixed(2)}, Z: ${gyroscopeZ!.toFixed(2)}` 
      : this.initialState.gyroString;

    // 3. Update the View State
    this.setViewState(prev => ({
      ...prev,
      accelString: accelStr,
      gyroString: gyroStr,
      latestReading: this.currentReading as SensorReading, 
    }));
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

  public cleanup() {
    this.service.cleanup();
  }
}