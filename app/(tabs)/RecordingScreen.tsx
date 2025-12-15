// RecordingScreen.tsx (e.g. app/recording.tsx)
import { router } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import PlainLineGraph from "../../components/PlainLineGraph";
import { useBluetoothVM } from "../../hooksVM/BluetoothVMContext";
import { RecordingState } from "../../Models/SensorData";

export default function RecordingScreen() {
  const { viewState, viewModel } = useBluetoothVM();

  const handleStart = () => {
    viewModel.setRecordingState(RecordingState.RECORDING);
  };

  const handleStop = () => {
    viewModel.setRecordingState(RecordingState.STOPPED);
    // ReportScreen will read accelHistory/gyroHistory from the same context
    router.push("/ReportScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recording</Text>
      <Text>Status: {viewState.recordingState}</Text>

      {viewState.accelHistory.length > 0 && (
        <View style={{ marginVertical: 8 }}>
          <PlainLineGraph
            data={viewState.accelHistory}
            title="Accelerometer XYZ"
          />
          <Text style={styles.dataValue}>{viewState.accelString}</Text>
        </View>
      )}

      {viewState.gyroHistory.length > 0 && (
        <View style={{ marginVertical: 8 }}>
          <PlainLineGraph data={viewState.gyroHistory} title="Gyroscope XYZ" />
          <Text style={styles.dataValue}>{viewState.gyroString}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <Button title="Start" onPress={handleStart} />
        <Button title="Stop" onPress={handleStop} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  dataValue: { fontSize: 16, fontFamily: "monospace", marginTop: 4 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
});
