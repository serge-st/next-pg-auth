import { AxiosRequestConfig } from 'axios';

export type AxiosRequestConfigWithRetry = AxiosRequestConfig & {
  _retry?: number;
};
