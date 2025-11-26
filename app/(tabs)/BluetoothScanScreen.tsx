// ../BluetoothScanScreen.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { BluetoothScanViewModel } from '../../hooksVM/BluetoothVM';
import { RecordingState } from '../../Models/SensorData'; // <-- Import Model enum for status clarity

// Define the state shape - matching ViewModel's ScanViewState
interface ScanViewState {
  status: string;
  isConnected: boolean;
  recordingState: RecordingState;
  latestReading: any | null; // Use 'any' or SensorReading model here
  accelString: string;
  gyroString: string;
  error: string | null;
  isLoading: boolean; // Loading state for Bluetooth operations
}

export default function BluetoothScanScreen() {
  const [viewState, setViewState] = useState<ScanViewState>(() => {
    // Lazy initialization of ViewModel for stable instance
    const viewModel = new BluetoothScanViewModel(() => {}); 
    return viewModel.initialState as ScanViewState;
  });
  
  // Ensure stable ViewModel instance
  const viewModel = useMemo(() => new BluetoothScanViewModel(setViewState), []);

  useEffect(() => {
    viewModel.startScanning();
    return () => viewModel.cleanup();
  }, [viewModel]); // Start scanning on mount, cleanup on unmount

  // Handle errors via alert (View responsibility)
  useEffect(() => {
    if (viewState.error) {
      Alert.alert('BLE Error', viewState.error);
    }
  }, [viewState.error]);


  return (
    <View style={styles.container}>
      <Text style={styles.header}>IMU Monitor</Text>
      
      <View style={styles.statusBox}>
        {viewState.isLoading && <ActivityIndicator size="small" color="#007AFF" />}
        <Text style={[styles.statusText, {color: viewState.isConnected ? 'green' : '#007AFF'}]}>
          {viewState.status}
        </Text>
      </View>
      
      <View style={styles.dataContainer}>
        <Text style={styles.dataHeader}>Accelerometer Readings (X, Y, Z)</Text>
        <Text style={styles.dataValue}>{viewState.accelString}</Text>
        <View style={styles.separator} />
        
        <Text style={styles.dataHeader}>Gyroscope Readings (X, Y, Z)</Text>
        <Text style={styles.dataValue}>{viewState.gyroString}</Text>
      </View>
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