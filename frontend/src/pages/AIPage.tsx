import AIInfo from "@/components/landing/ai/AIInfo";
import HeroAI from "@/components/landing/ai/HeroAi";
import SeamlessIntegration from "@/components/landing/ai/SeamlessIntegration";
import Footer from "@/components/landing/Footer";
import LandingNavbar from "@/components/landing/LandingNavbar";
import AnimatedLayout from "@/layouts/AnimatedLayout";
import PublicLayout from "@/layouts/PublicLayout";

const AIPage = () => {
  return (
    <PublicLayout>
      <div className="bg-white">
        <div className="bg-red-100">
          <LandingNavbar />
        </div>
        <AnimatedLayout className="relative z-10 rounded-b-[50px] bg-gradient-to-b from-red-100 to-[#fef2f2f0]">
          <div className="px-10">
            <HeroAI />
            <AIInfo />
          </div>
          <SeamlessIntegration />
        </AnimatedLayout>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default AIPage;
