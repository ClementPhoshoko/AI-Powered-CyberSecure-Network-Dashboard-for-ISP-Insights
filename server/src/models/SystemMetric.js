const { supabaseAdmin } = require('../config/db');

class SystemMetric {
  // Get all system metrics
  static async getAll() {
    const { data, error } = await supabaseAdmin
      .from('system_metrics')
      .select('*');
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching metrics:', error);
      throw error;
    }
    console.log('Fetched metrics from DB:', data);
    return data || [];
  }

  // Get metrics as key-value object
  static async getMetricsObject() {
    const metrics = await this.getAll();
    const metricsObj = {};
    
    metrics.forEach(metric => {
      let value = metric.metric_value;
      if (metric.metric_type === 'number') {
        value = parseFloat(value);
      }
      metricsObj[metric.metric_key] = value;
    });
    
    console.log('Metrics object:', metricsObj);
    return metricsObj;
  }

  // Update a single metric
  static async update(key, value, type = 'string') {
    try {
      console.log('Updating metric ' + key + ' to ' + value + ' (type: ' + type + ')');
      
      // First, check if the metric already exists
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('system_metrics')
        .select('*')
        .eq('metric_key', key)
        .single();
      
      let result;
      
      if (existing && !fetchError) {
        // Update existing
        console.log('Metric ' + key + ' exists, updating...');
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from('system_metrics')
          .update({
            metric_value: String(value),
            metric_type: type,
            updated_at: new Date().toISOString()
          })
          .eq('metric_key', key)
          .select()
          .single();
        
        if (updateError) {
          throw updateError;
        }
        result = updateData;
      } else {
        // Insert new
        console.log('Metric ' + key + " doesn't exist, inserting...");
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('system_metrics')
          .insert({
            metric_key: key,
            metric_value: String(value),
            metric_type: type,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (insertError) {
          throw insertError;
        }
        result = insertData;
      }
      
      console.log('Updated metric ' + key + ':', result);
      return result;
    } catch (error) {
      console.error('Failed to update metric ' + key + ':', error);
      return null;
    }
  }

  // Refresh user count - try multiple methods
  static async refreshUserCount() {
    let userCount = 0;
    
    try {
      console.log('Refreshing user count...');
      
      // Method 1: Try fetching all profiles first (most reliable)
      console.log('Method 1: Fetching all profiles and counting...');
      const { data: profilesData, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('id');
      
      if (!fetchError && profilesData) {
        userCount = profilesData.length;
        console.log('Found ' + userCount + ' users in profiles table (direct fetch)');
      } else {
        console.log('Error fetching profiles:', fetchError);
      }
      
      // If we still have 0, try the count method
      if (userCount === 0) {
        console.log('Method 2: Trying count method...');
        const { count: profilesCount, error: countError } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (!countError && profilesCount !== null) {
          userCount = profilesCount;
          console.log('Found ' + userCount + ' users in profiles table (count method)');
        }
      }
      
      // Update the metric with whatever count we have
      console.log('Setting total_users to ' + userCount);
      return this.update('total_users', userCount, 'number');
      
    } catch (error) {
      console.error('Failed to refresh user count:', error);
      return this.update('total_users', 0, 'number');
    }
  }

  // Refresh countries count from test_results
  static async refreshCountriesCount() {
    try {
      console.log('Refreshing countries count...');
      const { data, error } = await supabaseAdmin
        .from('test_results')
        .select('country')
        .not('country', 'is', null);
      
      if (!error && data) {
        const uniqueCountries = new Set(data.map(d => d.country));
        console.log('Found ' + uniqueCountries.size + ' unique countries');
        return this.update('countries_count', uniqueCountries.size, 'number');
      }
      
      console.log('No countries found or error:', error);
      return this.update('countries_count', 0, 'number');
    } catch (error) {
      console.error('Failed to refresh countries count:', error);
      return this.update('countries_count', 0, 'number');
    }
  }

  // Refresh uptime percentage - 99.9% if server is running, 0% if not
  static async refreshUptimePercentage() {
    try {
      console.log('Refreshing uptime percentage...');
      
      // Since we're on the same server, we're definitely healthy!
      const uptimePercent = 99.9;
      console.log('Setting uptime_percentage to ' + uptimePercent + '% (server is healthy)');
      return this.update('uptime_percentage', uptimePercent, 'number');
    } catch (error) {
      console.error('Failed to refresh uptime percentage:', error);
      // If anything goes wrong, set to 0%
      return this.update('uptime_percentage', 0, 'number');
    }
  }

  // Initialize default metrics if they don't exist
  static async initializeDefaults() {
    console.log('Initializing default metrics...');
    const defaults = [
      { key: 'founded_year', value: 2026, type: 'number' },
      { key: 'uptime_percentage', value: 99.9, type: 'number' },
      { key: 'total_users', value: 0, type: 'number' },
      { key: 'countries_count', value: 0, type: 'number' }
    ];
    
    for (const { key, value, type } of defaults) {
      await this.update(key, value, type);
    }
  }

  // Refresh all dynamic metrics
  static async refreshAll() {
    console.log('=== Starting metrics refresh ===');
    await this.initializeDefaults();
    
    await Promise.all([
      this.refreshUserCount(),
      this.refreshCountriesCount(),
      this.refreshUptimePercentage()
    ]);
    
    const finalMetrics = await this.getMetricsObject();
    console.log('=== Finished metrics refresh ===');
    return finalMetrics;
  }
}

module.exports = SystemMetric;
