const fetch = require('node-fetch');

async function testLogin() {
    try {
        const response = await fetch('https://mhsizqmhqngcaztresmh.supabase.co/functions/v1/admin-api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'login',
                data: {
                    username: 'admin',
                    password: 'changeme'
                }
            })
        });

        console.log('Status Code:', response.status);
        const text = await response.text();
        console.log('Response Body:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

testLogin();
