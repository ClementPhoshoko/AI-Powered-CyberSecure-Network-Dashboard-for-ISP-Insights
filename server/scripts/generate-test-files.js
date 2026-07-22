const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SIZES_MB = [2, 5, 10, 20, 50, 100, 200];
const OUT_DIR = path.join(__dirname, '..', 'public', 'speedtest', 'download');
const CHUNK = 1024 * 1024; // 1 MB per chunk

/**
 * Generate all pre-randomised test files synchronously.
 * Called at server startup so files exist before any requests arrive.
 */
function generateAll() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const mb of SIZES_MB) {
    const filePath = path.join(OUT_DIR, `${mb}mb.bin`);
    const totalBytes = mb * 1024 * 1024;

    if (fs.existsSync(filePath) && fs.statSync(filePath).size === totalBytes) {
      console.log(`[generate] Skipping ${mb}mb.bin (already exists)`);
      continue;
    }

    console.log(`[generate] Writing ${mb} MB (${totalBytes} bytes)...`);
    const fd = fs.openSync(filePath, 'w');
    try {
      let written = 0;
      while (written < totalBytes) {
        const size = Math.min(CHUNK, totalBytes - written);
        const buf = crypto.randomBytes(size);
        fs.writeSync(fd, buf, 0, size, null);
        written += size;
      }
    } finally {
      fs.closeSync(fd);
    }
    console.log(`[generate]   Done: ${filePath}`);
  }

  console.log('[generate] All test files ready.');
}

module.exports = { generateAll };

if (require.main === module) {
  generateAll();
}
