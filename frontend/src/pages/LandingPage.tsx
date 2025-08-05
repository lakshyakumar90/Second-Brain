import Footer from "@/components/landing/Footer";
import PricingSection from "@/components/landing/PricingSection";
import FeatureSection from "@/components/landing/FeatureSection";
import CarouselSection from "@/components/landing/CarouselSection";
import GallerySection from "@/components/landing/GallerySection";
import HeroSection from "@/components/landing/HeroSection";
import LandingNavbar from "@/components/landing/LandingNavbar";
import PublicLayout from "@/layouts/PublicLayout";

const LandingPage = () => {
  return (
    <PublicLayout>
      {/* Landing page always uses light mode - no theme toggle available */}
      <LandingNavbar />
      <div className="font-[neue-regular] bg-white">
        <HeroSection />
        <GallerySection />
        <FeatureSection />
        {/* <CarouselSection /> */}
        <PricingSection />
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default LandingPage;
