import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
      gradient: "from-purple-600 via-purple-700 to-indigo-800"
    },
    {
      title: "Summaries & Highlights",
      description: "Need a recap? Get instant summaries of lengthy meeting notes, shared docs, or visual whiteboards. Key points are automatically highlighted for your review.",
      icon: "📝",
      gradient: "from-blue-600 via-blue-700 to-cyan-800"
    },
    {
      title: "Smart Connections",
      description: "The more you use Mneumonicare, the more helpful it becomes—offering connections to similar topics, suggesting project links, or providing relevant templates to jumpstart your workflow.",
      icon: "🔗",
      gradient: "from-emerald-600 via-emerald-700 to-teal-800"
    },
    {
      title: "Conversational Search",
      description: "No more hunting through piles of files. Just ask a question in plain language, and the AI finds the answer—whether it's in a note, diagram, or meeting minute.",
      icon: "🔍",
      gradient: "from-orange-600 via-orange-700 to-red-800"
    },
    {
      title: "Whiteboard Magic",
      description: "Messy sketches? The AI tidy-ups diagrams, transcribes handwriting into digital text, and even suggests ways to expand your ideas visually.",
      icon: "🎨",
      gradient: "from-pink-600 via-pink-700 to-rose-800"
    },
    {
      title: "Idea Boosting",
      description: "Feeling stuck? With a single click, get creative prompts, outlines, or brainstorming help, tailored to your unique context.",
      icon: "💡",
      gradient: "from-yellow-600 via-yellow-700 to-amber-800"
    }
  ];

  useEffect(() => {
    if (!containerRef.current || cardsRef.current.length === 0) return;

    const cards = cardsRef.current;
    const vh = window.innerHeight;
    const cardHeight = vh * 0.88; // 88vh
    const gap = vh * 0.0; // 4vh gap between cards
    const startOffset = vh * 0.06; // 6vh from top for first card pin

    // Set initial positions: first at startOffset, others off-screen below
    cards.forEach((card, i) => {
      gsap.set(card, {
        y: i === 0 ? startOffset : vh + (i - 1) * gap, // Off-screen start
        position: i === 0 ? "relative" : "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: `${cardHeight}px`,
        zIndex: i, // Fixed: first card lowest z-index, later cards higher (stack on top)
      });
    });

    // Timeline with pinning
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: `top top`, // Pins starting 6vh down
        end: `+=${vh * (cards.length - 1) * 1.3}px`, // Space for all animations
        scrub: true,
        pin: true,
        pinSpacing: true,
        // markers: true, // Disabled for production
      },
    });

    // Animate each subsequent card sliding up to stacked position
    cards.forEach((card, i) => {
      if (i === 0) return; // First card is pinned at offset

      const targetY = startOffset + i * gap; // Below previous with gap

      tl.fromTo(
        card,
        { y: vh }, // From below viewport
        {
          y: targetY, // To stacked position
          ease: "none",
          duration: 1, // Relative scroll duration per card
        },
        (i - 1) * 1 // Stagger for sequencing
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
      // style={{ height: "600vh" }} // Large height for scroll space
    >
      {aiFeatures.map((feature, i) => (
        <div
          key={i}
          ref={addToRefs}
          className={`rounded-3xl shadow-2xl backdrop-blur-sm border border-white/10 overflow-hidden`}
          style={{
            background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
            backgroundImage: `linear-gradient(135deg, ${feature.gradient.split(' ').map(color => {
              const colorMap: { [key: string]: string } = {
                'from-purple-600': '#9333ea',
                'via-purple-700': '#7c3aed',
                'to-indigo-800': '#3730a3',
                'from-blue-600': '#2563eb',
                'via-blue-700': '#1d4ed8',
                'to-cyan-800': '#155e75',
                'from-emerald-600': '#059669',
                'via-emerald-700': '#047857',
                'to-teal-800': '#115e59',
                'from-orange-600': '#ea580c',
                'via-orange-700': '#c2410c',
                'to-red-800': '#991b1b',
                'from-pink-600': '#db2777',
                'via-pink-700': '#be185d',
                'to-rose-800': '#9f1239',
                'from-yellow-600': '#ca8a04',
                'via-yellow-700': '#a16207',
                'to-amber-800': '#92400e'
              };
              return colorMap[color] || color;
            }).join(', ')})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "2rem",
            fontWeight: "bold",
          }}
        >
          <div className="p-12 max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6 animate-bounce">
              {feature.icon}
            </div>
            <h3 className="text-4xl font-bold mb-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 inline-block">
              {feature.title}
            </h3>
            <p className="text-xl leading-relaxed bg-black/20 backdrop-blur-sm rounded-2xl p-6 inline-block max-w-3xl">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardsAi;
