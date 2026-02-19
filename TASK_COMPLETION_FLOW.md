# Task Completion to Wallet Balance Flow

This document describes the complete flow from task completion to wallet balance increase.

## Flow Overview

1. **User starts a task** → Status: `ongoing`
2. **User completes a task** → Status: `completed` (pending approval)
3. **Admin approves task** → Status: `approved` + Transaction created
4. **Wallet balance increases** → Transaction appears in wallet stats

## Implementation Details

### Backend APIs

#### Dashboard API (`supabase/functions/dashboard-api/index.ts`)
- **`start-task`**: Creates a `user_tasks` record with status `ongoing`
- **`complete-task`**: Updates `user_tasks` status to `completed` and sets `reward_earned` based on user membership

#### Admin API (`supabase/functions/admin-api/index.ts`)
- **`approve-task`**: 
  - Updates `user_tasks` status to `approved`
  - Creates a transaction record in `transactions` table
  - Transaction amount is set from `reward_earned` field
- **`reject-task`**: Updates `user_tasks` status to `rejected`

### Database

#### Tables
- **`user_tasks`**: Tracks user task progress
  - Statuses: `pending`, `ongoing`, `completed`, `approved`, `rejected`
  - `reward_earned`: Amount to be credited when approved
- **`transactions`**: Records all wallet transactions
  - Type: `reward`, `payout`, `referral`
  - Status: `completed`
  - Amount: Positive for credits, negative for debits

#### Functions
- **`get_user_wallet_stats(user_id)`**: Calculates wallet statistics
  - `approved`: Sum of completed reward transactions
  - `pending`: Sum of reward_earned from ongoing/completed tasks
  - `total`: approved + pending
  - `today`: Today's reward transactions
  - `monthly`: This month's reward transactions
  - `payout`: Total payout transactions

#### RLS Policies
- Users can view/update their own `user_tasks`
- Users can view their own `transactions`
- Service role can insert transactions (for admin approval)

### Frontend

#### User Dashboard (`user-dashboard/src/app/dashboard/tasks/page.tsx`)
- **Task Status Display**:
  - `new`: "Start Task"
  - `ongoing`: "Complete Task"
  - `completed`: "Pending Approval"
  - `approved`: "Reward Claimed"
  - `rejected`: "Task Rejected"
- **Complete Task Flow**:
  1. User clicks "Complete Task"
  2. Opens task action link (if available)
  3. Confirms completion
  4. Calls `complete-task` API
  5. Status updates to `completed`

#### Admin Dashboard (`admin/src/components/dashboard/TaskManager.tsx`)
- **Task Participants View**:
  - Shows all users who started/completed tasks
  - Displays status badges (pending, completed, approved, rejected)
  - Shows reward amount
- **Approve/Reject Actions**:
  - Approve button for `completed` tasks
  - Reject button for `completed` tasks
  - Creates transaction on approval

### Wallet Display (`user-dashboard/src/app/dashboard/wallet/page.tsx`)
- Shows real-time wallet stats from `get_user_wallet_stats` RPC
- Displays transactions from `transactions` table
- Updates automatically when new transactions are created

## Testing the Flow

1. **Start a task**: User clicks "Start Task" on any task
2. **Complete a task**: User clicks "Complete Task" after finishing
3. **Approve task**: Admin views task participants and clicks "Approve"
4. **Check wallet**: User's wallet balance should increase by the reward amount
5. **View transaction**: Transaction should appear in "Latest Transactions"

## Database Migration

Run the migration file to add necessary RLS policies:
```sql
supabase/migrations/20260124_add_task_completion_flow.sql
```

## Notes

- Reward calculation considers user membership type (member/premium get `reward_member`, others get `reward_free`)
- Transactions are only created when admin approves (not on completion)
- Pending amount includes tasks with status: `pending`, `ongoing`, `completed`
- Approved balance only counts `reward` type transactions with positive amounts
