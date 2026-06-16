import api from './api';

export const devLogin = async (email, password) => {
  const response = await api.post('/dev/auth/login', { email, password });
  if (response.data.access_token) {
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getCurrentUser = () => {
  return localStorage.getItem('access_token') ? true : false;
};
