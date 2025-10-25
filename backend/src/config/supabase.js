const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// console.log("🔐 Initializing Supabase...");
// console.log("URL:", supabaseUrl);
// console.log("Key (first 20 chars):", supabaseKey?.substring(0, 20) + "...");

if (!supabaseUrl || !supabaseKey) {
  // console.error("❌ Missing Supabase credentials");
  throw new Error("Supabase credentials not configured");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// console.log("✅ Supabase initialized successfully");

module.exports = supabase;
