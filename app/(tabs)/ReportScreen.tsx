import React, { useMemo } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExportService, createShoulderLoadReport } from "../../components/services/ExportService";
import { useBluetoothVM } from "../../hooksVM/BluetoothVMContext";
import { useInternalSensorVM } from "../../hooksVM/InternalSensorVMContext";
import { useSession } from "../../hooksVM/SessionContext"; // Om du skapade denna
import { SensorType } from "../../Models/SensorData";

export default function ReportScreen() {
  const { activeSource } = useSession();
  const { viewState: bleState } = useBluetoothVM();
  const { readings: internalReadings } = useInternalSensorVM();

  // 1. Normalisera intern data så den matchar formatet som createShoulderLoadReport förväntar sig
  const normalizedInternalData = useMemo(() => {
    return internalReadings.map((r, i) => ({
      index: i,
      accelX: r.accelerometerX,
      accelY: r.accelerometerY,
      accelZ: r.accelerometerZ,
      gyroX: r.gyroscopeX,
      gyroY: r.gyroscopeY,
      gyroZ: r.gyroscopeZ,
    }));
  }, [internalReadings]);

  const handleExport = async (type: 'internal' | 'bluetooth') => {
    try {
      if (type === 'internal') {
        const csv = ExportService.convertToCSV(normalizedInternalData);
        await ExportService.saveCSVToFile(csv, `internal_data_${Date.now()}.csv`);
      } else {
        const sensorData = bleState.accelHistory.map((a, i) => ({
          index: i,
          accelX: a.x, accelY: a.y, accelZ: a.z,
        }));
        await createShoulderLoadReport(sensorData, bleState.angleHistory);
      }
    } catch (error) {
      Alert.alert("Export misslyckades", "Ett fel uppstod vid skapande av filen.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.header}>Session Report</Text>

        {/* Visa endast sektionen som valts eller har data */}
        {(activeSource === SensorType.INTERNAL || internalReadings.length > 0) && (
          <View style={[styles.section, activeSource === SensorType.INTERNAL && styles.activeSection]}>
            <Text style={styles.subHeader}>📱 Intern Sensor</Text>
            <Text style={styles.statText}>Samples: {internalReadings.length}</Text>
            <Button 
              title="Exportera CSV" 
              onPress={() => handleExport('internal')} 
              disabled={internalReadings.length === 0}
            />
          </View>
        )}

        {(activeSource === SensorType.BLUETOOTH || bleState.accelHistory.length > 0) && (
          <View style={[styles.section, styles.mt20, activeSource === SensorType.BLUETOOTH && styles.activeSection]}>
            <Text style={styles.subHeader}>🔗 Bluetooth Enhet</Text>
            <Text style={styles.statText}>Samples: {bleState.accelHistory.length}</Text>
            <Button 
              title="Exportera Bluetooth Rapport" 
              onPress={() => handleExport('bluetooth')} 
              disabled={bleState.accelHistory.length === 0}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  header: { fontSize: 28, fontWeight: "800", marginBottom: 25, color: "#1C1C1E" },
  section: { 
    padding: 20, 
    backgroundColor: "#fff", 
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2 
  },
  activeSection: {
    borderWidth: 2,
    borderColor: "#007AFF"
  },
  subHeader: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#1C1C1E" },
  statText: { fontSize: 14, color: "#8E8E93", marginBottom: 15 },
  mt20: { marginTop: 20 }
});