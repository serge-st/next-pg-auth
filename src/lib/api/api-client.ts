import axios from 'axios';
import { HOST } from '@/lib/utils/helpers';

export const apiClient = axios.create({
  baseURL: `${HOST}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});
