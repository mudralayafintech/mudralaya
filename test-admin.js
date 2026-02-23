async function testAdminApi() {
    const url = 'https://mhsizqmhqngcaztresmh.supabase.co/functions/v1/admin-api';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oc2l6cW1ocW5nY2F6dHJlc21oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMjQ0NDYsImV4cCI6MjA4MjYwMDQ0Nn0.mURvS7dVh0jE5SSWDW2laVe00IhpUtgizBuMWPzEKH0';

    console.log(`Sending POST to ${url}...`);

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${anonKey}`,
                'apikey': anonKey
            },
            body: JSON.stringify({
                action: 'login',
                data: {
                    username: 'admin',
                    password: 'changeme'
                }
            })
        });

        const text = await res.text();
        console.log(`Status: ${res.status}`);
        console.log(`Body: ${text}`);
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

testAdminApi();
