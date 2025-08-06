import { motion } from "motion/react";
import { useState, useRef, useEffect } from "react";

interface CardData {
  tag: string;
  image: string;
  title: string;
  description: string;
  link: string;
}

interface AiCarouselProps {
  data: CardData[];
  cardBackgroundColor?: string;
}

const Card = ({ data, bgColor }: { data: CardData; bgColor: string }) => (
  <div className={`${bgColor} rounded-2xl overflow-hidden h-full flex flex-col select-none`}>
    <div className="relative h-64 bg-gray-300">
      <img
        src={data.image}
        alt={data.title}
        className="w-full h-full object-cover"
        draggable={false}
      />
      {data.tag && (
        <span className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-black text-xs font-semibold px-3 py-1 rounded-full">
          {data.tag}
        </span>
      )}
    </div>
    {(data.title || data.description) && (
      <div className="px-6 py-10 flex-grow flex flex-col">
        {data.title && <h3 className="text-xl font-bold mb-2">{data.title}</h3>}
        {data.description && <p className="text-gray-600 text-sm leading-relaxed flex-grow">{data.description}</p>}
      </div>
    )}
  </div>
);

const AiCarousel = ({
  data,
  cardBackgroundColor = "bg-gray-100",
}: AiCarouselProps) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [width, setWidth] = useState(0);
  const carouselWrapperRef = useRef<HTMLDivElement>(null);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const calculateWidth = () => {
      if (carouselWrapperRef.current) {
        const carouselWidth = carouselWrapperRef.current.scrollWidth;
        const carouselVisibleWidth = carouselWrapperRef.current.offsetWidth;
        const newWidth = carouselWidth - carouselVisibleWidth;
        setWidth(newWidth);
      }
    };

    calculateWidth();
    window.addEventListener("resize", calculateWidth);

    const timeoutId = setTimeout(calculateWidth, 300);

    return () => {
      window.removeEventListener("resize", calculateWidth);
      clearTimeout(timeoutId);
    };
  }, [data, isZoomed]);

  const handlePointerDown = () => {
    zoomTimeoutRef.current = setTimeout(() => {
      setIsZoomed(true);
    }, 150);
  };

  const handlePointerUp = () => {
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }
    setIsZoomed(false);
  };

  return (
    <div
      className="w-full overflow-hidden cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
    >
      <motion.div
        ref={carouselWrapperRef}
        drag="x"
        dragConstraints={{ right: 0, left: -width }}
        className="flex items-stretch gap-5"
        transition={{ duration: 0.5, type: "spring" }}
      >
        {data.map((item, index) => (
          <motion.div
            key={index}
            layout
            className="flex-shrink-0 w-[30vw]"
            animate={{ scale: isZoomed ? 0.95 : 1 }}
            transition={{ duration: 0.3, type: "spring" }}
          >
            <Card data={item} bgColor={cardBackgroundColor} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default AiCarousel;
