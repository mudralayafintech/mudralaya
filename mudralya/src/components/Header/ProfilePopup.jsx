import React from 'react';
import { Link } from 'react-router-dom';
import './ProfilePopup.css';
import { useModal } from '../../context/ModalContext';

const ProfilePopup = ({ isOpen, onClose, userRef }) => {
    const { user, logout } = useModal();

    if (!isOpen || !user) return null;

    return (
        <div className="profile-popup">
            <div className="profile-popup-header">
                <div className="profile-popup-user-info">
                    <img
                        src="/assets/profile-icon.png"
                        alt="Profile"
                        className="profile-popup-avatar"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=U'; }}
                    />
                    <div className="profile-popup-details">
                        <h3 className="profile-popup-name">
                            {user.firstName ? `${user.firstName} ${user.lastName || ''}` : `User ${user.mobileNumber ? user.mobileNumber.slice(-4) : ""}`}
                        </h3>
                        <p className="profile-popup-status">Free Partner</p>
                    </div>
                </div>

                <Link to="/membership" className="profile-popup-upgrade-link">
                    Become our Member for more benefits
                </Link>
            </div>

            <hr className="profile-popup-divider" />

            <div className="profile-popup-body">
                <a
                    href="https://user.mudralaya.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-popup-section-title profile-popup-dashboard-link"
                >
                    Dashboard
                </a>

                <button className="profile-popup-logout-btn" onClick={() => {
                    logout();
                    onClose();
                }}>
                    Log out
                </button>
            </div>
        </div>
    );
};

export default ProfilePopup;
