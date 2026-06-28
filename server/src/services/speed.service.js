const TestResult = require('../models/TestResult');
const DownloadMeasurement = require('../models/DownloadMeasurement');
const UploadMeasurement = require('../models/UploadMeasurement');
const crypto = require('crypto');

// Cache a large chunk of random data for faster streaming
const CACHED_RANDOM_DATA = crypto.randomBytes(1 * 1024 * 1024); // 1MB cached random data

class SpeedService {
  // Generate random binary data efficiently (for streaming)
  static generateRandomDataStream(sizeMb) {
    const sizeBytes = sizeMb * 1024 * 1024;
    let bytesSent = 0;
    const chunkSize = 64 * 1024; // 64KB chunks
    const cacheSize = CACHED_RANDOM_DATA.length;

    return {
      get sizeBytes() { return sizeBytes; },
      [Symbol.asyncIterator]() {
        return {
          next() {
            if (bytesSent >= sizeBytes) {
              return { done: true };
            }
            const remaining = sizeBytes - bytesSent;
            const currentChunkSize = Math.min(chunkSize, remaining);
            
            // Use cached random data for faster streaming
            let chunk;
            if (currentChunkSize <= cacheSize) {
              // Slice from cached data
              const offset = bytesSent % cacheSize;
              if (offset + currentChunkSize <= cacheSize) {
                chunk = CACHED_RANDOM_DATA.slice(offset, offset + currentChunkSize);
              } else {
                // Wrap around if needed
                const part1 = CACHED_RANDOM_DATA.slice(offset);
                const part2 = CACHED_RANDOM_DATA.slice(0, currentChunkSize - part1.length);
                chunk = Buffer.concat([part1, part2]);
              }
            } else {
              // Fall back to generating new data for very large chunks
              chunk = crypto.randomBytes(currentChunkSize);
            }
            
            bytesSent += currentChunkSize;
            return { done: false, value: chunk };
          }
        };
      }
    };
  }

  // Submit download results (final + all individual measurements)
  static async submitDownloadResults(userId, testResultId, finalResult, allMeasurements) {
    // First verify user owns the test result
    const testResult = await TestResult.findById(testResultId);
    if (!testResult) {
      throw new Error('Test result not found');
    }
    if (testResult.user_id !== userId) {
      throw new Error('Unauthorized: You do not own this test result');
    }

    // Update the test result with final data
    const updatedTestResult = await TestResult.update(testResultId, {
      download_speed_mbps: finalResult.download_speed_mbps,
      download_test_size_mb: finalResult.file_size_mb,
      download_test_duration_seconds: finalResult.test_duration_seconds
    });

    // Prepare measurements for insertion
    const measurementsToInsert = allMeasurements.map(m => ({
      test_result_id: testResultId,
      file_size_mb: m.file_size_mb,
      download_speed_mbps: m.download_speed_mbps,
      test_duration_seconds: m.test_duration_seconds
    }));

    // Bulk insert measurements
    const insertedMeasurements = await DownloadMeasurement.bulkCreate(measurementsToInsert);

    return {
      testResult: updatedTestResult,
      downloadMeasurements: insertedMeasurements
    };
  }

  // Submit upload results (final + all individual measurements)
  static async submitUploadResults(userId, testResultId, finalUploadSpeedMbps, allMeasurements) {
    // First verify user owns the test result
    const testResult = await TestResult.findById(testResultId);
    if (!testResult) {
      throw new Error('Test result not found');
    }
    if (testResult.user_id !== userId) {
      throw new Error('Unauthorized: You do not own this test result');
    }

    // Keep the saved summary aligned with the last successful adaptive upload measurement.
    const finalMeasurement = allMeasurements[allMeasurements.length - 1];

    // Update the test result with final data
    const updatedTestResult = await TestResult.update(testResultId, {
      upload_speed_mbps: finalUploadSpeedMbps,
      upload_test_size_mb: finalMeasurement.size_mb,
      upload_test_duration_seconds: finalMeasurement.duration_seconds
    });

    // Prepare measurements for insertion
    const measurementsToInsert = allMeasurements.map(m => ({
      test_result_id: testResultId,
      file_size_mb: m.size_mb,
      upload_speed_mbps: m.upload_speed_mbps,
      test_duration_seconds: m.duration_seconds
    }));

    // Bulk insert measurements
    const insertedMeasurements = await UploadMeasurement.bulkCreate(measurementsToInsert);

    return {
      testResult: updatedTestResult,
      uploadMeasurements: insertedMeasurements
    };
  }
}

module.exports = SpeedService;
