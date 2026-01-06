import React from 'react';
import './Benefits.css';
import { useModal } from '../../context/ModalContext';

const plans = [
  {
    key: 'free',
    title: 'FREE',
    subtitle: '',
    initialPrice: '₹ 0',
    priceLabel: '',
    description: '',
    benefits: [
      'Start with zero investment',
      'Access to daily / weekly / monthly tasks',
      'Earn by completing tasks from multiple companies',
      'Flexible work — home or on-field',
      'Unlimited earning potential',
      'Simple onboarding (18+)',
      'Ideal for students, homemakers & part-time earners'
    ],
    variant: 'free'
  },
  {
    key: 'individual',
    title: 'INDIVIDUAL',
    subtitle: '',
    initialPrice: '₹25,000', // Original price
    laptopPrice: '₹5,000', // Discounted price
    description: '',
    benefits: [
      'Maximum task opportunities from top brands & companies',
      'Weekly training sessions',
      'Dedicated Relationship Manager for guidance',
      'Daily review & performance improvement',
      'Fix salary support up to ₹50,000 (performance-based)',
      'Strong digital presence setup',
      'Priority access to high-paying tasks',
      'Fast-track growth to Skilled Partner → Entrepreneur'
    ],
    // The conditional benefit you requested (now we can remove this, as the checkbox is separate)
    // We will use the checkbox placement to handle the request.
    variant: 'individual'
  },
  {
    key: 'business-solution',
    title: 'BUSINESS SOLUTION',
    subtitle: '',
    initialPrice: '₹ 0',
    description: '',
    benefits: [
      'We understand your goals and create custom tasks.',
      'Industry-specific tasks for leads, marketing, and outreach.',
      'Training videos for easy execution.',
      'Verified partners for surveys and follow-ups.',
      'Tech, sales, and service support included.',
      'Affordable, scalable solutions for every business.'
    ],
    variant: 'franchise'
  },
  {
    key: 'startup-launch-lab',
    title: 'STARTUP LAUNCH LAB',
    subtitle: '',
    initialPrice: '₹ Customise',
    description: '',
    benefits: [
      'Understand your idea and build a tailored business model.',
      'Market research and competitor analysis included.',
      'Branding, tech development, and website/app setup.',
      'Support across ideation, strategy, product, and marketing.',
      'Go-to-market execution with dedicated startup mentor.',
      'End-to-end guidance from idea to launch.'
    ],
    variant: 'paid'
  }
];

const Benefits = () => {
  const [selectedPlan, setSelectedPlan] = React.useState('individual');
  // 1. State for the checkbox
  const [hasLaptop, setHasLaptop] = React.useState(false); 
  const { openJoinUsModal } = useModal();

  // Helper function to get the current price for a plan
  const getPlanPrice = (plan) => {
    // 2. Conditional Price Logic
    // Only apply the discount to the INDIVIDUAL plan when the checkbox is checked
    if (plan.key === 'individual' && hasLaptop) {
      return plan.laptopPrice; // Returns ₹5,000
    }
    return plan.initialPrice; // Returns ₹25,000 or others
  };

  return (
    <section className="benefits-section">
      <div className="container benefits-container">
        <div className="text-center benefits-header">
          <h2 className="benefits-title">Benefits of Joining Mudralaya</h2>
          <p className="benefits-subtitle">
            Choose your plan based on your dream of becoming Entrepreneur
          </p>
        </div>

        <div className="row g-4 benefits-grid benefits-grid-surface">
          {plans.map((plan) => (
            <div key={plan.key} className="col-12 col-md-6 col-lg-3">
              <div
                className={`plan-card ${plan.variant} ${selectedPlan === plan.key ? 'active' : ''}`}
                onClick={() => setSelectedPlan(plan.key)}
              >
                {plan.variant !== 'individual' && (
                  <div className="plan-badge">{plan.title}</div>
                )}
                <div
                  className={`plan-price ${plan.variant === 'individual' ? 'price-pill has-label' : ''}`}
                >
                  {plan.variant === 'individual' && (
                    <div className="price-label">{plan.title}</div>
                  )}
                  {/* Display the correct price */}
                  <div className="price-value">{getPlanPrice(plan)}</div>
                </div>

                <ul className="plan-benefits">
                  {/* Display all default benefits */}
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
                
                {/* 3. Checkbox placed at the end of the benefits list, before the divider */}
                {plan.key === 'individual' && (
                  <div
                    className="laptop-checkbox-container"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={hasLaptop}
                        onChange={(e) => {
                          setHasLaptop(e.target.checked);
                        }}
                      />
                      I have my own laptop 
                    </label>
                    {/* The specific line you want to show when the checkbox is checked */}
                    {hasLaptop && (
                        <p className="laptop-required-text">
                            Laptop is required to start your journey!
                        </p>
                    )}
                  </div>
                )}

                <div className="plan-divider" />
                <button
                  className={`plan-button ${plan.variant}-btn`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Pass current plan key and calculated price/laptop status
                    openJoinUsModal(plan.key, { hasLaptop, finalPrice: getPlanPrice(plan) }); 
                  }}
                >
                  CHOOSE PLAN
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
