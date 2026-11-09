import {initializeApp, getApps, getApp} from 'firebase/app';
import {initializeAuth, getAuth, getReactNativePersistence} from 'firebase/auth';
import {getDatabase} from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình project Firebase "chatapp-btth5" (Web app "ChatApp").
const firebaseConfig = {
  apiKey: 'AIzaSyCDm8g620G7rE5-O0ZkwOVPVJMFDpmXLLo',
  authDomain: 'chatapp-btth5.firebaseapp.com',
  databaseURL: 'https://chatapp-btth5-default-rtdb.firebaseio.com',
  projectId: 'chatapp-btth5',
  storageBucket: 'chatapp-btth5.firebasestorage.app',
  messagingSenderId: '578559396962',
  appId: '1:578559396962:web:20edb9f63936c18e05d53b',
};

const isNew = getApps().length === 0;
export const app = isNew ? initializeApp(firebaseConfig) : getApp();
export const auth = isNew
  ? initializeAuth(app, {persistence: getReactNativePersistence(AsyncStorage)})
  : getAuth(app);
export const db = getDatabase(app);
