import api from './api';

const PARALLEL_CONNECTIONS = 4;

function createProgressTracker(totalBytes, onProgress) {
  let prevTotalBytes = 0;
  let prevTime = null;
  let smoothedSpeed = 0;

  return {
    update(connections, now) {
      const totalLoaded = connections.reduce((sum, c) => sum + c.bytesLoaded, 0);
      const pct = Math.min((totalLoaded / totalBytes) * 100, 100);

      if (prevTime === null) {
        prevTime = now;
        prevTotalBytes = totalLoaded;
        onProgress(0, pct);
        return;
      }

      const deltaTime = (now - prevTime) / 1000;
      const deltaBytes = totalLoaded - prevTotalBytes;

      prevTime = now;
      prevTotalBytes = totalLoaded;

      if (deltaTime < 0.05) return;

      const instantMbps = (deltaBytes / (1024 * 1024) * 8) / deltaTime;
      smoothedSpeed = smoothedSpeed * 0.6 + instantMbps * 0.4;

      onProgress(smoothedSpeed, pct);
    },
    getSpeed() {
      return smoothedSpeed;
    }
  };
}

export const streamDownloadTest = async (sizeMb, signal, onProgress) => {
  const totalBytes = sizeMb * 1024 * 1024;
  const chunkSizeMb = sizeMb / PARALLEL_CONNECTIONS;
  const tracker = createProgressTracker(totalBytes, (speed, pct) => {
    if (onProgress) onProgress(speed, speed, pct);
  });

  const connections = Array.from({ length: PARALLEL_CONNECTIONS }, () => ({
    bytesLoaded: 0,
    startTime: null,
    endTime: null,
    done: false,
  }));

  const startTimes = [];

  const promises = connections.map((conn) => {
    return api.get('/speed/download', {
      params: { sizeMb: chunkSizeMb },
      responseType: 'blob',
      signal,
      onDownloadProgress: (e) => {
        const now = performance.now();
        if (!conn.startTime) {
          conn.startTime = now;
          startTimes.push(now);
        }
        conn.bytesLoaded = Math.max(conn.bytesLoaded, e.loaded);
        tracker.update(connections, now);
      },
    }).then(() => {
      conn.done = true;
      conn.endTime = performance.now();
      conn.bytesLoaded = chunkSizeMb * 1024 * 1024;
    });
  });

  await Promise.all(promises);

  const globalStart = Math.min(...connections.map((c) => c.startTime));
  const globalEnd = Math.max(...connections.map((c) => c.endTime));
  const elapsed = (globalEnd - globalStart) / 1000;
  const speed = (totalBytes / (1024 * 1024) * 8) / elapsed;

  return {
    download_speed_mbps: speed,
    file_size_mb: sizeMb,
    test_duration_seconds: elapsed,
  };
};

export const submitDownloadResults = async (data) => {
  const response = await api.post('/speed/tests/download', data);
  return response.data;
};

export const streamUploadTest = async (sizeMb, signal, onProgress) => {
  const totalBytes = sizeMb * 1024 * 1024;
  const chunkSizeMb = sizeMb / PARALLEL_CONNECTIONS;
  const chunkSizeBytes = chunkSizeMb * 1024 * 1024;
  const tracker = createProgressTracker(totalBytes, (speed, pct) => {
    if (onProgress) onProgress(speed, speed, pct);
  });

  const masterBlob = new Blob([new Uint8Array(totalBytes)]);

  const connections = Array.from({ length: PARALLEL_CONNECTIONS }, () => ({
    bytesLoaded: 0,
    startTime: null,
    endTime: null,
    done: false,
  }));

  const startTimes = [];

  const promises = connections.map((conn, i) => {
    const sliceStart = i * chunkSizeBytes;
    const sliceEnd = sliceStart + chunkSizeBytes;
    const blobSlice = masterBlob.slice(sliceStart, sliceEnd);

    return api.post('/speed/upload', blobSlice, {
      params: { sizeMb: chunkSizeMb },
      headers: { 'Content-Type': 'application/octet-stream' },
      signal,
      onUploadProgress: (e) => {
        const now = performance.now();
        if (!conn.startTime) {
          conn.startTime = now;
          startTimes.push(now);
        }
        conn.bytesLoaded = Math.max(conn.bytesLoaded, e.loaded);
        tracker.update(connections, now);
      },
    }).then(() => {
      conn.done = true;
      conn.endTime = performance.now();
      conn.bytesLoaded = chunkSizeBytes;
    });
  });

  await Promise.all(promises);

  const globalStart = Math.min(...connections.map((c) => c.startTime));
  const globalEnd = Math.max(...connections.map((c) => c.endTime));
  const elapsed = (globalEnd - globalStart) / 1000;
  const speed = (totalBytes / (1024 * 1024) * 8) / elapsed;

  return {
    size_mb: sizeMb,
    duration_seconds: elapsed,
    upload_speed_mbps: speed,
  };
};

export const submitUploadResults = async (data) => {
  const response = await api.post('/speed/tests/upload', data);
  return response.data;
};
