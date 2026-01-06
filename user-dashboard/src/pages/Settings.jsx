import React, { useState } from 'react';
import { FiUser, FiLock, FiBell, FiHelpCircle, FiFileText } from 'react-icons/fi';
import './Settings.css';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('account');

    const renderContent = () => {
        switch (activeTab) {
            case 'account':
                return (
                    <div className="settings-panel">
                        <h2 className="settings-section-title">Account Settings</h2>
                        <form className="settings-form">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" defaultValue="Ankit Gupta" />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" defaultValue="ankit@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" defaultValue="+91 98765 43210" />
                            </div>
                            <button className="save-btn">Save Changes</button>
                        </form>
                    </div>
                );
            case 'security':
                return (
                    <div className="settings-panel">
                        <h2 className="settings-section-title">Security</h2>
                        <form className="settings-form">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input type="password" />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" />
                            </div>
                            <button className="save-btn">Update Password</button>
                        </form>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="settings-panel">
                        <h2 className="settings-section-title">Notifications</h2>
                        <div className="toggle-row">
                            <div className="toggle-info">
                                <h4>Email Notifications</h4>
                                <p>Receive emails about your account activity.</p>
                            </div>
                            <div className="toggle-switch on"><div className="toggle-handle"></div></div>
                        </div>
                        <div className="toggle-row">
                            <div className="toggle-info">
                                <h4>Task Updates</h4>
                                <p>Get notified when a task is approved.</p>
                            </div>
                            <div className="toggle-switch on"><div className="toggle-handle"></div></div>
                        </div>
                        <div className="toggle-row">
                            <div className="toggle-info">
                                <h4>Promotional Offers</h4>
                                <p>Receive updates about new plans and offers.</p>
                            </div>
                            <div className="toggle-switch"><div className="toggle-handle"></div></div>
                        </div>
                    </div>
                );
            default:
                return <div>Select a setting</div>;
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Manage your account preferences and settings.</p>
            </div>

            <div className="settings-container">
                <div className="settings-sidebar">
                    <button
                        className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
                        onClick={() => setActiveTab('account')}
                    >
                        <FiUser /> Account
                    </button>
                    <button
                        className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <FiLock /> Security
                    </button>
                    <button
                        className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notifications')}
                    >
                        <FiBell /> Notifications
                    </button>
                    <button className="settings-tab">
                        <FiFileText /> Terms of Service
                    </button>
                    <button className="settings-tab">
                        <FiHelpCircle /> Help & Support
                    </button>
                </div>
                <div className="settings-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Settings;
