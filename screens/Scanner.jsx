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
import store from '../store';
import CustomWarningMSg from '../component/CustomWarningMSg';
import {useWebSocket} from './WebScoket';
import LoaderKit from 'react-native-loader-kit';

export default function Scanner() {
  const navigation = useNavigation();
  const BASE_URL = 'http://192.168.1.90:3002';
  const [deviceIdScanner, setDeviceIdScanner] = useState('');
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const {deviceIdBackend, idCardNo, setIsLogedIn, isLogedIn, setStudentData} =
    store();
  // const {deviceIdBackend, idCardNo} = store();

  const {booting2, setBooting2, getIsLogedIn} = store();

  useEffect(() => {
    const getIsLogedInData = async () => {
      await getIsLogedIn();
      console.log('isLogedIn', isLogedIn, 'booting2', booting2);
      setBooting2(true);
      if (isLogedIn) {
        navigation.navigate('Main');
      }
    };
    getIsLogedInData();
  }, [booting2, getIsLogedIn]);

  useEffect(() => {
    async function getDeviceToken() {
      const deviceId = DeviceInfo.getDeviceId();
      console.log('Device ID:', deviceId);
      setDeviceIdScanner(deviceId);
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
    const handleScan = async (deviceId_, idCardNo) => {
      try {
        console.log('data compare', deviceId_, deviceIdScanner);
        if (deviceId_ === deviceIdScanner) {
          const req = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              device_id: deviceId_,
              id_card_no: idCardNo,
            }),
          });
          const data = await req.json();
          console.log('data', data);
          if (data.return_status === 1) {
            emit('deviceIssueSuccess', {deviceId_, idCardNo});
            await setStudentData(data.data);
            await setIsLogedIn(true);
            navigation.navigate('Main');
          } else {
            emit('deviceIssueFailed', {
              deviceId_,
              idCardNo,
              errors: data.return_message,
            });
            setError(true);
            setErrorMsg(data.return_message);
          }
        } else {
          setError(true);
          emit('deviceIssueFailed', {
            deviceId_,
            idCardNo,
            errors: 'Device ID does not match',
          });
          setErrorMsg('Device ID does not match');
        }
      } catch (error) {
        console.log('error login data', error.messages);
        emit('deviceIssueSuccess', {
          deviceId_,
          idCardNo,
          error: error.messages,
        });
      }
    };
    if (connectionError) {
      // You could show an alert or update UI to inform user
      setError(true);
      setErrorMsg(`WebSocket connection failed: ${connectionError}`);
    }

    if (socket) {
      // Set up the event listener as soon as socket is available
      const handleRegisterDevice = data => {
        console.log('Received registerDevice event:', data);
        handleScan(data.device_id, data.id_card_no);
        // Clear any connection errors since we're receiving data
        if (error && errorMsg.includes('WebSocket')) {
          setError(false);
          setErrorMsg('');
        }
      };

      // Add the event listener
      socket.on('requestIssuingDevice', handleRegisterDevice);
      console.log('Added registerDevice listener');

      // If already connected, the event might have been missed
      // You could request it again or handle this case
      if (isConnected) {
        console.log(
          'Socket already connected, registerDevice event might have been missed',
        );
        // Optionally emit something to let server know we're ready
      }

      // Cleanup
      return () => {
        socket.off('requestIssuingDevice', handleRegisterDevice);
        console.log('Removed registerDevice listener');
      };
    }
  }, [
    socket,
    isConnected,
    socketId,
    deviceIdBackend,
    idCardNo,
    navigation,
    connectionError,
    error,
    errorMsg,
    BASE_URL,
    deviceIdScanner,
    emit,
    setIsLogedIn,
  ]);

  const GradientBackground = styled(LinearGradient);

  const handleNavigate = async () => {
    await setIsLogedIn(true);
    navigation.navigate('Main');
  };

  if (!booting2) {
    console.log('booting', booting2, 'isLogedIn', isLogedIn);
    return (
      <>
        <View className="items-center justify-center flex-1">
          <LoaderKit
            style={{width: 50, height: 50}}
            name={'LineScalePulseOut'} // Optional: see list of animations below
            color={'red'} // Optional: color can be: 'red', 'green',... or '#ddd', '#ffffff',...
          />
        </View>
      </>
    );
  } else {
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
          isError={error}
        />
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
              <TouchableOpacity onPress={handleNavigate}>
                <View className="bg-white rounded-2xl px-7 py-5 space-y-3 -mt-6 items-center justify-center">
                  {deviceIdScanner && (
                    <QRCode value={String(deviceIdScanner)} size={140} />
                  )}
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
      </>
    );
  }
}
