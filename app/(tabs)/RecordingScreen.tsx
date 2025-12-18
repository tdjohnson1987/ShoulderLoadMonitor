// RecordingScreen.tsx

import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PlainLineGraph from "../../components/PlainLineGraph";
import { AccelCard, GyroCard } from "../../components/ui/SensorCards";
import { useBluetoothVM } from "../../hooksVM/BluetoothVMContext";
import { RecordingState, SensorType } from "../../Models/SensorData";
// Byt ut useRecordingViewModel mot useInternalSensorVM
import { useInternalSensorVM } from "../../hooksVM/InternalSensorVMContext";


export default function RecordingScreen() {
  const params = useLocalSearchParams<{ sensorType?: string }>();
  const selectedType =
    params.sensorType === SensorType.INTERNAL
      ? SensorType.INTERNAL
      : SensorType.BLUETOOTH;
  const isInternal = selectedType === SensorType.INTERNAL;

  const { viewState: btState, viewModel: btVM } = useBluetoothVM();
  // ... inuti RecordingScreen-komponenten:
  const {
    readings: internalReadings,
    angleHistory: internalAngleHistory,
    startInternalRecording,
    stopRecording: stopInternal,
    isRecording,
  } = useInternalSensorVM(); // Använd Context-hooken här!

  const latestInternal =
    internalReadings.length > 0
      ? internalReadings[internalReadings.length - 1]
      : null;
  const latestBt = btState.latestReading;
  const displayData = isInternal ? latestInternal : latestBt;

// Lägg till denna variabel innan return (den saknades i din kod)
const statusText = isInternal
  ? isRecording ? "RECORDING" : "IDLE"
  : btState.recordingState;

  const { algo1Series, algo2Series, hasAngleData } = useMemo(() => {
    if (isInternal && internalReadings.length > 0) {
      // Skapa filterna EN GÅNG för denna beräkning
      const ewma = new EWMAFilter(0.1);
      const comp = new ComplementaryFilter(0.98);

      let lastTimestamp = internalReadings[0].timestamp;
      
      // Vi slice:ar för att hålla JS-tråden vid liv
      const dataToProcess = internalReadings.slice(-500); 

      const series1 = [];
      const series2 = [];

      for (const r of dataToProcess) {
        const accelAngle = Math.atan2(r.accelerometerY, r.accelerometerZ) * (180 / Math.PI);
        const dt = (r.timestamp - lastTimestamp) / 1000;
        lastTimestamp = r.timestamp;

        const val1 = ewma.update(accelAngle);
        // Säkerställ att vi inte har negativt eller noll dt som kan krascha filter
        const currentDt = dt > 0 ? dt : 0.01;
        const val2 = comp.update(accelAngle, r.gyroscopeX, currentDt);

        series1.push({ x: val1, y: val1, z: val1 });
        series2.push({ x: val2, y: val2, z: val2 });
      }

      return { 
        algo1Series: series1, 
        algo2Series: series2, 
        hasAngleData: series1.length > 0 
      };
    }

    // Bluetooth-delen (oförändrad)
    return {
      algo1Series: btState.angleHistory.map(a => ({ x: a.algorithm1Angle, y: a.algorithm1Angle, z: a.algorithm1Angle })),
      algo2Series: btState.angleHistory.map(a => ({ x: a.algorithm2Angle, y: a.algorithm2Angle, z: a.algorithm2Angle })),
      hasAngleData: btState.angleHistory.length > 0,
    };
  }, [isInternal, internalReadings, btState.angleHistory]);
  // --- 3. Handlers (Lägg till dessa!) ---
  const handleStart = () => {
    if (isInternal) {
      startInternalRecording();
    } else {
      btVM.setRecordingState(RecordingState.RECORDING);
    }
  };

  const handleStop = () => {
    if (isInternal) {
      console.log("STOP-knapp tryckt!");
      stopInternal();
    } else {
      btVM.setRecordingState(RecordingState.STOPPED);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ScrollView slutar innan knapparna */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Recording ({isInternal ? "Internal" : "Bluetooth"})</Text>
        <Text style={styles.status}>Status: {statusText}</Text>

        <AccelCard latest={displayData} />
        <GyroCard latest={displayData} />

        {hasAngleData && (
          <View style={styles.graphSection}>
             {/* Graferna här */}
             <PlainLineGraph data={algo1Series} title="EWMA" isRecording={isRecording} />
             <PlainLineGraph data={algo2Series} title="Complementary" isRecording={isRecording} />
          </View>
        )}
        {/* Lägg till ett tomt utrymme så grafen inte täcks av fasta knappar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FIXED BUTTONS - Flyttade utanför ScrollView för responsivitet */}
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
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
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
    paddingBottom: 20, // För iPhone "home bar"
  }
});