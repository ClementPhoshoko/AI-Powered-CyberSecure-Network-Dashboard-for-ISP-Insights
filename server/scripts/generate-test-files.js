const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SIZES_MB = [2, 5, 10, 20, 50, 100];
const OUT_DIR = path.join(__dirname, '..', 'public', 'speedtest', 'download');

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const mb of SIZES_MB) {
  const filePath = path.join(OUT_DIR, `${mb}mb.bin`);
  const totalBytes = mb * 1024 * 1024;

  if (fs.existsSync(filePath) && fs.statSync(filePath).size === totalBytes) {
    console.log(`Skipping ${mb}mb.bin (already exists)`);
    continue;
  }

  console.log(`Generating ${mb} MB (${totalBytes} bytes)...`);
  const ws = fs.createWriteStream(filePath);
  const CHUNK = 256 * 1024;
  let written = 0;

  return new Promise((resolve, reject) => {
    const write = () => {
      while (written < totalBytes) {
        const size = Math.min(CHUNK, totalBytes - written);
        const buf = crypto.randomBytes(size);
        const canContinue = ws.write(buf);
        written += size;
        if (!canContinue) {
          ws.once('drain', write);
          return;
        }
      }
      ws.end();
    };
    ws.on('finish', () => { console.log(`  Done: ${filePath}`); resolve(); });
    ws.on('error', reject);
    write();
  });
}
