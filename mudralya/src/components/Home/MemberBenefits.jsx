import React from 'react';
import './MemberBenefits.css';
import { useModal } from '../../context/ModalContext';

const MemberBenefits = () => {
    const { openJoinUsModal } = useModal();

    return (
        <section className="member-benefits-section">
            <div className="container">
                <div className="benefits-box">

                    <div className="benefits-header-area">
                        <h2 className="benefits-main-title">
                            Benefits of Becoming<br />
                            Our member <span className="strikethrough-price">999</span> 99/-
                        </h2>
                        <p className="benefits-desc">
                            Become our early member and join the waitlist in just rupees <strong>99/- limited time offer till 1 January</strong>
                        </p>
                    </div>

                    <div className="benefits-content-row">
                        {/* Left Column: Image */}
                        <div className="benefits-visual-col">
                            <img
                                src="/images/benefits.png"
                                alt="Member Benefits Visual"
                                className="benefits-img"
                            />
                        </div>

                        {/* Right Column: 4 Grid Items */}
                        <div className="benefits-grid-col">
                            <div className="benefits-grid-layout">
                                {/* Item 1 */}
                                <div className="benefit-card">
                                    <div className="benefit-number-badge">01</div>
                                    <h4>Earn 250 Cash</h4>
                                    <p>Get a reward of 250 in your Mudralaya Wallet as a early joining Bonus.</p>
                                </div>

                                {/* Item 2 */}
                                <div className="benefit-card">
                                    <div className="benefit-number-badge">02</div>
                                    <h4>Extra Earning</h4>
                                    <p>Your will get extra earning for the same task for which other's are getting lesser</p>
                                </div>

                                {/* Item 3 */}
                                <div className="benefit-card">
                                    <div className="benefit-number-badge">03</div>
                                    <h4>High Paying Task</h4>
                                    <p>You will get free access of high paying task after becoming our member</p>
                                </div>

                                {/* Item 4 */}
                                <div className="benefit-card">
                                    <div className="benefit-number-badge">04</div>
                                    <h4>Free Training</h4>
                                    <p>A FREE training course worth ₹10,000 to support your journey toward financial independence</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="benefits-footer-area">
                        <p className="join-today-text">Join today and start earning!</p>
                        <button
                            className="btn-become-partner"
                            onClick={() => openJoinUsModal('individual')}
                        >
                            Become our Partner
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default MemberBenefits;
