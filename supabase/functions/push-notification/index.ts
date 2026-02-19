import { serve } from "std/http/server.ts";
import admin from "firebase-admin";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

import serviceAccount from './service-account.json' assert { type: 'json' };

// Hardcoded Service Account removed in favor of import


// ...

if (serviceAccount && admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

serve(async (req: Request) => {
  try {
    // Service Account check removed as it is hardcoded

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
              user_id: null // Explicitly set null for global
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
        android: {
            priority: "high",
            notification: {
                channelId: "default",
                priority: "high",
                defaultSound: true,
                defaultVibrateTimings: true
            }
        }
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
