import api from './api';

export const streamDownloadTest = async (sizeMb, signal, onProgress) => {
  const startTime = performance.now();
  const expectedTotalBytes = sizeMb * 1024 * 1024;
  
  const response = await api.get('/speed/download', {
    params: { sizeMb },
    responseType: 'blob',
    signal,
    onDownloadProgress: (progressEvent) => {
      if (onProgress) {
        const totalBytes = progressEvent.total || expectedTotalBytes;
        const elapsedSeconds = Math.max((performance.now() - startTime) / 1000, 0.05);
        const receivedMb = progressEvent.loaded / (1024 * 1024);
        const speedMbps = (receivedMb * 8) / elapsedSeconds;
        const progress = Math.min((progressEvent.loaded / totalBytes) * 100, 100);
        onProgress(speedMbps, progress);
      }
    }
  });
  return response.data;
};

export const submitDownloadResults = async (data) => {
  const response = await api.post('/speed/tests/download', data);
  return response.data;
};

export const streamUploadTest = async (sizeMb, data, signal, onProgress) => {
  const startTime = performance.now();
  const expectedTotalBytes = sizeMb * 1024 * 1024;
  
  const response = await api.post('/speed/upload', data, {
    params: { sizeMb },
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    signal,
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const totalBytes = progressEvent.total || expectedTotalBytes;
        const elapsedSeconds = Math.max((performance.now() - startTime) / 1000, 0.05);
        const uploadedMb = progressEvent.loaded / (1024 * 1024);
        const speedMbps = (uploadedMb * 8) / elapsedSeconds;
        const progress = Math.min((progressEvent.loaded / totalBytes) * 100, 100);
        onProgress(speedMbps, progress);
      }
    }
  });
  return response.data;
};

export const submitUploadResults = async (data) => {
  const response = await api.post('/speed/tests/upload', data);
  return response.data;
};
