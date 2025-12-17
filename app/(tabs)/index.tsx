// app/(tabs)/index.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const handleGetStarted = () => {
    // navigate to Bluetooth tab screen
    router.push("/(tabs)/BluetoothScanScreen");
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name="accessibility-new" size={96} color="#333" />
      <Text style={styles.title}>Shoulder Load Monitor</Text>
      <Button title="Get started" onPress={handleGetStarted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginVertical: 16,
  },
});


// npx expo run:ios --device 