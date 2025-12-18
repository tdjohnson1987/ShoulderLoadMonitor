// app/(tabs)/RecordingScreen.tsx
import { useLocalSearchParams } from "expo-router";
import React from "react";
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

  const { viewState: btState, viewModel: btVM } = useBluetoothVM();
  const {
    readings: internalReadings,
    startInternalRecording,
    stopRecording: stopInternal,
    isRecording,
  } = useRecordingViewModel();

  const latestInternal =
    internalReadings.length > 0
      ? internalReadings[internalReadings.length - 1]
      : null;
  const latestBt = btState.latestReading;

  const isInternal = selectedType === SensorType.INTERNAL;

  // Bluetooth angle series (internal path currently has no angleHistory)
  const algo1Series = btState.angleHistory.map((a) => ({
    x: a.algorithm1Angle,
    y: a.algorithm1Angle,
    z: a.algorithm1Angle,
  }));

  const algo2Series = btState.angleHistory.map((a) => ({
    x: a.algorithm2Angle,
    y: a.algorithm2Angle,
    z: a.algorithm2Angle,
  }));

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

        {/* Reused UI: accelerometer & gyro cards */}
        <AccelCard latest={isInternal ? latestInternal : latestBt} />
        <GyroCard latest={isInternal ? latestInternal : latestBt} />

        {/* Angle graphs only make sense for Bluetooth at the moment */}
        {!isInternal && btState.angleHistory.length > 0 && (
          <View style={{ marginVertical: 8 }}>
            <PlainLineGraph
              data={algo1Series}
              title="Upper arm angle – Algorithm 1 (EWMA)"
            />
          </View>
        )}

        {!isInternal && btState.angleHistory.length > 0 && (
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
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 20,
  },
});




// // app/recording.tsx (or wherever your RecordingScreen lives)
// import { router } from "expo-router";
// import React from "react";
// import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import PlainLineGraph from "../../components/PlainLineGraph";
// import { useBluetoothVM } from "../../hooksVM/BluetoothVMContext";
// import { RecordingState } from "../../Models/SensorData";

// export default function RecordingScreen() {
//   const { viewState, viewModel } = useBluetoothVM();
//   // console.log("REC latestReading", viewState.latestReading);
//   // console.log("REC accelHistory length", viewState.accelHistory.length);
//   // console.log("REC angleHistory length", viewState.angleHistory.length); // Debugging, now seemingly working angleHistory


//   // Map angleHistory into the shape PlainLineGraph expects
//   const algo1Series = viewState.angleHistory.map((a) => ({
//     x: a.algorithm1Angle,
//     y: a.algorithm1Angle,
//     z: a.algorithm1Angle,
//   }));

//   const algo2Series = viewState.angleHistory.map((a) => ({
//     x: a.algorithm2Angle,
//     y: a.algorithm2Angle,
//     z: a.algorithm2Angle,
//   }));

//   const handleStart = () => {
//     viewModel.setRecordingState(RecordingState.RECORDING);
//   };

//   const handleStop = () => {
//     viewModel.setRecordingState(RecordingState.STOPPED);
//     router.push("/ReportScreen"); // Navigate to ReportScreen after stopping
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//      <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.header}>Recording</Text>
//       <Text>Status: {viewState.recordingState}</Text>

//       {/* Raw accelerometer graph */}
//       {viewState.accelHistory.length > 0 && (
//         <View style={{ marginVertical: 8 }}>
//           <PlainLineGraph
//             data={viewState.accelHistory}
//             title="Accelerometer (X/Y/Z)"
//           />
//           <Text style={styles.dataValue}>{viewState.accelString}</Text>
//         </View>
//       )}

//       {/* Raw gyroscope graph */}
//       {viewState.gyroHistory.length > 0 && (
//         <View style={{ marginVertical: 8 }}>
//           <PlainLineGraph
//             data={viewState.gyroHistory}
//             title="Gyroscope (X/Y/Z)"
//           />
//           <Text style={styles.dataValue}>{viewState.gyroString}</Text>
//         </View>
//       )}

//       {/* Algorithm 1 – EWMA angle */}
//       {viewState.angleHistory.length > 0 && (
//         <View style={{ marginVertical: 8 }}>
//           <PlainLineGraph
//             data={algo1Series}
//             title="Upper arm angle – Algorithm 1 (EWMA)"
//           />
//         </View>
//       )}

//       {/* Algorithm 2 – Complementary filter angle */}
//       {viewState.angleHistory.length > 0 && (
//         <View style={{ marginVertical: 8 }}>
//           <PlainLineGraph
//             data={algo2Series}
//             title="Upper arm angle – Algorithm 2 (Complementary)"
//           />
//         </View>
//       )}

//       <View style={styles.buttonRow}>
//         <Button title="Start" onPress={handleStart} />
//         <Button title="Stop" onPress={handleStop} />
//       </View>
//      </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   container: {
//     paddingTop: 24,
//     paddingHorizontal: 20,
//     paddingBottom: 40,
//   },
//   header: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#333" },
//   block: { marginVertical: 8 },
//   dataValue: { fontSize: 16, fontFamily: "monospace", marginTop: 4 },
//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginTop: 20,
//   },
//   text: { color: "#111" },
// });