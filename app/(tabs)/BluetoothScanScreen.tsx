// app/(tabs)/BluetoothScanScreen.tsx
import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from "react-native";
import { useBluetoothVM } from "../../hooksVM/BluetoothVMContext";

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
          onPress={() => router.push("/(tabs)/RecordingScreen")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    color: "#007AFF",
  },
});
