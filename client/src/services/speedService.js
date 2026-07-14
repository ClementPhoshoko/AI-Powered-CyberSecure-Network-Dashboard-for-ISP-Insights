import api from './api';

export const streamDownloadTest = async (sizeMb, signal, onProgress) => {
  const expectedTotalBytes = sizeMb * 1024 * 1024;
  let lastLoaded = 0;
  let lastTime = performance.now();
  const windowSpeeds = [];
  const ROLLING_WINDOW = 5;

  const response = await api.get('/speed/download', {
    params: { sizeMb },
    responseType: 'blob',
    signal,
    onDownloadProgress: (progressEvent) => {
      if (onProgress) {
        const totalBytes = progressEvent.total || expectedTotalBytes;
        const now = performance.now();
        const deltaBytes = progressEvent.loaded - lastLoaded;
        const deltaTime = Math.max((now - lastTime) / 1000, 0.001);
        const instantMbps = (deltaBytes / (1024 * 1024) * 8) / deltaTime;

        // Rolling window smooths per-chunk variation for the needle display
        windowSpeeds.push(instantMbps);
        if (windowSpeeds.length > ROLLING_WINDOW) windowSpeeds.shift();
        const smoothMbps = windowSpeeds.reduce((a, b) => a + b, 0) / windowSpeeds.length;

        lastLoaded = progressEvent.loaded;
        lastTime = now;

        const progress = Math.min((progressEvent.loaded / totalBytes) * 100, 100);
        onProgress(smoothMbps, instantMbps, progress);
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
  const expectedTotalBytes = sizeMb * 1024 * 1024;
  let lastLoaded = 0;
  let lastTime = performance.now();
  const windowSpeeds = [];
  const ROLLING_WINDOW = 5;

  const response = await api.post('/speed/upload', data, {
    params: { sizeMb },
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    signal,
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const totalBytes = progressEvent.total || expectedTotalBytes;
        const now = performance.now();
        const deltaBytes = progressEvent.loaded - lastLoaded;
        const deltaTime = Math.max((now - lastTime) / 1000, 0.001);
        const instantMbps = (deltaBytes / (1024 * 1024) * 8) / deltaTime;

        windowSpeeds.push(instantMbps);
        if (windowSpeeds.length > ROLLING_WINDOW) windowSpeeds.shift();
        const smoothMbps = windowSpeeds.reduce((a, b) => a + b, 0) / windowSpeeds.length;

        lastLoaded = progressEvent.loaded;
        lastTime = now;

        const progress = Math.min((progressEvent.loaded / totalBytes) * 100, 100);
        onProgress(smoothMbps, instantMbps, progress);
      }
    }
  });
  return response.data;
};

export const submitUploadResults = async (data) => {
  const response = await api.post('/speed/tests/upload', data);
  return response.data;
};
