/// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { BluetoothProvider } from '../../hooksVM/BluetoothVMContext';
import { InternalSensorProvider } from '../../hooksVM/InternalSensorVMContext';
import { SessionProvider } from '../../hooksVM/SessionContext';

export default function TabsLayout() {
  return (
    <SessionProvider>
      <BluetoothProvider>
        <InternalSensorProvider>
          <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="index" />
            <Tabs.Screen name="InternalSensorScreen" />
            <Tabs.Screen name="BluetoothScanScreen" />
            <Tabs.Screen name="ReportScreen" />
          </Tabs>
        </InternalSensorProvider>
      </BluetoothProvider>
    </SessionProvider>
  );
}