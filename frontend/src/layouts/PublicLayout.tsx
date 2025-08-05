import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    document.body.classList.remove('dark');

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
      orientation: 'vertical', // ✅ replaces 'direction'
      gestureOrientation: 'vertical', // ✅ correct prop name
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy(); // cleanup
    };
  }, []);

  return <div className="overflow-x-hidden font-[neue-regular]">{children}</div>;
};

export default PublicLayout;
