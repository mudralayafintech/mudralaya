import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Advisor.css';

import { supabase } from '../../supabaseClient';

const Advisor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailId: '',
    dateOfBirth: '',
    profession: '',
    irdaLicense: ''
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Full Name Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
      isValid = false;
    }

    // Mobile Number Validation
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
      isValid = false;
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailId.trim())) {
      newErrors.emailId = 'Please enter a valid email address.';
      isValid = false;
    }

    // Date of Birth Validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Please select your date of birth.';
      isValid = false;
    } else {
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future.';
        isValid = false;
      }
    }

    // Profession Validation
    if (!formData.profession) {
      newErrors.profession = 'Please select your profession.';
      isValid = false;
    }

    // IRDAI License Validation
    if (!formData.irdaLicense) {
      newErrors.irdaLicense = 'Please select whether you have an IRDAI license.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      setSubmitError('Please fix the errors above.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('forms-api', {
        body: { action: 'submit-advisor-application', data: formData }
      });

      if (error) throw error;

      setFormData({
        fullName: '',
        mobileNumber: '',
        emailId: '',
        dateOfBirth: '',
        profession: '',
        irdaLicense: ''
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (err) {
      if (err.data?.errors) {
        const fieldErrors = {};
        Object.entries(err.data.errors).forEach(([field, messages]) => {
          fieldErrors[field] = messages?.[0] || 'Invalid value';
        });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      setSubmitError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="advisor-page">
      <div className="advisor-card">
        <i
          className="fas fa-xmark close-btn"
          onClick={handleClose}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClose();
            }
          }}
        ></i>

        <div className="row g-0">
          <div className="col-12 col-lg-5 illustration-side">
            <div className="logo-overlay d-lg-flex logo align-items-center">
              <img
                src="/images/mudralya_logo.webp"
                alt="Mudralaya Fintech Logo"
                className="me-2 rounded-circle"
                style={{ width: '30px', height: '30px' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/30x30?text=M';
                }}
              />
              <span>Mudralaya Fintech</span>
            </div>
          </div>

          <div className="col-lg-7 form-side">
            <h2>Become our Advisor</h2>
            <p className="subtitle">
              It will take a couple of minutes to fill this form so that we can assist you accordingly!
            </p>

            {showSuccess && (
              <div className="alert alert-success mt-3">
                Success! Your form has been submitted. We will contact you shortly.
              </div>
            )}
            {submitError && (
              <div className="alert alert-danger mt-3">
                {submitError}
              </div>
            )}

            <form id="advisorForm" onSubmit={handleSubmit} noValidate>
              <h5 className="section-title">Your personal data</h5>

              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">Full Name*</label>
                <input
                  type="text"
                  className={`form-control ${errors.fullName ? 'is-invalid' : formData.fullName ? 'is-valid' : ''}`}
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && (
                  <div className="invalid-feedback">{errors.fullName}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="mobileNumber" className="form-label">Mobile Number*</label>
                <input
                  type="tel"
                  className={`form-control ${errors.mobileNumber ? 'is-invalid' : formData.mobileNumber && /^[0-9]{10}$/.test(formData.mobileNumber) ? 'is-valid' : ''}`}
                  id="mobileNumber"
                  name="mobileNumber"
                  required
                  pattern="[0-9]{10}"
                  placeholder="Enter mobile number"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                />
                {errors.mobileNumber && (
                  <div className="invalid-feedback">{errors.mobileNumber}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="emailId" className="form-label">Email Id*</label>
                <input
                  type="email"
                  className={`form-control ${errors.emailId ? 'is-invalid' : formData.emailId && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId) ? 'is-valid' : ''}`}
                  id="emailId"
                  name="emailId"
                  required
                  placeholder="Enter email address"
                  value={formData.emailId}
                  onChange={handleChange}
                />
                {errors.emailId && (
                  <div className="invalid-feedback">{errors.emailId}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="dateOfBirth" className="form-label">Date of birth*</label>
                <input
                  type="date"
                  className={`form-control ${errors.dateOfBirth ? 'is-invalid' : formData.dateOfBirth ? 'is-valid' : ''}`}
                  id="dateOfBirth"
                  name="dateOfBirth"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                {errors.dateOfBirth && (
                  <div className="invalid-feedback">{errors.dateOfBirth}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="profession" className="form-label">Profession*</label>
                <select
                  className={`form-select ${errors.profession ? 'is-invalid' : formData.profession ? 'is-valid' : ''}`}
                  id="profession"
                  name="profession"
                  required
                  value={formData.profession}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select Profession</option>
                  <option value="student">Student</option>
                  <option value="working">Working Professional</option>
                  <option value="house wife">House Wife</option>
                  <option value="business">Business Owner</option>
                  <option value="other">Other</option>
                </select>
                {errors.profession && (
                  <div className="invalid-feedback">{errors.profession}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="irdaLicense" className="form-label">Do you have IRDAI License*</label>
                <select
                  className={`form-select ${errors.irdaLicense ? 'is-invalid' : formData.irdaLicense ? 'is-valid' : ''}`}
                  id="irdaLicense"
                  name="irdaLicense"
                  required
                  value={formData.irdaLicense}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select Option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.irdaLicense && (
                  <div className="invalid-feedback">{errors.irdaLicense}</div>
                )}
              </div>

              <button type="submit" className="btn btn-submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Form'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advisor;

