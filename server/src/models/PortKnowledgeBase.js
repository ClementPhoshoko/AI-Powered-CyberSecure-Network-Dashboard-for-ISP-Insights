const { supabase, supabaseAdmin } = require('../config/db');

class PortKnowledgeBase {
  // Get all ports in knowledge base
  static async findAll() {
    const { data, error } = await supabase
      .from('port_knowledge_base')
      .select('*')
      .order('port_number');
    if (error) throw error;
    return data;
  }

  // Get port by number and protocol
  static async findByPortAndProtocol(portNumber, protocol = 'tcp') {
    const { data, error } = await supabase
      .from('port_knowledge_base')
      .select('*')
      .eq('port_number', portNumber)
      .eq('protocol', protocol)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Get all common ports
  static async findCommonPorts() {
    const { data, error } = await supabase
      .from('port_knowledge_base')
      .select('*')
      .eq('is_common', true)
      .order('port_number');
    if (error) throw error;
    return data;
  }

  // Get ports by risk level
  static async findByRiskLevel(riskLevel) {
    const { data, error } = await supabase
      .from('port_knowledge_base')
      .select('*')
      .eq('risk_level', riskLevel)
      .order('port_number');
    if (error) throw error;
    return data;
  }

  // Create new port entry
  static async create(portData) {
    const { data, error } = await supabaseAdmin
      .from('port_knowledge_base')
      .insert([portData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Update port entry
  static async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('port_knowledge_base')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Delete port entry
  static async delete(id) {
    const { data, error } = await supabaseAdmin
      .from('port_knowledge_base')
      .delete()
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  }
}

module.exports = PortKnowledgeBase;