import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedParagraphProps {
  textLines: string[];
  className?: string;
}

const AnimatedParagraph = ({ textLines, className }: AnimatedParagraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    // Integration with Lenis smooth scrolling
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const spans = gsap.utils.toArray(containerRef.current.querySelectorAll("span")) as HTMLElement[];

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        end: "bottom 20%",
        scrub: 1,
        invalidateOnRefresh: true,
        normalizeScroll: true,
      },
    });

    spans.forEach((span, index) => {
      tl.fromTo(
        span,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
        index * 0.1 // Stagger the animation of each line
      );
    });

    // Refresh ScrollTrigger to ensure proper positioning
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [textLines]);

  return (
    <div ref={containerRef} className={`text-center ${className}`}>
      {textLines.map((line, index) => (
        <span
          key={index}
          className="block overflow-hidden opacity-0"
          style={{ display: "block" }}
        >
          {line}
        </span>
      ))}
    </div>
  );
};

export default AnimatedParagraph;