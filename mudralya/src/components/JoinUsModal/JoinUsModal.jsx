import React, { useState } from 'react';
import './JoinUsModal.css';
import { useModal } from '../../context/ModalContext';

import { supabase } from '../../supabaseClient';
import JoinUsSuccess from './JoinUsSuccess';
import SuccessPopup from '../SuccessPopup/SuccessPopup';
import MembershipCard from '../MembershipCard/MembershipCard';

const JoinUsModal = ({ isOpen, onClose, initialPlan = '' }) => {
    const { modalData } = useModal();
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        emailId: '',
        dateOfBirth: '',
        profession: '',
        plan: ''
    });

    // Update plan when initialPlan changes or modal opens
    React.useEffect(() => {
        if (isOpen && initialPlan) {
            setFormData(prev => ({
                ...prev,
                plan: initialPlan
            }));
        }
    }, [isOpen, initialPlan]);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submissionId, setSubmissionId] = useState(null);
    const [showFinalSuccessPopup, setShowFinalSuccessPopup] = useState(false);
    const [showMembership, setShowMembership] = useState(false);
    const [paymentBusy, setPaymentBusy] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetAndClose = () => {
        setSubmitted(false);
        setShowFinalSuccessPopup(false);
        setShowMembership(false);
        setSubmissionId(null);
        setPaymentBusy(false);
        setFormData({
            fullName: '',
            mobileNumber: '',
            emailId: '',
            dateOfBirth: '',
            profession: '',
            plan: ''
        });
        onClose();
    };

    const handleClose = (fromSuccess = false) => {
        if (fromSuccess) {
            // content for success popup
            setShowFinalSuccessPopup(true);
            // Don't close immediately, let the popup show
        } else {
            resetAndClose();
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (overrideSubmissionId = null, overrideAmount = null) => {
        // Sanitize inputs: If called via onClick, first arg is an Event object
        const safeSubmissionId = (typeof overrideSubmissionId === 'string') ? overrideSubmissionId : null;
        const safeAmount = (typeof overrideAmount === 'number') ? overrideAmount : null;

        const activeSubmissionId = safeSubmissionId || submissionId;

        if (!activeSubmissionId) {
            alert('Please submit your details first, then proceed for payment.');
            return;
        }

        if (paymentBusy) return;
        setPaymentBusy(true);

        const res = await loadRazorpayScript();

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setPaymentBusy(false);
            return;
        }

        // Determine amount: override -> context -> default
        let amountToPay = 99; // Default backup

        console.log('Payment Debug:', {
            safeAmount,
            plan: formData.plan,
            finalPrice: modalData?.finalPrice,
            initialPlan
        });

        if (safeAmount && safeAmount > 0) {
            amountToPay = safeAmount;
        } else if (formData.plan === 'individual') {
            // Only try to parse if it's the Individual plan
            const extracted = String(modalData?.finalPrice || '').replace(/[^0-9]/g, '');
            const parsed = extracted ? Number(extracted) : 0;
            if (parsed > 0) amountToPay = parsed;
        } else {
            // Standard fee for others
            amountToPay = 99;
        }

        // Final safety check
        if (!amountToPay || amountToPay < 1) {
            console.warn('Invalid amount detected, resetting to 99');
            amountToPay = 99;
        }

        // 1. Create Order on Backend
        let orderData;
        try {
            const { data: res, error } = await supabase.functions.invoke('razorpay-api', {
                body: {
                    action: 'create-order',
                    data: {
                        amount: amountToPay,
                        currency: 'INR',
                        receipt: `join_${activeSubmissionId}`
                    }
                }
            });

            if (error) throw error;
            orderData = res;
        } catch (err) {
            console.error('Failed to create order', err);
            alert('Failed to initiate payment: ' + (err.message || 'Please try again.'));
            setPaymentBusy(false);
            return;
        }

        if (!orderData?.keyId) {
            alert('Payment configuration error: Missing Razorpay key. Please try again later.');
            setPaymentBusy(false);
            return;
        }

        // Create options for Razorpay Checkout
        const options = {
            key: orderData.keyId,
            amount: orderData.amount, // Amount from backend order
            currency: orderData.currency,
            name: 'Mudralaya',
            description: 'Partner Membership Fee',
            image: '/images/mudralya_logo.webp', // Optional: logo
            order_id: orderData.id, // Order ID from backend
            handler: async function (response) {
                try {
                    const { error: verifyError } = await supabase.functions.invoke('razorpay-api', {
                        body: {
                            action: 'verify-payment',
                            data: {
                                submissionId: activeSubmissionId,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            }
                        }
                    });

                    if (verifyError) throw verifyError;

                    // For individual plan, we might want to close or show success
                    // The original flow shows MembershipCard
                    setShowMembership(true);
                } catch (error) {
                    console.error('Failed to verify payment', error);
                    alert(
                        `Payment verification failed: ${error.message}. If your amount was deducted, please contact support with Payment ID: ${response.razorpay_payment_id}`
                    );
                    setPaymentBusy(false);
                    return;
                }
            },
            modal: {
                ondismiss: () => setPaymentBusy(false)
            },
            prefill: {
                name: formData.fullName,
                email: formData.emailId,
                contact: formData.mobileNumber
            },
            notes: {
                address: 'Mudralaya Office'
            },
            theme: {
                color: '#00a0dc'
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        setSubmitting(true);
        try {
            // Prepare payload with extra fields if available
            const payload = { ...formData };
            if (modalData?.hasLaptop !== undefined) {
                payload.hasLaptop = modalData.hasLaptop;
            }

            // Calculate amount for backend storage (optional, but good for record)
            let calculatedAmount = 99;
            if (formData.plan === 'individual' && modalData?.finalPrice) {
                const extracted = String(modalData.finalPrice).replace(/[^0-9]/g, '');
                calculatedAmount = extracted ? Number(extracted) : 99;
            }
            payload.amount = calculatedAmount;

            const { data: response, error } = await supabase.functions.invoke('forms-api', {
                body: { action: 'submit-join-request', data: payload }
            });

            if (error) throw error;

            let newSubmissionId = null;
            if (response && response.id) {
                setSubmissionId(response.id);
                newSubmissionId = response.id;
            }

            // JOIN LOGIC SPLIT
            if (formData.plan === 'individual') {
                // Direct Payment Flow
                // We pass the new ID and amount directly because state updates (setSubmissionId) are async
                await handlePayment(newSubmissionId, calculatedAmount);
                // We do NOT setSubmitted(true) here to avoid the intermediate "JoinUsSuccess" popup
                // If payment is successful, handlePayment sets ShowMembership(true)
            } else {
                // Standard Flow
                setSubmitted(true);
            }

        } catch (err) {
            if (err.data?.errors) {
                const fieldErrors = Object.values(err.data.errors)
                    .flat()
                    .filter(Boolean)
                    .join(', ');
                setSubmitError(fieldErrors || err.message);
            } else {
                setSubmitError(err.message || 'Failed to submit. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Render Final Success Popup if active
    if (showFinalSuccessPopup) {
        return (
            <SuccessPopup
                message="You are registered successfully with us"
                onClose={resetAndClose}
            />
        );
    }

    if (!isOpen) return null;

    if (submitted && !showMembership) {
        return (
            <div className="modal-overlay" onClick={() => handleClose(true)}>
                <div className="join-us-modal success-mode" onClick={(e) => e.stopPropagation()}>
                    <JoinUsSuccess
                        onClose={() => handleClose(true)}
                        onPayment={handlePayment}
                    />
                </div>
            </div>
        );
    }

    if (showMembership) {
        return (
            <MembershipCard
                name={formData.fullName}
                plan={formData.plan}
                memberId={submissionId ? submissionId.slice(-6).toUpperCase() : 'NEW'}
                onClose={resetAndClose}
            />
        );
    }

    return (
        <div className="modal-overlay" onClick={() => handleClose(false)}>
            <div className="join-us-modal" onClick={(e) => e.stopPropagation()}>
                {/* Left Side - Illustration */}
                <div className="modal-left">

                    <div className="modal-illustration">
                        <img
                            src="/images/join-us-illustration.png"
                            alt="Join Us"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x300?text=Join+Us';
                            }}
                        />
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="modal-right">
                    <button className="modal-close" onClick={() => handleClose(false)}>
                        <i className="fas fa-times"></i>
                    </button>

                    <h2 className="modal-title">Become our Partner</h2>
                    <p className="modal-subtitle">
                        Join Mudralaya today and start earning by completing<br />
                        simple, easy tasks of your choice—anytime, anywhere!
                    </p>
                    {submitError && (
                        <div className="alert alert-danger py-2">
                            {submitError}
                        </div>
                    )}

                    <div className="form-section-title">Your personal data</div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name*</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="mobileNumber">Mobile Number*</label>
                            <input
                                type="tel"
                                id="mobileNumber"
                                name="mobileNumber"
                                placeholder="Enter mobile number"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="emailId">Email Id</label>
                            <input
                                type="email"
                                id="emailId"
                                name="emailId"
                                placeholder="Enter email address"
                                value={formData.emailId}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="dateOfBirth">Date of birth*</label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="profession">Profession*</label>
                            <select
                                id="profession"
                                name="profession"
                                value={formData.profession}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select profession</option>
                                <option value="student">Student</option>
                                <option value="working-professional">Working Professional</option>
                                <option value="house-wife">House Wife</option>
                                <option value="business-man">Business Man</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="plan">Plan*</label>
                            <select
                                id="plan"
                                name="plan"
                                value={formData.plan}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select plan</option>
                                <option value="free">Free</option>
                                <option value="individual">Individual</option>
                                <option value="business-solution">Business Solution</option>
                                <option value="startup-launch-lab">Startup Launch Lab</option>
                            </select>
                        </div>

                        <button type="submit" className="btn-proceed" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Form'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JoinUsModal;
