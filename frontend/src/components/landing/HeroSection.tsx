// HeroSection.tsx
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

function AnimatedHeading({
  text,
  indexOffset,
  totalLetters,
  scrollYProgress,
  className,
}: {
  text: string;
  indexOffset: number;
  totalLetters: number;
  scrollYProgress: any;
  className: string;
}) {
  const letters = text.split("");

  return (
    <h1
      className={className}
      style={{ display: "block", whiteSpace: "pre-wrap" }}
    >
      {letters.map((letter, idx) => {
        const absoluteIdx = indexOffset + idx;
        const letterProgress = absoluteIdx / totalLetters;

        const opacity = useTransform(
          scrollYProgress,
          [letterProgress - 0.05, letterProgress],
          [0, 1]
        );
        const y = useTransform(
          scrollYProgress,
          [letterProgress - 0.05, letterProgress],
          [20, 0]
        );

        return (
          <motion.span
            key={absoluteIdx}
            style={{ display: "inline-block", opacity, y }}
          >
            {letter}
          </motion.span>
        );
      })}
    </h1>
  );
}

const headings = [
  "Imagine a single workspace",
  "and collaborations live side-by-side",
  "where your notes, ideas, sketches,",
  "this is Mneumonicore",
];

const lines = ["Empower Your", "Mind with Mneumonicore"];

const HeroSection = () => {
  const textRef = useRef(null);
  const videoRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: textRef,
    offset: ["start end", "end end"],
  });

  const { scrollYProgress: videoScroll } = useScroll({
    target: videoRef,
    offset: ["start center", "end start"],
  });

  const totalLetters = headings.join("").length;
  let cumulativeOffset = 0;

  // Animate video scale, position and translateY
  const y = useTransform(videoScroll, [0, 0.3, 1], ["0vh", "0vh", "0vh"]);
  const width = useTransform(
    videoScroll,
    [0, 0.3, 0.5, 1],
    ["95%", "100%", "100%", "95%"]
  );
  const borderRadius = useTransform(
    videoScroll,
    [0, 0.3, 0.5, 1],
    ["12px", "0px", "0px", "12px"]
  );

  const paragraphOpacity = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);
  const paragraphY = useTransform(scrollYProgress, [0.7, 0.9], [20, 0]);

  return (
    <div className="w-full">
      {/* Initial Hero Title */}
      <div className="px-10 py-32 text-[8vw] font-semibold leading-[1.1] overflow-hidden">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.3,
              delay: i * 0.2,
              ease: "easeOut",
            }}
            viewport={{ once: true, amount: 0.8 }}
          >
            {line}
          </motion.div>
        ))}
      </div>

      {/* Video Section with Scroll Animation */}
      <div className="relative" style={{ height: "200vh" }}>
        <motion.div
          ref={videoRef}
          className="z-10 mx-auto w-[95%] sticky top-0"
          style={{
            width,
            y,
          }}
        >
          <motion.div
            className="relative w-full h-screen overflow-hidden shadow-xl"
            style={{ borderRadius }}
          >
            <video
              src="assets/hero-video.mp4"
              loop
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll-triggered Animated Headings */}
      <div className="mt-20 relative z-10">
        <motion.div
          ref={textRef}
          className="flex flex-col items-center gap-4 px-6 text-center"
          style={{ minHeight: "80vh" }}
        >
          {headings.map((text, i) => {
            const element = (
              <AnimatedHeading
                key={i}
                text={text}
                indexOffset={cumulativeOffset}
                totalLetters={totalLetters}
                scrollYProgress={scrollYProgress}
                className="text-4xl md:text-6xl font-semibold"
              />
            );
            cumulativeOffset += text.length;
            return element;
          })}

          <motion.p
            style={{ opacity: paragraphOpacity, y: paragraphY }}
            className="text-lg md:text-xl text-black/80 max-w-4xl mt-10"
          >
            Mneumonicore is your digital second brain—purpose-built to help you
            collect thoughts, organize projects, visualize concepts, and
            collaborate seamlessly with others. Whether you’re managing personal
            learning, running a team project, or simply making sense of a busy
            life, Mneumonicore offers a unified space to think, build, and grow.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
