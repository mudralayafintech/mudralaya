import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './MembershipCard.css';

const MembershipCard = ({ name, plan, memberId, validFrom, onClose }) => {
    const cardRef = useRef(null);
    const navigate = useNavigate();

    const handleDownload = () => {
        // Future implementation: html2canvas or similar
        alert('Download feature coming soon!');
    };

    const handleGoToDashboard = () => {
        onClose(); // Close modal first
        navigate('/member-dashboard');
    };

    // Format plan name for display
    const formatPlanName = (planKey) => {
        if (!planKey) return 'Member';
        return planKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const formattedDate = new Date(validFrom || Date.now()).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="membership-card-overlay">
            {/* Confetti or success animation can be added here */}

            <div className="membership-card-container fade-in-up">
                <div className="card-header-actions">
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="premium-card" ref={cardRef}>
                    <div className="card-shine"></div>

                    <div className="card-top">
                        <img src="/images/mudralya_logo.webp" alt="Mudralaya" className="card-logo" />
                        <span className="card-label">PREMIUM MEMBER</span>
                    </div>

                    <div className="card-chip">
                        <img src="https://raw.githubusercontent.com/dashnow/dashboard/main/chip.png" alt="chip" />
                    </div>

                    <div className="card-details">
                        <div className="detail-group">
                            <label>Name</label>
                            <h3 className="member-name">{name}</h3>
                        </div>

                        <div className="detail-row">
                            <div className="detail-group">
                                <label>Plan</label>
                                <p className="member-plan">{formatPlanName(plan)}</p>
                            </div>
                            <div className="detail-group right">
                                <label>Member ID</label>
                                <p className="member-id">{memberId || 'PENDING'}</p>
                            </div>
                        </div>

                        <div className="detail-row bottom">
                            <div className="detail-group">
                                <label>Valid From</label>
                                <p className="member-date">{formattedDate}</p>
                            </div>
                            <div className="verified-badge">
                                <i className="fas fa-check-circle"></i> Verified
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-actions">
                    <h2 className="success-title">Welcome to the Family!</h2>
                    <p className="success-message">Your payment was successful. Here is your digital membership card.</p>
                    <button className="download-btn" onClick={handleDownload}>
                        <i className="fas fa-download"></i> Download Card
                    </button>
                    <button className="dashboard-btn" onClick={handleGoToDashboard}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MembershipCard;
