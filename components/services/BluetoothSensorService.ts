import { BleManager, Device, Subscription } from 'react-native-ble-plx';

const ACCEL_UUID = "07C80001-07C8-07C8-07C8-07C807C807C8";
const GYRO_UUID  = "07C80004-07C8-07C8-07C8-07C807C807C8";
const IMU_SERVICE_UUID = "07C80000-07C8-07C8-07C8-07C807C807C8";
const TARGET_ADDRESS = "191DD383-65E1-D4B2-CEDC-83FA0484F673";
const TARGET_NAME_PREFIX = "BERG1";

export class BluetoothSensorService {
  private bleManager = new BleManager();
  private scanTimeout: NodeJS.Timeout | number | null = null;
  private connection: Device | null = null;
  private accelSubscription: Subscription | null = null;
  private gyroSubscription: Subscription | null = null;

  async scanAndConnect(onData: (accel: string, gyro: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.bleManager.startDeviceScan(null, null, async (error, device) => {
        if (error) {
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

            // Accelerometer
            this.accelSubscription = this.connection.monitorCharacteristicForService(
              IMU_SERVICE_UUID,
              ACCEL_UUID,
              (err, characteristic) => {
                if (err) {
                  console.error('Accel error:', err);
                  return;
                }
                const accelData = characteristic?.value; // base64
                // Optionally decode base64 here or pass raw
                onData(accelData ?? '', '');
              }
            );

            // Gyroscope
            this.gyroSubscription = this.connection.monitorCharacteristicForService(
              IMU_SERVICE_UUID,
              GYRO_UUID,
              (err, characteristic) => {
                if (err) {
                  console.error('Gyro error:', err);
                  return;
                }
                const gyroData = characteristic?.value; // base64
                onData('', gyroData ?? '');
              }
            );

            resolve();
          } catch (err) {
            reject(err);
          }
        }
      });

      // Stop scan after 10 seconds
      this.scanTimeout = setTimeout(() => {
        this.bleManager.stopDeviceScan();
        reject(new Error('Device not found within timeout'));
      }, 10000);
    });
  }

  cleanup() {
    this.accelSubscription?.remove();
    this.gyroSubscription?.remove();
    this.connection = null;
    this.scanTimeout && clearTimeout(this.scanTimeout);
  }
}
