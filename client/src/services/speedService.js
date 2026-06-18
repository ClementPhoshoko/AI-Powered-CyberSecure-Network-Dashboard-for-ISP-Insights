import api from './api';

export const streamDownloadTest = async (sizeMb, signal) => {
  const response = await api.get('/api/speed/download', {
    params: { sizeMb },
    responseType: 'blob',
    signal
  });
  return response.data;
};

export const submitDownloadResults = async (data) => {
  const response = await api.post('/api/speed/tests/download', data);
  return response.data;
};

export const streamUploadTest = async (sizeMb, data, signal) => {
  const response = await api.post('/api/speed/upload', data, {
    params: { sizeMb },
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    signal
  });
  return response.data;
};

export const submitUploadResults = async (data) => {
  const response = await api.post('/api/speed/tests/upload', data);
  return response.data;
};
