import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

console.log("Razorpay API Handler V5.1 - Time: 2026-01-31 18:08");

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey || !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error("Missing Environment Variables");
      return new Response(JSON.stringify({ error: "Server configuration error: Missing Environment Variables" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    const body = await req.json().catch((e) => {
      console.error("JSON Parse Error:", e);
      return {};
    })
    
    console.log("Processing Request:", JSON.stringify(body));
    const { action, data } = body

    if (!action) {
      return new Response(JSON.stringify({ error: "Missing action in request body" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (action === 'create-order') {
      const { amount, currency, receipt } = data || {}
      
      if (!amount) {
        return new Response(JSON.stringify({ error: "Amount is required" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      console.log(`Creating order: ${amount} ${currency || 'INR'}`);

      const razorAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${razorAuth}`
        },
        body: JSON.stringify({
          amount: Math.round(Number(amount) * 100),
          currency: currency || 'INR',
          receipt: receipt || `rcpt_${Date.now()}`
        })
      }).catch(err => {
        console.error("Fetch Error:", err);
        throw new Error(`Failed to reach Razorpay API: ${err.message}`);
      })

      const order = await response.json()
      console.log("Razorpay API Status:", response.status);

      if (!response.ok) {
        console.error("Razorpay Error Details:", JSON.stringify(order));
        return new Response(JSON.stringify({ 
          error: order.error?.description || "Razorpay order creation failed",
          details: order
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        });
      }

      return new Response(JSON.stringify({
        ...order,
        keyId: RAZORPAY_KEY_ID
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'verify-payment') {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature, type, userId, plan, amount, submissionId } = data || {}

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return new Response(JSON.stringify({ error: "Missing payment verification parameters" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Verify signature
      const text = `${razorpay_order_id}|${razorpay_payment_id}`
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(RAZORPAY_KEY_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(text)
      )
      const signatureArray = Array.from(new Uint8Array(signatureBuffer))
      const generatedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')

      if (generatedSignature !== razorpay_signature) {
        return new Response(JSON.stringify({ error: "Invalid payment signature" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Handle Membership Payment
      if (type === 'membership' && userId && plan) {
        const isYearly = plan === 'yearly' || plan === 'YEARLY';
        const daysToAdd = isYearly ? 365 : 30;
        
        // 1. Fetch Current Expiry (to support stacking)
        let currentExpiryDate = new Date();
        let isStacked = false;

        const parseAnyDate = (dateStr: string) => {
          if (!dateStr) return null;
          // Try IST format: "DD/MM/YYYY, HH:mm:ss"
          const istMatch = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/);
          if (istMatch) {
            const [_, day, month, year, hour, minute, second] = istMatch;
            return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
          }
          // Fallback to ISO/standard: "2026-02-03..."
          const parsed = new Date(dateStr);
          return isNaN(parsed.getTime()) ? null : parsed;
        };

        try {
          const { data: userData } = await supabaseClient
            .from('users')
            .select('membership_expiry, membership_type')
            .eq('id', userId)
            .single();
          
          if (userData?.membership_expiry) {
            const existingDate = parseAnyDate(userData.membership_expiry);
            if (existingDate && existingDate > new Date()) {
              // Active Membership Found
              const currentPlan = userData.membership_type || 'monthly'; // default to monthly if not set
              
              // 1. Downgrade Guard: IF Active Yearly AND Trying Monthly -> BLOCK
              if (currentPlan.toLowerCase() === 'yearly' && !isYearly) {
                 return new Response(JSON.stringify({ 
                   error: "Cannot downgrade to Monthly while Yearly plan is active. Please wait for expiry." 
                 }), {
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 400,
                });
              }

              currentExpiryDate = existingDate;
              isStacked = true;
            }
          }
        } catch (e) {
          console.error("Stacking Logic: Error fetching/parsing existing expiry:", e);
        }

        const planStartDate = new Date(currentExpiryDate);
        const newExpiryDate = new Date(currentExpiryDate);
        newExpiryDate.setDate(newExpiryDate.getDate() + daysToAdd);

        // Format in Asia/Kolkata (IST)
        const formatIST = (date: Date) => new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).format(date);

        const istExpiryString = formatIST(newExpiryDate);
        const istStartString = formatIST(planStartDate);

        console.log(`Membership ${isStacked ? 'STACKED' : 'NEW'}: ${plan} for ${userId}. Expiry (IST): ${istExpiryString}`);

        // 2. Record Transaction (V19.0)
        const txPayload: any = {
          user_id: userId,
          title: 'Mudralaya Membership',
          sub_title: `${isYearly ? 'Yearly' : 'Monthly'} Membership ${isStacked ? '(Stacked)' : ''}`,
          amount: amount || (isYearly ? 999 : 99),
          type: 'membership',
          status: 'completed',
          plan_name: isYearly ? 'yearly' : 'monthly',
          transaction_id: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id
        };

        const { error: txError } = await supabaseClient
          .from('transactions')
          .insert(txPayload);

        if (txError) {
          console.error('CRITICAL: Transaction Recording Error (V19.0):', txError);
          throw new Error(`Transaction Recording Failed: ${txError.message || JSON.stringify(txError)}`);
        }

        // 3. Update User Membership
        try {
          await supabaseClient
            .from('users')
            .update({
              membership_type: isYearly ? 'yearly' : 'monthly',
              membership_expiry: istExpiryString,
              membership_start_date: istStartString, // Track when this specific purchase starts
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        } catch (e) {
          console.error('User Membership Update Exception:', e);
        }

        console.log("Razorpay API Handler V19.0 - Time: 2026-01-31 16:38");

        return new Response(JSON.stringify({ 
          success: true, 
          message: isStacked ? 'Membership stacked successfully.' : 'Membership recorded.',
          expiry: istExpiryString
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }


      // Handle Individual Plan Payment
      if (type === 'plan' && userId && plan === 'individual') {
        const now = new Date();
        const { amount: finalAmount, hasLaptop } = data || {};
        
        console.log('Using amount from frontend:', finalAmount);

        // 1. Record Transaction (STRICTLY matching user schema + transaction_id)
        const txPayload: any = {
          user_id: userId,
          title: 'Individual Plan Purchase',
          sub_title: 'Lifetime access to individual plan',
          amount: finalAmount,
          type: 'PLAN',
          status: 'completed',
          icon_type: 'shield',
          plan_name: 'INDIVIDUAL',
          currency: 'INR',
          transaction_id: razorpay_payment_id, // Added transaction_id
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id
        };

        const { error: txError } = await supabaseClient
          .from('transactions')
          .insert(txPayload);

        if (txError) {
          console.error('CRITICAL: Transaction Recording Error (V16.0):', txError);
        }

        // 2. Update User Plan & Laptop Status
        try {
          await supabaseClient
            .from('users')
            .update({
              plan_type: 'INDIVIDUAL',
              has_laptop: !!hasLaptop,
              updated_at: now.toISOString()
            })
            .eq('id', userId);
        } catch (e) {
          console.error('User Update Exception:', e);
        }

        console.log("Razorpay API Handler V16.0 - Time: 2026-01-31 16:18");

        return new Response(JSON.stringify({ success: true, message: 'Payment recorded.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Default: Handle Join Request Payment (Backward Compatibility)
      if (submissionId) {
        const { error: updateError } = await supabaseClient
          .from('join_requests')
          .update({
            payment_status: 'Paid',
            razorpay_payment_id: razorpay_payment_id,
            razorpay_order_id: razorpay_order_id,
            razorpay_signature: razorpay_signature,
            updated_at: new Date()
          })
          .eq('id', submissionId)

        if (updateError) throw updateError

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      throw new Error('Missing submissionId or invalid payment type')
    }

    throw new Error('Invalid action')

  } catch (error: any) {
    console.error('Razorpay Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
