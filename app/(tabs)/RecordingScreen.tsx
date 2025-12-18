// app/(tabs)/RecordingScreen.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PlainLineGraph from "../../components/PlainLineGraph";
import { AccelCard, GyroCard } from "../../components/ui/SensorCards";
import { ComplementaryFilter } from "../../components/utils/ComplementaryFilter";
import { EWMAFilter } from "../../components/utils/EWMAFilter";
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

  // View Model Hooks
  const { viewState: btState, viewModel: btVM } = useBluetoothVM();
  const {
    readings: internalReadings,
    startInternalRecording,
    stopRecording: stopInternal,
    isRecording,
  } = useRecordingViewModel();

  // 1. Determine Latest Data for Cards
  const latestInternal = internalReadings.length > 0
      ? internalReadings[internalReadings.length - 1]
      : null;
  const latestBt = btState.latestReading;
  const displayData = isInternal ? latestInternal : latestBt;


  // const { algo1Series, algo2Series, hasAngleData } = useMemo(() => {
  //   // 1. Logik för INTERNA sensorer
  //   if (isInternal && internalReadings.length > 0) {
  //     const ewma = new EWMAFilter(0.1);
  //     const comp = new ComplementaryFilter(0.98);

  //     let lastTimestamp = internalReadings[0].timestamp;

  //     const series1 = [];
  //     const series2 = [];

  //     for (const r of internalReadings) {
  //       // Beräkna vinkel från accelerometer (använder Y och Z för lutning)
  //       // Vi använder Math.atan2 för att få vinkeln i förhållande till gravitationen
  //       const accelAngle = Math.atan2(r.accelerometerY, r.accelerometerZ) * (180 / Math.PI);

  //       // Beräkna deltaTime (sekunder mellan mätningar)
  //       const dt = (r.timestamp - lastTimestamp) / 1000;
  //       lastTimestamp = r.timestamp;

  //       // Uppdatera filter
  //       const val1 = ewma.update(accelAngle);
        
  //       // Vi använder gyroscopeX för rotation runt X-axeln (vanligast för armlyft)
  //       // Om grafen går åt fel håll, ändra r.gyroscopeX till -r.gyroscopeX
  //       const val2 = comp.update(accelAngle, r.gyroscopeX, dt > 0 ? dt : 0.01);

  //       series1.push({ x: val1, y: val1, z: val1 });
  //       series2.push({ x: val2, y: val2, z: val2 });
  //     }

  //     return { 
  //       algo1Series: series1, 
  //       algo2Series: series2, 
  //       hasAngleData: series1.length > 0 
  //     };
  //   }

  //   // 2. Logik för BLUETOOTH sensorer
  //   const btHasData = btState.angleHistory.length > 0;
  //   return {
  //     algo1Series: btState.angleHistory.map((a) => ({
  //       x: a.algorithm1Angle,
  //       y: a.algorithm1Angle,
  //       z: a.algorithm1Angle,
  //     })),
  //     algo2Series: btState.angleHistory.map((a) => ({
  //       x: a.algorithm2Angle,
  //       y: a.algorithm2Angle,
  //       z: a.algorithm2Angle,
  //     })),
  //     hasAngleData: btHasData,
  //   };
  // }, [isInternal, internalReadings, btState.angleHistory]);

  const { algo1Series, algo2Series, hasAngleData } = useMemo(() => {
    // 1. Internal sensor
    if (isInternal && internalReadings.length > 0) {
      const ewma = new EWMAFilter(0.1);
      const comp = new ComplementaryFilter(0.98);

      let lastTimestamp = internalReadings[0].timestamp;
      const series1: { x: number; y: number; z: number }[] = [];
      const series2: { x: number; y: number; z: number }[] = [];

      internalReadings.forEach((r, i) => {
        const accelAngle =
          Math.atan2(r.accelerometerY, r.accelerometerZ) * (180 / Math.PI);

        const dt = (r.timestamp - lastTimestamp) / 1000;
        lastTimestamp = r.timestamp;

        const val1 = ewma.update(accelAngle);
        const val2 = comp.update(accelAngle, r.gyroscopeX, dt > 0 ? dt : 0.01);

        series1.push({ x: i, y: val1, z: 0 }); // index on x, angle on y
        series2.push({ x: i, y: val2, z: 0 });
      });

      return {
        algo1Series: series1,
        algo2Series: series2,
        hasAngleData: series1.length > 0,
      };
    }

    // 2. Bluetooth sensor
    const btHasData = btState.angleHistory.length > 0;

    const series1 = btState.angleHistory.map((a, i) => ({
      x: i,
      y: a.algorithm1Angle,
      z: 0,
    }));
    const series2 = btState.angleHistory.map((a, i) => ({
      x: i,
      y: a.algorithm2Angle,
      z: 0,
    }));

    return {
      algo1Series: series1,
      algo2Series: series2,
      hasAngleData: btHasData,
    };
  }, [isInternal, internalReadings, btState.angleHistory]);

  // 3. Handlers
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
      btVM.stopRecording();
    }
  };

  const statusText = isInternal
    ? isRecording ? "RECORDING" : "IDLE"
    : btState.recordingState;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>
          Recording ({isInternal ? "Internal" : "Bluetooth"})
        </Text>
        <Text style={styles.status}>Status: {statusText}</Text>

        {/* Accelerometer & Gyro Cards */}
        <AccelCard latest={displayData} />
        <GyroCard latest={displayData} />

        {/* Angle Graphs */}
        {hasAngleData && (
          <View style={styles.graphSection}>
            <View style={styles.graphContainer}>
              <PlainLineGraph
                data={algo1Series}
                title="Upper arm angle – Algorithm 1 (EWMA)"
                isRecording={isInternal ? isRecording : btState.recordingState === RecordingState.RECORDING}
              />
            </View>

            <View style={styles.graphContainer}>
              <PlainLineGraph
                data={algo2Series}
                title="Upper arm angle – Algorithm 2 (Complementary)"
                isRecording={isInternal ? isRecording : btState.recordingState === RecordingState.RECORDING}
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

