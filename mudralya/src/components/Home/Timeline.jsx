import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
  User,
  ShieldCheck,
  LayoutGrid,
  CreditCard,
  Rocket,
  CircleDollarSign
} from 'lucide-react';
import './Timeline.css';

const Timeline = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth out the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Map scroll progress to path offset [0.1, 0.9] for padding during sticky
  const offsetDistance = useTransform(smoothProgress, [0.1, 0.9], ["0%", "100%"]);

  const timelineItems = [
    {
      step: '1',
      title: 'Fill details',
      description: 'Fill basic details',
      icon: <User className="w-5 h-5" />,
      position: 'top',
      align: '0%'
    },
    {
      step: '2',
      title: 'Eligibility',
      description: 'Complete eligibility check',
      icon: <ShieldCheck className="w-5 h-5" />,
      position: 'bottom',
      align: '25%'
    },
    {
      step: '3',
      title: 'Review Plan',
      description: 'Review plan & add-ons',
      icon: <LayoutGrid className="w-5 h-5" />,
      position: 'top',
      align: '50%'
    },
    {
      step: '4',
      title: 'Payment',
      description: 'Pay (if required) / Submit',
      icon: <CreditCard className="w-5 h-5" />,
      position: 'bottom',
      align: '75%'
    },
    {
      step: '5',
      title: 'Training',
      description: 'Start training',
      icon: <Rocket className="w-5 h-5" />,
      position: 'top',
      align: '100%'
    }
  ];

  // Professional Wavy Path (Desktop)
  const pathD = "M 0,50 C 125,50 125,150 250,150 S 375,50 500,50 S 625,150 750,150 S 875,50 1000,50";
  // Vertical Path (Mobile)
  const mobilePathD = "M 50,0 V 1000";

  return (
    <div className="timeline-scroll-wrapper" ref={containerRef}>
      <div className="timeline-sticky-container">
        <section className="timeline-section">
          <div className="container">
            <div className="text-center mb-0">
              <h2 className="how-to-join-title">
                How to <span className="how-to-join-accent">Join</span>
              </h2>
              <p className="how-to-join-subtitle">Easy 5-Step Process</p>
            </div>

            <div className="timeline-interactive-container">
              {/* Desktop Path */}
              <div className="timeline-svg-path-wrapper desktop-only">
                <svg width="100%" height="200" viewBox="0 0 1000 200" preserveAspectRatio="none" className="timeline-svg">
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <motion.path
                    d={pathD}
                    fill="none"
                    stroke="#00AD97"
                    strokeWidth="6"
                    strokeLinecap="round"
                    style={{
                      pathLength: useTransform(smoothProgress, [0.1, 0.9], [0, 1])
                    }}
                  />
                </svg>
              </div>

              {/* Mobile Path (Vertical) */}
              <div className="timeline-svg-path-wrapper mobile-only">
                <svg width="60" height="100%" viewBox="0 0 100 1000" preserveAspectRatio="none" className="timeline-svg-vertical">
                  <path
                    d={mobilePathD}
                    fill="none"
                    stroke="#edeff2"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <motion.path
                    d={mobilePathD}
                    fill="none"
                    stroke="#00AD97"
                    strokeWidth="5"
                    strokeLinecap="round"
                    style={{
                      pathLength: useTransform(smoothProgress, [0.05, 0.95], [0, 1])
                    }}
                  />
                </svg>
              </div>

              {/* Moving Indicator */}
              <motion.div
                className="gold-coin-marker"
                style={{
                  offsetDistance: offsetDistance,
                  "--desktop-path": `path("${pathD}")`,
                  "--mobile-path": `path("${mobilePathD}")`
                }}
              >
                <div className="coin-glow">
                  <CircleDollarSign className="w-8 h-8 text-yellow-500 fill-yellow-100" />
                </div>
              </motion.div>

              {/* Timeline Cards */}
              <div className="timeline-cards-layout">
                {timelineItems.map((item, index) => {
                  const start = 0.1 + (index * 0.2);
                  const activationRange = [start - 0.1, start, start + 0.1];

                  const opacity = useTransform(smoothProgress, activationRange, [0.4, 1, 0.4]);
                  const scale = useTransform(smoothProgress, activationRange, [0.9, 1.05, 0.9]);
                  const borderColor = useTransform(
                    smoothProgress,
                    activationRange,
                    ["rgba(0, 173, 151, 0.1)", "rgba(0, 173, 151, 1)", "rgba(0, 173, 151, 0.1)"]
                  );

                  return (
                    <motion.div
                      key={index}
                      className={`timeline-card-node ${item.position} pos-${index}`}
                      style={{
                        opacity,
                        scale,
                        borderColor,
                        left: item.align
                      }}
                    >
                      <div className="card-inner-content">
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <div className="card-icon-wrapper">
                            {item.icon}
                          </div>
                          <span className="step-label">Step {item.step}</span>
                        </div>
                        <h4 className="card-title">{item.title}</h4>
                        <p className="card-desc">{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Timeline;
