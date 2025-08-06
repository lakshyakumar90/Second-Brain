import AiCarousel from "@/components/ui/ai-carousel";

const ImageCarousel = () => {
  const images = [
    {
      tag: "",
      image: "/assets/ai.png",
      title: "",
      description: "",
      link: "#",
    },
    {
      tag: "",
      image: "/assets/ai2.png",
      title: "",
      description: "",
      link: "#",
    },
    {
      tag: "",
      image: "/assets/home.png",
      title: "",
      description: "",
      link: "#",
    },
    {
      tag: "",
      image: "/assets/ai3.png",
      title: "",
      description: "",
      link: "#",
    },
    {
      tag: "",
      image: "/assets/about1.png",
      title: "",
      description: "",
      link: "#",
    },
    {
      tag: "",
      image: "/assets/ai4.png",
      title: "",
      description: "",
      link: "#",
    },
    {
      tag: "",
      image: "/assets/about2-alt.png",
      title: "",
      description: "",
      link: "#",
    },
    {
      tag: "",
      image: "/assets/ai5.png",
      title: "",
      description: "",
      link: "#",
    },
  ];

  return (
    <div className="py-10">
      <AiCarousel data={images} cardBackgroundColor="bg-transparent" />
    </div>
  );
};

export default ImageCarousel;