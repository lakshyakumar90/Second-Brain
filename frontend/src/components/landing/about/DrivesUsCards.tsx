import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function DrivesUsCards() {
  const containerRef = useRef(null);
  const cardsRef = useRef<any[]>([]);
  cardsRef.current = [];

  const addToRefs = (el: any) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  const drives = [
    {
      title: "Empowering Thought",
      description: "We empower everyone—from curious students to visionary researchers and bold designers—to capture, connect, and expand their knowledge without friction. Imagine a space where your wildest ideas evolve into actionable insights.",
      icon: "💡",
      imageUrl: "/assets/about1.png",
    },
    {
      title: "Human-First Design",
      description: "Our platform is designed to fade into the background, letting you transition smoothly from brainstorming to building. No cluttered interfaces—just intuitive tools that enhance your natural creative flow.",
      icon: "👤",
      imageUrl: "/assets/about2.png",
    },
    {
      title: "Trust & Privacy",
      description: "Your ideas are sacred. We prioritize robust security measures, including advanced encryption and user-controlled data sharing, ensuring your digital space remains private and protected.",
      icon: "🔒",
      imageUrl: "/assets/about2-alt.png",
    },
    {
      title: "Continuous Innovation",
      description: "Our dedicated team is always pushing boundaries, integrating the latest in AI-driven productivity and creative tools to support diverse minds and evolving needs.",
      icon: "🚀",
      imageUrl: "/assets/about3.png",
    },
  ];

  useEffect(() => {
    if (!containerRef.current || cardsRef.current.length === 0) return;

    const cards = cardsRef.current;
    const vh = window.innerHeight;
    const cardHeight = vh * 0.88;
    const gap = 0;
    const startOffset = vh * 0.06;

    cards.forEach((card, i) => {
      gsap.set(card, {
        y: i === 0 ? startOffset : vh + (i - 1) * gap,
        position: i === 0 ? "relative" : "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: `${cardHeight}px`,
        zIndex: i,
      });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: `top top`,
        end: `+=${vh * (cards.length - 1) * 1.3}px`,
        scrub: true,
        pin: true,
        // pinSpacing: true,
        // markers: true,
      },
    });

    cards.forEach((card, i) => {
      if (i === 0) return;

      const targetY = startOffset + i * gap;

      tl.fromTo(
        card,
        { y: vh },
        {
          y: targetY,
          ease: "none",
          duration: 1,
        },
        (i - 1) * 0.9
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {drives.map((drive, i) => (
        <div
          key={i}
          ref={addToRefs}
          className="bg-[#9BB8E8] text-black border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12 overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center h-full max-w-6xl mx-auto">
            <div className="text-content">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{drive.icon}</span>
                <h3 className="text-2xl lg:text-3xl font-bold ">
                  {drive.title}
                </h3>
              </div>
              <p className="text-md lg:text-lg  leading-relaxed text-gray-700">
                {drive.description}
              </p>
            </div>
            <div className="image-content h-full flex items-center justify-center">
              <img
                src={drive.imageUrl}
                alt={drive.title}
                className="rounded-2xl w-full h-auto max-h-[400px] object-cover object-left-top shadow-lg"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DrivesUsCards; 