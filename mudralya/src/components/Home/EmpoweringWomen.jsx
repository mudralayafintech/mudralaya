import React from 'react';

const EmpoweringWomen = () => {
  return (
    <section className="women-strip py-3">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left Side - Image with Card Effect */}
          <div className="col-12 col-lg-6 text-center text-lg-start">
            <div className="d-flex justify-content-center justify-content-lg-start">
              <div className="image-card-effect">
                <img
                  src="/images/women.png"
                  alt="Women Empowerment"
                  className="img-fluid"


                />
              </div>
            </div>
          </div>
          {/* Left Side - Text Quotes */}
          <div className="col-12 col-lg-6">
            <div className="women-content">
              <h2 className="why-join-title mb-4">
                Women Empowerment and <span className="why-join-accent">Growth</span>
              </h2>
              <div className="women-quotes">
                <p className="quote-text">
                  Your financial independence starts here.
                </p>
                <p className="quote-text">
                  Women leading India's financial future.
                </p>
                <p className="quote-text">
                  Start small, <span className="why-join-accent">grow big with Mudralaya.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="col-12 col-lg-6">
            <div className="d-flex justify-content-center justify-content-lg-end">
              <img
                src="/images/women-img.png"
                alt="Women Empowerment"
                className="img-fluid"
                style={{ maxWidth: '450px', width: '100%' }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/450x450?text=Women+Empowerment';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmpoweringWomen;

