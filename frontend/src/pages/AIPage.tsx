import CardsAi from "@/components/landing/ai/CardsAi";
import HeroAI from "@/components/landing/ai/HeroAi";
import AllFooter from "@/components/landing/AllFooter";
import LandingNavbar from "@/components/landing/LandingNavbar";
import PublicLayout from "@/layouts/PublicLayout";

const AIPage = () => {
  return (
    <PublicLayout>
      {/* AI page always uses light mode - no theme toggle available */}
      <div className="bg-gradient-to-b from-red-200 to-red-50">
        <LandingNavbar />

        <HeroAI/>
        <CardsAi/>
        <AllFooter/>
        
      </div>
    </PublicLayout>
  );
};

export default AIPage;