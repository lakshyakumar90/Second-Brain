import AIInfo from "@/components/landing/ai/AIInfo";
import HeroAI from "@/components/landing/ai/HeroAi";
import Footer from "@/components/landing/Footer";
import LandingNavbar from "@/components/landing/LandingNavbar";
import PublicLayout from "@/layouts/PublicLayout";

const AIPage = () => {
  return (
    <PublicLayout>
      {/* AI page always uses light mode - no theme toggle available */}
      <div className="bg-gradient-to-b from-red-100 to-[#fef2f2f0]">
        <LandingNavbar />
        <div className="px-10">
          <HeroAI />
          {/* <CardsAi /> */}
          <AIInfo />
        </div>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default AIPage;
