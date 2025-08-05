import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function AnimatedHeading({
  text,
  indexOffset,
  totalLetters,
  className,
}: {
  text: string;
  indexOffset: number;
  totalLetters: number;
  className: string;
}) {
  const letters = text.split("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    if (!headingRef.current) return;

    const spans = gsap.utils.toArray(
      headingRef.current.querySelectorAll("span")
    ) as HTMLElement[];
    const tl = gsap.timeline({ paused: true }); // Paused timeline to control via scroll

    spans.forEach((span, idx) => {
      const absoluteIdx = indexOffset + idx;
      const letterDelay = (absoluteIdx / totalLetters) * 3; // Scale delay (adjust '2' for speed; higher = slower reveal)

      tl.fromTo(
        span,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3, // Quick per-letter animation
          ease: "power2.inOut",
        },
        letterDelay // Offset each letter's start time
      );
    });

    ScrollTrigger.create({
      trigger: headingRef.current,
      start: "top 30%",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        tl.progress(self.progress); // Directly tie timeline progress to scroll
      },
      // markers: true, // Uncomment for debugging
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [indexOffset, totalLetters]); // Dependencies to re-run if offsets change

  return (
    <h1
      ref={headingRef}
      className={className}
      style={{ display: "block", whiteSpace: "pre-wrap" }}
    >
      {letters.map((letter, idx) => {
        const absoluteIdx = indexOffset + idx;
        return (
          <span
            key={absoluteIdx}
            style={{ display: "inline-block", opacity: 0 }} // Start hidden
          >
            {letter}
          </span>
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
  const videoContainerRef = useRef(null);
  const paragraphRef = useRef(null);

  const totalLetters = headings.join("").length;
  let cumulativeOffset = 0;

  useLayoutEffect(() => {
    if (!videoRef.current || !videoContainerRef.current) return;

    const videoContainer = videoContainerRef.current;
    const video = videoRef.current;

    // Phase 1: Expand video to full width on scroll down
    gsap.fromTo(
      video,
      { width: "95%", borderRadius: "32px", immediateRender: true },
      {
        width: "100%",
        borderRadius: "0px",
        ease: "none",
        scrollTrigger: {
          trigger: videoContainer,
          start: "top center",
          end: "+=50%",
          scrub: true,
          immediateRender: false, 
          // markers: true, // Keep for debugging; remove in production
        },
      }
    );

    // Phase 2: Pin the container while scrolling
    ScrollTrigger.create({
      trigger: videoContainer,
      start: "center center",
      end: "+=60%",
      pin: true,
      scrub: true,
      // markers: true,
    });

    // Phase 3: Shrink back to original on further scroll (and reverse smoothly)
    gsap.fromTo(
      video,
      { width: "100%", borderRadius: "0px" },
      {
        width: "95%",
        borderRadius: "32px",
        ease: "none",
        scrollTrigger: {
          trigger: videoContainer,
          start: "bottom 90%", // Starts right as pin might end
          end: "+=60%",
          scrub: true,
          // markers: true,
        },
        immediateRender: false,
      }
    );

    return () => ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }, []);

  useLayoutEffect(() => {
    if (!paragraphRef.current) return;

    const p = paragraphRef.current;

    gsap.fromTo(
      p,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: p,
          start: "top 80%",
          end: "bottom 60%",
          scrub: true,
          // markers: true, // uncomment for debugging
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="w-full">
      {/* Initial Hero Title */}
      <div className="px-10 py-32 text-[8vw] font-semibold leading-[1.1] overflow-hidden">
        {lines.map((line, i) => (
          <div
            key={i}
            className="hero-line-anim"
            ref={(el) => {
              if (el) {
                gsap.fromTo(
                  el,
                  { y: 60, opacity: 0 },
                  {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    delay: i * 0.2,
                    ease: "power3.out",
                    overwrite: "auto",
                  }
                );
              }
            }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Video Section with Scroll Animation */}
      <div className="relative w-full">
        <div
          ref={videoContainerRef}
          className="z-10 mx-auto w-full sticky top-0"
        >
          <div
            ref={videoRef}
            className="relative h-screen overflow-hidden shadow-xl rounded-lg w-[95%] mx-auto"
            style={{
              width: "95%",
              borderRadius: "32px",
            }}
          >
            <video
              src="assets/hero-video.mp4"
              loop
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Scroll-triggered Animated Headings */}
      <div className="mt-20 relative z-10">
        <div
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
                className="text-4xl md:text-6xl font-semibold"
              />
            );
            cumulativeOffset += text.length;
            return element;
          })}

          <p
            ref={paragraphRef}
            style={{ opacity: 0 }}
            className="text-lg md:text-xl text-black/80 max-w-4xl mt-10"
          >
            Mneumonicore is your digital second brain—purpose-built to help you
            collect thoughts, organize projects, visualize concepts, and
            collaborate seamlessly with others. Whether you’re managing personal
            learning, running a team project, or simply making sense of a busy
            life, Mneumonicore offers a unified space to think, build, and grow.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
