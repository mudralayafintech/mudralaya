import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../supabaseClient';
import { FaUser, FaPhoneAlt, FaEnvelope, FaCamera, FaSave, FaTimes, FaEdit, FaBriefcase } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
    const { user, profile: contextProfile } = useUser();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        profession: '',
        email_id: '',
        date_of_birth: '',
        phone: ''
    });

    // OTP State for Phone Update
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fileInputRef = useRef(null);

    // Initialize/Update local profile state from Context
    useEffect(() => {
        if (contextProfile) {
            setProfile(contextProfile);
            setFormData({
                full_name: contextProfile.full_name || '',
                profession: contextProfile.profession || '',
                email_id: contextProfile.email_id || '',
                date_of_birth: contextProfile.date_of_birth || '',
                phone: user?.phone || contextProfile.mobile_number || ''
            });
            setLoading(false);
        } else if (user) {
            // Context is still loading or failed, but user exists. 
            // We can wait for context to update (it has its own fetching logic)
            // or just set loading=true
            setLoading(true);
        }
    }, [contextProfile, user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setMessage({ type: '', text: '' });
        setOtpSent(false);
        setOtp('');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);

            // Sanitize filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            // Path: /public/fileName (ensure no weird folders)
            const filePath = `${fileName}`;

            // console.log('Uploading to:', filePath);

            let { error: uploadError } = await supabase.storage
                .from('profile-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error('Supabase upload error:', uploadError);
                throw uploadError;
            }

            const { data: publicUrlData } = supabase.storage
                .from('profile-images')
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData.publicUrl;

            // Update user profile with new avatar URL directly
            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
            setMessage({ type: 'success', text: 'Profile image updated!' });

        } catch (error) {
            console.error('Error uploading image full:', error);
            setMessage({ type: 'error', text: `Error uploading image: ${error.message || 'Unknown error'}` });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setMessage({ type: '', text: '' });

        // Check if phone number is changed
        const currentPhone = user?.phone?.replace('+', '') || '';
        const newPhone = formData.phone?.replace('+', '') || '';

        if (newPhone && newPhone !== currentPhone) {
            // Initiate Phone Update Flow
            try {
                // Formatting for Supabase (needs +)
                const formattedPhone = newPhone.startsWith('91') || newPhone.startsWith('+91')
                    ? (newPhone.startsWith('+') ? newPhone : `+${newPhone}`)
                    : `+91${newPhone}`; // Default to India if no code

                const { error } = await supabase.auth.updateUser({ phone: formattedPhone });
                if (error) throw error;

                setOtpSent(true);
                setMessage({ type: 'info', text: 'OTP sent to new phone number. Please verify.' });
                return; // Stop here, wait for OTP
            } catch (err) {
                setMessage({ type: 'error', text: err.message });
                return;
            }
        }

        // Update other fields directly
        await updateProfileData();
    };

    const verifyPhoneOtp = async () => {
        setVerifyingOtp(true);
        try {
            // Formatting for Supabase (needs +)
            const newPhone = formData.phone?.replace('+', '') || '';
            const formattedPhone = newPhone.startsWith('91') || newPhone.startsWith('+91')
                ? (newPhone.startsWith('+') ? newPhone : `+${newPhone}`)
                : `+91${newPhone}`;

            const { error } = await supabase.auth.verifyOtp({
                phone: formattedPhone,
                token: otp,
                type: 'phone_change'
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Phone number updated successfully!' });
            setOtpSent(false);
            // After phone update, ensure other data is also saved
            await updateProfileData();

        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setVerifyingOtp(false);
        }
    };

    const updateProfileData = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('users')
                .update({
                    full_name: formData.full_name,
                    profession: formData.profession,
                    email_id: formData.email_id,
                    date_of_birth: formData.date_of_birth
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            setProfile(prev => ({
                ...prev,
                ...data
            }));

            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Error updating profile' });
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile) return <div className="profile-loading">Loading Profile...</div>;

    return (
        <div className="profile-wrapper">
            <div className="profile-card glass-card">

                {message.text && (
                    <div className={`message-banner ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="profile-content-layout">
                    {/* Left Column: Avatar & Actions */}
                    <div className="profile-header">
                        <div className="avatar-container">
                            <img
                                src={profile?.avatar_url || 'https://placehold.co/150'}
                                alt="Profile"
                                className="profile-avatar"
                                onError={(e) => { e.target.src = 'https://placehold.co/150'; }}
                            />
                            {isEditing && (
                                <>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                    />
                                    <button className="edit-avatar-btn" onClick={() => fileInputRef.current.click()}>
                                        <FaCamera />
                                    </button>
                                </>
                            )}
                        </div>

                        {!isEditing ? (
                            <>
                                <h2>{profile?.full_name || 'User'}</h2>
                                <p className="profile-role">{profile?.role || 'Member'}</p>
                            </>
                        ) : (
                            <h2 className="edit-mode-title">Editing Profile</h2>
                        )}

                        {/* Actions Logic - Placed here to be in the left sidebar */}
                        <div className="profile-actions">
                            {isEditing ? (
                                <div className="edit-actions">
                                    <button className="btn-save" onClick={handleSave} disabled={otpSent}>
                                        <FaSave /> Save
                                    </button>
                                    <button className="btn-cancel" onClick={handleEditToggle}>
                                        <FaTimes /> Cancel
                                    </button>
                                </div>
                            ) : (
                                <button className="btn-edit-profile" onClick={handleEditToggle}>
                                    <FaEdit /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Form Inputs */}
                    <div className="profile-details">
                        <div className="detail-item">
                            <FaUser className="detail-icon" />
                            <div className="detail-content">
                                <label>Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        className="edit-input"
                                        placeholder="Enter Full Name"
                                    />
                                ) : (
                                    <p>{profile?.full_name || 'Not set'}</p>
                                )}
                            </div>
                        </div>

                        <div className="detail-item">
                            <FaPhoneAlt className="detail-icon" />
                            <div className="detail-content">
                                <label>Phone</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="edit-input"
                                        placeholder="Enter Phone Number"
                                    />
                                ) : (
                                    <p>{user?.phone || profile?.phone || 'N/A'}</p>
                                )}
                            </div>
                        </div>

                        {otpSent && isEditing && (
                            <div className="otp-verification-block">
                                <input
                                    type="text"
                                    placeholder="Enter OTP sent to new number"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="edit-input otp-input"
                                />
                                <button onClick={verifyPhoneOtp} disabled={verifyingOtp} className="verify-btn">
                                    {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </div>
                        )}

                        <div className="detail-item">
                            <FaEnvelope className="detail-icon" />
                            <div className="detail-content">
                                <label>Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email_id"
                                        value={formData.email_id}
                                        onChange={handleInputChange}
                                        className="edit-input"
                                        placeholder="Enter Email"
                                    />
                                ) : (
                                    <p>{profile?.email_id || 'No email'}</p>
                                )}
                            </div>
                        </div>

                        <div className="detail-item">
                            <FaEdit className="detail-icon" />
                            <div className="detail-content">
                                <label>Date of Birth</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleInputChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    <p>{profile?.date_of_birth || 'Not set'}</p>
                                )}
                            </div>
                        </div>

                        <div className="detail-item">
                            <FaBriefcase className="detail-icon" />
                            <div className="detail-content">
                                <label>Profession</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="profession"
                                        value={formData.profession}
                                        onChange={handleInputChange}
                                        className="edit-input"
                                        placeholder="Enter Profession"
                                    />
                                ) : (
                                    <p>{profile?.profession || 'Not set'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
