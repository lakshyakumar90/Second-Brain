import AiCarousel from "../../ui/ai-carousel";

const carouselData = [
  {
    tag: "Efficiency",
    image: "/assets/summarize.png",
    title: "AI Summarization",
    description: "Condense long documents and articles into key points instantly, saving you time and effort.",
    link: "#",
  },
  {
    tag: "Productivity",
    image: "/assets/search.png",
    title: "Intelligent Search",
    description: "Find exactly what you need with natural language search across all your notes and documents.",
    link: "#",
  },
  {
    tag: "Creativity",
    image: "/assets/ai.png",
    title: "Content Generation",
    description: "Draft emails, reports, and creative content with an AI assistant that understands your style.",
    link: "#",
  },
  {
    tag: "Collaboration",
    image: "/assets/whiteboard.png",
    title: "AI Whiteboarding",
    description: "Brainstorm with an AI partner on an infinite canvas, turning rough ideas into structured plans.",
    link: "#",
  },
  {
    tag: "Organization",
    image: "/assets/organize.png",
    title: "Smart Organization",
    description: "Let AI automatically categorize, tag, and connect your notes to build a coherent knowledge base.",
    link: "#",
  },
  {
    tag: "Performance",
    image: "/assets/boost.png",
    title: "Personalized Insights",
    description: "Our AI analyzes your work to uncover patterns and suggest insights unique to your projects.",
    link: "#",
  },
  {
    tag: "Connectivity",
    image: "/assets/connect.png",
    title: "Seamless Integrations",
    description: "Connect Mneumonicore to your favorite apps and create a unified, intelligent workflow.",
    link: "#",
  },
];

const SeamlessIntegration = () => {
  return (
    <div className="py-24">
      <div className="px-10">
        <div className="pb-12">
            <h2 className="text-[8vw] font-semibold-s leading-[1.1] overflow-hidden">What You Can <br /> Do With AI</h2>
            <p className="text-2xl text-gray-500 mt-2">A quick look at the powerful features at your fingertips.</p>
        </div>
        <div className="">
            <AiCarousel data={carouselData} cardBackgroundColor="bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default SeamlessIntegration;
