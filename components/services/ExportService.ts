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
// ../ExportService.ts
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

export class ExportService {
  static convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const headerString = headers.join(",");

    const rows = data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header] ?? "";
          // Formatera värdet som en sträng och hantera citationstecken
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        })
        .join(",");
    });

    return [headerString, ...rows].join("\n");
  }

  static async saveAndShare(csvData: string, filename: string): Promise<void> {
    try {
      // Vi castar FileSystem till any för att slippa röda streck på 
      // egenskaper som vi VET finns vid runtime (cacheDirectory och EncodingType)
      const fs = FileSystem as any;
      const directory = fs.cacheDirectory || fs.documentDirectory;
      
      if (!directory) {
        throw new Error("Lagringsutrymme hittades inte.");
      }

      const path = `${directory}${filename}`;
      
      // Vi använder strängen "utf8" direkt istället för FileSystem.EncodingType.UTF8
      await FileSystem.writeAsStringAsync(path, csvData, {
        encoding: "utf8",
      });

      if (await Sharing.shareAsync) {
        await Sharing.shareAsync(path);
      } else {
        Alert.alert("Sparad", `Filen sparades lokalt: ${path}`);
      }
    } catch (error) {
      console.error("Export Error:", error);
      Alert.alert("Fel", "Kunde inte spara eller dela CSV-filen.");
    }
  }
}