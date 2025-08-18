import {create} from 'zustand';
// isLogedIn, setIsLogedIn, token, setToken, setJwtToken;
import RNBlobUtil from 'react-native-blob-util';
import DeviceInfo from 'react-native-device-info';
import {navigate} from './navigationRef';
 
const Base_url = 'http://192.168.0.100:3002';
 
const filePath = RNBlobUtil.fs.dirs.DocumentDir + '/data.json';
const filePath2 = RNBlobUtil.fs.dirs.DocumentDir + '/data2.json';
 
const store = create(set => ({
  idNumber: null,
  otpHash: null,
  isLogedIn: false,
  token: null,
  jwtToken: null,
  isRegistered: null,
  booting: false,
  booting2: false,
  deviceId: null,
  deviceData: {
    device_name: '',
    device_qr_code: '',
    manufacturer: '',
    device_os: '',
    system_name: '',
    system_version: '',
    build_no: '',
    app_name: '',
    device_brand: '',
    device_model: '',
  },
  callDuration: 0,
  studentData: [],
 
  setStudentData: value => set(() => ({studentData: value})),
 
  setCallDuration: value => set(() => ({callDuration: value})),
 
  isDeviceRegistered: async () => {
    try {
      const deviceId = await DeviceInfo.getDeviceId();
      console.log('Device ID for registration check:', deviceId);
 
      const req = await fetch(`${Base_url}/api/isDeviceRegistered`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({device_id: deviceId}),
      });
 
      const data = await req.json();
      console.log('Device registration check response:', data);
 
      if (data.return_status === 1) {
        // Device is registered
        try {
          set(() => ({isRegistered: true}));
          await RNBlobUtil.fs
            .writeFile(filePath, JSON.stringify({isRegistered: true}), 'utf8')
            .catch(error => {
              console.error('Error writing isRegistered to file:', error);
            });
          console.log('isRegistered saved:', true);
 
          const verifyData = JSON.parse(
            await RNBlobUtil.fs.readFile(filePath, 'utf8'),
          );
          console.log('Verified saved data:', verifyData);
        } catch (error) {
          console.error('Error in setIsRegistered:', error);
        }
 
        console.log('Device is registered');
        return true; // Device is registered
      } else {
        // Device is not registered
        set(() => ({isRegistered: false}));
        console.log('Device is not registered');
        return false; // Device is not registered
      }
    } catch (error) {
      console.error('Error in isDeviceRegistered:', error);
      console.error('Error details:', error.message);
      // On error, assume device is not registered
      set(() => ({isRegistered: false}));
      return false;
    }
  },
 
  getDeviceInfo: async () => {
    const fetchDeviceInfo = async () => {
      try {
        const [
          deviceName,
          manufacturer,
          deviceId,
          baseOs,
          systemName,
          systemVersion,
          buildNumber,
          appName,
          brand,
          model,
          // mac // optional
        ] = await Promise.all([
          DeviceInfo.getDeviceName(),
          DeviceInfo.getManufacturer(),
          DeviceInfo.getDeviceId(),
          DeviceInfo.getBaseOs(),
          DeviceInfo.getSystemName(),
          DeviceInfo.getSystemVersion(),
          DeviceInfo.getBuildNumber(),
          DeviceInfo.getApplicationName(),
          DeviceInfo.getBrand(),
          DeviceInfo.getModel(),
          // DeviceInfo.getMacAddress()
        ]);
 
        // Update deviceData state properly
        set(state => ({
          deviceData: {
            ...state.deviceData,
            device_name: deviceName,
            device_qr_code: deviceId,
            manufacturer: manufacturer,
            device_os: baseOs,
            system_name: systemName,
            system_version: systemVersion,
            build_no: buildNumber,
            app_name: appName,
            device_brand: brand,
            device_model: model,
          },
        }));
      } catch (error) {
        console.error('Error fetching device info:', error);
      }
    };
 
    fetchDeviceInfo();
  },
 
  setDeviceId: value => set(() => ({deviceId: value})),
 
  setBooting: value => set(() => ({booting: value})),
  setBooting2: value => set(() => ({booting2: value})),
 
  setIsRegistered: async value => {
    try {
      set(() => ({isRegistered: value}));
      await RNBlobUtil.fs
        .writeFile(filePath, JSON.stringify({isRegistered: value}), 'utf8')
        .catch(error => {
          console.error('Error in setIsLogedIn:', error);
        });
      console.log('isRegistered saved:', value);
 
      const verifyData = JSON.parse(
        await RNBlobUtil.fs.readFile(filePath, 'utf8'),
      );
      console.log('Verified saved data:', verifyData);
    } catch (error) {
      console.error('Error in setIsRegistered:', error);
    }
  },
 
  setIdNumber: value => set(() => ({idNumber: value})),
 
  setOtpHash: value => set(() => ({otpHash: value})),
 
  setIsLogedIn: async value => {
    try {
      set(() => ({isLogedIn: value}));
      await RNBlobUtil.fs
        .writeFile(filePath2, JSON.stringify({isLogedIn: value}), 'utf8')
        .catch(error => {
          console.error('Error in setIsLogedIn:', error);
        });
      console.log('isLogedIn saved:', value);
 
      const verifyData = JSON.parse(
        await RNBlobUtil.fs.readFile(filePath2, 'utf8'),
      );
      console.log('Verified saved data:', verifyData);
    } catch (error) {
      console.error('Error in setIsLogedIn:', error);
    }
  },
 
  setToken: value => set(() => ({token: value})),
 
  setJwtToken: value => set(() => ({jwtToken: value})),
 
  getIsRegistered: async () => {
    try {
      // Check if file exists before trying to read it
      const fileExists = await RNBlobUtil.fs.exists(filePath);
      if (!fileExists) {
        console.log(
          'Registration data file does not exist, setting isRegistered to null',
        );
        set(() => ({isRegistered: null}));
        return;
      }
 
      const data = await RNBlobUtil.fs.readFile(filePath, 'utf8');
      const parsedData = JSON.parse(data);
      set(() => ({isRegistered: parsedData.isRegistered ?? null}));
      console.log('Retrieved isRegistered:', parsedData.isRegistered);
    } catch (error) {
      console.error('Error in getIsRegistered:', error);
      set(() => ({isRegistered: null}));
    }
  },
 
  getIsLogedIn: async () => {
    try {
      // Check if file exists before trying to read it
      const fileExists = await RNBlobUtil.fs.exists(filePath2);
      if (!fileExists) {
        console.log(
          'Login data file does not exist, setting isLogedIn to false',
        );
        set(() => ({isLogedIn: false}));
        return;
      }
 
      const data = await RNBlobUtil.fs.readFile(filePath2, 'utf8');
      const parsedData = JSON.parse(data);
      set(() => ({isLogedIn: parsedData.isLogedIn ?? false}));
      console.log('Retrieved isLogedIn:', parsedData.isLogedIn);
    } catch (error) {
      console.error('Error in getIsLogedIn:', error);
      set(() => ({isLogedIn: false}));
    }
  },
}));
export default store;
 
 