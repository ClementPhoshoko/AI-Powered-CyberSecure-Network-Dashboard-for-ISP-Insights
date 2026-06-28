import api from './api';

export const calculateNetworkScores = async (testResultId) => {
  const response = await api.post('/network/score', { test_result_id: testResultId });
  return response.data;
};

export const generateAISummary = async (testResultId) => {
  const response = await api.post('/network/summary', { test_result_id: testResultId });
  return response.data;
};
