// // ../ExportService.ts
// import FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";

// /**
//  * Export Service
//  * Handles exporting sensor data and angle calculations to CSV files.
//  */
// export class ExportService {
//   /**
//    * Convert data array of plain objects into CSV.
//    */
//   static convertToCSV(data: any[]): string {
//     if (!data || data.length === 0) return "";

//     const headers = Object.keys(data[0]).join(",");
//     const rows = data.map((row) =>
//       Object.values(row)
//         .map((v) => String(v))
//         .join(",")
//     );

//     return [headers, ...rows].join("\n");
//   }

//   /**
//    * Save CSV data to a file in cacheDirectory and open share dialog.
//    */
//   static async saveCSVToFile(
//     csvData: string,
//     filename: string
//   ): Promise<void> {
//     const path = `${FileSystem.cacheDirectory}${filename}`;

//     await FileSystem.writeAsStringAsync(path, csvData, {
//       encoding: FileSystem.EncodingType.UTF8,
//     });

//     const canShare = await Sharing.isAvailableAsync();
//     if (canShare) {
//       await Sharing.shareAsync(path);
//     } else {
//       console.log(`CSV saved at: ${path}`);
//     }
//   }
// }

// ../ExportService.ts
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export class ExportService {
  static convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((v) => String(v))
        .join(",")
    );

    return [headers, ...rows].join("\n");
  }

  static async saveCSVToFile(
    csvData: string,
    filename: string
  ): Promise<void> {
    // FileSystem may be undefined if the module didn't load correctly
    if (!FileSystem || !(FileSystem as any).writeAsStringAsync) {
      console.warn("expo-file-system not available");
      return;
    }

    const baseDir =
      (FileSystem as any).cacheDirectory ??
      (FileSystem as any).documentDirectory ??
      "";

    if (!baseDir) {
      console.warn("No writable directory available");
      return;
    }

    const path = `${baseDir}${filename}`;

    await (FileSystem as any).writeAsStringAsync(path, csvData, {
      encoding: "utf8",
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(path);
    } else {
      console.log(`CSV saved at: ${path}`);
    }
  }
}


/**
 * Create Shoulder Load report:
 * - sensorData: raw accel/gyro samples
 * - angleData : AngleData[] from Bluetooth VM
 */
export async function createShoulderLoadReport(
  sensorData: any[],
  angleData: any[]
): Promise<void> {
  const sensorCSV =
    sensorData && sensorData.length > 0
      ? ExportService.convertToCSV(sensorData)
      : "";
  const angleCSV =
    angleData && angleData.length > 0
      ? ExportService.convertToCSV(angleData)
      : "";

  if (sensorCSV) {
    await ExportService.saveCSVToFile(sensorCSV, "sensor_data.csv");
  }
  if (angleCSV) {
    await ExportService.saveCSVToFile(angleCSV, "angle_data.csv");
  }
}
