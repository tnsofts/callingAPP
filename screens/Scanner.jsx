import React, {useEffect, useState} from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {styled} from 'nativewind';
import DeviceInfo from 'react-native-device-info';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';

export default function Scanner() {
  const navigation = useNavigation();
  const [deviceId, setDeviceId] = useState('');
  useEffect(() => {
    async function getDeviceToken() {
      const deviceId = await DeviceInfo.getUniqueId();
      console.log('Device ID:', deviceId);
      setDeviceId(deviceId);
    }
    getDeviceToken();
  }, []);

  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp();
      return true; // Prevent default behavior
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  const handleScan = async () => {
    const req = await fetch('https://api.littlesecurity.com/v1/devices/scan', {
      method: 'POST',
      headers: {},
    });
  };

  const GradientBackground = styled(LinearGradient);

  return (
    <GradientBackground
      colors={['#2C6BED', '#2D3192']}
      className="flex-row justify-between px-8 py-20 flex-1 h-full items-center"
      start={{x: 0, y: 0}}
      end={{x: 0.5, y: 0.5}}>
      <View className="flex-1 items-center justify-between h-full flex flex-col">
        <Image
          source={require('./assets/LT_Logo_White.png')}
          resizeMode="contain"
          className="w-11/12 h-20"
        />

        <ImageBackground
          source={require('./assets/qrOutlineWhite.png')}
          resizeMode="contain"
          className="w-64 h-72 flex items-center justify-center">
          <TouchableOpacity onPress={() => navigation.navigate('Main')}>
            <View className="bg-white rounded-2xl px-7 py-5 space-y-3 -mt-6 items-center justify-center">
              {deviceId && <QRCode value={String(deviceId)} size={140} />}
              <Text className="text-black text-sm">Scan QR code</Text>
            </View>
          </TouchableOpacity>
        </ImageBackground>

        <View className="flex-col items-center justify-center gap-2">
          <View className="flex items-center justify-center bg-white p-3 rounded-2xl">
            <Icon name="phone" size={28} color="#2D3192" />
          </View>
          <Text className="text-white text-2xl font-bold -mb-2">
            Caller App
          </Text>
          <Text className="text-white text-sm">Connect securly</Text>
        </View>
      </View>
    </GradientBackground>
  );
}
