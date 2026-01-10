import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import DashboardHome from './pages/DashboardHome';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { UserProvider } from './context/UserContext';
import './App.css';

import Task from './pages/Task';
import Membership from './pages/Membership';
import Plans from './pages/Plans';
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardHome />} />
            {/* Placeholder routes for other links */}
            <Route path="task" element={<Task />} />
            <Route path="membership" element={<Membership />} />
            <Route path="plans" element={<Plans />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;
