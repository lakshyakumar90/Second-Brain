import AllFooter from "@/components/landing/AllFooter";
import EndSection from "@/components/landing/EndSection";
import FeatureSection from "@/components/landing/FeatureSection";
import FooterSection from "@/components/landing/FooterSection";
import GallerySection from "@/components/landing/GallerySection";
import HeroSection from "@/components/landing/HeroSection";
import LandingNavbar from "@/components/landing/LandingNavbar";
import PublicLayout from "@/layouts/PublicLayout";
import { motion } from "framer-motion";

const LandingPage = () => {
  return (
    <PublicLayout>
      {/* Landing page always uses light mode - no theme toggle available */}
      <div className="font-[neue-regular]">
        <div className="bg-gradient-to-b from-stone-300 to-stone-50">
          {/* <LandingNavbar />        */}
          <header className="flex items-center justify-between px-10 py-6">
            <div className="w-40">
              <motion.img
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                src="/mneumonicoreblack.svg"
                alt="Nuemonicore"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="h-10">
              <motion.img
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                src="/mneumonicorelogo.svg"
                alt="Nuemonicore"
                className="h-full w-full object-contain"
              />
            </div>
          </header>

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
