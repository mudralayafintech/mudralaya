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
        const { data: tasks, error: tasksError } = await supabaseClient.from('tasks').select('*').limit(5)
        const { data: transactions, error: transactionsError } = await supabaseClient.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)

        if (tasksError) console.error('Tasks fetch error:', tasksError)
        if (transactionsError) console.error('Transactions fetch error:', transactionsError)

        // Use the custom RPC for stats
        const { data: stats, error: statsError } = await supabaseClient.rpc('get_user_wallet_stats', { user_id_param: user.id })
        
        // Handle RPC response - it returns JSONB directly, not wrapped
        let walletStats = { approved: 0, pending: 0, total: 0, payout: 0, today: 0, monthly: 0 }
        if (statsError) {
          console.error('RPC Error:', statsError)
          // If RPC fails, calculate stats manually as fallback
          try {
            const { data: allTransactions } = await supabaseClient
              .from('transactions')
              .select('amount, type, status, created_at')
              .eq('user_id', user.id)
            
            const { data: userTasks } = await supabaseClient
              .from('user_tasks')
              .select('reward_earned, status')
              .eq('user_id', user.id)
            
            if (allTransactions) {
              const approved = allTransactions
                .filter(t => t.type === 'reward' && t.status === 'completed' && t.amount > 0)
                .reduce((sum, t) => sum + Number(t.amount || 0), 0)
              
              const today = allTransactions
                .filter(t => {
                  const today = new Date().toISOString().split('T')[0]
                  const txDate = new Date(t.created_at).toISOString().split('T')[0]
                  return txDate === today && t.type === 'reward' && t.amount > 0
                })
                .reduce((sum, t) => sum + Number(t.amount || 0), 0)
              
              const monthly = allTransactions
                .filter(t => {
                  const now = new Date()
                  const txDate = new Date(t.created_at)
                  return txDate.getMonth() === now.getMonth() && 
                         txDate.getFullYear() === now.getFullYear() &&
                         t.type === 'reward' && t.amount > 0
                })
                .reduce((sum, t) => sum + Number(t.amount || 0), 0)
              
              const payout = allTransactions
                .filter(t => t.type === 'payout' && t.status === 'completed')
                .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0)
              
              const pending = userTasks
                ?.filter(ut => ['pending', 'ongoing', 'completed'].includes(ut.status))
                .reduce((sum, ut) => sum + Number(ut.reward_earned || 0), 0) || 0
              
              walletStats = {
                approved,
                pending,
                total: approved + pending,
                payout,
                today,
                monthly
              }
            }
          } catch (fallbackError) {
            console.error('Fallback stats calculation error:', fallbackError)
          }
        } else if (stats) {
          // RPC returns JSONB directly, so we can use it as-is
          walletStats = typeof stats === 'object' && stats !== null ? stats : walletStats
        }

        result = { 
          tasks: tasks || [], 
          transactions: transactions || [], 
          stats: walletStats 
        }
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

      case 'complete-task':
        const { taskId: completeTaskId, submissionData } = requestData
        if (!completeTaskId) throw new Error('Task ID is required')

        // Use Service Role key to bypass RLS policies
        const supabaseAdminComplete = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Check if user_task exists first
        const { data: existingUserTask, error: checkError } = await supabaseAdminComplete
          .from('user_tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('task_id', completeTaskId)
          .maybeSingle()

        if (checkError) throw checkError
        if (!existingUserTask) throw new Error('Task not started. Please start the task first.')

        // Get the task details to determine reward
        const { data: taskDetails, error: taskError } = await supabaseAdminComplete
          .from('tasks')
          .select('reward_free, reward_member, title, icon_type')
          .eq('id', completeTaskId)
          .maybeSingle()

        if (taskError) throw taskError
        if (!taskDetails) throw new Error('Task not found')

        // Get user's membership status (simplified - you may need to check actual membership)
        const { data: userProfile, error: userError } = await supabaseAdminComplete
          .from('users')
          .select('membership_type')
          .eq('id', user.id)
          .maybeSingle()

        if (userError) throw userError

        // Determine reward based on membership (default to reward_free)
        const rewardAmount = userProfile?.membership_type === 'member' || userProfile?.membership_type === 'premium'
          ? (taskDetails.reward_member || taskDetails.reward_free || 0)
          : (taskDetails.reward_free || 0)

        // Update user_tasks status to 'completed' (pending approval)
        const { data: updatedTask, error: completeError } = await supabaseAdminComplete
          .from('user_tasks')
          .update({
            status: 'completed',
            submission_data: submissionData || null,
            reward_earned: rewardAmount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('task_id', completeTaskId)
          .select()
          .single()

        if (completeError) throw completeError
        if (!updatedTask) throw new Error('Failed to update task status')
        result = updatedTask
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
    const statusCode = error.message?.includes('Unauthorized') ? 401 
      : error.message?.includes('not found') ? 404 
      : 400
    return new Response(JSON.stringify({
      error: error.message || 'An error occurred',
      details: 'Check function logs',
      receivedAction: req.url,
      stack: Deno.env.get('DENO_ENV') === 'development' ? error.stack : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode,
    })
  }
})
