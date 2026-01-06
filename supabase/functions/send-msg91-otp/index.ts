import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MSG91_AUTH_KEY = Deno.env.get("MSG91_AUTH_KEY");
const MSG91_TEMPLATE_ID = Deno.env.get("MSG91_TEMPLATE_ID");

// Helper to sanitize phone number for MSG91 (remove leading +)
// Helper to sanitize phone number for MSG91
function sanitizePhone(phone: string): string {
  if (!phone) return "";
  // Remove all non-digit characters (brackets, spaces, dashes, +)
  const digits = phone.replace(/\D/g, "");
  
  // If it's exactly 10 digits, assume India and add 91
  if (digits.length === 10) {
    return "91" + digits;
  }
  
  // If it's 12 digits starting with 91, it's already good. 
  // If it's something else, return digits as is (Msg91 might handle international).
  return digits;
}

serve(async (req) => {
  try {
    const body = await req.json();
    console.log("Supabase Hook Payload Keys:", JSON.stringify(Object.keys(body)));
    if (body.sms) console.log("SMS Object:", JSON.stringify(body.sms));

    // Supabase Send SMS hook payload structure: { user: {...}, sms: { otp: "...", ... } }
    const user = body.user;
    const otp = body.otp || body.token || (body.sms && body.sms.otp) || (body.sms && body.sms.token);

    // Check payload validity
    if (!user || !user.phone || !otp) {
      console.error("Missing required fields. User:", JSON.stringify(user), "OTP found:", !!otp);
      return new Response(
        JSON.stringify({ error: "Payload missing user.phone or otp" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID) {
       console.error("Missing MSG91 secrets");
       return new Response(
        JSON.stringify({ error: "Server misconfiguration: Missing MSG91 secrets" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const mobile = sanitizePhone(user.phone);
    console.log(`Preparing to send OTP ${otp} to ${mobile}`);

    // Using MSG91 v5 API with JSON body to ensure variables are handled correctly
    // Doc: https://docs.msg91.com/p/tf9GTextN/api/send-otp
    const msg91Payload = {
      template_id: MSG91_TEMPLATE_ID,
      mobile: mobile,
      otp: otp,
      // If your template has ##OTP##, passing 'otp' param at root level usually suffices for the specific OTP endpoint.
      // However, sometimes it wants it inside 'realTimeResponse' or strict formatting.
      // Let's stick to query params for authkey + JSON body for the rest if needed, 
      // but standard practice for this endpoint is often mixed. 
      // Safest: Query Params for everything if it worked before, but let's try standard JSON.
    };
    
    // Construct URL with AuthKey to avoid header issues
    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.append("authkey", MSG91_AUTH_KEY);
    url.searchParams.append("template_id", MSG91_TEMPLATE_ID);
    url.searchParams.append("mobile", mobile);
    url.searchParams.append("otp", otp);
    // Explicitly add 'realTimeResponse' to debug
    url.searchParams.append("realTimeResponse", "1");

    console.log("Calling MSG91 API:", url.toString().replace(MSG91_AUTH_KEY, "HIDDEN"));

    const msg91Response = await fetch(url.toString(), {
      method: "POST",
      headers: {
         "Content-Type": "application/json"
      },
      // Some versions of MSG91 ignore body if query params are present, or vice versa.
      // Empty body for POST if all params are in URL.
      body: JSON.stringify({})
    });

    const data = await msg91Response.json();
    console.log("MSG91 Response:", data);

    if (msg91Response.ok && data.type !== "error") {
      return new Response(
        JSON.stringify({ success: true, provider_response: data }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
       console.error("MSG91 Failed:", data);
       // Return 200 with error info to prevent Supabase 500 if strict? 
       // No, we should return 400 so Supabase knows it failed.
       // But 'Invalid payload sent to hook' suggests Supabase rejected OUR response or request.
       // Let's return a clean 400.
       return new Response(
        JSON.stringify({ error: "MSG91 Rejected", details: data }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error in send-msg91-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
