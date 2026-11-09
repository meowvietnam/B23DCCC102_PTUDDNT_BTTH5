import {PermissionsAndroid, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

async function ensurePermission() {
  if (Platform.OS !== 'android') {
    return true;
  }
  const res = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return res === PermissionsAndroid.RESULTS.GRANTED;
}

// Lấy vị trí hiện tại (null nếu bị từ chối / lỗi).
export async function getCurrentCoords() {
  try {
    if (!(await ensurePermission())) {
      return null;
    }
    return await new Promise(resolve => {
      Geolocation.getCurrentPosition(
        pos => resolve(pos.coords),
        () => resolve(null),
        {enableHighAccuracy: false, timeout: 15000, maximumAge: 60000},
      );
    });
  } catch (e) {
    return null;
  }
}
