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

    if (!action) {
      return new Response(JSON.stringify({ error: 'Action is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

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
        if (delType === 'client') table = 'users'

        if (!table) throw new Error('Invalid type')

        const { error: delError } = await supabaseClient
          .from(table)
          .delete()
          .eq('id', delId)

        if (delError) throw delError
        result = { message: 'Deleted successfully' }
        break;


      case 'get-clients':
        // 1. Fetch KYC entries
        const { data: clients, error: clientsError } = await supabaseClient
          .from('user_kyc')
          .select('*')
          .order('created_at', { ascending: false })

        if (clientsError) throw clientsError

        if (!clients || clients.length === 0) {
            result = []
            break
        }

        // 2. Fetch User Details manually using user_id (reliable) instead of join on account_id
        const clientUserIds = clients.map((c: any) => c.user_id)
        const { data: clientUsersData, error: clientUsersError } = await supabaseClient
          .from('users')
          .select('id, full_name, email_id, mobile_number, phone')
          .in('id', clientUserIds)

        if (clientUsersError) throw clientUsersError

        // 3. Merge Data
        const clientUsersMap = new Map()
        clientUsersData?.forEach((u: any) => clientUsersMap.set(u.id, u))

        result = clients.map((c: any) => {
          const user = clientUsersMap.get(c.user_id) || null
          // Polyfill mobile if needed
          if (user && !user.mobile_number && user.phone) {
              user.mobile_number = user.phone
          }
          return {
            ...c,
            id: c.id, // KYC ID
            user_id: c.user_id,
            full_name: user?.full_name || "N/A",
            email_id: user?.email_id || "N/A",
            mobile_number: user?.mobile_number || "N/A",
            kyc_status: c.status,
            created_at: c.created_at
          }
        })
        break;

      case 'get-kyc-records':
        try {
          // Fetch all KYC records with user details
          const { data: kycRecords, error: kycError } = await supabaseClient
            .from('user_kyc')
            .select('*')
            .order('created_at', { ascending: false })

          if (kycError) {
            console.error('Error fetching KYC records:', kycError)
            throw new Error(`Failed to fetch KYC records: ${kycError.message || 'Unknown error'}`)
          }

          if (!kycRecords || kycRecords.length === 0) {
            result = []
            break
          }

          // Fetch user details
          const kycUserIds = kycRecords
            .map((k: any) => k.user_id)
            .filter((id: any) => id != null)

          if (kycUserIds.length === 0) {
            // No valid user IDs, return records without user data
            result = kycRecords.map((k: any) => ({
              ...k,
              users: null
            }))
            break
          }

          const { data: kycUsersData, error: kycUsersError } = await supabaseClient
            .from('users')
            .select('id, full_name, email_id, mobile_number, phone')
            .in('id', kycUserIds)

          if (kycUsersError) {
            console.error('Error fetching users for KYC:', kycUsersError)
            // Return records without user data if user fetch fails
            result = kycRecords.map((k: any) => ({
              ...k,
              users: null
            }))
            break
          }

          // Merge data
          const kycUsersMap = new Map()
          kycUsersData?.forEach((u: any) => {
            if (!u.mobile_number && u.phone) {
              u.mobile_number = u.phone
            }
            kycUsersMap.set(u.id, u)
          })

          result = kycRecords.map((k: any) => {
            const user = kycUsersMap.get(k.user_id) || null
            return {
              ...k,
              users: user ? {
                full_name: user.full_name,
                email_id: user.email_id,
                mobile_number: user.mobile_number,
              } : null
            }
          })
        } catch (kycCaseError: any) {
          console.error('Error in get-kyc-records case:', kycCaseError)
          throw new Error(`KYC records fetch failed: ${kycCaseError.message || 'Unknown error'}`)
        }
        break;

      case 'get-client-details':
        const { clientId } = data // This is actually the kyc_id from the URL
        
        // 1. Fetch KYC record
        const { data: kycRecord, error: kycError } = await supabaseClient
          .from('user_kyc')
          .select('*')
          .eq('id', clientId)
          .single()

        if (kycError) throw kycError

        // 2. Fetch User record using reliable user_id
        const { data: userRecord, error: userDetailsError } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', kycRecord.user_id)
          .single()
          
        if (userDetailsError) throw userDetailsError


        // Polyfill mobile_number if missing
        if (userRecord && !userRecord.mobile_number && userRecord.phone) {
          userRecord.mobile_number = userRecord.phone
        }

        // 3. Return structure matching frontend expectation: User object with user_kyc array
        result = {
          ...userRecord,
          user_kyc: [kycRecord]
        }
        break;

      case 'update-kyc-status':
        const { userId: kycId, status, reason } = data // "userId" payload is actually KYC ID

        // 1. Update user_kyc table using KYC ID
        const { data: updatedKyc, error: updateKycError } = await supabaseClient
          .from('user_kyc')
          .update({
            status: status,
            rejection_reason: reason || null,
            updated_at: new Date()
          })
          .eq('id', kycId) // Correct column is id, not user_id
          .select()
          .single()

        if (updateKycError) throw updateKycError

        // 2. If approved, verify the user profile using the CORRECT user_id from the kyc record
        if (status === 'verified' && updatedKyc?.user_id) {
          await supabaseClient
            .from('users')
            .update({ is_verified: true })
            .eq('id', updatedKyc.user_id)
        }

        result = updatedKyc
        break;

      case 'approve-task':
        const { userTaskId } = data
        if (!userTaskId) throw new Error('User Task ID is required')

        // Get user_task details
        const { data: userTask, error: fetchError } = await supabaseClient
          .from('user_tasks')
          .select('*, tasks(*)')
          .eq('id', userTaskId)
          .maybeSingle()

        if (fetchError) throw fetchError
        if (!userTask) throw new Error('User task not found')
        if (userTask.status !== 'completed') {
          throw new Error(`Task must be completed before approval. Current status: ${userTask.status}`)
        }

        // Update status to approved
        const { data: approvedTask, error: approveError } = await supabaseClient
          .from('user_tasks')
          .update({
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', userTaskId)
          .select()
          .single()

        if (approveError) throw approveError
        if (!approvedTask) throw new Error('Failed to approve task')

        // Create transaction record
        const taskTitle = (userTask.tasks as any)?.title || 'Task Completed'
        const taskIcon = (userTask.tasks as any)?.icon_type || 'group'
        const rewardAmount = userTask.reward_earned || 0

        if (rewardAmount <= 0) {
          throw new Error('Invalid reward amount. Cannot create transaction with zero or negative amount.')
        }

        const { data: transaction, error: transactionError } = await supabaseClient
          .from('transactions')
          .insert({
            user_id: userTask.user_id,
            title: taskTitle,
            sub_title: 'Task reward',
            amount: rewardAmount,
            type: 'reward',
            status: 'completed',
            icon_type: taskIcon
          })
          .select()
          .single()

        if (transactionError) {
          // Rollback the approval if transaction creation fails
          await supabaseClient
            .from('user_tasks')
            .update({ status: 'completed' })
            .eq('id', userTaskId)
          throw new Error(`Failed to create transaction: ${transactionError.message}`)
        }

        if (!transaction) throw new Error('Transaction creation returned no data')

        result = { approvedTask, transaction }
        break;

      case 'reject-task':
        const { userTaskId: rejectUserTaskId, reason: rejectReason } = data
        if (!rejectUserTaskId) throw new Error('User Task ID is required')

        // Check if task exists
        const { data: taskToReject, error: checkRejectError } = await supabaseClient
          .from('user_tasks')
          .select('*')
          .eq('id', rejectUserTaskId)
          .maybeSingle()

        if (checkRejectError) throw checkRejectError
        if (!taskToReject) throw new Error('User task not found')

        // Update status to rejected
        const { data: rejectedTask, error: rejectError } = await supabaseClient
          .from('user_tasks')
          .update({
            status: 'rejected',
            submission_data: rejectReason 
              ? { ...(taskToReject.submission_data || {}), rejection_reason: rejectReason }
              : taskToReject.submission_data,
            updated_at: new Date().toISOString()
          })
          .eq('id', rejectUserTaskId)
          .select()
          .single()

        if (rejectError) throw rejectError
        if (!rejectedTask) throw new Error('Failed to reject task')

        result = rejectedTask
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
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    
    const statusCode = error.message?.includes('Unauthorized') ? 401 
      : error.message?.includes('not found') || error.code === 'PGRST116' ? 404 
      : 500
    
    const errorResponse: any = {
      error: error.message || 'An error occurred',
    }
    
    // Include additional error details in development
    if (Deno.env.get('DENO_ENV') === 'development' || Deno.env.get('ENVIRONMENT') === 'development') {
      errorResponse.stack = error.stack
      errorResponse.details = error.details
      errorResponse.hint = error.hint
      errorResponse.code = error.code
    }
    
    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: statusCode,
    })
  }
})
