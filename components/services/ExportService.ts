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
        .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
        .join(",");
    });
    return [headerString, ...rows].join("\n");
  }

  static async saveAndShare(csvData: string, filename: string): Promise<void> {
    try {
      const fs = FileSystem as any;
      
      // ANVÄND documentDirectory FÖR PERMANENT LAGRING
      const directory = fs.documentDirectory;
      
      if (!directory) {
        throw new Error("Could not find the doc. map. ");
      }

      const path = `${directory}${filename}`;
      
      await FileSystem.writeAsStringAsync(path, csvData, {
        encoding: "utf8",
      });

      console.log("Fil sparad permanent på:", path);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      } else {
        Alert.alert("Saved", `Filen finns kvar i appens dokumentmapp.`);
      }
    } catch (error: any) {
      console.error("Export Error:", error);
      Alert.alert("Fail", error.message);
    }
  }
}