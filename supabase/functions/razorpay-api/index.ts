import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { action, data } = await req.json()

    if (action === 'create-order') {
      const { amount, currency, receipt } = data
      console.log("Create Order Request:", { amount, currency, receipt });

      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        console.error("Missing Razorpay Keys");
        throw new Error("Server configuration error: Missing Razorpay Keys");
      }

      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency: currency || 'INR',
          receipt: receipt || `receipt_${Date.now()}`
        })
      })

      const order = await response.json()
      console.log("Razorpay Response:", response.status, order);
      if (!response.ok) {
        throw new Error(order.error?.description || 'Failed to create Razorpay order')
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
      const { submissionId, razorpay_payment_id, razorpay_order_id, razorpay_signature, type, userId, plan } = data

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
        throw new Error('Invalid payment signature')
      }

      // Handle Membership Payment
      if (type === 'membership' && userId && plan) {
        const now = new Date();
        let expiryDate = new Date();

        if (plan === 'yearly') {
          expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else if (plan === 'monthly') {
          expiryDate.setDate(expiryDate.getDate() + 30);
        }

        const { error: updateError } = await supabaseClient
          .from('users')
          .update({
            membership_type: plan,
            membership_expiry: expiryDate.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', userId);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true, expiry: expiryDate }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Handle Individual Plan Payment
      if (type === 'plan' && userId && plan === 'individual') {
        // Specific logic for Individual Plan (25k)
        // We reuse membership_type for now to track this status
        const now = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Valid for 1 year

        const { error: updateError } = await supabaseClient
          .from('users')
          .update({
            membership_type: 'individual_plan',
            membership_expiry: expiryDate.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('id', userId);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true, expiry: expiryDate }), {
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
