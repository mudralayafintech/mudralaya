import React from 'react';

const WhatYouDo = () => {
  const items = [
    { icon: '🏠', text: 'Help families and businesses secure their tomorrow' },
    { icon: '🧾', text: 'Offer smart insurance solutions through our digital dashboard' },
    { icon: '💬', text: 'Guide clients with honesty, care, and expert knowledge' },
    { icon: '🌐', text: 'Build your own team of advisors and lead them to success' }
  ];

  return (
    <section className="do-section">
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-lg-5 text-center">
            <img 
              src="/images/what_to_do.webp" 
              alt="what_to_do image" 
              className="img-fluid hero-img animate-breathe"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400?text=What+You+Do';
              }}
            />
          </div>

          <div className="col-lg-7">
            <div className="mb-3">
              <h3 className="fw-bold">What You'll <span style={{ color: 'var(--brand)' }}>Do</span></h3>
              <div className="text-muted">Be the Face of Financial Security</div>
            </div>

            <p className="text-muted">
              As a Mudralaya Advisor, you don't just sell policies — you build futures
            </p>

            <div className="row g-3 do-features mt-3">
              {items.map((item, index) => (
                <div key={index} className="col-12 list-item">
                  <div className="list-icon">{item.icon}</div>
                  <div className="ms-2 text-muted">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatYouDo;

