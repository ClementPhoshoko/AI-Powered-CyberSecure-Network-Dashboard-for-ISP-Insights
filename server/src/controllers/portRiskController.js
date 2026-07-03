const PortRiskService = require('../services/portRisk.service');
const PortRiskAssessment = require('../models/PortRiskAssessment');
const PortKnowledgeBase = require('../models/PortKnowledgeBase');
const { z } = require('zod');

// Zod validation for assessment request
const assessmentRequestSchema = z.object({
  test_result_id: z.string().uuid()
});

// Zod validation for standalone scan
const standaloneScanSchema = z.object({
  ip_address: z.string().optional()
});

// @desc    Run full port risk assessment
// @route   POST /api/port-risk/assess
// @access  Private
const runPortRiskAssessment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = assessmentRequestSchema.parse(req.body);

    const result = await PortRiskService.runPortRiskAssessment(
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

// @desc    Run standalone port risk assessment (no speed test required)
// @route   POST /api/port-risk/standalone
// @access  Private
const runStandalonePortRiskAssessment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const validatedData = standaloneScanSchema.parse(req.body);

    const result = await PortRiskService.runStandalonePortRiskAssessment(
      userId,
      validatedData.ip_address
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get port risk assessment by ID
// @route   GET /api/port-risk/assessment/:id
// @access  Private
const getPortRiskAssessment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const assessment = await PortRiskAssessment.findById(id);
    if (!assessment) {
      return res.status(404).json({
        status: 'error',
        message: 'Port risk assessment not found'
      });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      status: 'success',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get port risk assessment by test result ID
// @route   GET /api/port-risk/test-result/:testResultId
// @access  Private
const getPortRiskAssessmentByTestResult = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { testResultId } = req.params;

    const assessment = await PortRiskAssessment.findByTestResultId(testResultId);
    if (!assessment) {
      return res.status(404).json({
        status: 'error',
        message: 'Port risk assessment not found for this test'
      });
    }

    if (assessment.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      status: 'success',
      data: assessment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all port risk assessments for current user
// @route   GET /api/port-risk/assessments
// @access  Private
const getUserPortRiskAssessments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const assessments = await PortRiskAssessment.findByUserId(userId);

    res.status(200).json({
      status: 'success',
      data: assessments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get port knowledge base
// @route   GET /api/port-risk/knowledge-base
// @access  Public
const getPortKnowledgeBase = async (req, res, next) => {
  try {
    const ports = await PortKnowledgeBase.findAll();

    res.status(200).json({
      status: 'success',
      data: ports
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  runPortRiskAssessment,
  runStandalonePortRiskAssessment,
  getPortRiskAssessment,
  getPortRiskAssessmentByTestResult,
  getUserPortRiskAssessments,
  getPortKnowledgeBase
};