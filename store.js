import {create} from 'zustand';
// isLogedIn, setIsLogedIn, token, setToken, setJwtToken;
import RNBlobUtil from 'react-native-blob-util';

const filePath = RNBlobUtil.fs.dirs.DocumentDir + '/data.json';

const store = create(set => ({
  idNumber: null,
  otpHash: null,
  isLogedIn: false,
  token: null,
  jwtToken: null,
  isRegistered: null,
  booting: false,
  deviceIdBackend: null,
  idCardNo: null,

  setDeviceIdBackend: value => set(() => ({deviceIdBackend: value})),
  setIdCardNo: value => set(() => ({idCardNo: value})),

  setBooting: value => set(() => ({booting: value})),

  setIsRegistered: async value => {
    try {
      set(() => ({isRegistered: value}));
      await RNBlobUtil.fs.writeFile(
        filePath,
        JSON.stringify({isRegistered: value}),
        'utf8',
      );
      console.log('isRegistered', value);

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

  setIsLogedIn: () => set(() => ({isLogedIn: true})),

  setToken: value => set(() => ({token: value})),

  setJwtToken: value => set(() => ({jwtToken: value})),

  getIsRegistered: async () => {
    try {
      // Check if file exists before trying to read it
      const fileExists = await RNBlobUtil.fs.exists(filePath);
      if (!fileExists) {
        console.log('Data file does not exist, setting isRegistered to null');
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
}));
export default store;
