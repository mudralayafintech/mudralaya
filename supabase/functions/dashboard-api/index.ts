import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    const requestData = await req.json().catch(() => ({}))
    const { action } = requestData
    const url = new URL(req.url)
    const queryAction = url.searchParams.get('action') || action

    let result = {}

    switch (queryAction) {
      case 'get-dashboard-summary':
        // Get tasks, transactions, and user profile summary
        const { data: tasks } = await supabaseClient.from('tasks').select('*').limit(5)
        const { data: transactions } = await supabaseClient.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)

        // Use the custom RPC for stats
        const { data: stats } = await supabaseClient.rpc('get_user_wallet_stats', { user_id_param: user.id }).single()

        result = { tasks, transactions, stats: stats || { approved: 0, pending: 0, total: 0, payout: 0, today: 0, monthly: 0 } }
        break;

      case 'get-tasks':
        const { data: allTasks } = await supabaseClient.from('tasks').select('*')
        // Fetch user's specific status for these tasks
        const { data: userTasks } = await supabaseClient
          .from('user_tasks')
          .select('task_id, status')
          .eq('user_id', user.id)

        // Merge statuses
        result = allTasks?.map((t: any) => {
          const ut = userTasks?.find((u: any) => u.task_id === t.id)
          return { ...t, status: ut ? ut.status : 'new' }
        }) || []
        break;

      case 'get-wallet':
        const { data: walletTx } = await supabaseClient.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        result = walletTx
        break;

      case 'get-plans':
        const { data: plans } = await supabaseClient.from('plans').select('*')
        result = plans
        break;

      case 'start-task':
        const { taskId } = requestData
        if (!taskId) throw new Error('Task ID is required')

        // Check if already started
        const { data: existing } = await supabaseClient
          .from('user_tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('task_id', taskId)
          .single()

        if (existing) {
          result = existing
        } else {
          // Use Service Role key to bypass RLS policies for insertion
          const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          )

          const { data: newTask, error: startError } = await supabaseAdmin
            .from('user_tasks')
            .insert({
              user_id: user.id,
              task_id: taskId,
              status: 'ongoing',
              reward_earned: 0
            })
            .select()
            .single()

          if (startError) throw startError
          result = newTask
        }
        break;

      default:
        throw new Error('Invalid action')
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Check function logs',
      receivedAction: req.url
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
