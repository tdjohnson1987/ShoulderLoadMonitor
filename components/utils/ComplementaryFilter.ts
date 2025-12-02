// ../ComplementaryFilter.ts
/**
 * Complementary Filter for sensor fusion of accelerometer and gyroscope data.
 * This filter combines the short-term accuracy of the gyroscope with the long-term stability of the accelerometer.
 */

export class ComplementaryFilter {
  private alpha: number; // weight for gyroscope data
  private angle: number; // current angle estimate

  constructor(alpha: number = 0.98) {
    this.alpha = alpha;
    this.angle = 0; // initial angle
  }

  /**
   * Update the filter with new accelerometer and gyroscope data
   * @param accelAngle Angle from accelerometer (degrees)
   * @param gyroRate Angular rate from gyroscope (degrees/second)
   * @param deltaTime Time interval since last update (seconds)
   * @returns Updated angle estimate (degrees)
   */
  update(accelAngle: number, gyroRate: number, deltaTime: number): number {
    // Integrate gyroscope data to get angle change
    const gyroAngleChange = gyroRate * deltaTime;

    // Predict new angle using gyroscope
    const predictedAngle = this.angle + gyroAngleChange;

    // Correct with accelerometer data
    this.angle = this.alpha * predictedAngle + (1 - this.alpha) * accelAngle;

    return this.angle;
  }
}