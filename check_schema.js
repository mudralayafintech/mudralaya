
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase.rpc('inspect_table', { table_name: 'tasks' });
  if (error) {
    // If RPC doesn't exist, try a simple select
    console.log("RPC inspect_table failed, trying simple select");
    const { data: task, error: selectError } = await supabase.from('tasks').select('*').limit(1);
    if (selectError) {
      console.error("Select failed:", selectError);
    } else {
      console.log("Column names:", Object.keys(task[0] || {}));
    }
  } else {
    console.log("Schema:", data);
  }
}

checkSchema();
