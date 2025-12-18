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

  // 1. View Model Hooks
  const { viewState: btState, viewModel: btVM } = useBluetoothVM();
  const {
    readings: internalReadings,
    algo1Series: internalAlgo1,
    algo2Series: internalAlgo2,
    startInternalRecording,
    stopRecording: stopInternal,
    exportCurrentData, // Hämtas från din uppdaterade VM
    isRecording,
  } = useInternalSensorVM();

  // 2. Visa data för korten (Senaste mätningen)
  const displayData = isInternal 
    ? internalReadings[internalReadings.length - 1] 
    : btState.latestReading;

  // 3. Logik för Grafer (Väljer data baserat på vald sensortyp)
  const algo1Data = isInternal 
    ? internalAlgo1 
    : btState.angleHistory.map(a => ({ x: a.algorithm1Angle, y: -999, z: -999 }));
    
  const algo2Data = isInternal 
    ? internalAlgo2 
    : btState.angleHistory.map(a => ({ x: -999, y: a.algorithm2Angle, z: -999 }));
    
  const hasData = algo1Data.length > 0;

  // 4. Statushantering
  const statusText = isInternal
    ? isRecording ? "RECORDING" : "IDLE"
    : btState.recordingState;

  // 5. Handlers
  const handleStart = () => {
    if (isInternal) {
      startInternalRecording();
    } else {
      btVM.setRecordingState(RecordingState.RECORDING);
    }
  };

  const handleStop = () => {
    if (isInternal) {
      stopInternal();
    } else {
      btVM.setRecordingState(RecordingState.STOPPED);
    }
  };

  const handleExport = async () => {
    // Om Bluetooth är valt kan du lägga till en btVM.export() här senare
    if (isInternal) {
      await exportCurrentData();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Recording ({isInternal ? "Internal" : "Bluetooth"})</Text>
        <Text style={styles.status}>Status: {statusText}</Text>

        <AccelCard latest={displayData} />
        <GyroCard latest={displayData} />

        {hasData && (
          <View style={styles.graphSection}>
            <View style={styles.graphContainer}>
              <PlainLineGraph 
                data={algo1Data} 
                title="EWMA Filter (Algorithm 1)" 
                isRecording={isRecording} 
                yLabel="Degrees"
                xLabel="Samples"
              />
            </View>
            <View style={styles.graphContainer}>
              <PlainLineGraph 
                data={algo2Data} 
                title="Complementary Filter (Algorithm 2)" 
                isRecording={isRecording} 
                yLabel="Degrees"
                xLabel="Samples"
              />
            </View>
          </View>
        )}
        {/* Padding för att ScrollView inte ska täckas av knapparna */}
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Fast bottenpanel för knappar */}
      <View style={styles.fixedButtonContainer}>
        <View style={styles.buttonRow}>
          <Button title="Start" onPress={handleStart} color="#007AFF" />
          <Button title="Stop" onPress={handleStop} color="#FF3B30" />
          <Button 
            title="Export CSV" 
            onPress={handleExport} 
            disabled={isRecording || (isInternal && internalReadings.length === 0)}
            color="#34C759" 
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F2F7" },
  container: { paddingTop: 24, paddingHorizontal: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "#1C1C1E" },
  status: { marginBottom: 16, color: "#636366", fontWeight: "600" },
  graphSection: { marginTop: 16 },
  graphContainer: { marginVertical: 12 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 20,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#D1D1D6',
    paddingBottom: 35, // Anpassat för iPhone "home bar"
  }
});