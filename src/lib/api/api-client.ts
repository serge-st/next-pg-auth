import axios from 'axios';
import { HOST, localStorageAccessToken } from '@/lib/utils/helpers';

export const apiClient = axios.create({
  baseURL: `${HOST}/api`,
});

apiClient.defaults.headers.common['Content-Type'] = 'application/json';

apiClient.interceptors.request.use((config) => {
  if (!window.localStorage) return config;
  const token = localStorageAccessToken.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
