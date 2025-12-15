// // ../BluetoothScanScreen.tsx

// import React, { useEffect, useMemo, useState } from 'react';
// import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
// import PlainLineGraph from "../../components/PlainLineGraph";
// import { BluetoothScanViewModel } from '../../hooksVM/BluetoothVM';
// import { RecordingState } from '../../Models/SensorData'; // <-- Import Model enum for status clarity


// // Define the state shape - matching ViewModel's ScanViewState
// interface ScanViewState {
//   status: string;
//   isConnected: boolean;
//   recordingState: RecordingState;
//   latestReading: any | null; // Use 'any' or SensorReading model here
//   accelString: string;
//   gyroString: string;
//   accelHistory: any[]; // Define proper type for history data
//   gyroHistory: any[];
//   error: string | null;
//   isLoading: boolean; // Loading state for Bluetooth operations
// }

// export default function BluetoothScanScreen() {
//   // --- State ---
//   const [viewState, setViewState] = useState<ScanViewState>(() => {
//     const viewModel = new BluetoothScanViewModel(() => {});
//     return viewModel.initialState as ScanViewState;
//   });

//   // --- ViewModel ---
//   const viewModel = useMemo(() => new BluetoothScanViewModel(setViewState), []);

//   // --- Start scanning on mount ---
//   useEffect(() => {
//     viewModel.startScanning();
//     return () => viewModel.cleanup();
//   }, [viewModel]);

//   // --- Handle errors ---
//   useEffect(() => {
//     if (viewState.error) {
//       Alert.alert("BLE Error", viewState.error);
//     }
//   }, [viewState.error]);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>IMU Monitor</Text>

//       {/* Status */}
//       <View style={styles.statusBox}>
//         {viewState.isLoading && <ActivityIndicator size="small" color="#007AFF" />}
//         <Text style={[styles.statusText, { color: viewState.isConnected ? "green" : "#007AFF" }]}>
//           {viewState.status}
//         </Text>
//       </View>

//       {/* --- Accelerometer Graph & Data --- */}
//       {viewState.accelHistory.length > 0 && (
//         <View style={{ marginVertical: 8 }}>
//           <PlainLineGraph data={viewState.accelHistory} title="Accelerometer (X/Y/Z)" />
//           <Text style={styles.dataValue}>{viewState.accelString}</Text>
//         </View>
//       )}

//       <View style={styles.dataContainer}>
//         <Text style={styles.dataHeader}>Accelerometer Readings</Text>
//         <Text style={styles.dataValue}>{viewState.accelString}</Text>
//       </View>

//       <View style={styles.separator} />

//       {/* --- Gyroscope Graph & Data --- */}
//       {viewState.gyroHistory.length > 0 && (
//         <View style={{ marginVertical: 8 }}>
//           <PlainLineGraph data={viewState.gyroHistory} title="Gyroscope (X/Y/Z)" />
//           <Text style={styles.dataValue}>{viewState.gyroString}</Text>
//         </View>
//       )}

//       <View style={styles.dataContainer}>
//         <Text style={styles.dataHeader}>Gyroscope Readings</Text>
//         <Text style={styles.dataValue}>{viewState.gyroString}</Text>
//       </View>
//     </View>
//   );
// }

// BluetoothScanScreen.tsx 
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from "react-native";
import { BluetoothScanViewModel, ScanViewState } from "../../hooksVM/BluetoothVM";

export default function BluetoothScanScreen() {
  const [viewState, setViewState] = useState<ScanViewState>(
    new BluetoothScanViewModel(() => {}).initialState
  );
  const navigation = useNavigation();

  const viewModel = useMemo(
    () => new BluetoothScanViewModel(setViewState),
    []
  );

  useEffect(() => {
    viewModel.startScanning();
    return () => viewModel.cleanup();
  }, [viewModel]);

  useEffect(() => {
    if (viewState.error) {
      Alert.alert("BLE Error", viewState.error);
    }
  }, [viewState.error]);

  // When connected, show a “Continue” button to go to RecordingScreen
  useEffect(() => {
    if (viewState.isConnected) {
      // Option 1: auto-navigate after connection
      // navigation.navigate("Recording");
    }
  }, [viewState.isConnected, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>IMU Monitor</Text>

      <View style={styles.statusBox}>
        {viewState.isLoading && (
          <ActivityIndicator size="small" color="#007AFF" />
        )}
        <Text
          style={[
            styles.statusText,
            { color: viewState.isConnected ? "green" : "#007AFF" },
          ]}
        >
          {viewState.status}
        </Text>
      </View>

      {viewState.isConnected && (
        <Button
          title="Go to Recording"
          onPress={() => navigation.navigate("Recording" as never)}
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#007AFF',
  },
  dataContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  dataHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  dataValue: {
    fontSize: 18,
    fontFamily: 'monospace',
    marginBottom: 15,
    color: '#000',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  }
});