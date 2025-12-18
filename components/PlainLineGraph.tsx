// components/PlainLineGraph.tsx
import React, { useRef } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path, Text as SvgText } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

interface PlainLineGraphProps {
  data: { x: number; y: number; z: number }[];
  title: string;
  height?: number;
  isRecording: boolean;
  yLabel?: string;
  xLabel?: string;
}

export default function PlainLineGraph({
  data,
  title,
  height = 180,
  isRecording,
  yLabel,
  xLabel,
}: PlainLineGraphProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  if (!data.length) return null;

  // 1. Layout
  const pointsPerScreen = 50;
  const pointDistance = (screenWidth - 40) / pointsPerScreen;

  // For angles: fixed range 0–180° 
  const minVal = -20;
  const maxVal = 180;
  const range = maxVal - minVal || 1;

  const contentWidth = data.length * pointDistance;
  const totalWidth = Math.max(screenWidth - 40, contentWidth);

  const createPath = (axis: "x" | "y" | "z", xOffset: number) => {
    if (data.length === 0) return "";
    return data
      .map((point, index) => {
        const xPos = xOffset + index * pointDistance;
        const yPos = height - ((point[axis] - minVal) / range) * height;
        return `${index === 0 ? "M" : "L"} ${xPos} ${yPos}`;
      })
      .join(" ");
  };


return (
  <View style={styles.outerContainer}>
    <Text style={styles.title}>{title}</Text>

    <View style={styles.graphRow}>
      {/* Optional Y-axis label, upright */}
      {yLabel && (
      <View style={styles.yLabelContainer}>
        <Text style={styles.yLabelText}>{yLabel}</Text>
      </View>
    )}

      <View style={[styles.graphWrapper, { height }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          onContentSizeChange={() => {
            if (isRecording) {
              scrollViewRef.current?.scrollToEnd({ animated: false });
            }
          }}
          contentContainerStyle={{ width: totalWidth }}
        >
          <Svg height={height} width={totalWidth}>
            {/* Grid + numeric labels */}
            {[0, 45, 90, 135, 180].map((val) => {
              const y = height - ((val - minVal) / range) * height;
              return (
                <React.Fragment key={val}>
                  <Line
                    x1={28}                // leave space for labels
                    y1={y}
                    x2={totalWidth}
                    y2={y}
                    stroke="#ddd"
                    strokeDasharray="5,5"
                  />
                  <SvgText
                    x={4}                 // label position
                    y={y + 3}
                    fontSize={10}
                    fill="#666"
                  >
                    {val}
                  </SvgText>
                </React.Fragment>
              );
            })}

            {/* Data paths shifted right by same offset (28) */}
            <Path
              d={createPath("x", 28)}
              fill="none"
              stroke="red"
              strokeWidth={2}
            />
            <Path
              d={createPath("y", 28)}
              fill="none"
              stroke="green"
              strokeWidth={2}
            />
            <Path
              d={createPath("z", 28)}
              fill="none"
              stroke="blue"
              strokeWidth={2}
            />
          </Svg>
        </ScrollView>
      </View>
    </View>

    {/* X-axis label + legend */}
    <View style={styles.bottomRow}>
      {xLabel && <Text style={styles.xLabelText}>{xLabel}</Text>}
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          {isRecording ? "Recording..." : "Swipe to see history →"}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ color: "red" }}> X </Text>
          <Text style={{ color: "green" }}> Y </Text>
          <Text style={{ color: "blue" }}> Z </Text>
        </View>
      </View>
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: 12,
    paddingHorizontal: 10,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  graphRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  yLabelContainer: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  yLabelText: {
    fontSize: 10,
    color: "#666",
    textAlign: "center"  
  },
  graphWrapper: {
    flex: 1,
    backgroundColor: "#fdfdfd",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    overflow: "hidden",
  },
  bottomRow: {
    marginTop: 4,
  },
  xLabelText: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    marginBottom: 2,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  legendText: {
    fontSize: 10,
    color: "#999",
    fontStyle: "italic",
  },
});
