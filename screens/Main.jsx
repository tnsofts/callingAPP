import React, {useEffect, useState} from 'react';
import {
  Alert,
  BackHandler,
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
import {useWebSocket} from './WebScoket';

export default function Main() {
  const {jwtToken, idNumber, setIsLogedIn} = store();
  const Base_url = 'http://192.168.1.90:3002';
  const [gender, setGender] = useState(profileData?.gender || '');
  const [profileData, setProfileData] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerNo, setCustomerNo] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [callIDS, setCallIDS] = useState([]);
  const navigation = useNavigation();
  const {studentData} = store();

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
    console.log('Web Socket hello');
    if (socket) {
      // Store call logs temporarily
      const callLogsStorage = [];

      const CallLog = async data => {
        try {
          console.log('call_ids', callIDS);
          console.log('data21', data);
          // Clear previous call logs
          callLogsStorage.length = 0;

          // Handle both single call_id and array of call_ids
          const idsArray = Array.isArray(callIDS) ? callIDS : [callIDS];

          // Fetch all call logs in parallel
          const callLogPromises = idsArray.map(async call_id => {
            const queryParams = new URLSearchParams({
              call_id: call_id,
            }).toString();

            const req = await fetch(
              `https://api-smartflo.tatateleservices.com/v1/call/records?${queryParams}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization:
                    'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MDUwMTYiLCJjciI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9jbG91ZHBob25lLnRhdGF0ZWxlc2VydmljZXMuY29tL3Rva2VuL2dlbmVyYXRlIiwiaWF0IjoxNzU1MTc0NTk4LCJleHAiOjIwNTUxNzQ1OTgsIm5iZiI6MTc1NTE3NDU5OCwianRpIjoiTE1yWk9tU2VQVHZ0ZVZ3VSJ9._RjSGxFUN--X3ROIubz7OCdWlnPGvvoc9-EC-WRBVrk',
                },
              },
            );

            const res = await req.json();
            return res;
          });

          // Wait for all API calls to complete
          const allCallLogs = await Promise.all(callLogPromises);

          // Process and format the call logs
          const formattedCallDetails = [];

          allCallLogs.forEach(apiResponse => {
            console.log('Tata Tele API - Call Logs:', apiResponse);

            if (apiResponse.results && apiResponse.results.length > 0) {
              apiResponse.results.forEach(callRecord => {
                // Extract relevant information
                const clientNumber =
                  callRecord.client_number?.replace('+91', '') || '';
                const startTime = formatTime(callRecord.time);
                const duration = formatDuration(callRecord.call_duration);

                // Determine contact name based on phone number
                let contactName = 'Unknown';
                if (studentData?.father_mobile_no === clientNumber) {
                  contactName = 'Father';
                } else if (studentData?.mother_mobile_no === clientNumber) {
                  contactName = 'Mother';
                }

                // Add to formatted call details
                formattedCallDetails.push({
                  name: contactName,
                  mobile: clientNumber,
                  startTime: startTime,
                  duration: duration,
                });
              });
            }
          });

          // Create response object with formatted call details
          const responseData = {
            ...allCallLogs[0], // Use first response as base
            formattedCallDetails: formattedCallDetails,
          };

          if (
            allCallLogs.some(
              log => log.status === 200 || log.results?.length > 0,
            )
          ) {
            handleReturnDevice(data, responseData);
          } else {
            console.log('Error fetching call logs or no results found');
          }
        } catch (error) {
          console.log('Error fetching call logs:', error);
        }
      };

      // Helper function to format time
      const formatTime = timeString => {
        if (!timeString) return 'N/A';

        // Convert 24-hour format to 12-hour format with AM/PM
        const [hours, minutes] = timeString.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';

        return `${hour12}:${minutes} ${ampm}`;
      };

      // Helper function to format duration
      const formatDuration = durationInSeconds => {
        if (!durationInSeconds || durationInSeconds === 0) return '0s';

        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;

        if (minutes > 0) {
          return `${minutes}m ${seconds}s`;
        } else {
          return `${seconds}s`;
        }
      };
      const handleReturnDevice = async (data, responseData) => {
        console.log('Received returnsDevice event:', data);

        // Use the formatted call details from the API response, or fallback to empty array
        console.log('Received returnsDevice event 2:', responseData);
        const callDetails = responseData.formattedCallDetails || [];
        console.log('Received returnsDevice event 3:', callDetails);
        try {
          const response = await fetch(`${Base_url}/api/returnMobileDevice`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              //Authorization: `Bearer ${jwtToken}`, // Uncomment if using JWT
            },
            body: JSON.stringify({
              data,
              callDetails,
            }),
          });

          const result = await response.json();
          if (result.return_status === 1) {
            emit('deviceReturnSuccess', data, callDetails);
            setIsLogedIn(false);
            navigation.navigate('DeviceInformation');
          } else {
            emit('deviceReturnFailed', {
              ...data,
              errors: result.return_message,
            });
            console.log('data');
          }
          console.log('PUT response:', result);
        } catch (error) {
          emit('deviceReturnFailed', {...data, errors: error.messages});
          console.error('PUT request failed:', error);
        }

        if (error && errorMsg.includes('WebSocket')) {
          setError(false);
          setErrorMsg('');
        }
      };
      socket.on('requestReturnDevice', CallLog);

      if (isConnected) {
        console.log(
          'Socket already connected, registerDevice event might have been missed',
        );
        // Optionally emit something to let server know we're ready
      }

      // Cleanup
      return () => {
        socket.off('requestReturnDevice', CallLog);
        console.log('Removed registerDevice listener');
      };
    }
  }, [
    socket,
    isConnected,
    connectionError,
    emit,
    error,
    errorMsg,
    navigation,
    studentData?.father_mobile_no,
    studentData?.mother_mobile_no,
    callIDS,
  ]);

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
        setCallIDS(prev => [...prev, res.call_id]);
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

  const callLogsStorage = [];

  const CallLog = async call_ids => {
    try {
      // Clear previous call logs
      callLogsStorage.length = 0;

      // Handle both single call_id and array of call_ids
      const idsArray = Array.isArray(call_ids) ? call_ids : [call_ids];

      // Fetch all call logs in parallel
      const callLogPromises = idsArray.map(async call_id => {
        const queryParams = new URLSearchParams({
          call_id: call_id,
        }).toString();

        const req = await fetch(
          `https://api-smartflo.tatateleservices.com/v1/call/records?${queryParams}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization:
                'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MDUwMTYiLCJjciI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9jbG91ZHBob25lLnRhdGF0ZWxlc2VydmljZXMuY29tL3Rva2VuL2dlbmVyYXRlIiwiaWF0IjoxNzU1MTc0NTk4LCJleHAiOjIwNTUxNzQ1OTgsIm5iZiI6MTc1NTE3NDU5OCwianRpIjoiTE1yWk9tU2VQVHZ0ZVZ3VSJ9._RjSGxFUN--X3ROIubz7OCdWlnPGvvoc9-EC-WRBVrk',
            },
          },
        );

        const res = await req.json();
        return res;
      });

      // Wait for all API calls to complete
      const allCallLogs = await Promise.all(callLogPromises);

      // Process and format the call logs
      const formattedCallDetails = [];

      allCallLogs.forEach(apiResponse => {
        console.log('Tata Tele API - Call Logs:', apiResponse);

        if (apiResponse.results && apiResponse.results.length > 0) {
          apiResponse.results.forEach(callRecord => {
            // Extract relevant information
            const clientNumber =
              callRecord.client_number?.replace('+91', '') || '';
            const startTime = formatTime(callRecord.time);
            const duration = formatDuration(callRecord.call_duration);

            // Determine contact name based on phone number
            let contactName = 'Unknown';
            if (studentData?.father_mobile_no === clientNumber) {
              contactName = 'Father';
            } else if (studentData?.mother_mobile_no === clientNumber) {
              contactName = 'Mother';
            }

            // Add to formatted call details
            formattedCallDetails.push({
              name: contactName,
              mobile: clientNumber,
              startTime: startTime,
              duration: duration,
            });
          });
        }
      });

      // Create response object with formatted call details
      const responseData = {
        ...allCallLogs[0], // Use first response as base
        formattedCallDetails: formattedCallDetails,
      };

      if (
        allCallLogs.some(log => log.status === 200 || log.results?.length > 0)
      ) {
        // handleReturnDevice(responseData);
        console.log('responseData--', responseData.formattedCallDetails);
      } else {
        console.log('Error fetching call logs or no results found');
      }
    } catch (error) {
      console.log('Error fetching call logs:', error);
    }
  };

  // Helper function to format time
  const formatTime = timeString => {
    if (!timeString) return 'N/A';

    // Convert 24-hour format to 12-hour format with AM/PM
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';

    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to format duration
  const formatDuration = durationInSeconds => {
    if (!durationInSeconds || durationInSeconds === 0) return '0s';

    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
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
                <Text className="text-white text-sm">
                  +91{' '}
                  {studentData?.father_mobile_no.slice(0, 2) +
                    'XXXXXX' +
                    studentData?.father_mobile_no.slice(8)}
                </Text>
                <Text className="text-white text-sm">
                  +91{' '}
                  {studentData?.father_mobile_no.slice(0, 2) +
                    'XXXXXX' +
                    studentData?.father_mobile_no.slice(8)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                handelCall(studentData?.father_mobile_no, 'Father/Gardian 1')
              }
              onPress={() =>
                handelCall(studentData?.father_mobile_no, 'Father/Gardian 1')
              }
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
                <Text className="text-white text-sm">
                  +91{' '}
                  {studentData?.mother_mobile_no.slice(0, 2) +
                    'XXXXXX' +
                    studentData?.mother_mobile_no.slice(8)}
                </Text>
                <Text className="text-white text-sm">
                  +91{' '}
                  {studentData?.mother_mobile_no.slice(0, 2) +
                    'XXXXXX' +
                    studentData?.mother_mobile_no.slice(8)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() =>
                handelCall(studentData?.mother_mobile_no, 'Mother/Gardian 1')
              }
              onPress={() =>
                handelCall(studentData?.mother_mobile_no, 'Mother/Gardian 1')
              }
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
              onPress={() => CallLog(callIDS)}>
              <MaterialIcons name="qr-code" size={20} color="#fff" />
              <Text className="text-white text-base font-bold">Scan</Text>
            </TouchableOpacity>
          </GradientBackground>
        </View>
      </View>
    </SafeAreaView>
  );
}
