// app/(tabs)/RecordingScreen.tsx
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlainLineGraph from "../../components/PlainLineGraph";
import { AccelCard, GyroCard } from "../../components/ui/SensorCards";

import { useBluetoothVM } from "../../hooksVM/BluetoothVMContext";
import { useInternalSensorVM } from "../../hooksVM/InternalSensorVMContext";
import { RecordingState, SensorType } from "../../Models/SensorData";

export default function RecordingScreen() {
  const params = useLocalSearchParams<{ sensorType?: string }>();
  const isInternal = params.sensorType === SensorType.INTERNAL;

  // View Model Hooks
  const { viewState: btState, viewModel: btVM } = useBluetoothVM();
  const {
    readings: internalReadings,
    algo1Series: internalAlgo1, // Färdig data från VM!
    algo2Series: internalAlgo2, // Färdig data från VM!
    startInternalRecording,
    stopRecording: stopInternal,
    isRecording,
  } = useInternalSensorVM();

  // 1. Unified Data for Cards
  const displayData = isInternal 
    ? internalReadings[internalReadings.length - 1] 
    : btState.latestReading;

  // 2. Unified Logic for Graphs
  const algo1Data = isInternal ? internalAlgo1 : btState.angleHistory.map(a => ({ x: a.algorithm1Angle, y: -999, z: -999 }));
  const algo2Data = isInternal ? internalAlgo2 : btState.angleHistory.map(a => ({ x: -999, y: a.algorithm2Angle, z: -999 }));
  const hasData = algo1Data.length > 0;

  const statusText = isInternal
    ? isRecording ? "RECORDING" : "IDLE"
    : btState.recordingState;

  // Handlers
  const handleStart = () => isInternal ? startInternalRecording() : btVM.setRecordingState(RecordingState.RECORDING);
  const handleStop = () => isInternal ? stopInternal() : btVM.setRecordingState(RecordingState.STOPPED);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Recording ({isInternal ? "Internal" : "Bluetooth"})</Text>
        <Text style={styles.status}>Status: {statusText}</Text>

        <AccelCard latest={displayData} />
        <GyroCard latest={displayData} />

        {hasData && (
          <View style={styles.graphSection}>
            <PlainLineGraph data={algo1Data} title="EWMA (Internal/BT)" isRecording={isRecording} />
            <PlainLineGraph data={algo2Data} title="Complementary (Internal/BT)" isRecording={isRecording} />
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <View style={styles.buttonRow}>
          <Button title="Start" onPress={handleStart} color="#007AFF" />
          <Button title="Stop" onPress={handleStop} color="#FF3B30" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F2F7" },
  container: { paddingTop: 24, paddingHorizontal: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "#1C1C1E" },
  status: { marginBottom: 16, color: "#636366" },
  graphSection: { marginTop: 16 },
  graphContainer: { marginVertical: 8 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#CCC',
    paddingBottom: 30, 
  }
});