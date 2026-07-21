import api from './api';

const PARALLEL_CONNECTIONS = 4;
const SLICE_COUNT = 20;
const DISCARD_TOP_PCT = 0.1;
const DISCARD_BOTTOM_PCT = 0.3;

function createThroughputSampler(totalBytes, onProgress) {
  let prevTotalBytes = 0;
  let prevTime = null;
  let smoothedSpeed = 0;
  const samples = [];

  return {
    update(connections, now) {
      const totalLoaded = connections.reduce((sum, c) => sum + c.bytesLoaded, 0);
      const pct = Math.min((totalLoaded / totalBytes) * 100, 100);

      if (prevTime === null) {
        prevTime = now;
        prevTotalBytes = totalLoaded;
        return;
      }

      const deltaTime = (now - prevTime) / 1000;
      const deltaBytes = totalLoaded - prevTotalBytes;

      prevTime = now;
      prevTotalBytes = totalLoaded;

      if (deltaTime < 0.016) return;

      const instantMbps = (deltaBytes / (1024 * 1024) * 8) / deltaTime;
      smoothedSpeed = smoothedSpeed * 0.4 + instantMbps * 0.6;
      samples.push(instantMbps);

      onProgress(smoothedSpeed, pct);
    },
    getResult() {
      if (samples.length === 0) return 0;
      return aggregateSamples(samples);
    },
    getSmoothedSpeed() {
      return smoothedSpeed;
    }
  };
}

function aggregateSamples(samples) {
  if (samples.length === 0) return 0;
  if (samples.length <= 4) {
    return samples.reduce((a, b) => a + b, 0) / samples.length;
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const discardTop = Math.ceil(sorted.length * DISCARD_TOP_PCT);
  const discardBottom = Math.ceil(sorted.length * DISCARD_BOTTOM_PCT);
  const kept = sorted.slice(discardBottom, sorted.length - discardTop);

  if (kept.length === 0) return sorted[sorted.length - 1];
  return kept.reduce((a, b) => a + b, 0) / kept.length;
}

function generateRandomBytes(sizeBytes) {
  const buf = new Uint8Array(sizeBytes);
  crypto.getRandomValues(buf);
  return buf;
}

export const streamDownloadTest = async (sizeMb, signal, onProgress) => {
  const totalBytes = sizeMb * 1024 * 1024;
  const chunkSizeMb = sizeMb / PARALLEL_CONNECTIONS;
  const sampler = createThroughputSampler(totalBytes, (speed, pct) => {
    if (onProgress) onProgress(speed, speed, pct);
  });

  const connections = Array.from({ length: PARALLEL_CONNECTIONS }, () => ({
    bytesLoaded: 0,
    startTime: null,
    endTime: null,
    done: false,
  }));

  const cacheBuster = Math.random().toString(36).slice(2);

  const promises = connections.map((conn) => {
    return api.get('/speed/download', {
      params: { sizeMb: chunkSizeMb, cb: cacheBuster },
      responseType: 'blob',
      signal,
      onDownloadProgress: (e) => {
        const now = performance.now();
        if (!conn.startTime) {
          conn.startTime = now;
        }
        conn.bytesLoaded = Math.max(conn.bytesLoaded, e.loaded);
        sampler.update(connections, now);
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

  const sampledSpeed = sampler.getResult();
  const fallbackSpeed = (totalBytes / (1024 * 1024) * 8) / elapsed;
  const speed = sampledSpeed > 0 ? sampledSpeed : fallbackSpeed;

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
  const sampler = createThroughputSampler(totalBytes, (speed, pct) => {
    if (onProgress) onProgress(speed, speed, pct);
  });

  const randomData = generateRandomBytes(totalBytes);
  const masterBlob = new Blob([randomData]);

  const connections = Array.from({ length: PARALLEL_CONNECTIONS }, () => ({
    bytesLoaded: 0,
    startTime: null,
    endTime: null,
    done: false,
  }));

  const cacheBuster = Math.random().toString(36).slice(2);

  const promises = connections.map((conn, i) => {
    const sliceStart = i * chunkSizeBytes;
    const sliceEnd = sliceStart + chunkSizeBytes;
    const blobSlice = masterBlob.slice(sliceStart, sliceEnd);

    return api.post('/speed/upload', blobSlice, {
      params: { sizeMb: chunkSizeMb, cb: cacheBuster },
      headers: { 'Content-Type': 'application/octet-stream' },
      signal,
      onUploadProgress: (e) => {
        const now = performance.now();
        if (!conn.startTime) {
          conn.startTime = now;
        }
        conn.bytesLoaded = Math.max(conn.bytesLoaded, e.loaded);
        sampler.update(connections, now);
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

  const sampledSpeed = sampler.getResult();
  const fallbackSpeed = (totalBytes / (1024 * 1024) * 8) / elapsed;
  const speed = sampledSpeed > 0 ? sampledSpeed : fallbackSpeed;

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
