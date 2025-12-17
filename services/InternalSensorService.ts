// services/InternalSensorService.ts
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { SensorReading, createSensorReading } from '../Models/SensorData';

export class InternalSensorService {
  private _accel = { x: 0, y: 0, z: 0 };
  private _gyro = { x: 0, y: 0, z: 0 };
  private _subscriptionAccel: any = null;
  private _subscriptionGyro: any = null;

  async isAvailable(): Promise<boolean> {
    const accelAvailable = await Accelerometer.isAvailableAsync();
    const gyroAvailable = await Gyroscope.isAvailableAsync();
    return accelAvailable && gyroAvailable;
  }

  start(updateIntervalMs: number, onData: (reading: SensorReading) => void) {
    // Sätt intervall
    Accelerometer.setUpdateInterval(updateIntervalMs);
    Gyroscope.setUpdateInterval(updateIntervalMs);

    this._subscriptionAccel = Accelerometer.addListener(data => {
      this._accel = data;
    });

    this._subscriptionGyro = Gyroscope.addListener(data => {
      this._gyro = data;
      
      onData(createSensorReading({
        timestamp: Date.now(),
        accelerometerX: this._accel.x,
        accelerometerY: this._accel.y,
        accelerometerZ: this._accel.z,
        gyroscopeX: this._gyro.x,
        gyroscopeY: this._gyro.y,
        gyroscopeZ: this._gyro.z,
      }));
    });
  }

  stop() {
    this._subscriptionAccel?.remove();
    this._subscriptionGyro?.remove();
    this._subscriptionAccel = null;
    this._subscriptionGyro = null;
  }
}

export const internalSensorService = new InternalSensorService();