const { supabase, supabaseAdmin } = require('../config/db');

class PingMeasurement {
  // Create a single ping measurement
  static async create(pingData) {
    const { data, error } = await supabase
      .from('ping_measurements')
      .insert([pingData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Bulk create ping measurements
  static async bulkCreate(pingMeasurementsArray) {
    const { data, error } = await supabase
      .from('ping_measurements')
      .insert(pingMeasurementsArray)
      .select();
    if (error) throw error;
    return data;
  }

  // Find all ping measurements for a test result
  static async findByTestResultId(testResultId) {
    const { data, error } = await supabase
      .from('ping_measurements')
      .select('*')
      .eq('test_result_id', testResultId)
      .order('sequence_number', { ascending: true });
    if (error) throw error;
    return data;
  }
}

module.exports = PingMeasurement;

/*
 * PingMeasurement Model Notes:
 * - Stores raw ping latency data for a single network test
 * - Each test result can have many ping measurements (1:many relationship)
 * - 'sequence_number' keeps pings ordered chronologically
 * - Used to calculate aggregate metrics like jitter, avg ping, etc.
 * - RLS policies ensure users can only access pings from their own tests
 */
