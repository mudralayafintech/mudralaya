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

    const payload = await req.json().catch(() => ({}))
    const { action, data } = payload

    const adminUser = Deno.env.get('DASHBOARD_ADMIN_USER')
    const adminPass = Deno.env.get('DASHBOARD_ADMIN_PASS')

    // Simple Admin Auth check
    const authHeader = req.headers.get('x-admin-password')

    if (action === 'login') {
      if (data.username === adminUser && data.password === adminPass) {
        return new Response(JSON.stringify({
          message: 'Logged in',
          success: true,
          token: adminPass // Using password as a simple token to mirror current behavior
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      } else {
        return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        })
      }
    }

    // Verify token for all other actions
    if (authHeader !== adminPass) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    let result;

    switch (action) {
      case 'get-dashboard':
        const [joins, contacts, advisors, tasksList] = await Promise.all([
          supabaseClient.from('join_requests').select('*').order('created_at', { ascending: false }),
          supabaseClient.from('contact_requests').select('*').order('created_at', { ascending: false }),
          supabaseClient.from('advisor_applications').select('*').order('created_at', { ascending: false }),
          supabaseClient.from('tasks').select('*').order('created_at', { ascending: false })
        ])

        if (joins.error) throw joins.error
        if (contacts.error) throw contacts.error
        if (advisors.error) throw advisors.error
        if (tasksList.error) throw tasksList.error

        const totalRevenue = (joins.data || [])
          .filter((j: any) => j.payment_status === 'Paid')
          .reduce((sum: number, j: any) => sum + (Number(j.amount) || 0), 0)

        result = {
          joinRequests: joins.data || [],
          contacts: contacts.data || [],
          advisorApplications: advisors.data || [],
          tasks: tasksList.data || [],
          counts: {
            joinRequests: joins.data?.length || 0,
            contacts: contacts.data?.length || 0,
            advisorApplications: advisors.data?.length || 0,
            tasks: tasksList.data?.length || 0,
            revenue: totalRevenue
          }
        }
        break;

      case 'get-tasks':
        const { data: allTasks, error: fetchTasksError } = await supabaseClient
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchTasksError) throw fetchTasksError
        result = allTasks
        break;

      case 'create-task':
        const { title, description, reward_free, reward_member, reward_premium, type, video_url, video_link, pdf_url, action_link, icon_type, target_audience, steps, reward_min, reward_max, reward_info } = data
        const { data: createdTask, error: createTaskError } = await supabaseClient
          .from('tasks')
          .insert({
            title,
            description,
            reward_free: reward_free || 0,
            reward_premium: reward_premium || reward_member || 0,
            video_link: video_link || video_url,
            steps: steps,
            reward_min: reward_min,
            reward_max: reward_max,
            reward_info: reward_info,
            category: type,
            icon_type: icon_type || 'group',
            pdf_url,
            action_link,
            target_audience: target_audience && target_audience.length > 0 ? target_audience : ['All'],
            is_active: true
          })
          .select()
          .single()

        if (createTaskError) throw createTaskError
        result = createdTask
        break;

      case 'get-task-participants':
        const { taskId: pTaskId } = data
        // 1. Fetch participants (user_tasks)
        const { data: participants, error: partError } = await supabaseClient
          .from('user_tasks')
          .select('*')
          .eq('task_id', pTaskId)

        if (partError) throw partError

        if (!participants || participants.length === 0) {
          result = []
          break
        }

        // 2. Fetch User Details manually (since FK might be missing)
        const userIds = participants.map((p: any) => p.user_id)
        const { data: usersData, error: usersError } = await supabaseClient
          .from('users')
          .select('*')
          .in('id', userIds)

        if (usersError) throw usersError

        // 3. Merge Data
        const usersMap = new Map()
        usersData?.forEach((u: any) => usersMap.set(u.id, u))

        result = participants.map((p: any) => {
          const user = usersMap.get(p.user_id) || null
          // Polyfill mobile_number if missing but phone exists
          if (user && !user.mobile_number && user.phone) {
            user.mobile_number = user.phone
          }
          return {
            ...p,
            users: user
          }
        })
        break;

      case 'assign-task':
        const { taskId, userIdentifier } = data

        // Find user by email or mobile
        const { data: users, error: userError } = await supabaseClient
          .from('users')
          .select('id')
          .or(`email_id.eq.${userIdentifier},mobile_number.eq.${userIdentifier}`)

        if (userError) throw userError
        if (!users || users.length === 0) throw new Error('User not found')

        const userId = users[0].id

        const { data: assignedTask, error: assignError } = await supabaseClient
          .from('user_tasks')
          .insert({
            user_id: userId,
            task_id: taskId,
            status: 'ongoing',
            reward_earned: 0 // Will be set on approval
          })
          .select()
          .single()

        if (assignError) throw assignError
        result = assignedTask
        break;

      case 'delete-entry':
        const { type: delType, id: delId } = data
        let table = ''
        if (delType === 'join') table = 'join_requests'
        if (delType === 'contact') table = 'contact_requests'
        if (delType === 'advisor') table = 'advisor_applications'

        if (!table) throw new Error('Invalid type')

        const { error: delError } = await supabaseClient
          .from(table)
          .delete()
          .eq('id', delId)

        if (delError) throw delError
        result = { message: 'Deleted successfully' }
        break;

      default:
        throw new Error('Invalid action')
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Admin API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
