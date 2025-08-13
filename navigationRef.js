// navigationRef.js
import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function resetToLogin() {
  navigationRef.current?.reset({
    index: 0,
    routes: [{name: 'UserNameScr'}],
  });
}
