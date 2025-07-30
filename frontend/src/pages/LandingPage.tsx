import AllFooter from "@/components/landing/AllFooter";
import EndSection from "@/components/landing/EndSection";
import FeatureSection from "@/components/landing/FeatureSection";
import FooterSection from "@/components/landing/FooterSection";
import GallerySection from "@/components/landing/GallerySection";
import HeroSection from "@/components/landing/HeroSection";
import LandingNavbar from "@/components/landing/LandingNavbar";
import PublicLayout from "@/layouts/PublicLayout";

const LandingPage = () => {
  return (
    <PublicLayout>
      {/* Landing page always uses light mode - no theme toggle available */}
      <div className="font-[neue-regular]">
        <div className="bg-gradient-to-b from-stone-300 to-stone-50">
          <LandingNavbar />
          <HeroSection />
          <GallerySection />
          <FeatureSection />
          <FooterSection />
          <EndSection />
          <AllFooter />
        </div>
      </div>
    </PublicLayout>
  );
};

export default LandingPage;
