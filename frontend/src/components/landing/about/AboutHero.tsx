import { motion } from "framer-motion";
import BentoGrid from "./BentoGrid";
import DrivesUsCards from "./DrivesUsCards";
import WhoWeServeGrid from "./WhoWeServeGrid";
import LandingButton from "@/components/ui/landing-button";
import ImageCarousel from "./ImageCarousel";
import AnimatedParagraph from "./AnimatedParagraph";

const AboutHero = () => {
  const heroParagraphLines = [
    "We founded Mneumonicare for",
    "today's thinkers who need more",
    "than outdated note apps or",
    "clunky collaboration tools.",
    // "We envision a fluid workflow",
    // "blending notes, visuals, ideas,",
    // "and teamwork into your true “second brain.”"
  ];

  return (
    <div className="w-full px-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-30 pb-20"
      >
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-4">
          Build Your Second Brain
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          Seamlessly blend notes, visuals, ideas, and collaboration in one fluid
          digital space.
        </p>
        <LandingButton link="/auth/register">Get Started Free</LandingButton>
      </motion.div>

      <ImageCarousel />

      <AnimatedParagraph
        textLines={heroParagraphLines}
        className="text-[5vw] font-semibold leading-[1] text-black my-20"
      />

      <BentoGrid />

      {/* What Drives Us Section */}
      <section className="py-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-[8vw] font-semibold-s leading-[1] mb-2"
        >
          What Drives Us
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl text-gray-600 mb-12 max-w-2xl pl-4"
        >
          At Mneumonicare, we're passionate about revolutionizing how you think
          and create. Here's what fuels our mission.
        </motion.p>
        <DrivesUsCards />
      </section>

      {/* Who We Serve Section */}
      <section className="py-10">
        <WhoWeServeGrid />
      </section>
    </div>
  );
};

export default AboutHero;
