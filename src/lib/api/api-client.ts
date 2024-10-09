import axios from 'axios';
import { HOST, localStorageAccessToken } from '@/lib/utils/helpers';
import { isApiError } from './is-api-error';
import { AxiosRequestConfigWithRetry, ValidateResponse } from '../types';

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfigWithRetry = error.config;

    if (!isApiError(error)) return Promise.reject(error);
    if (error.response.status !== 401) return Promise.reject(error);
    if (originalRequest.url?.includes('/auth/validate')) return Promise.reject(error);

    if (originalRequest._retry && originalRequest._retry > 3) {
      return Promise.reject(error);
    }

    originalRequest._retry = (originalRequest._retry || 0) + 1;

    try {
      const response = await apiClient.post<ValidateResponse>(
        '/auth/validate',
        {},
        {
          headers: originalRequest.headers,
        },
      );
      const newToken = response.data.access_token;
      if (newToken) localStorageAccessToken.set(newToken);
      return apiClient(originalRequest);
    } catch (error) {
      return Promise.reject(error);
    }
  },
);
