import api from './api';

export const runPortRiskAssessment = async (testResultId) => {
  const response = await api.post('/port-risk/assess', { test_result_id: testResultId });
  return response.data;
};

export const runStandalonePortRiskAssessment = async (ipAddress) => {
  const response = await api.post('/port-risk/standalone', { ip_address: ipAddress });
  return response.data;
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
