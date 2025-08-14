import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomWarningMSg from '../component/CustomWarningMSg';
// import LinearGradient from 'react-native-linear-gradient';

export default function CallScreen() {
  const route = useRoute();
  const Base_url = 'http://192.168.1.52:3002';
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigation = useNavigation();
  const {callIdRoute} = route.params;

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
        navigation.navigate('Main');
      } else {
        setError(true);
        setErrorMsg(res.message);
      }

      return res;
    } catch (error) {
      console.log('Error ending call:', error);
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
        isError={error}
      />
      <StatusBar barStyle={'light-content'} />
      <LinearGradient
        colors={['#2d62ef', '#2d399e']} // Gradient colors
        start={{x: 0.5, y: 0}} // Gradient starting point
        end={{x: 0.5, y: 1}} // Gradient ending point
        style={styles.gradient}>
        <View className="flex items-center justify-between flex-1 my-16">
          <View className="-mb-60">
            <View className="items-center space-y-4 h-max">
              <View className="flex-row items-center justify-center space-x-2">
                <View className="w-2 h-2 bg-green-500 rounded-full"></View>
                <Text className="text-sm text-green-500">Outgoing call</Text>
              </View>
              <View className="bg-[#4d75de] w-24 h-24 rounded-full items-center justify-center flex">
                <Text className="text-2xl text-white font-bold">F/G</Text>
              </View>
              <Text className="text-2xl text-white font-bold">
                Father/Gardian
              </Text>
              <Text className="text-[#cacaca]">+91 80X XXXX XXX</Text>
              <View className="flex-row space-x-1">
                <Icon name="location" size={18} color="#cacaca" />
                <Text className="text-[#cacaca]">Nagpur, India</Text>
              </View>
            </View>
          </View>
          <View className="items-center space-y-6">
            <Text className="text-[#cacaca] text-lg">Calling ...</Text>
            <View className="flex-row items-center space-x-4 bg-[#415fc5] px-8 py-2 rounded-3xl">
              <AntDesign name="clockcircleo" color="#FFF" size={18} />
              <Text className="text-white text-2xl">00:22:12</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => HangUpCall(callIdRoute)}
            className="items-center mb-8 justify-center relative">
            <LinearGradient
              colors={['#FF4B4B', '#FF0000']} // Gradient colors
              start={{x: 0.5, y: 0}} // Gradient starting point
              end={{x: 0.5, y: 1}} // Gradient ending point
              style={styles.callBox}></LinearGradient>
            <Icon name="call-outline" size={24} color="white" />
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
