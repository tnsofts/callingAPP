import React, {useEffect, useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Platform,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {LinearGradient} from 'react-native-linear-gradient';
import {styled} from 'nativewind';
import {useNavigation} from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import CustomWarningMSg from '../component/CustomWarningMSg';
import {useWebSocket} from './WebScoket';
import store from '../store';

const Detail = ({icon, label, value, qr, deviceId}) => (
  <View className="flex-row item-start justify-between space-x-2 flex my-1 mx-4">
    <View className="flex-row items-start justify-start space-x-2">
      <Image source={icon} resizeMode="contain" className="w-5 h-5" />
      <View>
        <Text className="text-sm text-[#4D4D4D]">{label}</Text>
        <Text className="text-base text-[#333333]">{value || '-'}</Text>
      </View>
    </View>
    {qr && (
      <QRCode
        source={deviceId}
        resizeMode="contain"
        className="w-2 h-2"
        size={40}
      />
    )}
  </View>
);

export default function DeviceInformation() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const {isRegistered, setIsRegistered} = store();

  // Use the same URL logic as WebSocket
  const getBaseUrl = () => {
    if (Platform.OS === 'android') {
      // For Android emulator, use your machine's actual IP address
      return 'http://192.168.1.53:3002';
    } else if (Platform.OS === 'ios') {
      // For iOS simulator, use your machine's IP address as well
      return 'http://192.168.1.53:3002';
    } else {
      return 'http://192.168.1.53:3002';
    }
  };

  const BaseUrl = getBaseUrl();
  const [deviceData, setDeviceData] = useState({
    device_name: '',
    device_qr_code: '',
    manufacturer: '',
    device_os: '',
    system_name: '',
    system_version: '',
    build_no: '',
    app_name: '',
    device_brand: '',
    device_model: '',
  });
  console.log(deviceData);

  const GradientBackground = styled(LinearGradient);

  const {
    socket,
    isConnected,
    connectionError,
    emit,
    on,
    off,
    sendMessage,
    messages,
    joinRoom,
    leaveRoom,
    socketId,
  } = useWebSocket();

  useEffect(() => {
    // Test basic HTTP connectivity first
    const testHttpConnection = async () => {
      try {
        const response = await fetch(`${BaseUrl}/home`);
        const text = await response.text();
      } catch (error) {
        console.error('❌ HTTP connection test failed:', error.message);
        setError(true);
        setErrorMsg(`Network error: Cannot reach server at ${BaseUrl}`);
        return;
      }
    };

    // Run HTTP test first
    testHttpConnection();

    if (connectionError) {
      // You could show an alert or update UI to inform user
      setError(true);
      setErrorMsg(`WebSocket connection failed: ${connectionError}`);
    }

    if (socket) {
      // Set up the event listener as soon as socket is available
      const handleRegisterDevice = data => {
        console.log('Received registerDevice event:', data);
        // Clear any connection errors since we're receiving data
        if (error && errorMsg.includes('WebSocket')) {
          setError(false);
          setErrorMsg('');
        }
      };

      // Add the event listener
      // socket.on('device', handleRegisterDevice);
      // console.log('Added registerDevice listener');

      // If already connected, the event might have been missed
      // You could request it again or handle this case
      if (isConnected) {
        console.log(
          'Socket already connected, registerDevice event might have been missed',
        );
        // Optionally emit something to let server know we're ready
        socket.emit('clientReady', {deviceId: deviceData.deviceId});
      }

      // Cleanup
      return () => {
        socket.off('issueDevice', handleRegisterDevice);
        console.log('Removed registerDevice listener');
      };
    }
  }, [
    socket,
    isConnected,
    socketId,
    deviceData.deviceId,
    connectionError,
    error,
    errorMsg,
    BaseUrl,
  ]);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const [
          deviceName,
          manufacturer,
          deviceId,
          baseOs,
          systemName,
          systemVersion,
          buildNumber,
          appName,
          brand,
          model,
          // mac // optional
        ] = await Promise.all([
          DeviceInfo.getDeviceName(),
          DeviceInfo.getManufacturer(),
          DeviceInfo.getDeviceId(),
          DeviceInfo.getBaseOs(),
          DeviceInfo.getSystemName(),
          DeviceInfo.getSystemVersion(),
          DeviceInfo.getBuildNumber(),
          DeviceInfo.getApplicationName(),
          DeviceInfo.getBrand(),
          DeviceInfo.getModel(),
          // DeviceInfo.getMacAddress()
        ]);

        setDeviceData({
          device_name: deviceName,
          device_qr_code: deviceId,
          manufacturer: manufacturer,
          device_os: baseOs,
          system_name: systemName,
          system_version: systemVersion,
          build_no: buildNumber,
          app_name: appName,
          device_brand: brand,
          device_model: model,
        });
      } catch (error) {
        console.error('Error fetching device info:', error);
      }
    };

    fetchDeviceInfo();
  }, []);

  const handleRegister = async () => {
    const req = await fetch(`${BaseUrl}/api/addNewMobileDevice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({...deviceData}),
    });
    const data = await req.json();
    console.log(data);
    if (data.return_status === 1 || data.return_status === 2) {
      setIsRegistered(true);
      navigation.navigate('Scanner');
    } else {
      setError(true);
      setErrorMsg(data.return_message);
    }
  };

  return (
    <>
      <CustomWarningMSg
        visible={error}
        title={'Error'}
        msg={errorMsg}
        close={() => setError(false)}
        showBtn={true}
        buttonText={'OK'}
        buttonClass={'bg-blue-500'}
        buttonWrapperClass={'w-full'}
        isError={true}
      />
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        <SafeAreaProvider className="flex-1 pt-16">
          <View className="flex-1 items-center justify-center">
            <Text className="text-2xl">Device Information</Text>
            <View className="w-full mt-4 flex-1">
              <ScrollView className="px-6">
                <View
                  style={styles.boxShadow}
                  className="bg-white w-full my-4 px-6 py-6 rounded-2xl flex-row items-end space-x-2">
                  <Image
                    source={require('./assets/mobile.png')}
                    resizeMode="contain"
                    className="w-7 h-10"
                  />
                  <View className="flex-1">
                    <Text className="text-lg mb-2">Device Name</Text>
                    <TextInput
                      editable={false}
                      value={deviceData.device_name}
                      className="border border-[#DCDCDC] bg-[#EDEDED] rounded-md p-2"
                    />
                  </View>
                </View>

                {/* Technical Details */}
                <View
                  style={styles.boxShadow}
                  className="bg-white w-full my-4 px-6 py-6 rounded-2xl">
                  <Text className="text-lg mb-2">Technical Details</Text>
                  <Detail
                    label="Manufacturer"
                    value={deviceData.manufacturer}
                    icon={require('./assets/manufacture.png')}
                  />
                  <Detail
                    label="Device ID"
                    value={deviceData.device_qr_code}
                    icon={require('./assets/deviceId.png')}
                    qr={true}
                    deviceId={deviceData.device_qr_code}
                  />
                </View>

                {/* System Information */}
                <View
                  style={styles.boxShadow}
                  className="bg-white w-full my-4 px-6 py-6 rounded-2xl">
                  <Text className="text-lg mb-2">System Information</Text>
                  <Detail
                    label="Base OS"
                    value={deviceData.device_os}
                    icon={require('./assets/baseOS.png')}
                  />
                  <Detail
                    label="System Name"
                    value={deviceData.device_name}
                    icon={require('./assets/systemName.png')}
                  />
                  <Detail
                    label="System Version"
                    value={deviceData.system_version}
                    icon={require('./assets/systemVersion.png')}
                  />
                  <Detail
                    label="Build Number"
                    value={deviceData.build_no}
                    icon={require('./assets/buildNumber.png')}
                  />
                </View>

                {/* Basic Information */}
                <View
                  style={styles.boxShadow}
                  className="bg-white w-full mt-4 mb-24 px-6 py-6 rounded-2xl">
                  <Text className="text-lg mb-2">Basic Information</Text>
                  <Detail
                    label="Application Name"
                    value="Device Manager"
                    icon={require('./assets/applicationName.png')}
                  />
                  <Detail
                    label="Device Brand"
                    value={deviceData.device_brand}
                    icon={require('./assets/deviceBrand.png')}
                  />
                  <Detail
                    label="Device Model"
                    value={deviceData.device_model}
                    icon={require('./assets/deviceModal.png')}
                  />
                </View>
              </ScrollView>
            </View>
            <View className="w-full bg-white absolute bottom-0 pb-6 pt-2 items-center">
              <GradientBackground
                colors={['#2C66E6', '#2D3192']}
                className="flex-row justify-center px-8 py-2 w-10/12 items-center rounded-xl"
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0.5}}>
                <TouchableOpacity
                  onPress={handleRegister}
                  className="w-full items-center justify-center">
                  <Text className="text-white text-lg flex-wrap">
                    Register Now
                  </Text>
                </TouchableOpacity>
              </GradientBackground>
            </View>
          </View>
        </SafeAreaProvider>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  boxShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 4, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
  },
});
