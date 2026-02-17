import HomeHero from "@/components/Home/Hero";
import WhyJoin from "@/components/Home/WhyJoin";
import OurMission from "@/components/Home/OurMission";
import Benefits from "@/components/Home/Benefits";
import Timeline from "@/components/Home/Timeline";
import MemberBenefits from "@/components/Home/MemberBenefits";
import EmpoweringWomen from "@/components/Home/EmpoweringWomen";
import Testimonials from "@/components/Home/Testimonials";

export default function Home() {
  return (
    <div className="home-page">
      <HomeHero />
      <WhyJoin />
      <OurMission />
      <Benefits />
      <Timeline />
      <MemberBenefits />
      <EmpoweringWomen />
      <Testimonials />
    </div>
  );
}
