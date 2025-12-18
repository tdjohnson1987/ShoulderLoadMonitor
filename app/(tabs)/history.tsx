import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { StorageService } from '../../components/services/StorageService';

// 1. Definiera vad en Session faktiskt innehåller
interface Session {
  id: string;
  date: string;
  data: any[];
}

export default function HistoryScreen() {
  // 2. Sätt typen till <Session[]> istället för standardvärdet 'never'
  const [savedSessions, setSavedSessions] = useState<Session[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        const sessions = await StorageService.getAllSessions();
        setSavedSessions(sessions.reverse()); 
      };
      loadHistory();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sparade Mätningar</Text>
      
      <FlatList
        data={savedSessions}
        // 3. Nu vet TypeScript att 'item' är en Session och har 'id'
        keyExtractor={(item: Session) => item.id}
        renderItem={({ item }: { item: Session }) => (
          <View style={styles.sessionItem}>
            <View>
              <Text style={styles.dateText}>{item.date}</Text>
              <Text style={styles.infoText}>{item.data.length} rader data</Text>
            </View>
            <Button 
              title="Till Datorn" 
              onPress={() => StorageService.exportSessionToTerminal(item.id)} 
            />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Inga sparade mätningar än.</Text>}
      />

      <Button title="Rensa allt" color="red" onPress={() => {
        Alert.alert("Radera", "Vill du verkligen rensa all historik?", [
          { text: "Avbryt", style: "cancel" },
          { text: "Ja, radera", onPress: async () => {
              await StorageService.clearAll();
              setSavedSessions([]);
          }}
        ]);
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 40 },
  sessionItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  dateText: { fontSize: 16, fontWeight: '600' },
  infoText: { fontSize: 12, color: '#666' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});