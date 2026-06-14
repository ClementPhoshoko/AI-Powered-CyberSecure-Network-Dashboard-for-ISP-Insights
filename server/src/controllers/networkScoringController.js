const NetworkScoringService = require('../services/networkScoring.service');
const { z } = require('zod');

// Zod validation for score calculation request
const scoreCalculationSchema = z.object({
  test_result_id: z.string().uuid()
});

// @desc    Calculate and save network scores for a test result
// @route   POST /api/network/score
// @access  Private (requires JWT)
const calculateNetworkScores = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = scoreCalculationSchema.parse(req.body);

    const result = await NetworkScoringService.calculateAndSaveScores(
      userId,
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
  calculateNetworkScores
};
