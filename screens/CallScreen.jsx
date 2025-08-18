import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import React, {useEffect, useState, useRef} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ToastManager, {Toast} from 'toastify-react-native';
import {useStore} from '../store';
 
export default function CallScreen() {
  const route = useRoute();
  const {callId, name} = route.params || {};
  const navigation = useNavigation();
  const Base_url = 'http://192.168.1.90:3004';
  // const {setCallDuration} = useStore();
  // Timer states
  const [seconds, setSeconds] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);
  const [callStatus, setCallStatus] = useState('Connecting...');
  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());
 
  // Format timer display
  const formatTime = totalSeconds => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
 
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };
 
  // Start timer when component mounts
  useEffect(() => {
    startTimeRef.current = Date.now();
    setCallStatus('Connected');
 
    intervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const elapsedSeconds = Math.floor(
        (currentTime - startTimeRef.current) / 1000,
      );
      setSeconds(elapsedSeconds);
    }, 1000);
 
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
 
  // Disable back button during active call
  useFocusEffect(
    React.useCallback(() => {
      const handleHangUp = async () => {
        try {
          setCallStatus('Ending call...');
 
          // Stop the timer
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
 
          setIsCallActive(false);
 
          // Call the hang up API
          const finalCallDuration = seconds;
          console.log('Call ended. Duration:', formatTime(finalCallDuration));
 
          if (callId) {
            await HangUpCall(callId);
          }
 
          showToasts(`Call ended. Duration: ${formatTime(finalCallDuration)}`);
 
          // Navigate back after a short delay
          setTimeout(() => {
            navigation.goBack();
          }, 1500);
        } catch (error) {
          console.error('Error hanging up call:', error);
          setIsCallActive(false);
          navigation.goBack();
        }
      };
 
      const onBackPress = () => {
        if (isCallActive) {
          // Show alert asking if user wants to end call
          Alert.alert('End Call', 'Are you sure you want to end the call?', [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'End Call',
              style: 'destructive',
              onPress: () => handleHangUp(),
            },
          ]);
          return true; // Prevent default back behavior
        }
        return false; // Allow normal back behavior when call is ended
      };
 
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => backHandler.remove();
    }, [isCallActive, seconds, callId, navigation]),
  );
 
  const showToasts = msg => {
    Toast.success(msg);
  };
 
  const handleHangUp = async () => {
    try {
      setCallStatus('Ending call...');
 
      // Stop the timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
 
      setIsCallActive(false);
 
      // Call the hang up API
      const finalCallDuration = seconds;
      // setCallDuration(finalCallDuration);
      console.log('Call ended. Duration:', formatTime(finalCallDuration));
 
      if (callId) {
        await HangUpCall(callId);
      }
 
      showToasts(`Call ended. Duration: ${formatTime(finalCallDuration)}`);
 
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error hanging up call:', error);
      setIsCallActive(false);
      navigation.goBack();
    }
  };
 
  const HangUpCall = async callId => {
    try {
      console.log('Hanging up call ID:', callId);
      const req = await fetch(
        'https://api-smartflo.tatateleservices.com/v1/call/hangup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MDUwMTYiLCJjciI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9jbG91ZHBob25lLnRhdGF0ZWxlc2VydmljZXMuY29tL3Rva2VuL2dlbmVyYXRlIiwiaWF0IjoxNzU1MTc0NTk4LCJleHAiOjIwNTUxNzQ1OTgsIm5iZiI6MTc1NTE3NDU5OCwianRpIjoiTE1yWk9tU2VQVHZ0ZVZ3VSJ9._RjSGxFUN--X3ROIubz7OCdWlnPGvvoc9-EC-WRBVrk',
          },
          body: JSON.stringify({
            call_id: callId,
          }),
        },
      );
 
      const res = await req.json();
      console.log('Hang up API response:', res);
 
      if (res.success) {
        console.log('Call successfully ended via API');
      } else {
        console.log('API reported failure, but continuing with local hangup');
      }
 
      return res;
    } catch (error) {
      console.log('Error calling hang up API:', error);
      // Continue with local hangup even if API fails
    }
  };
 
  return (
    <>
      <ToastManager />
      <StatusBar barStyle={'light-content'} />
      <LinearGradient
        colors={['#2d62ef', '#2d399e']}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.gradient}>
        <View className="flex items-center justify-between flex-1 my-16">
          <View className="-mb-60">
            <View className="items-center space-y-4 h-max">
              <View className="flex-row items-center justify-center space-x-2">
                <View
                  className={`w-2 h-2 rounded-full ${
                    isCallActive ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <Text
                  className={`text-sm ${
                    isCallActive ? 'text-green-500' : 'text-red-500'
                  }`}>
                  {isCallActive ? 'Connected' : 'Call Ended'}
                </Text>
              </View>
              <View className="bg-[#4d75de] w-24 h-24 rounded-full items-center justify-center flex">
                <Text className="text-2xl text-white font-bold">
                  {name ? name.charAt(0).toUpperCase() : 'F/G'}
                </Text>
              </View>
              <Text className="text-2xl text-white font-bold">
                {name || 'Father/Guardian'}
              </Text>
              <Text className="text-[#cacaca]">+91 80X XXXX XXX</Text>
              <View className="flex-row space-x-1">
                <Icon name="location" size={18} color="#cacaca" />
                <Text className="text-[#cacaca]">Nagpur, India</Text>
              </View>
            </View>
          </View>
 
          <View className="items-center space-y-6">
            <Text className="text-[#cacaca] text-lg">{callStatus}</Text>
            <View className="flex-row items-center space-x-4 bg-[#415fc5] px-8 py-2 rounded-3xl">
              <AntDesign name="clockcircleo" color="#FFF" size={18} />
              <Text className="text-white text-2xl font-mono">
                {formatTime(seconds)}
              </Text>
            </View>
          </View>
 
          <TouchableOpacity
            className="items-center mb-8 justify-center relative"
            onPress={handleHangUp}
            disabled={!isCallActive}>
            <LinearGradient
              colors={
                isCallActive ? ['#FF4B4B', '#FF0000'] : ['#666666', '#444444']
              }
              start={{x: 0.5, y: 0}}
              end={{x: 0.5, y: 1}}
              style={styles.callBox}
            />
            <Icon
              name={isCallActive ? 'call-outline' : 'call-outline'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );
}
 
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBox: {
    padding: 32,
    position: 'absolute',
    borderRadius: 16,
    transform: [{rotate: '-45deg'}],
  },
  text: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  boxShadow: {
    elevation: 12,
    shadowColor: '#dadada',
    shadowOffset: {width: 7, height: 7},
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
});
 
 