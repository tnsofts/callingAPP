import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TextInput} from 'react-native';
import DeviceInfo from 'react-native-device-info';

const DeviceInfoCard = () => {
  const [deviceData, setDeviceData] = useState({
    deviceName: '',
    mac: '',
    manufacturer: '',
    deviceId: '',
    systemName: '',
    systemVersion: '',
    buildNumber: '',
    brand: '',
    model: '',
  });
  console.log(deviceData);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const [
          deviceName,
          manufacturer,
          deviceId,
          systemName,
          systemVersion,
          buildNumber,
          brand,
          model,
          // mac // optional
        ] = await Promise.all([
          DeviceInfo.getDeviceName(),
          DeviceInfo.getManufacturer(),
          DeviceInfo.getDeviceId(),
          DeviceInfo.getSystemName(),
          DeviceInfo.getSystemVersion(),
          DeviceInfo.getBuildNumber(),
          DeviceInfo.getBrand(),
          DeviceInfo.getModel(),
          // DeviceInfo.getMacAddress()
        ]);

        setDeviceData({
          deviceName,
          manufacturer,
          deviceId,
          systemName,
          systemVersion,
          buildNumber,
          brand,
          model,
          mac: '', // or hardcoded for testing
        });
      } catch (error) {
        console.error('Error fetching device info:', error);
      }
    };

    fetchDeviceInfo();
  }, []);

  return (
    <ScrollView className="bg-white px-16">
      <View className="bg-white w-full">
        <Text className="text-2xl font-bold">Device Name</Text>
        <TextInput editable={false} value={deviceData.deviceName} />
      </View>

      {/* Technical Details */}
      <View className="bg-white w-full">
        <Text className="text-2xl font-bold">Technical Details</Text>
        <Detail label="MAC Address" value={deviceData.mac} />
        <Detail label="Manufacturer" value={deviceData.manufacturer} />
        <Detail label="Device ID" value={deviceData.deviceId} />
      </View>

      {/* System Information */}
      <View className="bg-white w-full">
        <Text className="text-2xl font-bold">System Information</Text>
        <Detail label="Base OS" value={deviceData.systemName} />
        <Detail label="System Name" value={deviceData.systemName} />
        <Detail label="System Version" value={deviceData.systemVersion} />
        <Detail label="Build Number" value={deviceData.buildNumber} />
      </View>

      {/* Basic Information */}
      <View className="bg-red-300 w-full">
        <Text className="text-2xl font-bold">Basic Information</Text>
        <Detail label="Application Name" value="Device Manager" />
        <Detail label="Device Brand" value={deviceData.brand} />
        <Detail label="Device Model" value={deviceData.model} />
      </View>
    </ScrollView>
  );
};

const Detail = ({label, value}) => (
  <View className="flex-row justify-between flex">
    <Text className="text-lg font-bold">{label}</Text>
    <Text className="text-lg">{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 10,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#444',
    fontWeight: '600',
  },
  value: {
    color: '#333',
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default DeviceInfoCard;
