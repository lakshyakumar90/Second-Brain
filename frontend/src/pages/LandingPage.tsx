import FeatureSection from "@/components/landing/FeatureSection";
import FooterSection from "@/components/landing/FooterSection";
import GallerySection from "@/components/landing/GallerySection";
import HeroSection from "@/components/landing/HeroSection";
import LandingNavbar from "@/components/landing/LandingNavbar";

const LandingPage = () => {
  return (
    <div>
      {/* <LandingNavbar />        */}
      <header className="flex items-center justify-between px-10 py-6">
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
      
      <LandingNavbar />
      <HeroSection/>
      <GallerySection/>
      <FeatureSection/>
      <FooterSection/>
    </div>
  );
};

export default LandingPage;
