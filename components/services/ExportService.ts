import * as FileSystem from 'expo-file-system';
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
      // 1. Tvinga TypeScript att acceptera de dolda egenskaperna
      const fs = FileSystem as any; 
      
      const directory = fs.documentDirectory || fs.cacheDirectory;
      
      if (!directory) {
        throw new Error("Kunde inte hitta lagringsplats på enheten.");
      }

      const fileUri = `${directory}${filename}`;

      // 2. Använd "utf8" som rå sträng istället för att leta efter EncodingType
      // Detta är säkrare när bibliotekets definitioner bråkar
      await FileSystem.writeAsStringAsync(fileUri, csvData, {
        encoding: "utf8", 
      });

      // 3. Dela filen
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          UTI: 'public.comma-separated-values-text',
        });
      }
    } catch (error: any) {
      console.error("Export Error:", error);
      Alert.alert("Export misslyckades", error.message);
    }
  }
}