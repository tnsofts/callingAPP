// navigationRef.js
import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  console.log(`Attempting to navigate to: ${name}`);

  if (navigationRef.isReady()) {
    console.log(`Navigation is ready, navigating to: ${name}`);
    navigationRef.navigate(name, params);
  } else {
    console.log('Navigation not ready, retrying in 500ms...');
    // Retry after a short delay if navigation is not ready
    setTimeout(() => {
      if (navigationRef.isReady()) {
        console.log(`Navigation ready on retry, navigating to: ${name}`);
        navigationRef.navigate(name, params);
      } else {
        console.error(
          `Failed to navigate to ${name}: Navigation container not ready`,
        );
      }
    }, 500);
  }
}

export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{name: 'UserNameScr'}],
    });
  } else {
    console.error('Cannot reset navigation: Navigation container not ready');
  }
}
