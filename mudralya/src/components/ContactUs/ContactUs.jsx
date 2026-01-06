import React, { useState } from 'react';
import './ContactUs.css';

import { supabase } from '../../supabaseClient';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    occupation: '',
    qualification: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Validation functions
  const validateFullName = (name) => {
    if (!name.trim()) {
      return 'Full name is required';
    }
    if (name.trim().length < 2) {
      return 'Full name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Full name must be less than 50 characters';
    }
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      return 'Full name can only contain letters and spaces';
    }
    return '';
  };

  const validatePhoneNumber = (phone) => {
    const digits = phone.replace(/\D/g, '');
    if (!digits) return 'Phone number is required';
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return 'Enter a valid 10-digit Indian mobile number starting with 6-9';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    if (email.length > 100) {
      return 'Email must be less than 100 characters';
    }
    return '';
  };

  const validateMessage = (message) => {
    if (!message.trim()) {
      return 'Message is required';
    }
    if (message.trim().length < 10) {
      return 'Message must be at least 10 characters';
    }
    if (message.trim().length > 500) {
      return 'Message must be less than 500 characters';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone number formatting
    let formattedValue = value;
    if (name === 'phoneNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      formattedValue = digitsOnly;
    }

    // Full name - only letters and spaces
    if (name === 'fullName') {
      formattedValue = value.replace(/[^a-zA-Z\s]/g, '');
      if (formattedValue.length > 50) {
        formattedValue = formattedValue.substring(0, 50);
      }
    }

    // Message - limit to 500 characters
    if (name === 'message') {
      if (value.length > 500) {
        formattedValue = value.substring(0, 500);
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Validate on change if field has been touched
    if (touched[name]) {
      validateField(name, formattedValue);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'fullName':
        error = validateFullName(value);
        break;
      case 'phoneNumber':
        error = validatePhoneNumber(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'occupation':
        if (!value) {
          error = 'Occupation is required';
        }
        break;
      case 'qualification':
        if (!value) {
          error = 'Qualification is required';
        }
        break;
      case 'message':
        error = validateMessage(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    newErrors.fullName = validateFullName(formData.fullName);
    newErrors.phoneNumber = validatePhoneNumber(formData.phoneNumber);
    newErrors.email = validateEmail(formData.email);
    newErrors.occupation = !formData.occupation ? 'Occupation is required' : '';
    newErrors.qualification = !formData.qualification ? 'Qualification is required' : '';
    newErrors.message = validateMessage(formData.message);

    setErrors(newErrors);
    setTouched({
      fullName: true,
      phoneNumber: true,
      email: true,
      occupation: true,
      qualification: true,
      message: true
    });

    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage('');

    if (!validateForm()) {
      setSubmitMessage('Please fix the errors in the form before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('forms-api', {
        body: {
          action: 'submit-contact-request',
          data: {
            ...formData,
            phoneNumber: `+91${formData.phoneNumber}`
          }
        }
      });

      if (error) throw error;

      setSubmitMessage('Thank you! We will reach you soon.');
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        occupation: '',
        qualification: '',
        subject: 'General Inquiry',
        message: ''
      });
      setErrors({});
      setTouched({});
    } catch (err) {
      if (err.data?.errors) {
        const fieldErrors = {};
        Object.entries(err.data.errors).forEach(([field, messages]) => {
          fieldErrors[field] = messages?.[0] || 'Invalid value';
        });
        setErrors(fieldErrors);
      }
      setSubmitMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="contact-us-section">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">Any question or remarks? Just write us a message!</p>
        </div>

        <div className="row g-0 contact-container">
          {/* Left Column - Contact Information */}
          <div className="col-12 col-lg-5 contact-info-column">
            <div className="contact-info-content">
              <h2 className="contact-info-title">Contact Information</h2>
              <p className="contact-info-subtitle">Call us during office hours if facing any doubts</p>

              {/* Customer Support Illustration */}
              <div className="support-illustration">
                <img
                  src="/images/customer-support.png"
                  alt="Customer Support"
                  className="support-img"


                />
              </div>

              <div className="contact-details">
                <div className="contact-item">
                  <i className="fas fa-phone contact-icon"></i>
                  <span>+91 8899883638</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-envelope contact-icon"></i>
                  <span>contact@mudralaya.com</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt contact-icon"></i>
                  <span>Sikanderpur, We Work</span>
                </div>
              </div>

              <div className="social-media-icons">
                <a href="#" className="social-icon quora" aria-label="Quora">
                  <i className="fab fa-quora"></i>
                </a>
                <a href="#" className="social-icon reddit" aria-label="Reddit">
                  <i className="fab fa-reddit"></i>
                </a>
                <a href="#" className="social-icon discord" aria-label="Discord">
                  <i className="fab fa-discord"></i>
                </a>
                <a href="#" className="social-icon instagram" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="social-icon facebook" aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="col-12 col-lg-7 contact-form-column">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input
                    type="text"
                    className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your full name"
                    maxLength={50}
                    required
                  />
                  {errors.fullName && <div className="error-message">{errors.fullName}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className={`form-control ${errors.phoneNumber ? 'is-invalid' : ''}`}
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                  />
                  {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="yourname@email.com"
                    maxLength={100}
                    required
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="occupation" className="form-label">Occupation</label>
                  <select
                    className={`form-select ${errors.occupation ? 'is-invalid' : ''}`}
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  >
                    <option value="">Select Occupation</option>
                    <option value="student">Student</option>
                    <option value="professional">Professional</option>
                    <option value="homemaker">Homemaker</option>
                    <option value="entrepreneur">Entrepreneur</option>
                    <option value="retired">Retired</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.occupation && <div className="error-message">{errors.occupation}</div>}
                </div>

                <div className="col-md-6">
                  <label htmlFor="qualification" className="form-label">Qualification</label>
                  <select
                    className={`form-select ${errors.qualification ? 'is-invalid' : ''}`}
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  >
                    <option value="">Select Qualification</option>
                    <option value="10th">10th Pass</option>
                    <option value="12th">12th Pass</option>
                    <option value="graduate">Graduate</option>
                    <option value="postgraduate">Post Graduate</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.qualification && <div className="error-message">{errors.qualification}</div>}
                </div>

                <div className="col-12">
                  <label className="form-label">Select Subject?</label>
                  <div className="radio-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="subject"
                        id="partner"
                        value="Partner"
                        checked={formData.subject === 'Partner'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="partner">
                        Partner
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="subject"
                        id="business"
                        value="Business Owner"
                        checked={formData.subject === 'Business Owner'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="business">
                        Business Owner
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="subject"
                        id="startup"
                        value="Want to Build a Startup"
                        checked={formData.subject === 'Want to Build a Startup'}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="startup">
                        Want to Build a Startup
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <label htmlFor="message" className="form-label">
                    Message
                  </label>
                  <textarea
                    className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                    id="message"
                    name="message"
                    rows="2"
                    placeholder="Write your message.."
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={500}
                    required
                  ></textarea>
                  {errors.message && <div className="error-message">{errors.message}</div>}
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <p className="submit-message">Submit the form and we will get back soon</p>
                  {submitMessage && <p className="submit-message">{submitMessage}</p>}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;

