import React, {useEffect, useState} from 'react';
import {StatusBar, Text, View} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {WebSocketProvider} from './screens/WebScoket';
import Login from './screens/Login';
import Password from './screens/Password';
import Main from './screens/Main';
import CallScreen from './screens/CallScreen';
import Scanner from './screens/Scanner';
import DeviceInformation from './screens/DeviceInformation';
import store from './store';
import LoaderKit from 'react-native-loader-kit';
import {navigationRef, navigate} from './navigationRef';
import {useWebSocket} from './screens/WebScoket';
import DeviceInfo from 'react-native-device-info';

const Stack = createStackNavigator();

export default function App() {
  const BASE_URL = 'http://192.168.1.51:3002';
  const {isRegistered, getIsRegistered, setBooting, booting} = store();

  useEffect(() => {
    const getIsRegisteredData = async () => {
      console.log('booting', booting, 'isRegistered', isRegistered);
      await getIsRegistered();
      setBooting(true);
      if (!isRegistered) {
        navigate('DeviceInformation');
      }
    };
    getIsRegisteredData();
  }, [booting, getIsRegistered]);

  if (!booting) {
    console.log('booting', booting, 'isRegistered', isRegistered);
    return (
      <>
        <StatusBar translucent={true} backgroundColor="transparent" />
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
    console.log('booting', booting, 'isRegistered', isRegistered);
    return (
      <WebSocketProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator
            initialRouteName={'DeviceInformation'}
            screenOptions={{headerShown: false}}>
            <Stack.Screen name="Scanner" component={Scanner} />
            <Stack.Screen name="Main" component={Main} />
            <Stack.Screen name="CallScreen" component={CallScreen} />
            <Stack.Screen
              name="DeviceInformation"
              component={DeviceInformation}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </WebSocketProvider>
    );
  }
}
