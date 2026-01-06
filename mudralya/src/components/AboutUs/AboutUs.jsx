import React from 'react';
import { Link } from 'react-router-dom';
import { useModal } from '../../context/ModalContext';
import EmpoweringWomen from '../Home/EmpoweringWomen.jsx';
import MemberBenefits from '../Home/MemberBenefits.jsx';
import './AboutUs.css';
import '../Home/Home.css';

const AboutUs = () => {
  const { openJoinUsModal } = useModal();

  return (
    <div className="about-us-page">
      {/* Hero Section */}
      <section className="about-us-hero-section">
        <div className="container-fluid about-us-hero-container">
          <div className="row g-0 align-items-center">
            {/* Left Section - Banner Image with Text Content */}
            <div className="col-12 col-lg-6 about-us-hero-left">
              <div className="about-us-hero-content">
                {/* Title */}
                <h1 className="about-us-hero-title">
                  About <span className="about-us-hero-title-highlight">Us</span>
                </h1>

                {/* Subtitle */}
                <h2 className="about-us-hero-subtitle">
                  Empowering Financial Simplicity Through AI.
                </h2>

                {/* Body Text */}
                <p className="about-us-hero-text">
                  Mudralaya is India's emerging financial entrepreneurship platform, built to empower individuals — especially women — to earn, grow, and build their own financial careers or franchises. We believe financial freedom should be accessible to everyone, regardless of background, experience, or starting point.
                </p>

                {/* {Decorative Line }
                <div className="about-us-hero-divider"></div> */}

                {/* CTA Buttons */}
                <div className="about-us-hero-buttons">

                  <button
                    className="btn btn-about-explore"
                    onClick={() => openJoinUsModal()}
                    type="button"
                  >
                    Become Our Partner
                  </button>
                  <Link to="/advisor" className="btn btn-about-advisor">
                    Explore Plans
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Section - About Us Image */}
            <div className="col-12 col-lg-6 about-us-hero-right">
              <div className="about-us-hero-image-wrapper">
                <img
                  src="/images/about-us.png"
                  alt="About Us"
                  className="about-us-hero-image"
                  onError={(e) => {
                    e.target.src = '/images/about-us.png';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="our-mission-section">
        <div className="container-xl px-4 px-lg-5">
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="our-mission-title">
                Our <span className="our-mission-title-highlight">Mission</span>
              </h2>
              <p className="our-mission-text">
                To create 1 lakh financial entrepreneurs across India through simple earning models, structured training, and multi-product financial opportunities
              </p>

              {/* Mission Content Box */}
              <div className="our-mission-content-box">
                <video
                  className="mission-video"
                  controls
                  playsInline
                >
                  <source src="/video/video%20mudralaya.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="what-we-do-section">
        <div className="container-xl px-4 px-lg-5">
          {/* Title and Mission Statement */}
          <div className="row">
            <div className="col-12 text-center">
              <h2 className="what-we-do-title">
                What We <span className="what-we-do-title-highlight">Do</span>
              </h2>
              <p className="what-we-do-mission">
                To create India's most trusted and intelligent digital finance ecosystem, where people can access lending, insurance, and money management tools effortlessly
              </p>
            </div>
          </div>

          {/* Content: Illustration and List */}
          <div className="row align-items-center">
            {/* Left Side - Illustration */}
            <div className="col-12 col-lg-6">
              <div className="what-we-do-illustration">
                <img
                  src="/images/what-we-do.png"
                  alt="What We Do Illustration"
                  className="img-fluid"
                  onError={(e) => {
                    e.target.src = '/images/what-we-do.png';
                  }}
                />
              </div>
            </div>

            {/* Right Side - Benefits List */}
            <div className="col-12 col-lg-6">
              <div className="what-we-do-list">
                <div className="what-we-do-item">
                  <div className="what-we-do-icon">
                    <i className="fas fa-hand-holding-usd"></i>
                  </div>
                  <div className="what-we-do-text">
                    Start earning with zero investment
                  </div>
                </div>

                <div className="what-we-do-item">
                  <div className="what-we-do-icon">
                    <i className="fas fa-user-graduate"></i>
                  </div>
                  <div className="what-we-do-text">
                    Become a trained financial professional
                  </div>
                </div>

                <div className="what-we-do-item">
                  <div className="what-we-do-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="what-we-do-text">
                    Build leadership skills
                  </div>
                </div>

                <div className="what-we-do-item">
                  <div className="what-we-do-icon">
                    <i className="fas fa-store"></i>
                  </div>
                  <div className="what-we-do-text">
                    Grow into a franchise owner
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Our Vision Section */}
      <section className="our-vision-section">
        <div className="container-xl px-4 px-lg-5">
          <div className="row align-items-center">
            {/* Left Side - Content */}
            <div className="col-12 col-lg-6 mb-4 mb-lg-0 text-start">
              <h2 className="our-vision-title">
                Our <span className="our-vision-title-highlight">Vision</span>
              </h2>
              <p className="our-vision-text">
                To build a nationwide network of entrepreneurs, micro-franchises, and financial leaders who uplift communities and shape the future of India's financial ecosystem
              </p>
            </div>

            {/* Right Side - Illustration */}
            <div className="col-12 col-lg-6">
              <div className="our-vision-illustration">
                <img
                  src="/images/vision.png"
                  alt="Our Vision Illustration"
                  className="img-fluid rounded-4 shadow-sm"
                  onError={(e) => {
                    e.target.src = '/images/vision.png';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist Section */}
      <section className="why-we-exist-section">
        <div className="container-xl px-4 px-lg-5">
          {/* Title and Subtitle */}
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="why-we-exist-title">
                Why We <span className="why-we-exist-title-highlight">Exist</span>
              </h2>
              <p className="why-we-exist-subtitle">
                Mudralaya bridges these gaps by giving individuals a platform to learn, earn, and lead
              </p>
            </div>
          </div>

          {/* Four Content Blocks - 2x2 Grid */}
          <div className="row g-4">
            {/* Top-Left Block */}
            <div className="col-12 col-md-6">
              <div className="why-we-exist-block">
                <div className="why-we-exist-icon">
                  <i className="fas fa-user-tie"></i>
                </div>
                <p className="why-we-exist-text">
                  More women in entrepreneurship
                </p>
              </div>
            </div>

            {/* Top-Right Block */}
            <div className="col-12 col-md-6">
              <div className="why-we-exist-block">
                <div className="why-we-exist-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
                <p className="why-we-exist-text">
                  More job alternatives beyond traditional employment
                </p>
              </div>
            </div>

            {/* Bottom-Left Block */}
            <div className="col-12 col-md-6">
              <div className="why-we-exist-block">
                <div className="why-we-exist-icon">
                  <i className="fas fa-rocket"></i>
                </div>
                <p className="why-we-exist-text">
                  Multi-Product Earnings
                </p>
              </div>
            </div>

            {/* Bottom-Right Block */}
            <div className="col-12 col-md-6">
              <div className="why-we-exist-block">
                <div className="why-we-exist-icon">
                  <i className="fas fa-laptop"></i>
                </div>
                <p className="why-we-exist-text">
                  Training & Skill Growth
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Member Benefits Section */}
      <MemberBenefits />

      {/* Empowering Women Section from Home Page */}
      <EmpoweringWomen />
    </div>
  );
};

export default AboutUs;


