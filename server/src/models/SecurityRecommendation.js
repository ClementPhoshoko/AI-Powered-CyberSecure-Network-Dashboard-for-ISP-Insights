const { supabase, supabaseAdmin } = require('../config/db');

class SecurityRecommendation {
  // Create a new recommendation
  static async create(recommendationData) {
    const { data, error } = await supabaseAdmin
      .from('security_recommendations')
      .insert([recommendationData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Create multiple recommendations
  static async createMany(recommendations) {
    const { data, error } = await supabaseAdmin
      .from('security_recommendations')
      .insert(recommendations)
      .select();
    if (error) throw error;
    return data;
  }

  // Find all recommendations for an assessment
  static async findByPortRiskAssessmentId(assessmentId) {
    const { data, error } = await supabaseAdmin
      .from('security_recommendations')
      .select('*')
      .eq('port_risk_assessment_id', assessmentId)
      .order('priority', { ascending: false }); // critical first
    if (error) throw error;
    return data;
  }

  // Mark a recommendation as resolved
  static async markResolved(id) {
    const { data, error } = await supabaseAdmin
      .from('security_recommendations')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Update a recommendation
  static async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('security_recommendations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Delete a recommendation
  static async delete(id) {
    const { data, error } = await supabaseAdmin
      .from('security_recommendations')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  }
}

module.exports = SecurityRecommendation;