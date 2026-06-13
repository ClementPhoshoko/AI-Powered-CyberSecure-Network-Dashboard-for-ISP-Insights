const SpeedService = require('../services/speed.service');
const { z } = require('zod');

// Allowed test sizes in MB
const ALLOWED_SIZES = [1, 5, 10, 20];

// Zod validation for download test size query param
const downloadTestQuerySchema = z.object({
  sizeMb: z.preprocess(
    (val) => Number(val),
    z.number().int().refine((val) => ALLOWED_SIZES.includes(val), {
      message: `sizeMb must be one of: ${ALLOWED_SIZES.join(', ')}`
    })
  )
});

// Zod validation for single download result submission
const downloadResultSchema = z.object({
  test_result_id: z.string().uuid(),
  download_speed_mbps: z.number().positive(),
  file_size_mb: z.number().int().refine((val) => ALLOWED_SIZES.includes(val), {
    message: `file_size_mb must be one of: ${ALLOWED_SIZES.join(', ')}`
  }),
  test_duration_seconds: z.number().positive()
});

// Zod validation for multiple download results submission
const multipleDownloadResultsSchema = z.object({
  test_result_id: z.string().uuid(),
  final_result: downloadResultSchema.omit({ test_result_id: true }),
  all_measurements: z.array(
    z.object({
      file_size_mb: z.number().int().refine((val) => ALLOWED_SIZES.includes(val), {
        message: `file_size_mb must be one of: ${ALLOWED_SIZES.join(', ')}`
      }),
      download_speed_mbps: z.number().positive(),
      test_duration_seconds: z.number().positive()
    })
  ).min(1)
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
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
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
// @access  Private (requires JWT)
const submitDownloadResults = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = multipleDownloadResultsSchema.parse(req.body);

    const result = await SpeedService.submitDownloadResults(
      userId,
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

module.exports = {
  streamDownloadTest,
  submitDownloadResults
};
