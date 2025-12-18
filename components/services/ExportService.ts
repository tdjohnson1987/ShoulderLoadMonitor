
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
      return headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",");
    });
    return [headerString, ...rows].join("\n");
  }

  static async saveAndShare(csvData: string, filename: string): Promise<void> {
    try {
      // 1. Hitta en fungerande mapp (iOS föredrar cache för delning)
      const fs = FileSystem as any;
      const directory = fs.cacheDirectory || fs.documentDirectory;

      if (!directory) {
        throw new Error("Kunde inte hitta lagringsplats på enheten.");
      }

      // 2. Skapa en säker filväg med file:// prefix (Krävs ofta av iOS Sharing)
      const tempPath = `${directory}${filename}`;
      const fileUri = tempPath.startsWith("file://") ? tempPath : `file://${tempPath}`;

      // 3. Skriv filen
      await FileSystem.writeAsStringAsync(fileUri, csvData, {
        encoding: "utf8",
      });

      // 4. Dubbelkolla att filen finns innan vi delar (för att undvika Access Error)
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("Filen kunde inte skapas.");
      }

      // 5. Dela med explicit MIME-typ
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Spara din inspelning',
          UTI: 'public.comma-separated-values-text', // iOS-specifik typ för CSV
        });
      } else {
        Alert.alert("Sparad", `Filen sparades lokalt: ${fileUri}`);
      }
    } catch (error: any) {
      console.error("Export Error:", error);
      Alert.alert("Export misslyckades", error.message);
    }
  }
}