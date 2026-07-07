import api from './api';

export const runPortRiskAssessment = async (testResultId) => {
  const response = await api.post('/port-risk/assess', { test_result_id: testResultId });
  return response.data;
};

export const runStandalonePortRiskAssessment = async (ipAddress) => {
  const payload = ipAddress ? { ip_address: ipAddress } : {};
  const response = await api.post('/port-risk/standalone', payload);
  return response.data;
};

export const runPortRiskScan = async (ipAddress) => {
  const response = await runStandalonePortRiskAssessment(ipAddress);
  return response;
};

export const getPortRiskAssessment = async (id) => {
  const response = await api.get(`/port-risk/assessment/${id}`);
  return response.data;
};

export const getPortRiskAssessmentByTestResult = async (testResultId) => {
  const response = await api.get(`/port-risk/test-result/${testResultId}`);
  return response.data;
};

export const getUserPortRiskAssessments = async () => {
  const response = await api.get('/port-risk/assessments');
  return response.data;
};

export const getPortKnowledgeBase = async () => {
  const response = await api.get('/port-risk/knowledge-base');
  return response.data;
};
