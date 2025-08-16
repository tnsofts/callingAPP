import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState, useTransition} from 'react';
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
import store from '../store';
import Icon from 'react-native-vector-icons/Ionicons';
import LoaderKit from 'react-native-loader-kit';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function Login() {
  const Base_url = 'http://192.168.1.90:3002';
  const [idCardNumber, setIdCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [isPending, startTransition] = useTransition();
  const [isVisible, setIsVisible] = useState(false);
  const [myData, setMyData] = useState(null);
  const [appHash, setAppHash] = useState('');

  const {setIdNumber, setOtpHash} = store();

  //   useEffect(() => {
  //     Platform.OS === 'android' &&
  //       getHash()
  //         .then(hash => {
  //           setAppHash(hash);
  //         })
  //         .catch();
  //   }, []);

  const handleChange = text => {
    setIdCardNumber(text);
  };

  const handleOtpRequired = idCardNumber => {
    navigation.navigate('OtpVerificationScr');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSendOtp = async () => {
    try {
      const formData = new FormData();
      formData.append('id_card_no', idCardNumber);
      formData.append('hash', appHash);
      formData.append('type', 'OTP'); // Assuming 'OTP' as type
      formData.append('appHash', appHash[0]);

      const response = await axios.post(`${Base_url}/api/otpsend`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      setMyData(data);
      if (data.return_otphash) {
        setOtpHash(data.return_otphash);
      }

      if (data.return_status === 1) {
        handleOtpRequired(data.idCardNumber || idCardNumber);
      } else {
      }
    } catch (error) {}
  };

  const handleUname = async val => {
    try {
      setUname(val);
      setIdNumber(val);
      const response = await fetch(`http://192.168.1.90:3002/api/idcardcheck`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id_card_no: val}),
      });

      const data = await response.json();
      setMyData(data);

      if (data.return_status === 1) {
        if (data.otp_hash) {
          setOtpHash(data.otp_hash);
          setFetchedUsername(val);
          setScreen('otp'); // Navigate to OTP screen
        } else {
        }
      } else {
      }
    } catch (error) {}
  };

  const handleLoginPress = async () => {
    if (idCardNumber) {
      setLoading(true);
      startTransition(async () => {
        try {
          const response = await fetch(
            `http://192.168.1.90:3002/api/idcardcheck`,
            {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({id_card_no: idCardNumber}),
            },
          );

          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            setMyData(data);
            //('Response Data:', data);

            if (data.return_status === 1) {
              setLoading(false);
              handleUname(idCardNumber);
              navigation.navigate('Password', {idCardNumber: idCardNumber}); // Navigate to password screen
            } else if (data.return_status === 2) {
              setLoading(false);
              handleUname(idCardNumber);
              handleSendOtp(); // Send OTP when moving to the OTP screen
            } else {
              setIsVisible(true);
            }
          } else {
            throw new Error('Unexpected response type');
          }
        } catch (error) {
          //('Error during fetch:', error);
          if (error.status == 0 || error.status == 401) {
          }
        }
      });
    } else {
    }
  };
  return (
    <>
      <StatusBar />
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <View>
          <View className="bg-blue-700 p-4 rounded-lg">
            <Icon name="call" size={18} color="white" />
          </View>
          <Text className="text-black text-xl">Caller App</Text>
        </View>
      </SafeAreaView>
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
