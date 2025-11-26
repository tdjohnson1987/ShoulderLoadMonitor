// ../components/services/BluetoothSensorService.ts

import { Buffer } from 'buffer';
import { BleManager, Device, State, Subscription } from 'react-native-ble-plx';
import { SensorReading } from '../../Models/SensorData'; // <-- Import the Model

const ACCEL_UUID = "07C80001-07C8-07C8-07C8-07C807C807C8";
const GYRO_UUID  = "07C80004-07C8-07C8-07C8-07C807C807C8";
const IMU_SERVICE_UUID = "07C80000-07C8-07C8-07C8-07C807C807C8";
const TARGET_ADDRESS = "191DD383-65E1-D4B2-CEDC-83FA0484F673";
const TARGET_NAME_PREFIX = "BERG1";

// --- DECODING FUNCTIONS ---
function decodeAccelData(base64Data: string): Pick<SensorReading, 'accelerometerX' | 'accelerometerY' | 'accelerometerZ'> | null {
  if (!base64Data) return null;
  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length < 12) { 
      console.warn("Received short accelerometer data.");
      return null;
  }
  return {
    accelerometerX: buffer.readFloatLE(0),
    accelerometerY: buffer.readFloatLE(4),
    accelerometerZ: buffer.readFloatLE(8),
  };
}

function decodeGyroData(base64Data: string): Pick<SensorReading, 'gyroscopeX' | 'gyroscopeY' | 'gyroscopeZ'> | null {
  if (!base64Data) return null;
  const buffer = Buffer.from(base64Data, 'base64');
  if (buffer.length < 12) { 
      console.warn("Received short gyroscope data.");
      return null;
  }
  return {
    gyroscopeX: buffer.readFloatLE(0),
    gyroscopeY: buffer.readFloatLE(4),
    gyroscopeZ: buffer.readFloatLE(8),
  };
}
// -------------------------


export class BluetoothSensorService {
  private bleManager = new BleManager();
  private scanTimeout: NodeJS.Timeout | number | null = null;
  private connection: Device | null = null;
  private accelSubscription: Subscription | null = null;
  private gyroSubscription: Subscription | null = null;

  /**
   * Helper function - wait until the Bluetooth Manager is in the PoweredOn state.
   */
  private async waitUntilPoweredOn(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Listen for state changes
      const subscription = this.bleManager.onStateChange(state => {
        console.log('BLE State:', state); // Source of the LOG BLE State: Unknown message
        if (state === State.PoweredOn) {
          subscription.remove();
          resolve();
        } else if (state === State.PoweredOff) { // <-- CRITICAL FIX: Explicitly handle Bluetooth being OFF
          subscription.remove();
          reject(new Error(`Bluetooth is off (${state}). Please enable Bluetooth.`));
        } else if (state === State.Unauthorized || state === State.Unsupported) {
          subscription.remove();
          reject(new Error(`Bluetooth is permanently unavailable: ${state}`));
        }
        // State.Unknown and State.Resetting are intermediate and do not cause rejection yet.
      }, true); 
    });
  }

  /**
   * Scans, connects, and starts monitoring IMU characteristics.
   * @param onData Callback to receive partial SensorReading objects.
   */
  async scanAndConnect(onData: (reading: Partial<SensorReading>) => void): Promise<void> {
    // WAIT FOR POWERED ON STATE
    await this.waitUntilPoweredOn();
    
    return new Promise((resolve, reject) => {
      this.bleManager.startDeviceScan(null, null, async (error, device) => {
        if (error) {
          this.bleManager.stopDeviceScan();
          reject(error);
          return;
        }
        if (
          device &&
          (device.id === TARGET_ADDRESS ||
            (device.name && device.name.startsWith(TARGET_NAME_PREFIX)))
        ) {
          this.bleManager.stopDeviceScan();
          clearTimeout(this.scanTimeout as NodeJS.Timeout);

          try {
            this.connection = await device.connect();
            await this.connection.discoverAllServicesAndCharacteristics();

            // Accelerometer Monitor
            this.accelSubscription = this.connection!.monitorCharacteristicForService(
              IMU_SERVICE_UUID,
              ACCEL_UUID,
              (err, characteristic) => {
                if (err) {
                  console.error('Accel error:', err);
                  return;
                }
                if (characteristic?.value) {
                    const accelData = decodeAccelData(characteristic.value);
                    if (accelData) {
                        onData({ ...accelData, timestamp: Date.now() }); 
                    }
                }
              }
            );

            // Gyroscope Monitor
            this.gyroSubscription = this.connection!.monitorCharacteristicForService(
              IMU_SERVICE_UUID,
              GYRO_UUID,
              (err, characteristic) => {
                if (err) {
                  console.error('Gyro error:', err);
                  return;
                }
                if (characteristic?.value) {
                    const gyroData = decodeGyroData(characteristic.value);
                    if (gyroData) {
                        onData({ ...gyroData, timestamp: Date.now() }); 
                    }
                }
              }
            );

            resolve();
          } catch (err) {
            this.connection?.cancelConnection(); 
            reject(err);
          }
        }
      });

      // Stop scan after 10 seconds (Timeout)
      this.scanTimeout = setTimeout(() => {
        this.bleManager.stopDeviceScan();
        reject(new Error('Device not found within timeout'));
      }, 10000);
    });
  }

  cleanup() {
    this.accelSubscription?.remove();
    this.gyroSubscription?.remove();
    this.connection?.cancelConnection(); 
    this.connection = null;
    this.scanTimeout && clearTimeout(this.scanTimeout);
    
    // Destroy the manager on unmount
    this.bleManager.destroy(); 
  }
}