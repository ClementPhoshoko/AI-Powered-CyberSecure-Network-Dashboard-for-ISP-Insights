const { supabaseAdmin } = require('../config/db');

class Subscriber {
  // Find subscriber by user ID
  static async findByUserId(userId) {
    console.log('Subscriber.findByUserId called with userId:', userId);
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .single();
    console.log('Subscriber.findByUserId data:', data, 'error:', error);
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Find subscriber by email
  static async findByEmail(email) {
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Create a new subscriber
  static async create(subscriberData) {
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .insert(subscriberData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Update subscriber
  static async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Delete subscriber
  static async delete(id) {
    const { data, error } = await supabaseAdmin
      .from('subscribers')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  }
}

module.exports = Subscriber;
