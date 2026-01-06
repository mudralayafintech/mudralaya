import React from 'react';

const WhyJoin = () => {
  const features = [
    {
      image: '/images/vector/entrepreneurship.png',
      title: 'Entrepreneurship for All',
      description: 'Start earning from home and grow at your pace'
    },
    {
      image: '/images/vector/women.png',
      title: 'Women-Focused',
      description: 'Designed to support women restarting careers or seeking financial independence'
    },
    {
      image: '/images/vector/dollar.png',
      title: 'Zero-Investment Options',
      description: 'Begin without spending anything'
    },
    {
      image: '/images/vector/rocket.png',
      title: 'Multi-Task Earnings',
      description: 'Complete tasks from multiple companies & earn instantly'
    },
    {
      image: '/images/vector/laptop.png',
      title: 'Training and Skill Growth',
      description: 'Weekly sessions with daily guidance'
    },
    {
      image: '/images/vector/handshake.png',
      title: 'Step-by-Step Growth Path',
      description: 'From Partner → Skilled Partner → Entrepreneur'
    }
  ];

  return (
    <section className="why-section">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="why-join-title">
            Why Join <span className="why-join-accent">Mudralaya?</span>
          </h2>
          <p className="why-join-subtitle">Work Smart. Earn Big. Live Free.</p>
        </div>

        <div className="features-scroll-wrapper">
          <div className="features-track">
            {/* Original Items */}
            {features.map((feature, index) => (
              <div key={`orig-${index}`} className="feature-item">
                <div className="card-feature h-100">
                  <div className="icon-box">
                    <img src={feature.image} alt={feature.title} />
                  </div>
                  <div className="card-content-wrapper">
                    <h5 className="mb-1">{feature.title}</h5>
                    <p className="mb-0 text-muted small">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicated Items for seamless loop */}
            {features.map((feature, index) => (
              <div key={`dup-${index}`} className="feature-item d-md-none">
                <div className="card-feature h-100">
                  <div className="icon-box">
                    <img src={feature.image} alt={feature.title} />
                  </div>
                  <div className="card-content-wrapper">
                    <h5 className="mb-1">{feature.title}</h5>
                    <p className="mb-0 text-muted small">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyJoin;

