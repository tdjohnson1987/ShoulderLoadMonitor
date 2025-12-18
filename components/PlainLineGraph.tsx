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
  const labelWidth = 35; // Utrymme för siffrorna (t.ex. "-180")
  const pointDistance = (screenWidth - 40 - labelWidth) / pointsPerScreen;

  const minVal = -180; 
  const maxVal = 180; 
  const range = maxVal - minVal || 1;

  const contentWidth = data.length * pointDistance;
  // Vi lägger till labelWidth i totalWidth så att SVG:n rymmer både siffror och linjer
  const totalWidth = Math.max(screenWidth - 40, contentWidth + labelWidth);

  const createPath = (axis: "x" | "y" | "z", xOffset: number) => {
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
        {yLabel && (
          <View style={styles.yLabelContainer}>
            {/* Split text för att kunna visa den vertikalt om man vill, 
                eller bara som en kort label */}
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
              {/* Grid + numeriska labels från -180 till 180 */}
              {[-180, -90, 0, 90, 180].map((val) => {
                const y = height - ((val - minVal) / range) * height;
                // Justera y-position för texten så den inte hamnar utanför i topp/botten
                const textYOffset = val === 180 ? 12 : val === -180 ? -4 : 4;

                return (
                  <React.Fragment key={val}>
                    <Line
                      x1={labelWidth}
                      y1={y}
                      x2={totalWidth}
                      y2={y}
                      stroke={val === 0 ? "#bbb" : "#eee"} // Mörkare linje vid 0 grader
                      strokeDasharray={val === 0 ? "0" : "5,5"}
                    />
                    <SvgText
                      x={labelWidth - 5}
                      y={y + textYOffset}
                      fontSize={10}
                      fill="#999"
                      textAnchor="end" // Högerjustera siffrorna mot grafen
                    >
                      {val}°
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {/* Data paths shifted right by labelWidth */}
              <Path
                d={createPath("x", labelWidth)}
                fill="none"
                stroke="red"
                strokeWidth={1.5}
                opacity={0.8}
              />
              <Path
                d={createPath("y", labelWidth)}
                fill="none"
                stroke="green"
                strokeWidth={1.5}
                opacity={0.8}
              />
              <Path
                d={createPath("z", labelWidth)}
                fill="none"
                stroke="blue"
                strokeWidth={1.5}
                opacity={0.8}
              />
            </Svg>
          </ScrollView>
        </View>
      </View>

      <View style={styles.bottomRow}>
        {xLabel && <Text style={styles.xLabelText}>{xLabel}</Text>}
        <View style={styles.legend}>
          <Text style={styles.legendText}>
            {isRecording ? "🔴 Live Recording" : "Scroll to see history"}
          </Text>
          <View style={styles.axisLegend}>
            <View style={[styles.dot, { backgroundColor: "red" }]} /><Text style={styles.dotText}>X</Text>
            <View style={[styles.dot, { backgroundColor: "green" }]} /><Text style={styles.dotText}>Y</Text>
            <View style={[styles.dot, { backgroundColor: "blue" }]} /><Text style={styles.dotText}>Z</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    // Lite skugga för att lyfta fram grafen
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 13,
    color: "#444",
    textAlign: "center",
  },
  graphRow: {
    flexDirection: "row",
  },
  yLabelContainer: {
    width: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  yLabelText: {
    fontSize: 9,
    color: "#aaa",
    fontWeight: 'bold',
    // Rotate text vertical (valfritt)
    transform: [{ rotate: '-90deg' }],
    width: 100,
    textAlign: 'center'
  },
  graphWrapper: {
    flex: 1,
    backgroundColor: "#fafafa",
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  bottomRow: {
    marginTop: 8,
  },
  xLabelText: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  legendText: {
    fontSize: 10,
    color: "#999",
  },
  axisLegend: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 10,
    marginRight: 4,
  },
  dotText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666'
  }
});