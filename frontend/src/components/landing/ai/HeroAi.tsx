import LandingButton from "@/components/ui/landing-button";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroAI = () => {
  const h1Ref = useRef(null);
  const pRef = useRef(null);
  const buttonRef = useRef(null); // New ref for button animation
  const imgRefs = useRef<any[]>([]);
  imgRefs.current = []; // Reset array on each render

  const addToRefs = (el: any) => {
    if (el && !imgRefs.current.includes(el)) {
      imgRefs.current.push(el);
    }
  };

  useEffect(() => {
    if (h1Ref.current) {
      gsap.fromTo(
        h1Ref.current,
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power3.out",
        }
      );
    }
    if (pRef.current) {
      gsap.fromTo(
        pRef.current,
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: 0.3,
          ease: "power3.out",
        }
      );
    }
    if (buttonRef.current) {
      gsap.fromTo(
        buttonRef.current,
        { y: 20, opacity: 0 }, // Starts slightly below for a pop-up effect
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: 0.6, // Delayed after p for sequencing
          ease: "power3.out",
        }
      );
    }

    imgRefs.current.forEach((img) => {
      gsap.fromTo(
        img,
        { y: 40, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: img,
            start: "top 100%", // Starts animating when image top is at 100% viewport height
            end: "top 80%", // Ends when top is at 80%
            // markers: true, // Uncomment for debugging trigger points
          },
        }
      );
    });

    // Optional cleanup for ScrollTriggers
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 py-20">
        <h1
          ref={h1Ref}
          className="text-[8vw] font-semibold leading-[1.1] overflow-hidden"
        >
          Meet Your <br /> Creative AI Companion
        </h1>
        <p ref={pRef} className="text-2xl mb-6">
          <span className="font-semibold">Mneumonicare AI</span> isn't just
          another add-on—
          <br />
          it's an embedded assistant that helps you think, create, and stay
          organized.
        </p>
        <div ref={buttonRef}>
          <LandingButton link="/auth/register">Get Started</LandingButton>
        </div>
      </div>
      <div className="w-full pb-40 ">
        <div className="h-[130vh] py-10">
          <img
            ref={addToRefs}
            className="h-full w-full rounded-3xl object-cover object-center shadow-2xs"
            src="assets/ai2.png"
            alt=""
          />
        </div>
        <div className="h-[100vh] flex justify-between gap-5">
          <img
            ref={addToRefs}
            className="w-[50%] rounded-3xl object-cover object-center"
            src="assets/ai3.png"
            alt=""
          />
          <img
            ref={addToRefs}
            className="w-[50%] rounded-3xl object-cover object-center"
            src="assets/ai5.png"
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default HeroAI;
