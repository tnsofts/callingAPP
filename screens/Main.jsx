import React, {useEffect, useState} from 'react';
import {
  Alert,
  BackHandler,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import store from '../store';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import ToastManager, {Toast} from 'toastify-react-native';
import {Linking} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {styled} from 'nativewind';
import DeviceInfo from 'react-native-device-info';
import QRCode from 'react-native-qrcode-svg';

export default function Main() {
  const {jwtToken, idNumber, setIsLogedIn} = store();
  const Base_url = 'http://192.168.1.53:3004';
  const [gender, setGender] = useState(profileData?.gender || '');
  const [profileData, setProfileData] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerNo, setCustomerNo] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigation = useNavigation();

  // Back handler that exits app only when on Main screen
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true; // Prevent default behavior
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, []),
  );

  useEffect(() => {
    async function getDeviceToken() {
      const deviceId = await DeviceInfo.getUniqueId();
      console.log('Device ID:', deviceId);
      setDeviceId(deviceId);
    }
    getDeviceToken();

    // fetchProfile();
  }, [jwtToken, navigation, setIsLogedIn]); // Add dependencies to avoid unnecessary re-renders

  const showToasts = msg => {
    Toast.success(msg);
  };

  const CallApi = async (number, name) => {
    console.log(number);
    try {
      setLoading(true);
      const req = await fetch(
        'https://api-smartflo.tatateleservices.com/v1/click_to_call_support',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MDUwMTYiLCJjciI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9jbG91ZHBob25lLnRhdGF0ZWxlc2VydmljZXMuY29tL3Rva2VuL2dlbmVyYXRlIiwiaWF0IjoxNzU1MTc0NTk4LCJleHAiOjIwNTUxNzQ1OTgsIm5iZiI6MTc1NTE3NDU5OCwianRpIjoiTE1yWk9tU2VQVHZ0ZVZ3VSJ9._RjSGxFUN--X3ROIubz7OCdWlnPGvvoc9-EC-WRBVrk', // from Tata Tele
          },
          body: JSON.stringify({
            agent_number: '918010911884',
            customer_number: Number(number),
            api_key: 'e5d668fe-7e40-4a72-83ce-69c332b33506',
            get_call_id: 1,
          }),
        },
      );
      const res = await req.json();
      console.log('this is res for tata teli api', res);
      if (res.success == true) {
        navigation.navigate('CallScreen', {callId: res.call_id});
      } else {
        showToasts('Call disconnected by the agent');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const CallLog = async (fromDate, toDate) => {
    try {
      const queryParams = new URLSearchParams({
        from_date: fromDate,
        to_date: toDate,
      }).toString();

      const req = await fetch(`${Base_url}/v1/call/records?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer YOUR_API_TOKEN',
        },
      });

      const res = await req.json();
      console.log('Tata Tele API - Call Logs:', res);

      return res;
    } catch (error) {
      console.log('Error fetching call logs:', error);
    }
  };

  const profileArray = profileData ? Object.entries(profileData) : [];

  const number = profileArray
    .filter(([key, value]) => key.includes('mobile_number'))
    .map(([key, value]) => ({key, value}));
  console.log(number);
  //   setProfileData(number);

  const handelCall = async (number, name) => {
    await CallApi(number, name);
    // makePhoneCall('+1234567890');
  };
  const GradientBackground = styled(LinearGradient);

  return (
    <SafeAreaView className="flex-1 bg-white flex flex-col">
      <ToastManager />
      <StatusBar
        barStyle={'dark-content'}
        hidden={false}
        backgroundColor={'#025043'}
      />
      <View className="mx-4 my-8 flex flex-col items-center h-full">
        <Text className="text-black text-2xl font-semibold mt-4">Contact</Text>
        <View className="mt-6 flex flex-col space-y-4 w-full">
          <GradientBackground
            colors={['#2C66E6', '#2D3192']}
            className="flex-row justify-between px-8 py-10 items-center rounded-3xl"
            start={{x: 0, y: 0.5}}
            end={{x: 1, y: 0.5}}>
            <View className="space-y-2">
              <Text className="text-white text-lg font-bold flex-wrap">
                Father/Gardian 1
              </Text>
              <View>
                <Text className="text-white text-sm">+91 80X XXXX X88</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handelCall('9960353112', 'Father/Gardian 1')}
              className="bg-[#fff] flex-row items-center justify-center space-x-2 rounded-full p-3">
              <Icon name="call" size={24} color="#2D3192" />
            </TouchableOpacity>
          </GradientBackground>

          <GradientBackground
            colors={['#2C66E6', '#2D3192']}
            className="flex-row justify-between px-8 py-10 items-center rounded-3xl"
            start={{x: 0, y: 0.5}}
            end={{x: 1, y: 0.5}}>
            <View className="space-y-2">
              <Text className="text-white text-lg font-bold flex-wrap">
                Mother/Gardian 1
              </Text>
              <View>
                <Text className="text-white text-sm">+91 80X XXXX X88</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handelCall('9960353112', 'Mother/Gardian 1')}
              className="bg-[#fff] flex-row items-center justify-center space-x-2 rounded-full p-3">
              <Icon name="call" size={24} color="#2D3192" />
            </TouchableOpacity>
          </GradientBackground>
        </View>

        <View className="mt-6 flex flex-1 flex-col items-center justify-center space-y-2 w-full">
          <ImageBackground
            source={require('./assets/qrOutline.png')}
            resizeMode="contain"
            className="w-60 h-60 flex items-center justify-center">
            {deviceId && <QRCode value={String(deviceId)} size={140} />}
          </ImageBackground>
          <GradientBackground
            colors={['#2C66E6', '#2D3192']}
            className="flex-row justify-between px-8 py-3 items-center rounded-3xl"
            start={{x: 0, y: 0.5}}
            end={{x: 1, y: 0.5}}>
            <TouchableOpacity
              className="flex-row items-center justify-center space-x-2 rounded-full"
              onPress={() => setIsVisible(true)}>
              <MaterialIcons name="qr-code" size={20} color="#fff" />
              <Text className="text-white text-base font-bold">Scan</Text>
            </TouchableOpacity>
          </GradientBackground>
        </View>
      </View>
    </SafeAreaView>
  );
}
