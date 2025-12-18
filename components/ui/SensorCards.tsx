// components/SensorCards.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const DataPoint = ({
  label,
  value,
  color,
}: {
  label: string;
  value?: number;
  color: string;
}) => (
  <View style={styles.dataPoint}>
    <Text style={[styles.dataLabel, { color }]}>{label}</Text>
    <Text style={styles.dataValue}>
      {value !== undefined ? value.toFixed(3) : "0.000"}
    </Text>
  </View>
);

export const AccelCard = ({
  latest,
}: {
  latest:
    | { accelerometerX?: number; accelerometerY?: number; accelerometerZ?: number }
    | null;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardLabel}>ACCELEROMETER (G)</Text>
    <View style={styles.row}>
      <DataPoint label="X" value={latest?.accelerometerX} color="#FF3B30" />
      <DataPoint label="Y" value={latest?.accelerometerY} color="#34C759" />
      <DataPoint label="Z" value={latest?.accelerometerZ} color="#007AFF" />
    </View>
  </View>
);

export const GyroCard = ({
  latest,
}: {
  latest:
    | { gyroscopeX?: number; gyroscopeY?: number; gyroscopeZ?: number }
    | null;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardLabel}>GYROSCOPE (deg/s)</Text>
    <View style={styles.row}>
      <DataPoint label="X" value={latest?.gyroscopeX} color="#FF9500" />
      <DataPoint label="Y" value={latest?.gyroscopeY} color="#5856D6" />
      <DataPoint label="Z" value={latest?.gyroscopeZ} color="#FF2D55" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 16,
    letterSpacing: 1,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  dataPoint: { alignItems: "center", flex: 1 },
  dataLabel: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  dataValue: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Courier",
    color: "#1C1C1E",
  },
});
