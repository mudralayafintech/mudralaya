import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    // Internal admin key for elevated operations
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    })
    
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Verify user is valid
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const body = await req.json()
    const { action, data } = body

    if (action === 'lock-company') {
      const { company_id } = data
      if (!company_id) throw new Error('Missing company_id')

      // Check if already locked
      const { data: existingLock } = await supabaseClient
        .from('user_company_locks')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (existingLock) {
        throw new Error('You are already locked to an active company.')
      }

      // Create 3-month lock using elevated privileges (since we might want to bypass some RLS if complex, though user can insert)
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 3)

      const { data: newLock, error: lockError } = await adminClient
        .from('user_company_locks')
        .insert({
          user_id: user.id,
          company_id,
          expires_at: expiresAt.toISOString(),
          status: 'active'
        })
        .select()
        .single()

      if (lockError) throw lockError

      return new Response(JSON.stringify({ success: true, lock: newLock }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'request-certificate') {
      const { company_id } = data
      
      // Verification logic: 3 months must have passed, or user has completed training (simplified here, checking lock status)
      const { data: lock } = await adminClient
        .from('user_company_locks')
        .select('*')
        .eq('user_id', user.id)
        .eq('company_id', company_id)
        .single()

      if (!lock) throw new Error('No lock found for this company')
      
      // Determine if paid or unpaid (PRD says if unpaid ask ₹499, if paid allow download)
      // Paid status comes from `certificates` table
      let { data: certificate } = await adminClient
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .eq('company_id', company_id)
        .single()

      if (!certificate) {
        // Create an unpaid certificate record
        const { data: newCert, error: certError } = await adminClient
          .from('certificates')
          .insert({
            user_id: user.id,
            company_id,
            is_paid: false
          })
          .select()
          .single()
        
        if (certError) throw certError
        certificate = newCert
      }

      return new Response(JSON.stringify({ success: true, certificate }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
