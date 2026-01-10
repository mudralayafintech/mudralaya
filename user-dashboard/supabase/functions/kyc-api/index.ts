import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { action, data } = await req.json()

    if (action === 'submit-kyc') {
      const { user_id, pan_url, adhaar_url, bank_url, selfie_url } = data

      // 1. Validate Input
      if (!user_id || !pan_url || !adhaar_url || !bank_url || !selfie_url) {
        throw new Error("Missing required KYC documents")
      }

      // 2. Insert into user_kyc table
      // First get the account_id from public.users table (profile)
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user_id)
        .single()

      if (profileError) console.error("Profile lookup warning:", profileError)

      const { data: kycRecord, error: kycError } = await supabase
        .from('user_kyc')
        .insert({
          user_id: user_id,
          account_id: profile?.id || null, // Best effort link
          pan_card_url: pan_url,
          adhaar_card_url: adhaar_url,
          bank_proof_url: bank_url,
          selfie_url: selfie_url,
          status: 'pending'
        })
        .select()
        .single()

      if (kycError) throw kycError

      return new Response(
        JSON.stringify({ success: true, message: "KYC submitted successfully", kyc: kycRecord }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: "Invalid Action" }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
