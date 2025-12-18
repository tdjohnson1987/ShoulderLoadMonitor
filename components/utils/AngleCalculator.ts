// // ../AngleCalculator.ts

// import { MadgwickFilter } from '../utils/MadgwickFilter'; // Your existing filter

// export class AngleCalculator {
//   private static madgwick = new MadgwickFilter(0.041); // 0.041 rad/s for typical sample rate

//   /**
//    * Calculate angles using Madgwick sensor fusion
//    * Returns all 3 plane angles from a single, fused orientation
//    */
//   static calculateAnglesWithMadgwick(
//     accelX: number,
//     accelY: number,
//     accelZ: number,
//     gyroX: number,
//     gyroY: number,
//     gyroZ: number,
//     deltaTime: number
//   ): {
//     roll: number;    // Frontal plane (°)
//     pitch: number;   // Sagittal plane (°)
//     yaw: number;     // Horizontal plane (°)
//   } {
//     // Update Madgwick with new sensor data
//     this.madgwick.update(
//       gyroX, gyroY, gyroZ,  // Gyroscope (rad/s)
//       accelX, accelY, accelZ, // Accelerometer (m/s²)
//       deltaTime
//     );

//     // Get Euler angles from quaternion
//     const { roll, pitch, yaw } = this.madgwick.getEulerAngles();

//     return {
//       roll: roll * (180 / Math.PI),   // Convert rad to degrees
//       pitch: pitch * (180 / Math.PI),
//       yaw: yaw * (180 / Math.PI),
//     };
//   }

// }


/*
ANGLE CALCULATIONS USING BASIC TRIGONOMETRY
*/

export class AngleCalculator {
//   /**
//    * Calculate shoulder angle in FRONTAL plane (abduction/adduction)
//    * Uses accelerometer to detect tilt relative to gravity
//    * 
//    * When arm is at side: angle ≈ 0°
//    * When arm is lifted to shoulder height: angle ≈ 90°
//    */
  static calculateFrontalPlaneAngle(
    accelX: number,
    accelY: number,
    accelZ: number
  ): number {
    // Magnitude of vertical acceleration (combination of Y and Z)
    const verticalAccel = Math.sqrt(accelY * accelY + accelZ * accelZ);
    
    // Prevent division by zero
    if (verticalAccel === 0) return 0;

    // Calculate angle between forward tilt (accelX) and vertical (Y+Z)
    // atan2 returns angle in radians (-π to π)
    const angleRad = Math.atan2(accelX, verticalAccel);
    const angleDeg = angleRad * (180 / Math.PI);
    
    return angleDeg; // Range: -90° to +90°
  }
/**
    //  * Calculate shoulder angle in SAGITTAL plane (flexion/extension)
    //  * Forward reach = positive angle
    //  * Arm at side = 0°
    //  * Behind back = negative angle
    //  */
    static calculateSagittalPlaneAngle(
    accelY: number,
    accelX: number,
    accelZ: number
    ): number {
    // Magnitude of vertical acceleration (X and Z components)
    const verticalAccel = Math.sqrt(accelX * accelX + accelZ * accelZ);
    
    if (verticalAccel === 0) return 0;

    // Calculate angle between forward tilt (accelY) and vertical (X+Z)
    const angleRad = Math.atan2(accelY, verticalAccel);
    const angleDeg = angleRad * (180 / Math.PI);
    
    return angleDeg; // Range: -90° to +90°
    }

//   /**
//    * Calculate shoulder angle in HORIZONTAL plane (rotation/yaw)
//    * Uses gyroscope to measure rotation rate and integrate over time
//    * 
//    * Note: This measures instantaneous rotation. For cumulative angle,
//    * you need to integrate over time: angle += gyroZ * deltaTime
//    */
  static calculateHorizontalPlaneAngle(
    gyroX: number,
    gyroY: number
  ): number {
    // Calculate angle from gyroscope rotation rates
    const angleRad = Math.atan2(gyroY, gyroX);
    const angleDeg = angleRad * (180 / Math.PI);
    
    return angleDeg; // Range: -180° to +180°
  }

//   /**
//    * Integrate gyroscope data to get cumulative rotation angle
//    * Should be called with each new sensor reading
//    */
  static integrateGyroAngle(
    previousAngle: number,
    gyroZ: number, // Rotation around vertical axis (rad/s)
    deltaTime: number // Time since last sample (seconds)
  ): number {
    // angle = angle + (angular_velocity * time)
    const angleIncrement = gyroZ * deltaTime * (180 / Math.PI); // Convert rad/s to deg
    return previousAngle + angleIncrement;
  }
}
