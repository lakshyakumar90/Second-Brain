import { motion } from "framer-motion";
import LandingButton from "../ui/landing-button";

const FeatureSection = () => {
  return (
    <div className="pb-20 bg-[#F3F3E9]">
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-[8vw] font-semibold-s px-10 leading-30 mb-20"
      >
        Unify Your <br /> Work and Ideas{" "}
      </motion.h1>
      <div className="h-[120vh] px-10 flex gap-3 justify-between">
        <div className="w-[40%] flex flex-col justify-between">
          <div className="flex flex-col gap-5">
            <p className="text-2xl">
              Discover a powerful all-in-one workspace designed to help you
              think, create, and organize effortlessly. Whether you're jotting
              down quick notes, brainstorming big ideas, or managing complex
              projects, everything stays connected and easy to access—so you can
              stay focused and productive, no matter how you work or what you’re
              building.
            </p>
            <LandingButton link="/about">Get Started</LandingButton>
          </div>
          <div className="flex flex-col gap-5">
            <div className="text-xl border-b border-gray-300 py-5">
              <span className="font-semibold">Flexible Notes & Docs: </span>
              Create structured notes or quick reminders with rich text, images,
              checklists, and more.
            </div>
            <div className="text-xl border-b border-gray-300 py-5">
              <span className="font-semibold">Visual Whiteboards: </span>
              Switch to an infinite canvas for brainstorming, diagramming, or
              drawing mind maps with intuitive tools.
            </div>
            <div className="text-xl border-b border-gray-300 py-5">
              <span className="font-semibold">Organize Naturally: </span>
              Arrange everything in smart folders, tag topics, and pin your most
              important projects.
            </div>
          </div>
        </div>
        <div className="w-[56%] rounded-3xl overflow-hidden shadow-blue-50 shadow-2xs">
          <img
            className="h-full w-full object-cover object-center"
            src="assets/home.png"
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
