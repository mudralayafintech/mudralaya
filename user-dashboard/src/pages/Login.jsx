import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaLock, FaArrowRight, FaSpinner } from 'react-icons/fa';
import './Login.css';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let formattedPhone = phone.trim();
        // Default to India (+91) if no country code provided
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+91' + formattedPhone;
        }

        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: formattedPhone,
            });
            if (error) throw error;
            setPhone(formattedPhone); // Update state to correct format for verification
            setStep('otp');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.verifyOtp({
                phone: phone,
                token: otp,
                type: 'sms',
            });
            if (error) throw error;
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const [timer, setTimer] = useState(60);
    const [resendAttempts, setResendAttempts] = useState(0);

    React.useEffect(() => {
        let interval;
        if (step === 'otp' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleResendOtp = async () => {
        if (resendAttempts >= 3) return;

        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                phone: phone,
            });
            if (error) throw error;
            setTimer(60);
            setResendAttempts((prev) => prev + 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePhoneNumber = () => {
        setStep('phone');
        setOtp('');
        setTimer(60);
        setResendAttempts(0);
        setError(null);
        // If phone currently has +91 prefix from previous step, strip it for input display logic if needed
        // But the input logic below handles raw input, so we might want to strip +91 if we want to show just 10 digits
        if (phone.startsWith('+91')) {
            setPhone(phone.slice(3));
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-header">
                    <img src="/mudralaya_logo.webp" alt="Mudralaya Logo" className="logo" />
                    <h1>Welcome Back</h1>
                    <p>Secure Client Access</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className={`login-form-container ${step === 'otp' ? 'slide-left' : ''}`}>
                    {step === 'phone' ? (
                        <form onSubmit={handleSendOtp} className="login-form">
                            <div className="input-group">
                                <span className="phone-prefix">+91</span>
                                <input
                                    type="tel"
                                    placeholder="Enter 10-digit number"
                                    value={phone.replace('+91', '')} // Show only 10 digits
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setPhone(val);
                                    }}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading || phone.replace('+91', '').length !== 10} className="btn-primary">
                                {loading ? <FaSpinner className="spinner" /> : <>Send OTP <FaArrowRight /></>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="login-form">
                            <div className="otp-sent-info">
                                <p className="otp-sent-text">
                                    OTP sent to <strong>{phone}</strong>
                                </p>
                                <p className="otp-delivery-hint">
                                    You will receive the OTP via SMS or Call.
                                </p>
                            </div>
                            <div className="input-group">
                                <FaLock className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary">
                                {loading ? <FaSpinner className="spinner" /> : 'Verify & Login'}
                            </button>

                            <div className="otp-actions">
                                {timer > 0 ? (
                                    <span className="timer-text">Resend OTP in {timer}s</span>
                                ) : (
                                    <button
                                        type="button"
                                        className="btn-text resend-btn"
                                        onClick={handleResendOtp}
                                        disabled={loading || resendAttempts >= 3}
                                    >
                                        {resendAttempts >= 3 ? "Max attempts reached" : "Resend OTP"}
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                className="btn-text change-phone-btn"
                                onClick={handleChangePhoneNumber}
                                disabled={loading}
                            >
                                Edit Phone Number
                            </button>
                        </form>
                    )}
                </div>

                <div className="login-footer">
                    <p>&copy; {new Date().getFullYear()} Mudralaya Fintech. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
