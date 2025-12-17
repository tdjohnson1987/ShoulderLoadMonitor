// app/(tabs)/_layout.tsx
import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index" // Home
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="accessibility-new" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="RecordingScreen"
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="show-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ReportScreen"
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="file-alt" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="BluetoothScanScreen"
        options={{
          tabBarLabel: "",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="bluetooth-b" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
