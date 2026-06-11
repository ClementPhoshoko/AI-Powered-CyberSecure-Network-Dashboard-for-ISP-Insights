const { supabase, supabaseAdmin } = require('../config/db');

class TestResult {
  // Create a new test result
  static async create(testData) {
    const { data, error } = await supabase
      .from('test_results')
      .insert([testData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Find test result by ID
  static async findById(id) {
    const { data, error } = await supabase
      .from('test_results')
      .select(`
        *,
        ping_measurements (*),
        anomaly_logs (*)
      `)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Find all test results for current user
  static async findByCurrentUser(limit = 100, offset = 0) {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  }

  // Get network summary for current user (from network_summary view)
  static async getNetworkSummary() {
    const { data, error } = await supabase
      .from('network_summary')
      .select('*')
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Delete test result
  static async delete(id) {
    const { data, error } = await supabase
      .from('test_results')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  }

  // Admin: Get all test results
  static async findAll(limit = 100, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('test_results')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  }
}

module.exports = TestResult;

/*
 * TestResult Model Notes:
 * - Core table storing complete network test data (speed, latency, quality, etc.)
 * - Each user can have many test results (1:many with auth.users)
 * - Aggregates raw ping data into summary metrics (avg ping, jitter, etc.)
 * - Includes quality scores for gaming, streaming, video calls, browsing
 * - 'findById' eagerly loads related ping_measurements and anomaly_logs
 * - 'getNetworkSummary' uses the network_summary view for quick analytics
 * - RLS policies ensure users can only read/write their own test results
 */
