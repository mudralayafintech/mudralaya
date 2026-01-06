import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

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

    let result;

    switch (action) {
      case 'submit-join-request':
        const { data: joinData, error: joinError } = await supabaseClient
          .from('join_requests')
          .insert({
            full_name: data.fullName,
            mobile_number: data.mobileNumber,
            email_id: data.emailId,
            date_of_birth: data.dateOfBirth,
            profession: data.profession,
            form: data.plan,
            payment_status: 'pending',
            amount: data.amount
          })
          .select()
          .single()
        
        if (joinError) throw joinError
        result = joinData
        break;

      case 'submit-advisor-application':
        const { data: advisorData, error: advisorError } = await supabaseClient
          .from('advisor_applications')
          .insert({
            full_name: data.fullName,
            mobile_number: data.mobileNumber,
            email_id: data.emailId,
            date_of_birth: data.dateOfBirth,
            profession: data.profession,
            irda_license: data.irdaLicense,
            form: 'advisor'
          })
          .select()
          .single()
        
        if (advisorError) throw advisorError
        result = advisorData
        break;

      case 'submit-contact-request':
        const { data: contactData, error: contactError } = await supabaseClient
          .from('contact_requests')
          .insert({
            full_name: data.fullName,
            phone_number: data.phoneNumber,
            email: data.email,
            subject: data.subject,
            message: data.message,
            occupation: data.occupation,
            qualification: data.qualification
          })
          .select()
          .single()
        
        if (contactError) throw contactError
        result = contactData
        break;

      case 'subscribe-newsletter':
        const { data: newsData, error: newsError } = await supabaseClient
          .from('newsletter_subscriptions')
          .upsert({ email: data.email })
          .select()
          .single()
        
        if (newsError) throw newsError
        result = newsData
        break;

      default:
        throw new Error('Invalid action')
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
