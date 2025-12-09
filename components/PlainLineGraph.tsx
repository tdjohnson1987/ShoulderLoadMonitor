import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function PlainLineGraph({
  data,
  title,
  color = "#007AFF",
  height = 150,
}: {
  data: { x: number; y: number; z: number }[];
  title: string;
  color?: string;
  height?: number;
}) {
  if (!data.length) return null;

  const maxPoints = 100; // max number of points to display
  const displayData = data.slice(-maxPoints);

  // Find min and max to scale graph
  const allValues = displayData.flatMap((p) => [p.x, p.y, p.z]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const range = maxVal - minVal || 1;

  return (
    <View style={{ marginVertical: 8 }}>
      <Text style={{ fontWeight: "bold", marginBottom: 4 }}>{title}</Text>
      <View style={[styles.graphContainer, { height, width: screenWidth - 20 }]}>
        {["x", "y", "z"].map((axis, i) =>
          displayData.map((point, index) => {
            const value = point[axis as keyof typeof point] as number;
            const y = ((value - minVal) / range) * height;
            return (
              <View
                key={`${axis}-${index}`}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: (index / maxPoints) * (screenWidth - 20),
                  width: 2,
                  height: y,
                  backgroundColor: axis === "x" ? "red" : axis === "y" ? "green" : "blue",
                }}
              />
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  graphContainer: {
    backgroundColor: "#eee",
    borderRadius: 4,
    overflow: "hidden",
  },
});
