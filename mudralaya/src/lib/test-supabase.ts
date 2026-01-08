"use client";

import { supabase } from "./supabase";

export const testSupabaseConnection = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("Supabase URL present:", !!url);
  console.log("Supabase Key present:", !!key);

  if (!url || !key) {
    return { error: "Missing environment variables" };
  }

  try {
    const { data, error } = await supabase.from("_unused_table_just_to_test").select("*").limit(1);
    // 404 is actually "ok" for connection test if the table doesn't exist, 
    // but 401/403 means auth issue.
    return { data, error };
  } catch (err) {
    return { error: err };
  }
};
