import React from 'react';
import Hero from './Hero';
import WhyJoin from './WhyJoin';
import Benefits from './Benefits';
import Timeline from './Timeline';
import MemberBenefits from './MemberBenefits';
import EmpoweringWomen from './EmpoweringWomen';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <WhyJoin />
      <Benefits />
      <Timeline />
      <MemberBenefits />
      <EmpoweringWomen />
    </div>
  );
};

export default Home;

