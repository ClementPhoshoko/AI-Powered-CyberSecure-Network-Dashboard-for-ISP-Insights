import api from './api';

export const runPingTest = async (pingData) => {
  const response = await api.post('/ping/tests', pingData);
  return response.data;
};

export const getPingTestById = async (testId) => {
  const response = await api.get(`/ping/tests/${testId}`);
  return response.data;
};

export const getPingHistory = async (limit = 100, offset = 0, filters = {}) => {
  const params = { limit, offset };
  if (filters.startDate) params.start_date = filters.startDate;
  if (filters.endDate) params.end_date = filters.endDate;
  
  const response = await api.get('/ping/history', {
    params
  });
  return response.data;
};

export const getPingSummary = async () => {
  const response = await api.get('/ping/summary');
  return response.data;
};
