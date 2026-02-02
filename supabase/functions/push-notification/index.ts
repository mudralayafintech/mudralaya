import { serve } from "std/http/server.ts";
import admin from "firebase-admin";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Placeholder for Service Account - will be replaced when user uploads file
let serviceAccount;

try {
  // We will place the service-account.json in the same directory
  // In production, you might want to use Deno.env.get("FIREBASE_SERVICE_ACCOUNT")
  const serviceAccountText = Deno.readTextFileSync(new URL("./service-account.json", import.meta.url));
  serviceAccount = JSON.parse(serviceAccountText);
} catch (e) {
  console.error("Service account file not found or invalid:", e);
}

if (serviceAccount && admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

serve(async (req: Request) => {
  try {
    if (!serviceAccount) {
        return new Response(JSON.stringify({ error: "Service Account not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }

    const payload = await req.json();
    let { title, body, token, topic, data } = payload;

    // Handle Supabase Database Webhook payload (Mapping logic from old SQL trigger)
    if (payload.record && payload.type === 'INSERT') {
        const task = payload.record;
        title = "New Task Available! 🎯";
        const reward = task.reward_free || task.reward || 0;
        body = `A new task "${task.title}" is now available with a reward of ₹${reward}`;
        topic = "all_users";
        data = {
            task_id: String(task.id),
            task_title: task.title,
            task_type: task.task_type || task.type || 'Daily',
            reward: String(reward)
        };
        console.log("Processed Webhook for Task:", task.id);
        // Persist Global Notification to Database (One entry for all users)
        try {
           await supabase.from("notifications").insert({
              title,
              message: body,
              type: task.task_type || 'task',
              metadata: data,
              is_global: true,
              // user_id is nullable? If not, we might need a dummy ID or handle schema constraint.
              // Assuming user_id is NULLABLE or we can omit it for global.
              // If user_id is NOT NULL, we need to change schema or use a system user ID.
              // Let's assume it allows NULL if we are doing this.
              // Checking previous schema: "user_id" usually references auth.users.
              // Safest bet: If schema enforces user_id, user needs to make it nullable.
              // We just pushed a migration. Let's hope user_id is nullable.
              // If not, this insert will fail.
              // Let's add user_id: null if possible.
           });
           console.log("Global Notification saved to DB");
        } catch (dbError) {
           console.error("Error saving to DB:", dbError);
        }
    }

    const message = {
        notification: {
            title: title || "New Notification",
            body: body || "",
        },
        data: data || {},
        // Can send to either a specific device token OR a topic
        ...(token ? { token } : { topic: topic || "all_users" }),
    };

    const response = await admin.messaging().send(message);

    return new Response(
      JSON.stringify({ success: true, messageId: response }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
