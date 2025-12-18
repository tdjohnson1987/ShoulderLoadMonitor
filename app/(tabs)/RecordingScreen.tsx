// RecordingScreen.tsx

import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PlainLineGraph from "../../components/PlainLineGraph";
import { AccelCard, GyroCard } from "../../components/ui/SensorCards";
import { useBluetoothVM } from "../../hooksVM/BluetoothVMContext";
import { useRecordingViewModel } from "../../hooksVM/InternalSensorVM";
import { RecordingState, SensorType } from "../../Models/SensorData";

export default function RecordingScreen() {
  const params = useLocalSearchParams<{ sensorType?: string }>();
  const selectedType =
    params.sensorType === SensorType.INTERNAL
      ? SensorType.INTERNAL
      : SensorType.BLUETOOTH;
  const isInternal = selectedType === SensorType.INTERNAL;

  const { viewState: btState, viewModel: btVM } = useBluetoothVM();
  const {
    readings: internalReadings,
    angleHistory: internalAngleHistory,
    startInternalRecording,
    stopRecording: stopInternal,
    isRecording,
  } = useRecordingViewModel();

  const latestInternal =
    internalReadings.length > 0
      ? internalReadings[internalReadings.length - 1]
      : null;
  const latestBt = btState.latestReading;
  const displayData = isInternal ? latestInternal : latestBt;

  // Common function: convert AngleData[] -> graph series
  const makeSeries = (angles: { algorithm1Angle: number; algorithm2Angle: number; timestamp: number }[]) => {
    if (angles.length === 0) {
      return { algo1Series: [], algo2Series: [], hasAngleData: false };
    }

    const t0 = angles[0].timestamp;
    const series1 = angles.map((a) => ({
      x: (a.timestamp - t0) / 1000, // seconds
      y: a.algorithm1Angle,
      z: a.algorithm1Angle,
    }));
    const series2 = angles.map((a) => ({
      x: (a.timestamp - t0) / 1000,
      y: a.algorithm2Angle,
      z: a.algorithm2Angle,
    }));
    return { algo1Series: series1, algo2Series: series2, hasAngleData: true };
  };

  const { algo1Series, algo2Series, hasAngleData } = useMemo(() => {
    if (isInternal) {
      return makeSeries(internalAngleHistory);
    }
    return makeSeries(btState.angleHistory);
  }, [isInternal, internalAngleHistory, btState.angleHistory]);

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

  const statusText = isInternal
    ? isRecording
      ? "RECORDING"
      : "IDLE"
    : btState.recordingState;

return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>
          Recording ({isInternal ? "Internal" : "Bluetooth"})
        </Text>
        <Text style={styles.status}>Status: {statusText}</Text>

        {displayData && (
          <>
            <AccelCard latest={displayData} />
            <GyroCard latest={displayData} />
          </>
        )}

        {hasAngleData && (
          <View style={styles.graphSection}>
            <View style={styles.graphContainer}>
              <PlainLineGraph
                data={algo1Series}
                title="Upper arm elevation (°) – Algorithm 1 (EWMA)"
                yLabel="Angle (degrees)"
                xLabel="Time (s)"
                isRecording={
                  isInternal
                    ? isRecording
                    : btState.recordingState === RecordingState.RECORDING
                }
              />
            </View>
            <View style={styles.graphContainer}>
              <PlainLineGraph
                data={algo2Series}
                title="Upper arm elevation (°) – Algorithm 2 (Complementary)"
                yLabel="Angle (degrees)"
                xLabel="Time (s)"
                isRecording={
                  isInternal
                    ? isRecording
                    : btState.recordingState === RecordingState.RECORDING
                }
              />
            </View>
          </View>
        )}

        <View style={styles.buttonRow}>
          <Button title="Start" onPress={handleStart} />
          <Button title="Stop" onPress={handleStop} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F2F7" },
  container: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1C1C1E",
  },
  status: { marginBottom: 16, color: "#636366" },
  graphSection: { marginTop: 16 },
  graphContainer: { marginVertical: 8 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 20,
  },
});
