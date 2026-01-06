import React, { useState } from 'react';
import './LoginModal.css';
import { useModal } from '../../context/ModalContext';
import { supabase } from '../../supabaseClient';

const LoginModal = ({ isOpen, onClose }) => {
    const { login } = useModal();
    const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleClose = () => {
        setStep(1);
        setMobileNumber('');
        setOtp('');
        setError('');
        setSuccessMessage('');
        onClose();
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                phone: `+91${mobileNumber}`,
            });
            if (otpError) throw otpError;

            setStep(2);
            setSuccessMessage(`OTP sent to ${mobileNumber}`);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data: { session, user }, error: verifyError } = await supabase.auth.verifyOtp({
                phone: `+91${mobileNumber}`,
                token: otp,
                type: 'sms',
            });

            if (verifyError) throw verifyError;

            setSuccessMessage('Login successful! Redirecting to Dashboard...');

            // Update global state
            login(user);

            setTimeout(() => {
                // Redirecting to User Dashboard
                // Dev: localhost:5173 | Prod: user.mudralaya.com
                const dashboardUrl = import.meta.env.DEV
                    ? 'http://localhost:5173'
                    : 'https://user.mudralaya.com';

                window.location.href = dashboardUrl;
            }, 1000);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Invalid OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="login-modal-overlay" onClick={handleClose}>
            <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="login-modal-close" onClick={handleClose}>
                    &times;
                </button>

                <div className="login-modal-header">
                    <h2>Login</h2>
                    <p>Enter your details to access your account</p>
                </div>

                <div className="login-modal-body">
                    {error && <div className="alert alert-danger">{error}</div>}
                    {successMessage && (
                        <div className="alert alert-success">
                            {successMessage}
                            <div className="mt-2 small">
                                <a
                                    href={import.meta.env.DEV ? 'http://localhost:5173' : 'https://user.mudralaya.com'}
                                    className="text-success fw-bold"
                                >
                                    Click here if not redirected
                                </a>
                            </div>
                        </div>
                    )}



                    {step === 1 ? (
                        <form onSubmit={handleSendOTP}>
                            <div className="form-group">
                                <label htmlFor="mobileNumber">Mobile Number</label>
                                <input
                                    type="tel"
                                    id="mobileNumber"
                                    className="form-control"
                                    placeholder="Enter 10 digit mobile number"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    required
                                    pattern="[0-9]{10}"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading || mobileNumber.length !== 10}>
                                {loading ? 'Sending OTP...' : 'Get OTP (SMS)'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP}>
                            <div className="form-group">
                                <label htmlFor="otp">Enter OTP</label>
                                <input
                                    type="text"
                                    id="otp"
                                    className="form-control"
                                    placeholder="Enter 6 digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    maxLength={6}
                                />
                                <div className="text-end mt-2">
                                    <button
                                        type="button"
                                        className="btn-link-custom"
                                        onClick={() => setStep(1)}
                                        disabled={loading}
                                    >
                                        Change Number?
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading || otp.length !== 6}>
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
