import React from 'react';
import { MdMenu, MdNotifications, MdSettings, MdHelp, MdSearch } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import './Header.css';

const Header = ({ toggleSidebar }) => {
    const { profile } = useUser();
    const displayName = profile?.full_name || 'User';
    const displayRole = profile?.profession || 'Member';
    const displayAvatar = profile?.avatar_url || 'https://placehold.co/40';

    return (
        <header className="dashboard-header">
            <div className="header-left">
                <button className="menu-btn" onClick={toggleSidebar}>
                    <MdMenu />
                </button>
                <h2 className="page-title">Dashboard</h2>
            </div>

            <div className="header-center">
                <div className="search-bar">
                    <MdSearch className="search-icon" />
                    <input type="text" placeholder="Search...." />
                </div>
            </div>

            <div className="header-right">
                <button className="icon-btn notification-btn">
                    <MdNotifications />
                    <span className="badge"></span>
                </button>
                <button className="icon-btn notification-btn">
                    <MdNotifications />
                    <span className="badge"></span>
                </button>
                <button className="icon-btn help-btn" title="Help">
                    <MdHelp />
                </button>

                <Link to="/profile" className="user-profile-link">
                    <div className="user-profile">
                        <div className="user-info">
                            <span className="user-name">{displayName}</span>
                            <span className="user-role">{displayRole}</span>
                        </div>
                        <img
                            src={displayAvatar}
                            alt={displayName}
                            className="user-avatar"
                            onError={(e) => { e.target.src = 'https://placehold.co/40'; }}
                        />
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default Header;
