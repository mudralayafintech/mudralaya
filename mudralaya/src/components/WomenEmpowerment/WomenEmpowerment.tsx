import React from "react";
import styles from "./WomenEmpowerment.module.css";

const WomenEmpowerment: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Women Empowerment and Financial Growth</h1>
          <p className={styles.heroSubtitle}>
            Build wealth, independence, and lasting financial security through education and opportunity
          </p>
          <button className={styles.ctaButton}>Start Your Journey</button>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className={styles.benefitsSection}>
        <h2>Women Empowerment and Financial Growth</h2>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <h3>Financial Independence</h3>
            <p>Achieve complete control over your finances and build lasting wealth independently.</p>
          </div>
          <div className={styles.benefitCard}>
            <h3>Entrepreneurial Growth</h3>
            <p>Start and scale your business with expert guidance and financial planning support.</p>
          </div>
          <div className={styles.benefitCard}>
            <h3>Smart Investing</h3>
            <p>Learn proven investment strategies tailored specifically for women investors in India.</p>
          </div>
          <div className={styles.benefitCard}>
            <h3>Career Advancement</h3>
            <p>Develop skills to negotiate better compensation and accelerate your professional growth.</p>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className={styles.programsSection}>
        <h2>Our Empowerment Programs</h2>
        <div className={styles.programsGrid}>
          <div className={styles.programCard}>
            <h3>Financial Literacy Bootcamp</h3>
            <p>Comprehensive training covering budgeting, savings, investing, and wealth creation strategies.</p>
          </div>
          <div className={styles.programCard}>
            <h3>Women Entrepreneur Network</h3>
            <p>Connect with successful women entrepreneurs and receive mentorship for business growth.</p>
          </div>
          <div className={styles.programCard}>
            <h3>Investment Masterclass</h3>
            <p>Learn stock market fundamentals, mutual funds, real estate, and retirement planning.</p>
          </div>
          <div className={styles.programCard}>
            <h3>Career Growth Coaching</h3>
            <p>Skill development, salary negotiation, and leadership training for career advancement.</p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={styles.statsSection}>
        <h2>Women Making Financial Impact</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h4>50,000+</h4>
            <p>Women Empowered</p>
          </div>
          <div className={styles.statCard}>
            <h4>₹2,500 Cr+</h4>
            <p>Wealth Managed</p>
          </div>
          <div className={styles.statCard}>
            <h4>89%</h4>
            <p>Success Rate</p>
          </div>
          <div className={styles.statCard}>
            <h4>1000+</h4>
            <p>Active Businesses</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>Ready to Take Control of Your Financial Future?</h2>
        <p>Join thousands of women who are building wealth and creating lasting impact.</p>
        <button className={styles.ctaButtonPrimary}>Get Started Today</button>
      </section>
    </div>
  );
};

export default WomenEmpowerment;
