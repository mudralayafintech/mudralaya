import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

import { supabase } from '../../supabaseClient';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('forms-api', {
        body: { action: 'subscribe-newsletter', data: { email } }
      });

      if (error) throw error;
      setEmail('');
      alert('Thank you for subscribing!');
    } catch (err) {
      alert(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="site-footer">
      <div className="container-xl">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-4 m-0 mb-3">
            <div className="mb-3">
              <Link to="/" className="d-inline-block footer-logo-container">
                <img
                  src="/images/mudralya_logo.webp"
                  alt="Mudralya Fintech"
                  className="footer-logo-img"
                />
              </Link>
            </div>

            <div className="small text-white-50">
              Copyright © 2025 Mudralaya Fintech
            </div>
            <div className="small text-white-50">
              All rights reserved
            </div>

            <div className="d-flex gap-2 mt-3">
              <a href="https://www.instagram.com/mudralaya?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.linkedin.com/company/mudralaya/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="social-icon" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div >

          <div className="col-lg-4 col-md-4">
            <div className="row">
              <div className="col-6">
                <h6>Company</h6>
                <ul className="list-unstyled small">
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/about">About us</Link></li>
                  <li><Link to="/contact">Contact us</Link></li>
                </ul>
              </div>
              <div className="col-6">
                <h6>Support</h6>
                <ul className="list-unstyled small">
                  <li><a href="#help">Help center</a></li>
                  <li><a href="#terms">Terms of service</a></li>
                  <li><a href="#legal">Legal</a></li>
                  <li><a href="#privacy">Privacy policy</a></li>
                  <li><a href="#status">Status</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 col-md-4">
            <div>
              <h6>Stay up to date</h6>
              <form className="d-flex" onSubmit={handleSubmit}>
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Your email address"
                    aria-label="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button className="btn btn-primary" type="submit" aria-label="Subscribe" disabled={submitting}>
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div >
      </div >
    </footer >
  );
};

export default Footer;

