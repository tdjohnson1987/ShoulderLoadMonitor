// app/(tabs)/ReportScreen.tsx
import React from "react";
import { Button, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExportService, createShoulderLoadReport } from "../../components/services/ExportService";
import { useBluetoothVM } from "../../hooksVM/BluetoothVMContext";

export default function ReportScreen() {
  const { viewState } = useBluetoothVM();
  const { angleHistory, accelHistory } = viewState;

  const handleExportAnglesCsv = async () => {
    const csv = ExportService.convertToCSV(angleHistory);
    await ExportService.saveCSVToFile(csv, "angles.csv");
  };

  const handleExportSimpleReport = async () => {
    const sensorData = accelHistory.map((a, i) => ({
      index: i,
      accelX: a.x,
      accelY: a.y,
      accelZ: a.z,
    }));
    //Can add gyro and angle data later 
    await createShoulderLoadReport(sensorData, angleHistory);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Session Report</Text>
      <Text>Total angle samples: {angleHistory.length}</Text>

      <Button title="Download angle CSV" onPress={handleExportAnglesCsv} />
      <Button title="Download simple report" onPress={handleExportSimpleReport} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
});
