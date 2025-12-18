// components/PlainLineGraph.tsx
import React, { useRef } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

interface PlainLineGraphProps {
  data: { x: number; y: number; z: number }[];
  title: string;
  height?: number;
  isRecording: boolean; 
}

export default function PlainLineGraph({
  data,
  title,
  height = 180,
  isRecording,
}: PlainLineGraphProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  console.log("Graph Render - isRecording:", isRecording, "Points:", data.length);
  if (!data.length) return null;

  // 1. Inställningar för layout
  const pointsPerScreen = 50; 
  const pointDistance = (screenWidth - 40) / pointsPerScreen; 

  const minVal = -20; 
  const maxVal = 180; 
  const range = maxVal - minVal || 1;

  // 2. Dynamisk bredd som växer med datan
  const contentWidth = data.length * pointDistance;
  // Vi ser till att bredden aldrig är mindre än skärmen
  const totalWidth = Math.max(screenWidth - 40, contentWidth);

  // 3. Skapa Path (optimera genom att bara rita de punkter som faktiskt finns)
  const createPath = (axis: "x" | "y" | "z") => {
    if (data.length === 0) return "";
    
    // Om du har väldigt mycket data (>1000 punkter), kan man slice:a här 
    // för prestanda, men för vanliga sessioner funkar detta:
    return data
      .map((point, index) => {
        const xPos = index * pointDistance;
        const yPos = height - ((point[axis] - minVal) / range) * height;
        return `${index === 0 ? "M" : "L"} ${xPos} ${yPos}`;
      })
      .join(" ");
  };

  return (
    <View style={styles.outerContainer}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={[styles.graphWrapper, { height }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          
          onContentSizeChange={() => {
            if (isRecording) {
              // Prova false här för att se om "eftersläpet" försvinner
              scrollViewRef.current?.scrollToEnd({ animated: false });
            }
          }}
          contentContainerStyle={{ width: totalWidth }}
        >
          <Svg height={height} width={totalWidth}>
            {/* Rutnät (Grid) */}
            {[0, 45, 90, 135, 180].map((val) => {
              const y = height - ((val - minVal) / range) * height;
              return (
                <React.Fragment key={val}>
                  <Line x1="0" y1={y} x2={totalWidth} y2={y} stroke="#ddd" strokeDasharray="5,5" />
                </React.Fragment>
              );
            })}

            <Path d={createPath("x")} fill="none" stroke="red" strokeWidth="2" />
            <Path d={createPath("y")} fill="none" stroke="green" strokeWidth="2" />
            <Path d={createPath("z")} fill="none" stroke="blue" strokeWidth="2" />
          </Svg>
        </ScrollView>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>
          {isRecording ? "Recording..." : "Swipe to see history →"}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ color: 'red' }}> X </Text>
          <Text style={{ color: 'green' }}> Y </Text>
          <Text style={{ color: 'blue' }}> Z </Text>
        </View>
      </View>
    </View>
  );
}

// HÄR ÄR DEFINITIONEN SOM SAKNADES:
const styles = StyleSheet.create({
  outerContainer: { 
    marginVertical: 12, 
    paddingHorizontal: 10 
  },
  title: { 
    fontWeight: "bold", 
    marginBottom: 8, 
    fontSize: 14, 
    color: "#333" 
  },
  graphWrapper: {
    backgroundColor: "#fdfdfd",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    overflow: "hidden",
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  legendText: { 
    fontSize: 10, 
    color: '#999', 
    fontStyle: 'italic' 
  }
});