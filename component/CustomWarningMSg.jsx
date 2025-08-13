import React from 'react';
import {
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CustomWarningMSg({
  visible,
  title,
  msg,
  close,
  showBtn,
  buttonText,
  buttonClass,
  buttonWrapperClass,
  isError,
  img,
}) {
  return (
    <>
      <StatusBar translucent={true} transparent={true} />
      <Modal
        visible={visible}
        animationType="slide"
        className="flex-1 items-center justify-center bg-black/40 z-50"
        transparent={true}>
        <View className="flex-1 items-center justify-center bg-black/40 z-50">
          <View
            className="bg-white rounded-xl px-8 py-6 w-10/12 items-center justify-center space-y-4 relative"
            style={style.boxShodow}>
            {isError ? (
              <Image
                source={require('../screens/assets/wariningIcon.jpg')}
                resizeMode="cover"
                className="w-14 h-14"
              />
            ) : (
              <Image
                source={require('../screens/assets/infoIcon.jpg')}
                resizeMode="cover"
                className="w-14 h-14"
              />
            )}
            <Text className="text-lg lg:text-xl font-semibold text-center text-black">
              {title}
            </Text>
            <Text className="text-sm  md:text-base lg:text-lg text-center text-black">
              {msg}
            </Text>
            {img && (
              <Image source={img} resizeMode="cover" className="w-40 h-40" />
            )}
            {showBtn && (
              <TouchableOpacity
                className={`px-4 py-2 rounded-3xl w-full ${buttonWrapperClass}`}
                onPress={close}>
                <Text
                  className={`text-sm  md:text-base lg:text-lg  text-white text-center ${buttonClass}`}>
                  {buttonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const style = StyleSheet.create({
  boxShodow: {
    shadowColor: '#000',
    shadowOffset: [4, 12],
    shadowOpacity: 0.6,
    shadowRadius: 7,
    elevation: 15,
  },
});
