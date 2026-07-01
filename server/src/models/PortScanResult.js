const { supabase, supabaseAdmin } = require('../config/db');

class PortScanResult {
  // Create a new port scan result
  static async create(scanData) {
    const { data, error } = await supabaseAdmin
      .from('port_scan_results')
      .insert([scanData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Create multiple port scan results
  static async createMany(scanResults) {
    const { data, error } = await supabaseAdmin
      .from('port_scan_results')
      .insert(scanResults)
      .select();
    if (error) throw error;
    return data;
  }

  // Find all port scan results for a test result ID
  static async findByTestResultId(testResultId) {
    const { data, error } = await supabaseAdmin
      .from('port_scan_results')
      .select('*')
      .eq('test_result_id', testResultId)
      .order('port_number');
    if (error) throw error;
    return data;
  }

  // Find open ports for a test result ID
  static async findOpenPortsByTestResultId(testResultId) {
    const { data, error } = await supabaseAdmin
      .from('port_scan_results')
      .select('*')
      .eq('test_result_id', testResultId)
      .eq('port_state', 'open')
      .order('port_number');
    if (error) throw error;
    return data;
  }

  // Delete all port scan results for a test
  static async deleteByTestResultId(testResultId) {
    const { data, error } = await supabaseAdmin
      .from('port_scan_results')
      .delete()
      .eq('test_result_id', testResultId)
      .select();
    if (error) throw error;
    return data;
  }
}

module.exports = PortScanResult;