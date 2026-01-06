import React from 'react';

const GrowWithoutLimits = () => {
  const empowerFeatures = [
    { bold: 'Digital dashboard & mobile CRM', rest: ' for easy client management.' },
    { bold: 'Marketing toolkit & training', rest: ' to help you acquire leads.' },
    { bold: '24x7 support & mentorship', rest: ' from industry leaders.' },
    { bold: 'Certification & rewards', rest: ' structure for performance.' }
  ];

  const whoCanJoin = [
    'Students',
    'Professionals',
    'Homemakers',
    'Entrepreneurs',
    'Retirees'
  ];

  return (
    <section className="grow-limits-section">
      <div className="container">
        <div className="text-center mb-5 mb-lg-6">
          <h2 className="fw-bold">Grow Without <span style={{ color: 'var(--brand)' }}>Limits</span></h2>
          <p className="mt-3 fs-5 text-muted max-w-xl">
            You're not just an agent — you're a digital-first financial consultant
          </p>
        </div>
        
        <div className="row align-items-center g-5 mb-6 mb-lg-7">
          <div className="col-lg-6 order-2 order-lg-1">
            <h3 className="fs-2 mb-4">From Advisor to Leader</h3>
            <p className="fs-5 text-muted mb-4">
              Earn per sale, get team overrides, and rise to partner status.
            </p>
            <p className="fs-4 fw-semibold text-dark">
              Your growth = your effort
            </p>
          </div>
          <div className="col-lg-6 order-1 order-lg-2">
            <div className="w-75 mx-auto">
              <img 
                src="/images/grow_1.webp" 
                alt="Advisor to Leader img" 
                className="img-fluid rounded-4 shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x400?text=Advisor+to+Leader';
                }}
              />
            </div>
          </div>
        </div>
        
        <div className="row align-items-center g-5 mb-6 mb-lg-7">
          <div className="col-lg-6 order-2 order-lg-2">
            <h2 className="fs-2 fw-bold text-dark mb-5 mt-5">We Empower You</h2>
            <ul className="list-unstyled space-y-4 grow-feature-list">
              {empowerFeatures.map((feature, index) => (
                <li key={index} className="mb-3">
                  <div className="d-flex align-items-start fs-5">
                    <svg 
                      className="grow-icon-check me-3 mt-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ width: '1.5rem', height: '1.5rem' }}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <div>
                      <span className="fw-bold text-dark">{feature.bold}</span>
                      {feature.rest}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-lg-6 order-1 order-lg-1">
            <div className="w-75 mx-auto">
              <img 
                src="/images/grow_2.webp" 
                alt="We Empower You img" 
                className="img-fluid rounded-4 shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x400?text=We+Empower+You';
                }}
              />
            </div>
          </div>
        </div>

        <div className="row align-items-center g-5">
          <div className="col-lg-6 order-2 order-lg-1">
            <h2 className="fs-2 fw-bold mb-5 mt-5">Who Can Join</h2>
            <ul className="fs-5 text-muted mb-4 grow-who-list">
              {whoCanJoin.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <p className="fs-5 text-dark fst-italic grow-callout ps-4 py-2 mt-4">
              — If you can connect and communicate, you can succeed with Mudralaya.
            </p>
          </div>
          <div className="col-lg-6 order-1 order-lg-2">
            <div className="w-75 mx-auto">
              <img 
                src="/images/grow_3.webp" 
                alt="Who Can Join img" 
                className="img-fluid rounded-4 shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x400?text=Who+Can+Join';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrowWithoutLimits;

