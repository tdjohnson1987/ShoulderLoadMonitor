import React, { useEffect } from 'react';
import { Alert, Text, View } from 'react-native';
import { BluetoothSensorService } from '../../components/services/BluetoothSensorService';

export default function BluetoothScanScreen() {
  useEffect(() => {
    // Replace this with your actual service
    const service = new BluetoothSensorService();

    // Start scan/connect as soon as component loads
    service.scanAndConnect((accel, gyro) => {
      console.log('Bluetooth Data:', { accel, gyro });
      // show a success message here... 
      console.log('Device connected successfully');
    })
    .then(() => {
      Alert.alert('BLE', 'Device connected!');
    })
    .catch(err => {
      Alert.alert('BLE', 'Failed to connect: ' + err.message);
    });

    // Stop BLE scan on unmount
    return () => service.cleanup();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Scanning for Bluetooth Device…</Text>
    </View>
  );
}
