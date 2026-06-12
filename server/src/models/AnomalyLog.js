const { supabaseAdmin } = require('../config/db');

class AnomalyLog {
  // Create an anomaly log
  static async create(anomalyData) {
    const { data, error } = await supabaseAdmin
      .from('anomaly_logs')
      .insert([anomalyData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Bulk create anomaly logs
  static async bulkCreate(anomaliesArray) {
    const { data, error } = await supabaseAdmin
      .from('anomaly_logs')
      .insert(anomaliesArray)
      .select();
    if (error) throw error;
    return data;
  }

  // Find all anomalies for a test result
  static async findByTestResultId(testResultId) {
    const { data, error } = await supabaseAdmin
      .from('anomaly_logs')
      .select('*')
      .eq('test_result_id', testResultId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }
}

module.exports = AnomalyLog;

/*
 * AnomalyLog Model Notes:
 * - Stores detected network anomalies and security issues from a test
 * - Each test result can have many anomaly logs (1:many relationship)
 * - 'severity' can be 'low', 'medium', 'high', or 'critical'
 * - Used to provide actionable insights to users about their network health
 * - RLS policies ensure users can only access anomalies from their own tests
 */
