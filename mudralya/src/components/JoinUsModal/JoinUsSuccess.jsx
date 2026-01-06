import React from 'react';
import './JoinUsSuccess.css';

const JoinUsSuccess = ({ onClose, onPayment }) => {
    return (
        <div className="join-us-success">
            <button className="success-close" onClick={onClose}>
                <i className="fas fa-times"></i>
            </button>

            <div className="success-header">
                <h2 className="success-title">Mudralaya Welcomes You as Our Partner!</h2>
                <p className="success-subtitle">
                    Congratulations on becoming our partner. Become our early member too and join the waitlist in
                    just rupees <span style={{ textDecoration: 'line-through', color: '#999' }}>999.00</span> <strong>99.00/- limited time offer till 1 January</strong>
                </p>
            </div>

            <div className="success-content">
                <div className="success-image-container">
                    {/* Placeholder for the reward image */}
                    <img
                        src="/images/reward.png"
                        alt="250 Cash Reward"
                        className="success-image"
                    />
                </div>

                <div className="success-features">
                    <div className="feature-item">
                        <div className="feature-number">01</div>
                        <h3 className="feature-title">Earn 250 Cash</h3>
                        <p className="feature-description">
                            Get a reward of 250 in your Mudralaya Wallet as a early joining Bonus.
                        </p>
                    </div>

                    <div className="feature-item">
                        <div className="feature-number">02</div>
                        <h3 className="feature-title">Extra Earning</h3>
                        <p className="feature-description">
                            Your will get extra earning for the same task for which other's are getting lesser
                        </p>
                    </div>

                    <div className="feature-item">
                        <div className="feature-number">03</div>
                        <h3 className="feature-title">High Paying Task</h3>
                        <p className="feature-description">
                            You will get free access of high paying task after becoming our member
                        </p>
                    </div>

                    <div className="feature-item">
                        <div className="feature-number">04</div>
                        <h3 className="feature-title">Free Training</h3>
                        <p className="feature-description">
                            A FREE training course worth ₹10,000 to support your journey toward financial independence
                        </p>
                    </div>
                </div>
            </div>

            <div className="success-footer">
                <p className="footer-text">Join today and start earning!</p>
                <button className="btn-payment" onClick={onPayment}>
                    Proceed for payment
                </button>
            </div>
        </div>
    );
};

export default JoinUsSuccess;
