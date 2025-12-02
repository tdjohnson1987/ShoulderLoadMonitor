// ..DataProcessor.ts

// Data processing service for sensor readings
import { AngleData, SensorReading } from '../../Models/SensorData';
import { AngleCalculator } from '../utils/AngleCalculator';
import { ComplementaryFilter } from '../utils/ComplementaryFilter';

// Initialize Madgwick-based Angle Calculator
const angleCalculator = AngleCalculator;

// Initialize Complementary Filter with alpha = 0.98
const compFilter = new ComplementaryFilter(0.98);

export class DataProcessor {
  /**
   * Process raw sensor reading to compute angles using both algorithms
   * @param reading Raw sensor reading
   * @param deltaTime Time since last reading in seconds
   * @returns Processed angle data
   */
  static processReading(reading: SensorReading, deltaTime: number): AngleData {
    // Calculate angles using Madgwick filter
    const { roll } = angleCalculator.calculateAnglesWithMadgwick(
      reading.accelerometerX,
      reading.accelerometerY,
      reading.accelerometerZ,
      reading.gyroscopeX,
      reading.gyroscopeY,
      reading.gyroscopeZ,
      deltaTime
    );

    // Calculate angle from accelerometer for complementary filter
    const accelAngle = Math.atan2(
      reading.accelerometerY,
      Math.sqrt(reading.accelerometerX ** 2 + reading.accelerometerZ ** 2)
    ) * (180 / Math.PI); // Convert to degrees

    // Gyroscope rate around X-axis in degrees/second
    const gyroRate = reading.gyroscopeX * (180 / Math.PI);

    // Update complementary filter
    const compAngle = compFilter.update(accelAngle, gyroRate, deltaTime);

    return {
      timestamp: reading.timestamp,
      algorithm1Angle: roll, // Madgwick roll angle
      algorithm2Angle: compAngle, // Complementary filter angle
    };
  }
}   