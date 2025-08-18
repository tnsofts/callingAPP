import React, {useEffect, useState, useRef} from 'react';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {WebSocketProvider} from './screens/WebScoket';
import Main from './screens/Main';
import CallScreen from './screens/CallScreen';
import Scanner from './screens/Scanner';
import DeviceInformation from './screens/DeviceInformation';
import store from './store';
import LoaderKit from 'react-native-loader-kit';
import {navigationRef, navigate} from './navigationRef';
import {View} from 'react-native';
import DeviceInfo from 'react-native-device-info';
 
const Stack = createStackNavigator();
 
export default function App() {
  const BASE_URL = 'http://192.168.0.100:3002';
  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [initialRoute, setInitialRoute] = useState('DeviceInformation'); // Safe default
  const [appReady, setAppReady] = useState(false);
  const initializeRef = useRef(false);
 
  const {
    isRegistered,
    getIsRegistered,
    setBooting,
    booting,
    setDeviceId,
    setIsRegistered,
    isDeviceRegistered,
    getDeviceInfo,
    isLogedIn,
    getIsLogedIn,
  } = store();
 
  useEffect(() => {
        async function getDeviceToken() {
          const deviceId = DeviceInfo.getDeviceId();
          console.log('Device ID:', deviceId);
          //setDeviceIdScanner(deviceId);
          setDeviceId(deviceId)
        }
        getDeviceToken();
      }, []);

  useEffect(() => {
    const initializeApp = async () => {
      // Prevent multiple initialization calls
      // if (initializeRef.current) return;
      // initializeRef.current = true;
 
      try {
        console.log('Starting app initialization...');
 
        // Get stored data first
        await getIsRegistered();
        await getIsLogedIn();
        await getDeviceInfo();
 
        // Check device registration status
        const deviceRegistered = await isDeviceRegistered();
 
        console.log('Initialization data:', {
          deviceRegistered,
          isRegistered,
          isLogedIn,
        });
 
        // Determine initial route with clearer logic
        let targetRoute = 'DeviceInformation'; // Default fallback
 
        if (isLogedIn && deviceRegistered) {
          targetRoute = 'Main';
          console.log('User is logged in, starting with Main');
        } else if (deviceRegistered || isRegistered) {
          targetRoute = 'Scanner';
          console.log('Device is registered, starting with Scanner');
        } else {
          targetRoute = 'DeviceInformation';
          console.log(
            'Device is not registered, starting with DeviceInformation',
          );
        }
 
        setInitialRoute(targetRoute);
        setBooting(true);
        setAppReady(true);
      } catch (error) {
        console.error('Error during app initialization:', error);
        setInitialRoute('DeviceInformation');
        setBooting(true);
        setAppReady(true);
      }
    };
 
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booting]); // Intentionally empty - we want this to run only once on mount
 
  if (!appReady && !booting) {
    return (
      <View className="items-center justify-center flex-1">
        <LoaderKit
          style={{width: 50, height: 50}}
          name={'LineScalePulseOut'}
          color={'red'}
        />
      </View>
    );
  }
 
  console.log('App ready, initial route:', initialRoute);
 
  return (
    <WebSocketProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Main" component={Main} />
          <Stack.Screen name="Scanner" component={Scanner} />
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
 
 