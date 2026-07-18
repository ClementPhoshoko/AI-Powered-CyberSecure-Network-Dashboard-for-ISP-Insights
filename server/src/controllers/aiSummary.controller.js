const AiSummaryService = require('../services/aiSummary.service');
const { z } = require('zod');

// Zod validation for summary request
const summaryRequestSchema = z.object({
  test_result_id: z.string().uuid()
});

// @desc    Generate and save AI summary for a test result
// @route   POST /api/network/summary
// @access  Public (optional auth)
const generateSummary = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const anonymousId = req.anonymousId || null;
    const validatedData = summaryRequestSchema.parse(req.body);

    const result = await AiSummaryService.generateSummary(
      userId,
      anonymousId,
      validatedData.test_result_id
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
  generateSummary
};
