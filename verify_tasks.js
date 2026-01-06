const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)).catch(() => global.fetch(...args));
const fs = require('fs');

async function test() {
    const baseURL = 'http://localhost:5000/api';

    // Helper for JSON request
    const postJSON = async (url, data) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw { response: { data: json } };
        return { data: json };
    };

    const getJSON = async (url) => {
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) throw { response: { data: json } };
        return { data: json };
    };

    const userEmail = 'test@mudralya.com';

    // 0. Create User (Join Request)
    console.log('--- Creating Dummy User ---');
    try {
        await postJSON(`${baseURL}/join`, {
            fullName: 'Test User',
            emailId: userEmail,
            mobileNumber: '9999999999', // Unique dummy
            dateOfBirth: '2000-01-01',
            profession: 'student'
        });
        console.log('User Created/Exists');
    } catch (e) {
        const errData = e.response?.data || e;
        fs.writeFileSync('verify_error.log', JSON.stringify(errData, null, 2));
        console.log('User Create Err written to verify_error.log');
    }

    // 1. Create Task
    console.log('--- Creating Task ---');
    let taskId;
    try {
        const createRes = await postJSON(`${baseURL}/admin/tasks`, {
            title: 'Verify Script Task',
            description: 'Created via script',
            reward: 50,
            type: 'Daily Task',
            link: 'http://test.com',
            action_required: 'signup'
        });
        console.log('Task Created:', createRes.data);
        taskId = createRes.data._id;
    } catch (e) {
        console.error('Create Failed:', e.response?.data || e);
        return;
    }

    // 2. Assign Task
    console.log('\n--- Assigning Task ---');
    try {
        const assignRes = await postJSON(`${baseURL}/admin/tasks/assign`, {
            taskId,
            userIdentifier: userEmail
        });
        console.log('Assign Result:', assignRes.data);
    } catch (e) {
        console.error('Assign Failed:', e.response?.data || e);
    }

    // 3. fetch tasks for user
    console.log('\n--- Fetching Tasks for User ---');
    try {
        const fetchRes = await getJSON(`${baseURL}/client-dashboard/tasks?email=${userEmail}`);
        console.log('Tasks for User:', fetchRes.data);
    } catch (e) {
        console.error('Fetch Failed:', e.response?.data || e);
    }
}

test();
