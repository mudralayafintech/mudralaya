import React from 'react';
import './DashboardLayout.css';

const Sidebar = ({ activeTab, setActiveTab, onLogout, isMobileOpen, toggleMobileSidebar }) => {
    const navItems = [
        { id: 'overview', icon: 'fas fa-chart-line', label: 'Overview' },
        { id: 'join', icon: 'fas fa-user-plus', label: 'Join Requests' },
        { id: 'contacts', icon: 'fas fa-envelope', label: 'Messages' },
        { id: 'advisor', icon: 'fas fa-briefcase', label: 'Advisors' },
        { id: 'tasks', icon: 'fas fa-tasks', label: 'Task Manager' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${isMobileOpen ? 'active' : ''}`}
                onClick={toggleMobileSidebar}
            ></div>

            <aside className={`admin-sidebar ${isMobileOpen ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <img src="/images/mudralya_logo.webp" alt="Mudralaya" className="sidebar-logo" />
                    <span className="sidebar-brand">Admin Panel</span>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.id}>
                                <button
                                    className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        if (window.innerWidth < 992) toggleMobileSidebar();
                                    }}
                                >
                                    <span className="nav-indicator"></span>
                                    <i className={`${item.icon} nav-icon`}></i>
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-link logout-btn" onClick={onLogout}>
                        <i className="fas fa-sign-out-alt nav-icon"></i>
                        <span>Logout</span>
                    </button>
                    <div className="admin-profile">
                        <div className="admin-avatar">A</div>
                        <div className="admin-info">
                            <span className="admin-name">Admin User</span>
                            <span className="admin-role">Super Admin</span>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
