import CardsAi from "@/components/landing/ai/CardsAi";
import HeroAI from "@/components/landing/ai/HeroAi";
import PublicLayout from "@/layouts/PublicLayout";

const AIPage = () => {
  return (
    <PublicLayout>
      {/* AI page always uses light mode - no theme toggle available */}
      <div>
        {/* <LandingNavbar />        */}
        <header className="flex items-center justify-between px-10 py-6 bg-red-200">
          <div className="w-40">
            <img
              src="/mneumonicoreblack.svg"
              alt="Nuemonicore"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="h-10">
            <img
              src="/mneumonicorelogo.svg"
              alt="Nuemonicore"
              className="h-full w-full object-contain"
            />
          </div>
        </header>

        <HeroAI/>
        <CardsAi/>
        
      </div>
    </PublicLayout>
  );
};

export default AIPage;