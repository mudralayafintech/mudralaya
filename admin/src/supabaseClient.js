import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://mhsizqmhqngcaztresmh.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oc2l6cW1ocW5nY2F6dHJlc21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjQ0NDYsImV4cCI6MjA4MjYwMDQ0Nn0.mURvS7dVh0jE5SSWDW2laVe00IhpUtgizBuMWPzEKH0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
