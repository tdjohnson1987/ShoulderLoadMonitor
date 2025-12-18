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
      
      // DEBUG: Se vad som faktiskt finns tillgängligt i din build
      console.log("FileSystem State:", {
        cache: fs.cacheDirectory,
        document: fs.documentDirectory
      });

      // Vi provar båda alternativen
      const directory = fs.cacheDirectory || fs.documentDirectory;
      
      if (!directory) {
        // Om båda är null i en native app, är modulen inte korrekt länkad
        throw new Error("FileSystem returnerar null. Prova att bygga om appen med 'npx expo run:ios'.");
      }

      // Se till att filnamnet börjar med ett snedstreck om directory inte slutar med ett
      const cleanDir = directory.endsWith('/') ? directory : `${directory}/`;
      const path = `${cleanDir}${filename}`;
      
      await FileSystem.writeAsStringAsync(path, csvData, {
        encoding: "utf8",
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      } else {
        Alert.alert("Sparad", `CSV finns på: ${path}`);
      }
    } catch (error: any) {
      console.error("Export Error:", error);
      Alert.alert("Systemfel", error.message);
    }
  }
}