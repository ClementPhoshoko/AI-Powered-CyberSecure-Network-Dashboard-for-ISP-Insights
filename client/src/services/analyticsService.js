import api from './api';

export const getAnalyticsOverview = async () => {
  const response = await api.get('/api/analytics/overview');
  return response.data;
};

export const getAnalyticsHistory = async (range = '30d') => {
  const response = await api.get('/api/analytics/history', {
    params: { range }
  });
  return response.data;
};

export const getTestDetails = async (testResultId) => {
  const response = await api.get(`/api/analytics/test/${testResultId}`);
  return response.data;
};

export const getAnomalies = async () => {
  const response = await api.get('/api/analytics/anomalies');
  return response.data;
};
