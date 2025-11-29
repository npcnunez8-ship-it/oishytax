import { createClient } from '@supabase/supabase-js';

// --- EMERGENCY HARDCODED KEYS ---
// This ensures the Login Page ALWAYS has the correct keys
const supabaseUrl = "https://cdndutsyztaqtiwtntts.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkbmR1dHN5enRhcXRpd3RudHRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMDQ3ODAsImV4cCI6MjA3OTc4MDc4MH0.7pFdFopbumF1JJMkoA5x-flF1-V6u1jGYFDsS-79vDA";
// --------------------------------

export const supabase = createClient(supabaseUrl, supabaseKey);
