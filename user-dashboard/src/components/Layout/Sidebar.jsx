import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import {
    MdDashboard,
    MdAssignment,
    MdCardMembership,
    MdViewList,
    MdAccountBalanceWallet,
    MdSettings,
    MdLogout
} from 'react-icons/md';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <img src="/logo.png" alt="Mudralaya" className="sidebar-logo" />
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <MdDashboard className="nav-icon" />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/task" className="nav-item">
                        <MdAssignment className="nav-icon" />
                        <span>Task</span>
                    </NavLink>
                    <NavLink to="/membership" className="nav-item">
                        <MdCardMembership className="nav-icon" />
                        <span>Membership</span>
                    </NavLink>
                    <NavLink to="/plans" className="nav-item">
                        <MdViewList className="nav-icon" />
                        <span>Plans</span>
                    </NavLink>
                    <NavLink to="/wallet" className="nav-item">
                        <MdAccountBalanceWallet className="nav-icon" />
                        <span>Wallet</span>
                    </NavLink>
                    <NavLink to="/settings" className="nav-item">
                        <MdSettings className="nav-icon" />
                        <span>Settings</span>
                    </NavLink>
                </div>

                <div className="nav-section logout-section">
                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <MdLogout className="nav-icon" />
                        <span>Log out</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
