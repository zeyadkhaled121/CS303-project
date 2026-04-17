import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
const MY_IP_ADDRESS = '192.168.1.5'; //Put ur Laptop's IP address here

const baseURL = __DEV__ ? `http://${MY_IP_ADDRESS}:5000` : 'https://api.your-production-domain.com';

const API = axios.create({
  baseURL,
  timeout: 15000,
});


API.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('SecureStore read failed', e.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);


API.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = error;
    normalized.userMessage = error.response?.data?.message || error.message || 'Network Error';
    return Promise.reject(normalized);
  }
);

export default API;