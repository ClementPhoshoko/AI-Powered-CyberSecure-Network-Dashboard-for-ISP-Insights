import api from './api';

export const getSystemMetrics = async () => {
  const response = await api.get('/system/metrics');
  return response.data;
};

export const refreshSystemMetrics = async () => {
  const response = await api.post('/system/metrics/refresh');
  return response.data;
};
