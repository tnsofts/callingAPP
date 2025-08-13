import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import store from '../store';
import {useNavigation, useRoute} from '@react-navigation/native';
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
  const Base_url = 'http://192.168.1.52:3002';
  const [gender, setGender] = useState(profileData?.gender || '');
  const [profileData, setProfileData] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerNo, setCustomerNo] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigation = useNavigation();

  // useEffect(() => {
  // const fetchProfile = async () => {
  //   console.log('in', jwtToken);
  //   try {
  //     console.log('Fetching profile with jwtToken:', jwtToken);
  //     const response = await fetch(
  //       `${Base_url}/api/getprofile?username=25001`,
  //       {
  //         method: 'GET',
  //         headers: {
  //           // Authorization: `Bearer ${jwtToken}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       // //('Error Response:', errorText);
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     console.log('this is data', data);
  //     if (data.return_status === 1) {
  //       setProfileData(data.return_data);
  //       setProfileImage(
  //         `http://192.168.1.52:3002/image/student/${data.return_data.photo_url}`,
  //       );
  //       //('Fetched Gender:', data.return_data.gender);
  //       setGender(data.return_data.gender);
  //     } else {
  //       // //(data.return_message);
  //       // ('Error', data.return_message);
  //     }
  //   } catch (error) {
  //     // //('Error fetching profile:', error);
  //     // (
  //     //   'Error',
  //     //   'An unexpected error occurred while fetching profile data.',
  //     // );
  //     if (error.return_status == 401) {
  //       setIsLogedIn(false);
  //       navigation.navigate('UserNameScr');
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // fetchProfile();
  // }, []);

  useEffect(() => {
    async function getDeviceToken() {
      const deviceId = await DeviceInfo.getUniqueId();
      console.log('Device ID:', deviceId);
      setDeviceId(deviceId);
    }
    getDeviceToken();
    const fetchProfile = async () => {
      console.log('Fetching profile with jwtToken:', jwtToken);
      try {
        const response = await fetch(
          `${Base_url}/api/getprofile?id=${251002}`, // Pass the user ID as a query parameter
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // Authorization: `Bearer ${jwtToken}`, // Uncomment if using JWT
            },
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Profile data:', data);

        if (data.return_status === 1) {
          setProfileData(data.return_data);
          setProfileImage(
            `http://192.168.1.52:3002/image/student/${data.return_data.photo_url}`,
          );
          setGender(data.return_data.gender);
        } else {
          console.error('Error:', data.return_message);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.return_status === 401) {
          setIsLogedIn(false);
          navigation.navigate('UserNameScr');
        }
      } finally {
        setLoading(false);
      }
    };

    // fetchProfile();
  }, [jwtToken, navigation, setIsLogedIn]); // Add dependencies to avoid unnecessary re-renders

  const makePhoneCall = phoneNumber => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Unable to open the phone dialer.');
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  const handelProfileModalVisibility = () => {
    setIsVisible(true);
  };

  const showToasts = msg => {
    Toast.success(msg);
  };

  const CallApi = async (number, name) => {
    console.log(number);
    try {
      setLoading(true);
      const req = await fetch(
        `${Base_url}/thirdpartyapi/telecall_api?apiKey=e5d668fe-7e40-4a72-83ce-69c332b33506&customerNumber=${number}`,
      );
      const res = await req.json();
      console.log('this is res for tata teli api', res);
      if (res.return_message == 'Originate failed') {
        showToasts('Call disconnected by the agent');
      }
      if (res.return_message == 'Call Connected') {
        navigation.navigate('CallScreen', {name: name});
      }
      if (res.return_message == 'Agent is Offline') {
        showToasts('Agent not logged in');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const HangUpCall = async callId => {
    try {
      const req = await fetch(`${Base_url}/v1/call/hangup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer YOUR_API_TOKEN', // from Tata Tele
        },
        body: JSON.stringify({call_id: callId}),
      });

      const res = await req.json();
      console.log('Tata Tele API - Hangup Call Response:', res);

      if (res.success) {
        showToasts('Call ended successfully');
      } else {
        showToasts('Failed to end call');
      }

      return res;
    } catch (error) {
      console.log('Error ending call:', error);
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
    setCustomerNo(number);
    await CallApi(number, name);
    makePhoneCall('+1234567890');
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
              onPress={() => navigation.navigate('CallScreen')}
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
              onPress={() => navigation.navigate('CallScreen')}
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
