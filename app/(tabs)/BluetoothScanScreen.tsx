// app/(tabs)/BluetoothScanScreen.tsx
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useBluetoothVM } from "../../hooksVM/BluetoothVMContext";
import { SensorType } from "../../Models/SensorData";

export default function BluetoothScanScreen() {
  const { viewState, viewModel } = useBluetoothVM();

  useEffect(() => {
    viewModel.startScanning();
    return () => viewModel.cleanup();
  }, [viewModel]);

  useEffect(() => {
    if (viewState.error) {
      Alert.alert("BLE Error", viewState.error);
    }
  }, [viewState.error]);

  const handleGoToRecording = () => {
    router.push({
      pathname: "/(tabs)/RecordingScreen",
      params: { sensorType: SensorType.BLUETOOTH },
    });
  };

  const isReady = viewState.isConnected;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth IMU</Text>

      <View style={styles.statusCard}>
        {viewState.isLoading && (
          <ActivityIndicator size="small" color="#007AFF" />
        )}
        <Text style={styles.statusText}>{viewState.status}</Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isReady ? "#007AFF" : "#A0AEC0" },
        ]}
        disabled={!isReady}
        onPress={handleGoToRecording}
      >
        <Text style={styles.buttonText}>
          {isReady ? "Go to recording" : "Waiting for device..."}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    alignItems: "center",
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  button: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
