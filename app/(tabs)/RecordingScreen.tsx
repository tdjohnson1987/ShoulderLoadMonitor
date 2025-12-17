// app/recording.tsx (or wherever your RecordingScreen lives)
import { router } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlainLineGraph from "../../components/PlainLineGraph";
import { useBluetoothVM } from "../../hooksVM/BluetoothVMContext";
import { RecordingState } from "../../Models/SensorData";

export default function RecordingScreen() {
  const { viewState, viewModel } = useBluetoothVM();
  console.log("REC latestReading", viewState.latestReading);
  console.log("REC accelHistory length", viewState.accelHistory.length);
  console.log("REC angleHistory length", viewState.angleHistory.length); // Debugging


  // Map angleHistory into the shape PlainLineGraph expects
  const algo1Series = viewState.angleHistory.map((a) => ({
    x: a.algorithm1Angle,
    y: a.algorithm1Angle,
    z: a.algorithm1Angle,
  }));

  const algo2Series = viewState.angleHistory.map((a) => ({
    x: a.algorithm2Angle,
    y: a.algorithm2Angle,
    z: a.algorithm2Angle,
  }));

  const handleStart = () => {
    viewModel.setRecordingState(RecordingState.RECORDING);
  };

  const handleStop = () => {
    viewModel.setRecordingState(RecordingState.STOPPED);
    router.push("/ReportScreen"); // or wherever your report screen is
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Recording</Text>
      <Text>Status: {viewState.recordingState}</Text>

      {/* Raw accelerometer graph */}
      {viewState.accelHistory.length > 0 && (
        <View style={{ marginVertical: 8 }}>
          <PlainLineGraph
            data={viewState.accelHistory}
            title="Accelerometer (X/Y/Z)"
          />
          <Text style={styles.dataValue}>{viewState.accelString}</Text>
        </View>
      )}

      {/* Raw gyroscope graph */}
      {viewState.gyroHistory.length > 0 && (
        <View style={{ marginVertical: 8 }}>
          <PlainLineGraph
            data={viewState.gyroHistory}
            title="Gyroscope (X/Y/Z)"
          />
          <Text style={styles.dataValue}>{viewState.gyroString}</Text>
        </View>
      )}

      {/* Algorithm 1 – EWMA angle */}
      {viewState.angleHistory.length > 0 && (
        <View style={{ marginVertical: 8 }}>
          <PlainLineGraph
            data={algo1Series}
            title="Upper arm angle – Algorithm 1 (EWMA)"
          />
        </View>
      )}

      {/* Algorithm 2 – Complementary filter angle */}
      {viewState.angleHistory.length > 0 && (
        <View style={{ marginVertical: 8 }}>
          <PlainLineGraph
            data={algo2Series}
            title="Upper arm angle – Algorithm 2 (Complementary)"
          />
        </View>
      )}

      <View style={styles.buttonRow}>
        <Button title="Start" onPress={handleStart} />
        <Button title="Stop" onPress={handleStop} />
      </View>
    </SafeAreaView>
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
