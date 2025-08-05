import { motion } from "motion/react";
import CardsAi from "./CardsAi";

const AIInfo = () => {
  return (
    <div className="pb-20">
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-[8vw] font-semibold-s leading-30 pb-10"
      >
        How Our <br /> AI Empowers You
      </motion.h1>
      <CardsAi />
    </div>
  );
};

export default AIInfo;
