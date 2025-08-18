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
  deviceId: null,
 
  setDeviceId: value => set(() => ({deviceId: value})),
  
  setIsRegistered: async value => {
    try {
      set(() => ({isRegistered: value}));
      await RNBlobUtil.fs.writeFile(
        filePath,
        JSON.stringify({isRegistered: value}),
      );
      console.log('isRegistered', value);
      await RNBlobUtil.fs
        .writeFile(filePath, JSON.stringify({isRegistered: value}), 'utf8')
        .catch(error => {
          console.error('Error writing role:', error);
          throw error;
        });

      const verifyData = JSON.parse(
        await RNBlobUtil.fs.readFile(filePath, 'utf8'),
      );
      console.log('Verified saved data:', verifyData);
    } catch (error) {
      console.error(error);
    }
  },

  setIdNumber: value => set(() => ({idNumber: value})),

  setOtpHash: value => set(() => ({otpHash: value})),

  setIsLogedIn: () => set(() => ({isLogedIn: true})),

  setToken: value => set(() => ({token: value})),

  setJwtToken: value => set(() => ({jwtToken: value})),

  getIsRegistered: async () => {
    const data = await RNBlobUtil.fs.readFile(filePath, 'utf8');
    set(() => ({isRegistered: JSON.parse(data).isRegistered}));
  },
}));
export default store;
