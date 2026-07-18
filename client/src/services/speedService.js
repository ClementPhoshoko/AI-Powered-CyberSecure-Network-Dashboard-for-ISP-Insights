import api from './api';

const PARALLEL_CONNECTIONS = 4;

export const streamDownloadTest = async (sizeMb, signal, onProgress) => {
  const totalBytes = sizeMb * 1024 * 1024;
  const chunkSizeMb = sizeMb / PARALLEL_CONNECTIONS;

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
        conn.bytesLoaded = e.loaded;

        if (onProgress) {
          const totalLoaded = connections.reduce((sum, c) => sum + c.bytesLoaded, 0);
          const globalStart = Math.min(...startTimes);
          const elapsed = (now - globalStart) / 1000;
          const speedMbps = elapsed > 0.01 ? (totalLoaded / (1024 * 1024) * 8) / elapsed : 0;
          const pct = Math.min((totalLoaded / totalBytes) * 100, 100);
          onProgress(speedMbps, speedMbps, pct);
        }
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

  const CHUNK_SIZE = 256 * 1024;
  // Build one master blob, then slice per connection so each post gets its own
  // independent Blob reference. Sharing the same Blob across concurrent uploads
  // can cause browsers to send 0 bytes on some connections.
  const masterBlob = (() => {
    const chunks = [];
    let remaining = totalBytes;
    while (remaining > 0) {
      const size = Math.min(CHUNK_SIZE, remaining);
      chunks.push(new Blob([new Uint8Array(size)]));
      remaining -= size;
    }
    return new Blob(chunks);
  })();

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
        conn.bytesLoaded = e.loaded;

        if (onProgress) {
          const totalLoaded = connections.reduce((sum, c) => sum + c.bytesLoaded, 0);
          const globalStart = Math.min(...startTimes);
          const elapsed = (now - globalStart) / 1000;
          const speedMbps = elapsed > 0.01 ? (totalLoaded / (1024 * 1024) * 8) / elapsed : 0;
          const pct = Math.min((totalLoaded / totalBytes) * 100, 100);
          onProgress(speedMbps, speedMbps, pct);
        }
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
    upload_speed_mbps: Math.max(0.01, speed),
  };
};

export const submitUploadResults = async (data) => {
  const response = await api.post('/speed/tests/upload', data);
  return response.data;
};
