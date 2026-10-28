// This service acts as a helper layer for Supabase operations.
// You can use the exported supabase client from config/supabase.js directly too.
import supabase from "../config/supabase.js";

class SupabaseService {
  // Example helper
  static async getClient() {
    return supabase;
  }
}

export default SupabaseService;
