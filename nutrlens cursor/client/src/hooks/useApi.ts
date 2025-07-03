import axios from 'axios';
import { useAuth } from './useAuth';

export function useApi() {
  const { getAuthHeader } = useAuth();

  const api = axios.create({
    baseURL: '/api',
    headers: {
      ...getAuthHeader(),
    },
    withCredentials: true,
  });

  // Interceptor to always inject latest token
  api.interceptors.request.use((config) => {
    const headers = getAuthHeader();
    config.headers = { ...config.headers, ...headers };
    return config;
  });

  return api;
} 