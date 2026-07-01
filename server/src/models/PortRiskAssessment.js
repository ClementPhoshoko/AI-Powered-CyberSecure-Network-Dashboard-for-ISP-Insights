const { supabase, supabaseAdmin } = require('../config/db');
const PortScanResult = require('./PortScanResult');
const SecurityRecommendation = require('./SecurityRecommendation');

class PortRiskAssessment {
  // Create a new port risk assessment
  static async create(assessmentData) {
    const { data, error } = await supabaseAdmin
      .from('port_risk_assessments')
      .insert([assessmentData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Find assessment by ID with scan results and recommendations
  static async findById(id) {
    // First get the assessment itself
    const { data: assessment, error: assessmentError } = await supabaseAdmin
      .from('port_risk_assessments')
      .select('*')
      .eq('id', id)
      .single();
    if (assessmentError && assessmentError.code !== 'PGRST116') throw assessmentError;
    if (!assessment) return null;

    // Then get the related data separately
    const [scanResults, recommendations] = await Promise.all([
      PortScanResult.findByTestResultId(assessment.test_result_id),
      SecurityRecommendation.findByPortRiskAssessmentId(id)
    ]);

    return {
      ...assessment,
      port_scan_results: scanResults,
      security_recommendations: recommendations
    };
  }

  // Find assessment by test result ID
  static async findByTestResultId(testResultId) {
    // First get the assessment itself
    const { data: assessment, error: assessmentError } = await supabaseAdmin
      .from('port_risk_assessments')
      .select('*')
      .eq('test_result_id', testResultId)
      .single();
    if (assessmentError && assessmentError.code !== 'PGRST116') throw assessmentError;
    if (!assessment) return null;

    // Then get the related data separately
    const [scanResults, recommendations] = await Promise.all([
      PortScanResult.findByTestResultId(testResultId),
      SecurityRecommendation.findByPortRiskAssessmentId(assessment.id)
    ]);

    return {
      ...assessment,
      port_scan_results: scanResults,
      security_recommendations: recommendations
    };
  }

  // Find all assessments for a user
  static async findByUserId(userId) {
    const { data, error } = await supabaseAdmin
      .from('port_risk_assessments')
      .select(`
        *,
        test_results (id, created_at, user_id)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Filter to only include assessments belonging to the user
    const userAssessments = data.filter(assessment => 
      assessment.test_results && assessment.test_results.user_id === userId
    );

    // For each assessment, get the related data
    const assessmentsWithDetails = await Promise.all(
      userAssessments.map(async (assessment) => {
        const [scanResults, recommendations] = await Promise.all([
          PortScanResult.findByTestResultId(assessment.test_result_id),
          SecurityRecommendation.findByPortRiskAssessmentId(assessment.id)
        ]);
        return {
          ...assessment,
          port_scan_results: scanResults,
          security_recommendations: recommendations
        };
      })
    );

    return assessmentsWithDetails;
  }

  // Update an assessment
  static async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('port_risk_assessments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Delete an assessment
  static async delete(id) {
    const { data, error } = await supabaseAdmin
      .from('port_risk_assessments')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  }
}

module.exports = PortRiskAssessment;
