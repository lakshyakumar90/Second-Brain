import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface AnimatedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedLayout = ({ children, className }: AnimatedLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  return (
    <motion.div ref={containerRef} style={{ scale }} className={className}>
      {children}
    </motion.div>
  );
};

export default AnimatedLayout;
