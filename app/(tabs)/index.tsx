import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSession } from '../../hooksVM/SessionContext';
import { SensorType } from '../../Models/SensorData';

export default function HomeScreen() {
  const router = useRouter();
  const { setActiveSource } = useSession();

  const handleSelectInternal = () => {
    setActiveSource(SensorType.INTERNAL);
    router.push('/(tabs)/RecordingScreen');
  };

  const handleSelectBluetooth = () => {
    setActiveSource(SensorType.BLUETOOTH);
    router.push('/(tabs)/BluetoothScanScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose recording method</Text>
      
      <TouchableOpacity 
        style={styles.card} 
        onPress={handleSelectInternal}
      >
        <Text style={styles.cardTitle}>📱 Internal Sensor</Text>
        <Text style={styles.cardDesc}>Use your phone's built-in IMU sensor.</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.card} 
        onPress={handleSelectBluetooth}
      >
        <Text style={styles.cardTitle}>🔗 Bluetooth IMU</Text>
        <Text style={styles.cardDesc}>Connect to an external sensor device through Bluetooth.</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  card: { 
    backgroundColor: '#FFF', 
    padding: 25, 
    borderRadius: 15, 
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  cardDesc: { color: '#666', marginTop: 5 }
});