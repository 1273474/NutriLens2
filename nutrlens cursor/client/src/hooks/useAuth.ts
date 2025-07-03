import { useCallback } from 'react';

export function useAuth() {
  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  const setToken = useCallback((token: string) => {
    localStorage.setItem('token', token);
  }, []);

  const clearToken = useCallback(() => {
    localStorage.removeItem('token');
  }, []);

  const getAuthHeader = useCallback(() => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

  return { getToken, setToken, clearToken, getAuthHeader };
} 