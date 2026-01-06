import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const API_KEY = Deno.env.get("TWOFACTOR_API_KEY");

// Helper to sanitize phone number
function sanitizePhone(phone: string): string {
  if (!phone) return "";
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  // 2Factor.in expects 10 digits for India usually, or full format.
  // Their API examples often show just the 10 digit number for domestic,
  // but if using the pattern /SMS/{phone}/{otp}, international format is safer if supported.
  // However, for India, if we send 91..., it usually works.
  // If user sends +91..., we strip +.
  // Let's ensure we just send digits.
  return digits;
}

serve(async (req) => {
  try {
    const body = await req.json();
    console.log("Supabase Hook Payload Keys:", JSON.stringify(Object.keys(body)));
    if (body.sms) console.log("SMS Object:", JSON.stringify(body.sms));

    // Extract OTP and Phone
    const user = body.user;
    // Look for OTP in all known places
    const otp = body.otp || body.token || (body.sms && body.sms.otp) || (body.sms && body.sms.token);

    if (!user || !user.phone || !otp) {
      console.error("Missing required fields. User:", JSON.stringify(user));
      return new Response(
        JSON.stringify({ error: "Payload missing user.phone or otp" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!API_KEY) {
       console.error("Missing TWOFACTOR_API_KEY secret");
       return new Response(
        JSON.stringify({ error: "Server misconfiguration: Missing API Key" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const mobile = sanitizePhone(user.phone);
    console.log(`Sending OTP ${otp} to ${mobile} via 2Factor.in`);

    // 2Factor.in API Endpoint
    // Try passing template as a query parameter to avoid ambiguity with Sender ID.
    // URL: https://2factor.in/API/V1/{api_key}/SMS/{phone_number}/{otp}?template={template_name}
    const url = `https://2factor.in/API/V1/${API_KEY}/SMS/${mobile}/${otp}?template=MudralayaLogin`;

    const response = await fetch(url);
    const data = await response.json();
    
    console.log("2Factor Response:", data);

    if (data.Status === "Success") {
      return new Response(
        JSON.stringify({ success: true, provider_response: data }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
       return new Response(
        JSON.stringify({ error: "2Factor Failed", details: data }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error in send-2factor-otp:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
