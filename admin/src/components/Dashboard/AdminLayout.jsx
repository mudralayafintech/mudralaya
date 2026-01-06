import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

const AdminLayout = ({ children, activeTab, setActiveTab, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="admin-layout">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={onLogout}
                isMobileOpen={isSidebarOpen}
                toggleMobileSidebar={toggleSidebar}
            />

            <div className="admin-main">
                <header className="admin-header">
                    <button className="mobile-menu-btn" onClick={toggleSidebar}>
                        <i className="fas fa-bars"></i>
                    </button>
                    <h2 className="header-title">
                        {activeTab === 'overview' && 'Dashboard Overview'}
                        {activeTab === 'join' && 'Member Join Requests'}
                        {activeTab === 'contacts' && 'Contact Messages'}
                        {activeTab === 'advisor' && 'Advisor Applications'}
                        {activeTab === 'tasks' && 'Task Manager'}
                    </h2>
                    <div className="header-actions">
                        <button className="icon-btn notification-btn">
                            <i className="far fa-bell"></i>
                            <span className="badge-dot"></span>
                        </button>
                    </div>
                </header>

                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
