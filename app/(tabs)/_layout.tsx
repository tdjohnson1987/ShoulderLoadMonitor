// // app/(tabs)/_layout.tsx
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { BluetoothProvider } from "../../hooksVM/BluetoothVMContext";
import { InternalSensorProvider } from "../../hooksVM/InternalSensorVMContext";
import { SessionProvider } from "../../hooksVM/SessionContext";

export default function TabsLayout() {
  return (
    <SessionProvider>
      <BluetoothProvider>
        <InternalSensorProvider>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: false,
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialIcons
                    name="accessibility-new"
                    color={color}
                    size={size}
                  />
                ),
              }}
            />
            <Tabs.Screen
              name="BluetoothScanScreen"
              options={{
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome5 name="bluetooth-b" color={color} size={size} />
                ),
              }}
            />

            <Tabs.Screen
              name="RecordingScreen"
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="bar-chart" color={color} size={size} />
                ),
              }}
            />

            

            <Tabs.Screen
              name="ReportScreen"
              options={{
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome5 name="file-alt" color={color} size={size} />
                ),
              }}
            />
          </Tabs>
        </InternalSensorProvider>
      </BluetoothProvider>
    </SessionProvider>
  );
}
