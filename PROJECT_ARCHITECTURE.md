# Mudralaya Project Architecture & Working

This document outlines the architecture, main components, and working data flows of the Mudralaya project. The project is a comprehensive FinTech platform comprising multiple Next.js applications, a React Native mobile app, and a robust Supabase backend.

## 📁 Repository Structure Overview

The monorepo contains 5 main pillars:

1. **`mudralaya/`**: Public-facing Landing Page & Marketing Website
2. **`user-dashboard/`**: Secure Web Portal for End-Users
3. **`admin/`**: Control Panel for Administrators
4. **`mobile-app/`**: Native Mobile Application (Android/iOS)
5. **`supabase/`**: Backend Database, Auth, and Serverless API

---

## 1. Web Frontend (`/mudralaya`)
The public face of Mudralaya, designed to attract and inform users.
- **Tech Stack**: Next.js 15, React 19, Tailwind CSS
- **Key Features**: Static pages (Home, About Us, Plans, Advisor), Animations using Framer Motion.
- **Where**: 
  - `src/app/`: Next.js file-based routing.
  - `src/components/`: Reusable, static UI components.
- **Running**: `npm run dev`

## 2. User Dashboard (`/user-dashboard`)
The web portal where registered users manage their accounts and earn rewards.
- **Tech Stack**: Next.js 15, React 19, Supabase SSR.
- **Key Features**:
  - Secure authentication (via Supabase).
  - Task completion and wallet tracking.
  - Profile and KYC management.
- **Where**:
  - `src/app/dashboard/`: Protected routes representing the dashboard pages (`/tasks`, `/wallet`, `/profile`).
  - `src/components/`: Interactive components relying on real-time data.
- **Running**: `npm run dev`

## 3. Admin Dashboard (`/admin`)
The control center for Mudralaya staff to manage operations.
- **Tech Stack**: Next.js 15, React 19, Supabase SSR.
- **Key Features**:
  - User and KYC management.
  - Task approval/rejection workflows.
  - Global transaction monitoring.
- **Where**:
  - `src/app/dashboard/`: Secure admin-only pages (`/users`, `/kyc`, `/tasks`).
  - `src/components/dashboard/`: Admin-specific components, like the `TaskManager` for accepting/rejecting user tasks.
- **Running**: `npm run dev`

## 4. Mobile Application (`/mobile-app`)
A native mobile experience bringing the user dashboard to smartphones.
- **Tech Stack**: Expo (React Native), Expo Router, Supabase JS, Firebase.
- **Key Features**:
  - Push notifications via Firebase.
  - Native gesture handling, camera integration, and secure local storage.
  - Replicates all User Dashboard functionality on-the-go.
- **Where**:
  - `app/`: Expo Router structure. Includes Drawer navigators and main screens (`login.tsx`, `index.tsx`, `profile.tsx`).
  - `components/`: React Native UI blocks.
- **Running**: `npm run start` (Android/iOS via Expo Go or native build)

## 5. Backend Infrastructure (`/supabase`)
The central nervous system linking all the frontends together.
- **Tech Stack**: Supabase (PostgreSQL, Edge Functions, Auth, Storage).
- **Key Components**:
  - **Edge Functions** (`/supabase/functions/`): Secure serverless logic. e.g., `admin-api` handles admin actions securely without exposing direct DB access to clients; `dashboard-api` handles user task interactions.
  - **Database schema & RPCs** (`.sql` files): Contains core logic like `get_user_wallet_stats()` to dynamically calculate balances and triggers like `auth_trigger.sql` that sync Supabase Auth users with public user tables securely.
  - **Row Level Security (RLS)**: Enforces that users can only read/write their own data, while Admins (via Service Roles) have broader access.

---

## 🔄 Core Data Flow: Task Completion & Wallet Credit

A prime example of how the components work together is the "Task Completion to Wallet" flow:

1. **Initiation**: A user clicks "Complete Task" on the **User Dashboard** or **Mobile App**.
2. **API Call**: The client calls the Supabase Edge Function `complete-task`.
3. **Database Update**: The database marks the `user_tasks` record as `completed` (pending admin approval).
4. **Admin Review**: An administrator opens the **Admin Dashboard**, navigates to the Task Manager, sees the pending task, and clicks "Approve". 
5. **Approval Logic**: This calls the `approve-task` Edge Function, which:
   - Updates the task status to `approved`.
   - Generates a new `transaction` record adding funds to the user.
6. **Real-time Refresh**: The user's wallet automatically queries the `get_user_wallet_stats` Database function, showing their new balance.
