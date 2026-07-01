const { supabase, supabaseAdmin } = require('../config/db');

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
    const { data, error } = await supabaseAdmin
      .from('port_risk_assessments')
      .select(`
        *,
        port_scan_results (*),
        security_recommendations (*)
      `)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Find assessment by test result ID
  static async findByTestResultId(testResultId) {
    const { data, error } = await supabaseAdmin
      .from('port_risk_assessments')
      .select(`
        *,
        port_scan_results (*),
        security_recommendations (*)
      `)
      .eq('test_result_id', testResultId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Find all assessments for a user
  static async findByUserId(userId) {
    const { data, error } = await supabaseAdmin
      .from('port_risk_assessments')
      .select(`
        *,
        test_results (id, created_at)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Filter to only include assessments belonging to the user
    return data.filter(assessment => 
      assessment.test_results && assessment.test_results.length > 0
    );
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