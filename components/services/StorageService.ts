 // components/services/StorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export class StorageService {
  private static STORAGE_KEY = '@sensor_recordings';

  // Sparar en ny mätning
  static async saveSession(data: any[]) {
    try {
      const timestamp = new Date().toLocaleString();
      const newSession = {
        id: Date.now().toString(),
        date: timestamp,
        data: data
      };

      // 1. Hämta befintliga sessioner
      const existingData = await AsyncStorage.getItem(this.STORAGE_KEY);
      const sessions = existingData ? JSON.parse(existingData) : [];

      // 2. Lägg till den nya
      sessions.push(newSession);

      // 3. Spara ner hela listan igen
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
      
      Alert.alert("Sparad!", `Sessionen från ${timestamp} har sparats i appen.`);
    } catch (error) {
      console.error("Storage Error:", error);
      Alert.alert("Fel", "Kunde inte spara i internminnet.");
    }
  }

  // Hämtar alla sparade sessioner (för att visa i en lista)
  static async getAllSessions() {
    const data = await AsyncStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Rensar allt (om du vill börja om)
  static async clearAll() {
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }
  // Lägg till detta i din StorageService.ts

    static async exportSessionToTerminal(sessionId: string) {
    try {
        const existingData = await AsyncStorage.getItem(this.STORAGE_KEY);
        const sessions = existingData ? JSON.parse(existingData) : [];
        
        // Hitta rätt session
        const session = sessions.find((s: any) => s.id === sessionId);
        
        if (!session) return;

        // KONVERTERA TILL CSV
        const data = session.data;
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map((row: any) => 
            Object.values(row).join(",")
        ).join("\n");
        
        const csvString = `${headers}\n${rows}`;

        // SKICKA TILL DATORN
        console.log("      --- KOPIERA NEDANSTÅENDE TILL EXCEL ---");
        console.log(csvString);
        console.log("      --- SLUT PÅ CSV-DATA ---");

        alert("CSV-data har skickats till terminalen på din dator!");
    } catch (error) {
        console.error("Kunde inte konvertera till CSV", error);
    }
    }
}