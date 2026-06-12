const { supabaseAdmin } = require('../config/db');

class Profile {
  // Find profile by user ID
  static async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Update profile
  static async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Delete profile
  static async delete(id) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  }
}

module.exports = Profile;

/*
 * Profile Model Notes:
 * - This model maps to the 'profiles' table in our database
 * - The 'profiles' table extends Supabase Auth's built-in 'auth.users' table
 * - Each user has exactly one profile (1:1 relationship)
 * - Profile ID is the same as the Supabase Auth user ID for consistency
 * - RLS policies ensure users can only read/write their own profile
 * - Use 'create' only after a user signs up (triggered by Supabase Auth hook)
 */
