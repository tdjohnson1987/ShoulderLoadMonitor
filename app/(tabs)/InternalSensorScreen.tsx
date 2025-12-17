// views/InternalSensorScreen.tsx
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useRecordingViewModel } from '../../hooksVM/InternalSensorVM';

const InternalSensorScreen = () => {
  const { 
    readings, 
    startInternalRecording, 
    stopRecording,
    isRecording // Antar att du har en boolean i din ViewModel för detta
  } = useRecordingViewModel();

  // Hämta det senaste värdet från arrayen
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Intern IMU Sensor</Text>
        <View style={[styles.statusBadge, { backgroundColor: isRecording ? '#34C759' : '#FF9500' }]}>
          <Text style={styles.statusText}>{isRecording ? 'RECORDING' : 'IDLE'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Accelerometer Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ACCELEROMETER (G)</Text>
          <View style={styles.row}>
            <DataPoint label="X" value={latestReading?.accelerometerX} color="#FF3B30" />
            <DataPoint label="Y" value={latestReading?.accelerometerY} color="#34C759" />
            <DataPoint label="Z" value={latestReading?.accelerometerZ} color="#007AFF" />
          </View>
        </View>

        {/* Gyroscope Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>GYROSKOP (rad/s)</Text>
          <View style={styles.row}>
            <DataPoint label="X" value={latestReading?.gyroscopeX} color="#FF3B30" />
            <DataPoint label="Y" value={latestReading?.gyroscopeY} color="#34C759" />
            <DataPoint label="Z" value={latestReading?.gyroscopeZ} color="#007AFF" />
          </View>
        </View>

        {/* Statistik */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Samples</Text>
            <Text style={styles.statValue}>{readings.length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Timestamp</Text>
            <Text style={styles.statValue}>
              {latestReading ? new Date(latestReading.timestamp).toLocaleTimeString() : '--:--:--'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Kontrollknappar */}
      <View style={styles.footer}>
        {!isRecording ? (
          <TouchableOpacity 
            style={[styles.button, styles.startBtn]} 
            onPress={startInternalRecording}
          >
            <Text style={styles.buttonText}>STARTA MÄTNING</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.stopBtn]} 
            onPress={stopRecording}
          >
            <Text style={styles.buttonText}>STOPPA & SPARA</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

/** Hjälpkomponent för att visa enskilda mätvärden */
const DataPoint = ({ label, value, color }: { label: string, value?: number, color: string }) => (
  <View style={styles.dataPoint}>
    <Text style={[styles.dataLabel, { color }]}>{label}</Text>
    <Text style={styles.dataValue}>
      {value !== undefined ? value.toFixed(3) : '0.000'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { 
    padding: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 20, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  cardLabel: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 16, letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  dataPoint: { alignItems: 'center', flex: 1 },
  dataLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  dataValue: { fontSize: 20, fontWeight: '600', fontFamily: 'Courier', color: '#1C1C1E' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { 
    flex: 1, 
    backgroundColor: '#E5E5EA', 
    padding: 12, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  statLabel: { fontSize: 11, color: '#636366', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
  footer: { padding: 20, backgroundColor: 'transparent' },
  button: { 
    height: 60, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  startBtn: { backgroundColor: '#007AFF' },
  stopBtn: { backgroundColor: '#FF3B30' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }
});

export default InternalSensorScreen;