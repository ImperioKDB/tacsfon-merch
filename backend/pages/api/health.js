
import { supabaseAdmin } from '../../lib/supabase.js';

export default async function handler(req, res) {
  try {
    // Probe the DB to ensure the whole stack is awake
    const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);
    
    if (error) throw error;

    return res.status(200).json({ 
      success: true, 
      status: "online", 
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch (err) {
    return res.status(500).json({ success: false, status: "degraded", error: err.message });
  }
}
