import api from './api';

const TIMER_INTERVAL_MS = 50;
const CONNECTION_DISCARD_PCT = 0.25;

export function getOptimalConnectionCount(avgRttMs) {
  if (avgRttMs < 20) return 8;
  if (avgRttMs < 50) return 6;
  if (avgRttMs < 100) return 4;
  return 2;
}

function createTimerSampler(totalBytes, onProgress) {
  let prevTotalBytes = 0;
  let prevTime = null;
  let smoothedSpeed = 0;
  let timerId = null;
  let conns = null;

  return {
    start(connections) {
      conns = connections;
      prevTime = performance.now();
      prevTotalBytes = 0;

      timerId = setInterval(() => {
        const now = performance.now();
        const totalLoaded = conns.reduce((sum, c) => sum + c.bytesLoaded, 0);
        const pct = Math.min((totalLoaded / totalBytes) * 100, 100);

        const deltaTime = (now - prevTime) / 1000;
        const deltaBytes = totalLoaded - prevTotalBytes;

        prevTime = now;
        prevTotalBytes = totalLoaded;

        if (deltaTime < 0.01) return;

        const instantMbps = (deltaBytes / (1024 * 1024) * 8) / deltaTime;
        smoothedSpeed = smoothedSpeed * 0.4 + instantMbps * 0.6;

        onProgress(smoothedSpeed, pct);
      }, TIMER_INTERVAL_MS);
    },
    stop() {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    },
    getSmoothedSpeed() {
      return smoothedSpeed;
    }
  };
}

function aggregateConnections(connections) {
  const connResults = connections
    .filter(c => c.endTime && c.startTime && c.bytesLoaded > 0)
    .map(c => {
      const duration = (c.endTime - c.startTime) / 1000;
      const speed = duration > 0 ? (c.bytesLoaded / (1024 * 1024) * 8) / duration : 0;
      return { bytes: c.bytesLoaded, duration, speed };
    })
    .filter(c => c.duration > 0.001 && c.speed > 0);

  if (connResults.length === 0) return 0;
  if (connResults.length <= 2) {
    return connResults.reduce((sum, c) => sum + c.speed, 0) / connResults.length;
  }

  connResults.sort((a, b) => a.speed - b.speed);
  const discardCount = Math.max(1, Math.ceil(connResults.length * CONNECTION_DISCARD_PCT));
  const kept = connResults.slice(discardCount);

  if (kept.length === 0) return connResults[connResults.length - 1].speed;
  return kept.reduce((sum, c) => sum + c.speed, 0) / kept.length;
}

function generateRandomBytes(sizeBytes) {
  const RANDOM_CHUNK = 65536;
  const buf = new Uint8Array(sizeBytes);
  for (let offset = 0; offset < sizeBytes; offset += RANDOM_CHUNK) {
    const end = Math.min(offset + RANDOM_CHUNK, sizeBytes);
    crypto.getRandomValues(buf.subarray(offset, end));
  }
  return buf;
}

export const streamDownloadTest = async (sizeMb, signal, onProgress, connectionCount) => {
  const totalBytes = sizeMb * 1024 * 1024;
  const conns = connectionCount || 4;
  const chunkSizeMb = sizeMb / conns;
  const sampler = createTimerSampler(totalBytes, (speed, pct) => {
    if (onProgress) onProgress(speed, speed, pct);
  });

  const connections = Array.from({ length: conns }, () => ({
    bytesLoaded: 0,
    startTime: null,
    endTime: null,
    done: false,
  }));

  const cacheBuster = Math.random().toString(36).slice(2);

  const promises = connections.map((conn) => {
    conn.startTime = performance.now();
    return api.get('/speed/download', {
      params: { sizeMb: chunkSizeMb, cb: cacheBuster },
      responseType: 'arraybuffer',
      signal,
      onDownloadProgress: (e) => {
        conn.bytesLoaded = Math.max(conn.bytesLoaded, e.loaded);
      },
    }).then(() => {
      conn.done = true;
      conn.endTime = performance.now();
      conn.bytesLoaded = chunkSizeMb * 1024 * 1024;
    });
  });

  sampler.start(connections);

  try {
    await Promise.all(promises);
  } finally {
    sampler.stop();
  }

  const speed = aggregateConnections(connections);
  const globalStart = Math.min(...connections.map((c) => c.startTime));
  const globalEnd = Math.max(...connections.map((c) => c.endTime));
  const elapsed = (globalEnd - globalStart) / 1000;

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

export const streamUploadTest = async (sizeMb, signal, onProgress, connectionCount) => {
  const totalBytes = sizeMb * 1024 * 1024;
  const conns = connectionCount || 4;
  const chunkSizeMb = sizeMb / conns;
  const chunkSizeBytes = chunkSizeMb * 1024 * 1024;
  const sampler = createTimerSampler(totalBytes, (speed, pct) => {
    if (onProgress) onProgress(speed, speed, pct);
  });

  const connections = Array.from({ length: conns }, () => ({
    bytesLoaded: 0,
    startTime: null,
    endTime: null,
    done: false,
  }));

  const cacheBuster = Math.random().toString(36).slice(2);

  const blobSlices = Array.from({ length: conns }, () => {
    const data = generateRandomBytes(chunkSizeBytes);
    return new Blob([data]);
  });

  const promises = connections.map((conn, i) => {
    conn.startTime = performance.now();
    return api.post('/speed/upload', blobSlices[i], {
      params: { sizeMb: chunkSizeMb, cb: cacheBuster },
      headers: { 'Content-Type': 'application/octet-stream' },
      signal,
      onUploadProgress: (e) => {
        conn.bytesLoaded = Math.max(conn.bytesLoaded, e.loaded);
      },
    }).then(() => {
      conn.done = true;
      conn.endTime = performance.now();
      conn.bytesLoaded = chunkSizeBytes;
    });
  });

  sampler.start(connections);

  try {
    await Promise.all(promises);
  } finally {
    sampler.stop();
  }

  const speed = aggregateConnections(connections);
  const globalStart = Math.min(...connections.map((c) => c.startTime));
  const globalEnd = Math.max(...connections.map((c) => c.endTime));
  const elapsed = (globalEnd - globalStart) / 1000;

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
