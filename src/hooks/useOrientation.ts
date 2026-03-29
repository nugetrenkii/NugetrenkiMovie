import { useEffect } from 'react';
import Orientation from 'react-native-orientation-locker';

export const useOrientation = (type: 'PORTRAIT' | 'LANDSCAPE' | 'UNLOCK' = 'PORTRAIT') => {
  useEffect(() => {
    switch (type) {
      case 'LANDSCAPE':
        Orientation.lockToLandscape();
        break;
      case 'PORTRAIT':
        Orientation.lockToPortrait();
        break;
      case 'UNLOCK':
        Orientation.unlockAllOrientations();
        break;
      default:
        Orientation.lockToPortrait();
        break;
    }

    // Cleanup: always return to portrait when component unmounts
    return () => {
      Orientation.lockToPortrait();
    };
  }, [type]);
};
