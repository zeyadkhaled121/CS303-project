import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Determine base host during development (works with Expo)
let host = 'localhost';
if (__DEV__) {
  // debuggerHost format is '192.168.x.x:19000' when running in Expo
  const debuggerHost = Constants.manifest?.debuggerHost || Constants.manifest?.packagerOpts?.dev?.host;
  if (debuggerHost) host = debuggerHost.split(':')[0];
  else if (Platform.OS === 'android') host = '10.0.2.2';
}

const baseURL = __DEV__ ? `http://${host}:5000` : 'https://api.your-production-domain.com';

const API = axios.create({
  baseURL,
  timeout: 15000,
});

// Attach auth token from secure storage to each request (if present)
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore secure store errors here; request will proceed without auth header
      console.warn('SecureStore read failed', e.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized response error handling: normalize error message
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = error;
    normalized.userMessage = error.response?.data?.message || error.message || 'Network Error';
    return Promise.reject(normalized);
  }
);

export default API;
