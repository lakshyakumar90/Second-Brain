import Footer from "@/components/landing/Footer";
import PricingSection from "@/components/landing/PricingSection";
import FeatureSection from "@/components/landing/FeatureSection";
import CarouselSection from "@/components/landing/CarouselSection";
import GallerySection from "@/components/landing/GallerySection";
import HeroSection from "@/components/landing/HeroSection";
import LandingNavbar from "@/components/landing/LandingNavbar";
import PublicLayout from "@/layouts/PublicLayout";
import AnimatedLayout from "@/layouts/AnimatedLayout";

const LandingPage = () => {
  return (
    <PublicLayout>
      <div className="bg-white">
        <div className="bg-[#f3f3f9]">
          <LandingNavbar />
        </div>
        <AnimatedLayout className="relative z-10 rounded-b-[50px] font-[neue-regular] bg-[#f3f3f9]">
          <HeroSection />
          <GallerySection />
          <FeatureSection />
          {/* <CarouselSection /> */}
          <PricingSection />
        </AnimatedLayout>
        <Footer />
      </div>
    </PublicLayout>
  );
};

export default LandingPage;
