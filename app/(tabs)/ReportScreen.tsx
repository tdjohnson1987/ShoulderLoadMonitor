// ReportScreen.tsx
import { RouteProp, useRoute } from "@react-navigation/native";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SensorReading, calculateSampleRate } from "../../Models/SensorData";

type ReportRoute = RouteProp<
  {
    Report: {
      accelHistory: { x: number; y: number; z: number }[];
      gyroHistory: { x: number; y: number; z: number }[];
      readings?: SensorReading[];
    };
  },
  "Report"
>;

export default function ReportScreen() {
  const route = useRoute<ReportRoute>();
  const { readings = [] } = route.params;

  const sampleRate = useMemo(
    () => calculateSampleRate(readings),
    [readings]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Session Report</Text>
      <Text>Total samples: {readings.length}</Text>
      <Text>Estimated sample rate: {sampleRate.toFixed(1)} Hz</Text>
      {/* Add more stats/graphs as needed */}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
});
