const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Supabase POSTGRES Connection String usually looks like:
// postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

// Since we have NEXT_PUBLIC_SUPABASE_URL and anon key in .env, wait let me check if we have the DB URI.
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.log("No DATABASE_URL found in .env.local, checking for standard supabase db string or we must ask user.");
    console.log('ENV keys available:', Object.keys(process.env));
    process.exit(0);
}

const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    await client.connect();
    console.log('Connected to DB');

    const sql = fs.readFileSync('D:/mudralaya/supabase/migrations/20260303200108_create_blogs_table.sql', 'utf8');

    try {
        const res = await client.query(sql);
        console.log('Migration Success:', res);
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
