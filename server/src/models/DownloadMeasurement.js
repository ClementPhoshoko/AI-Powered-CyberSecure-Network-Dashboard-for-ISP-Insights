const { supabaseAdmin } = require('../config/db');

class DownloadMeasurement {
  // Bulk insert measurements
  static async bulkCreate(measurements) {
    const { data, error } = await supabaseAdmin
      .from('download_measurements')
      .insert(measurements)
      .select();
    if (error) throw error;
    return data;
  }

  // Find all measurements for a test result
  static async findByTestResultId(testResultId) {
    const { data, error } = await supabaseAdmin
      .from('download_measurements')
      .select('*')
      .eq('test_result_id', testResultId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }
}

module.exports = DownloadMeasurement;
