import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import organize from "/public/assets/organize.png";
import summarize from "/public/assets/summarize.png";
import connect from "/public/assets/connect.png";
import search from "/public/assets/search.png";
import whiteboard from "/public/assets/whiteboard.png";
import boost from "/public/assets/boost.png";

gsap.registerPlugin(ScrollTrigger);

function CardsAi() {
  const containerRef = useRef(null);
  const cardsRef = useRef<any[]>([]);
  cardsRef.current = []; // Reset array on each render

  const addToRefs = (el: any) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  // AI Features data
  const aiFeatures = [
    {
      title: "Automatic Organization",
      description: "When you jot down quick ideas, upload documents, or sketch mind maps, Mneumonicare intelligently groups and tags related content, so you stay organized without manual effort.",
      icon: "🗂️",
      imageUrl: organize,
    },
    {
      title: "Summaries & Highlights",
      description: "Need a recap? Get instant summaries of lengthy meeting notes, shared docs, or visual whiteboards. Key points are automatically highlighted for your review.",
      icon: "📝",
      imageUrl: summarize,
    },
    {
      title: "Smart Connections",
      description: "The more you use Mneumonicare, the more helpful it becomes—offering connections to similar topics, suggesting project links, or providing relevant templates to jumpstart your workflow.",
      icon: "🔗",
      imageUrl: connect,
    },
    {
      title: "Conversational Search",
      description: "No more hunting through piles of files. Just ask a question in plain language, and the AI finds the answer—whether it's in a note, diagram, or meeting minute.",
      icon: "🔍",
      imageUrl: search,
    },
    {
      title: "Whiteboard Magic",
      description: "Messy sketches? The AI tidy-ups diagrams, transcribes handwriting into digital text, and even suggests ways to expand your ideas visually.",
      icon: "🎨",
      imageUrl: whiteboard,
    },
    {
      title: "Idea Boosting",
      description: "Feeling stuck? With a single click, get creative prompts, outlines, or brainstorming help, tailored to your unique context.",
      icon: "💡",
      imageUrl: boost,
    },
  ];

  useEffect(() => {
    if (!containerRef.current || cardsRef.current.length === 0) return;

    const cards = cardsRef.current;
    const vh = window.innerHeight;
    const cardHeight = vh * 0.88; // 88vh
    const gap = 0;
    const startOffset = vh * 0.06; // 6vh from top for first card pin

    // Set initial positions
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

    // Timeline with pinning
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: `top top`,
        end: `+=${vh * (cards.length - 1) * 1.3}px`,
        scrub: true,
        pin: true,
        pinSpacing: true,
      },
    });

    // Animate each subsequent card
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
    <div
      ref={containerRef}
      className="relative"
      // style={{ height: "600vh" }}
    >
      {aiFeatures.map((feature, i) => (
        <div
          key={i}
          ref={addToRefs}
          className="bg-[#424b54] border border-white/10 rounded-3xl shadow-2xl p-8 lg:p-12 overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center h-full max-w-6xl mx-auto">
            <div className="text-content">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{feature.icon}</span>
                <h3 className="text-2xl lg:text-3xl font-bold text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-md lg:text-lg text-gray-200 leading-relaxed">
                {feature.description}
              </p>
            </div>
            <div className="image-content h-full flex items-center justify-center">
              <img
                src={feature.imageUrl}
                alt={feature.title}
                className="rounded-2xl w-full h-auto max-h-[450px] object-cover object-left-top shadow-lg"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardsAi;
