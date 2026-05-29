
import { supabaseAdmin } from '../../lib/supabase.js';

export default async function handler(req, res) {
  try {
    // Check if we can reach the database
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
       console.error("Database Health Error:", error);
       return res.status(503).json({ 
         success: false, 
         status: "database_error", 
         message: error.message 
       });
    }

    return res.status(200).json({ 
      success: true, 
      status: "online", 
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      status: "internal_error", 
      error: err.message 
    });
  }
}
