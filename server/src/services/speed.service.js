const TestResult = require('../models/TestResult');
const DownloadMeasurement = require('../models/DownloadMeasurement');
const crypto = require('crypto');

class SpeedService {
  // Generate random binary data efficiently (for streaming)
  static generateRandomDataStream(sizeMb) {
    const sizeBytes = sizeMb * 1024 * 1024;
    let bytesSent = 0;
    const chunkSize = 64 * 1024; // 64KB chunks

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
            bytesSent += currentChunkSize;
            const chunk = crypto.randomBytes(currentChunkSize);
            return { done: false, value: chunk };
          }
        };
      }
    };
  }

  // Update test result with download speed data
  static async updateDownloadResult(userId, testResultId, downloadData) {
    // First verify user owns the test result
    const testResult = await TestResult.findById(testResultId);
    if (!testResult) {
      throw new Error('Test result not found');
    }
    if (testResult.user_id !== userId) {
      throw new Error('Unauthorized: You do not own this test result');
    }

    // Update the test result
    const { data, error } = await TestResult.update(testResultId, {
      download_speed_mbps: downloadData.download_speed_mbps,
      download_test_size_mb: downloadData.file_size_mb,
      download_test_duration_seconds: downloadData.test_duration_seconds
    });

    if (error) throw error;
    return data;
  }

  // Submit multiple download results and update test result
  static async submitMultipleDownloadResults(userId, testResultId, finalResult, allMeasurements) {
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
      measurements: insertedMeasurements
    };
  }
}

module.exports = SpeedService;
