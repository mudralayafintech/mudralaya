import HomeHero from "@/components/Home/Hero";
import WhyJoin from "@/components/Home/WhyJoin";
import Benefits from "@/components/Home/Benefits";
import Timeline from "@/components/Home/Timeline";
import MemberBenefits from "@/components/Home/MemberBenefits";
import EmpoweringWomen from "@/components/Home/EmpoweringWomen";

export default function Home() {
  return (
    <div className="home-page">
      <HomeHero />
      <WhyJoin />
      <Benefits />
      <Timeline />
      <MemberBenefits />
      <EmpoweringWomen />
    </div>
  );
}
