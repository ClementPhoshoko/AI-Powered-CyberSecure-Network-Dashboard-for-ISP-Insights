const SpeedService = require('../services/speed.service');
const { z } = require('zod');

// Client uses parallel connections, so chunk sizes are any positive float.
const downloadTestQuerySchema = z.object({
  sizeMb: z.preprocess(
    (val) => Number(val),
    z.number().positive('sizeMb must be a positive number')
  )
});

// Zod validation for single download result submission
const downloadResultSchema = z.object({
  test_result_id: z.string().uuid(),
  download_speed_mbps: z.number().positive(),
  file_size_mb: z.number().positive(),
  test_duration_seconds: z.number().positive()
});

// Zod validation for multiple download results submission
const multipleDownloadResultsSchema = z.object({
  test_result_id: z.string().uuid(),
  final_result: downloadResultSchema.omit({ test_result_id: true }),
  all_measurements: z.array(
    z.object({
      file_size_mb: z.number().positive(),
      download_speed_mbps: z.number().positive(),
      test_duration_seconds: z.number().positive()
    })
  ).min(1)
});

// Zod validation for upload test size query param
const uploadTestQuerySchema = z.object({
  sizeMb: z.preprocess(
    (val) => Number(val),
    z.number().positive('sizeMb must be a positive number')
  )
});

// Zod validation for multiple upload results submission
const multipleUploadResultsSchema = z.object({
  test_result_id: z.string().uuid(),
  measurements: z.array(
    z.object({
      size_mb: z.number().positive(),
      duration_seconds: z.number().positive(),
      upload_speed_mbps: z.number().positive()
    })
  ).min(1),
  final_upload_speed_mbps: z.number().positive(),
  was_unstable: z.boolean().optional()
});

// @desc    Stream binary data for download test
// @route   GET /api/speed/download
// @access  Public (for testing purposes)
const streamDownloadTest = async (req, res, next) => {
  try {
    const { sizeMb } = downloadTestQuerySchema.parse(req.query);
    const streamData = SpeedService.generateRandomDataStream(sizeMb);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', streamData.sizeBytes);
    res.setHeader('Content-Disposition', `attachment; filename="test-${sizeMb}mb.bin"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, no-transform');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Stream the data
    for await (const chunk of streamData) {
      if (!res.write(chunk)) {
        await new Promise(resolve => res.once('drain', resolve));
      }
    }
    res.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Submit multiple download test results
// @route   POST /api/speed/tests/download
// @access  Public (optional auth)
const submitDownloadResults = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const anonymousId = req.anonymousId || null;
    const validatedData = multipleDownloadResultsSchema.parse(req.body);

    const result = await SpeedService.submitDownloadResults(
      userId,
      anonymousId,
      validatedData.test_result_id,
      validatedData.final_result,
      validatedData.all_measurements
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Receive upload data for speed testing
// @route   POST /api/speed/upload
// @access  Public (for testing purposes)
const streamUploadTest = async (req, res, next) => {
  try {
    // Validate sizeMb query parameter
    const { sizeMb } = uploadTestQuerySchema.parse(req.query);

    // Just consume the stream without storing anything
    let bytesReceived = 0;
    req.on('data', (chunk) => {
      bytesReceived += chunk.length;
    });

    req.on('end', () => {
      res.status(200).json({
        status: 'success',
        message: 'Upload data received successfully',
        bytesReceived: bytesReceived
      });
    });

    req.on('error', (err) => {
      next(err);
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit multiple upload test results
// @route   POST /api/speed/tests/upload
// @access  Public (optional auth)
const submitUploadResults = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const anonymousId = req.anonymousId || null;
    const validatedData = multipleUploadResultsSchema.parse(req.body);

    const result = await SpeedService.submitUploadResults(
      userId,
      anonymousId,
      validatedData.test_result_id,
      validatedData.final_upload_speed_mbps,
      validatedData.measurements,
      validatedData.was_unstable || false
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  streamDownloadTest,
  submitDownloadResults,
  streamUploadTest,
  submitUploadResults
};
