import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import store from '../store';
import LoaderKit from 'react-native-loader-kit';

export default function Password() {
  const Base_url = 'http://192.168.1.52:3002';
  const navigation = useNavigation();
  const route = useRoute();
  const {idCardNumber} = route.params;
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otphash, setOtpHash] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [myData, setMyData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {setIsLogedIn, token, setJwtToken} = store();

  const handleApiError = async error => {
    //('API Error:', error.message || error);
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      console.log('idCardNumber:', idCardNumber);
      console.log('Password:', password);

      const response = await fetch(`${Base_url}/api/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id_card_no: idCardNumber,
          password: password,
          //   device_token: token,
        }),
      });

      const data = await response.json();
      setMyData(data);
      //('API Response:', data);

      if (data.return_message == 'Login SuccessFully') {
        setIsLogedIn(true);
      } else {
        setIsLogedIn(false);
      }
      if (
        data.return_data &&
        data.return_data.token &&
        data.return_status === 1
      ) {
        const userInfo = data.return_data.user_info;

        if (userInfo) {
          const username = String(userInfo.id_card_no);
          const token = data.return_data.token;
          console.log('this is token', token);
          setJwtToken(token);
          setOtpHash(data.return_data.token);

          navigation.navigate('Main', {jwt: token});
        } else {
          console.log('User info is not available in API response:', data);
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
    } catch (error) {
      console.log('errorr', error);
      await handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = text => {
    setPassword(text);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <>
      <StatusBar hidden={true} />
      {/* <LinearGradient
        colors={['#81cdc6', '#048c7f', '#037c6e']} // Gradient colors
        start={{x: 0.5, y: 0}} // Gradient starting point
        end={{x: 0.5, y: 1}} // Gradient ending point
        style={styles.gradient}> */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 items-center justify-center w-full px-4 space-y-4">
          <Text className="text-3xl font-bold text-center">
            Your Password Please!!
          </Text>
          <View className="px-8 rounded-3xl w-full bg-white items-center flex-row justify-between">
            <TextInput
              secureTextEntry={showPassword ? false : true}
              className="text-lg font-bold text-black w-full"
              placeholderTextColor={'lightgray'}
              placeholder="Password"
              onChangeText={handleChange}></TextInput>
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-8">
              <Icon
                name={showPassword ? 'eye' : 'eye-off'}
                size={18}
                color="black"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="bg-[#025043] w-full h-11 mx-4 px-4 py-2 rounded-3xl items-center justify-center "
            style={styles.boxShadow}
            onPress={handleLogin}>
            {loading ? (
              <LoaderKit
                style={{width: 25, height: 25}}
                name={'BallPulseSync'} // Optional: see list of animations below
                size={16} // Required on iOS
                color={'white'} // Optional: color can be: 'red', 'green',... or '#ddd', '#ffffff',...
              />
            ) : (
              <>
                <Text className="text-white text-lg text-center font-extrabold">
                  Login
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
      {/* </LinearGradient> */}
    </>
  );
}
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
